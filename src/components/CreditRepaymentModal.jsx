import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import { clientPOS } from '../components/clientPOS';
import echo from '../components/echo';

export default function CreditRepaymentModal({
  open,
  onClose,
  selectedCreditSale,
  fetchCreditSales,
  showError,
  setToast,
  setReceiptData,
  setIsReceiptOpen,
  formatNumber,
  validatePhone,
  loading,
  setLoading,
}) {
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMethod, setRepayMethod] = useState('Cash');
  const [repayCustomerTelephone, setRepayCustomerTelephone] = useState('');
  const [mpesaMode, setMpesaMode] = useState('stk'); // stk | manual | txn
  const [transactionIdInput, setTransactionIdInput] = useState('');
  const [repayPaymentStatus, setRepayPaymentStatus] = useState(null);
  const [repayTransactionId, setRepayTransactionId] = useState(null);

  useEffect(() => {
    if (!open || !selectedCreditSale) return;

    // Listen for PaymentReceived events for this credit sale
    const channel = echo.channel(`payment-confirmation.credit.${selectedCreditSale.id}`);
    channel.listen('.PaymentReceived', (data) => {
      console.log('Home Payment Received:', data);
      setReceiptData(data.receipt);
      setIsReceiptOpen(true);
      setToast({ open: true, msg: `Payment of KES ${formatNumber(data.receipt.amount_paid)} received for ${data.receipt.customer}`, sev: 'success' });
      fetchCreditSales();
      onClose();
    });

    return () => {
      channel.stopListening('.PaymentReceived');
      echo.leaveChannel(`payment-confirmation.credit.${selectedCreditSale.id}`);
    };
  }, [open, selectedCreditSale, setReceiptData, setIsReceiptOpen, setToast, fetchCreditSales, formatNumber, onClose]);

  useEffect(() => {
    if (repayTransactionId && repayPaymentStatus === 'pending') {
      const channel = echo.channel(`payment-confirmation.${repayTransactionId}`);
      channel.listen('.payment.confirmed', (data) => {
        console.log('Repayment Confirmation:', data);
        setRepayPaymentStatus('confirmed');
        setReceiptData({
          receipt_no: data.receipt_no,
          customer: selectedCreditSale.customer,
          phone: selectedCreditSale.phone,
          total_credit: Number(selectedCreditSale.total_credit),
          amount_paid: Number(data.amount_paid),
          balance_remaining: Number(data.balance_remaining),
          payment_method: repayMethod,
          date: new Date().toLocaleString(),
        });
        setIsReceiptOpen(true);
        onClose();
        setRepayAmount('');
        setRepayMethod('Cash');
        setRepayCustomerTelephone('');
        setRepayPaymentStatus(null);
        setRepayTransactionId(null);
        setToast({ open: true, msg: 'Repayment confirmed successfully', sev: 'success' });
        fetchCreditSales();
      });

      return () => {
        channel.stopListening('.payment.confirmed');
        echo.leaveChannel(`payment-confirmation.${repayTransactionId}`);
      };
    }
  }, [
    repayTransactionId,
    repayPaymentStatus,
    selectedCreditSale,
    setReceiptData,
    setIsReceiptOpen,
    onClose,
    setToast,
    fetchCreditSales,
  ]);

  const handleRepay = async () => {
    if (!selectedCreditSale) {
      showError('No credit sale selected');
      return;
    }

    // Validate amounts
    if (repayMethod !== 'M-Pesa' || (repayMethod === 'M-Pesa' && mpesaMode === 'stk')) {
      if (!repayAmount || Number(repayAmount) <= 0) {
        showError('Please enter a valid repayment amount');
        return;
      }
      if (Number(repayAmount) > selectedCreditSale.balance_remaining) {
        showError(`Repayment amount exceeds outstanding balance of KES ${formatNumber(selectedCreditSale.balance_remaining)}`);
        return;
      }
    }

    setLoading(true);
    try {
      if (repayMethod === 'M-Pesa') {
        if (mpesaMode === 'manual') {
          // Manual Till Payment
          const response = await clientPOS.post(
            '/api/mpesa/c2b/confirmation',
            {
              amount: Number(repayAmount || selectedCreditSale.balance_remaining),
              tillNumber: '9549191',
              credit_sale_id: selectedCreditSale.id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                Accept: 'application/json',
              },
            }
          );
          const data = response.data;
          setRepayTransactionId(data.transactionId);
          setRepayPaymentStatus('pending');
          setToast({
            open: true,
            msg: `Please pay KES ${formatNumber(repayAmount || selectedCreditSale.balance_remaining)} to Till Number: 9549191 for credit repayment. Waiting for confirmation...`,
            sev: 'info',
          });
          return; // wait for confirmation via Echo
        }

        if (mpesaMode === 'txn') {
          // Verify Transaction ID
          if (!transactionIdInput.trim()) {
            showError('Please enter a valid M-Pesa Transaction ID');
            return;
          }
          const res = await clientPOS.post(
            '/api/mpesa/verify',
            {
              transaction_id: transactionIdInput,
              context: 'credit',
              credit_sale_id: selectedCreditSale.id,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                Accept: 'application/json',
              },
            }
          );

          const { receipt } = res.data;
          setReceiptData(receipt);
          setIsReceiptOpen(true);
          onClose();
          setToast({ open: true, msg: 'Repayment verified successfully', sev: 'success' });
          fetchCreditSales();
          return;
        }

        if (mpesaMode === 'stk') {
          // STK Push
          if (!validatePhone(repayCustomerTelephone)) {
            showError('Please enter a valid phone number for STK Push');
            return;
          }

          const payload = {
            amount: Number(repayAmount),
            payment_method: 'M-Pesa',
            customer_telephone_number: repayCustomerTelephone,
            use_stkpush: true,
            credit_sale_id: selectedCreditSale.id,
          };

          const res = await clientPOS.post('/api/credit-sales/mpesa/start', payload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
              Accept: 'application/json',
            },
          });

          const { receipt } = res.data;
          setReceiptData(receipt);
          setIsReceiptOpen(true);
          onClose();
          setToast({ open: true, msg: `Repayment of KES ${formatNumber(repayAmount)} recorded`, sev: 'success' });
          fetchCreditSales();
          return;
        }
      }

      // Cash repayment
      if (repayMethod === 'Cash') {
        const payload = { amount: Number(repayAmount), payment_method: 'Cash' };
        const res = await clientPOS.post(`api/credit-sales/${selectedCreditSale.id}/pay`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            Accept: 'application/json',
          },
        });

        const { receipt } = res.data;
        setReceiptData(receipt);
        setIsReceiptOpen(true);
        onClose();
        setToast({ open: true, msg: `Repayment of KES ${formatNumber(repayAmount)} recorded`, sev: 'success' });
        fetchCreditSales();
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to process repayment. Please try again.';
      if (err.response?.data?.error?.includes('Overpayment detected')) {
        showError(
          `Overpayment detected. Expected KES ${formatNumber(err.response.data.expected_amount)}, but received KES ${formatNumber(
            err.response.data.paid_amount
          )}.`
        );
      } else if (err.response?.data?.error?.includes('Transaction already used')) {
        showError('This transaction ID has already been used.');
      } else if (err.response?.data?.error?.includes('Transaction not found')) {
        showError('Invalid transaction ID. Please check and try again.');
      } else {
        showError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Repay Credit for {selectedCreditSale?.customer || 'Customer'}</DialogTitle>
      <DialogContent>
        {selectedCreditSale && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            Outstanding Balance: KES {formatNumber(selectedCreditSale.balance_remaining)}
          </Typography>
        )}
        {(repayMethod !== 'M-Pesa' || (repayMethod === 'M-Pesa' && mpesaMode === 'stk')) && (
          <TextField
            size="small"
            label="Amount"
            type="number"
            value={repayAmount}
            onChange={(e) => setRepayAmount(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            error={Number(repayAmount) > selectedCreditSale?.balance_remaining}
            helperText={
              Number(repayAmount) > selectedCreditSale?.balance_remaining
                ? `Cannot exceed KES ${formatNumber(selectedCreditSale.balance_remaining)}`
                : ''
            }
          />
        )}
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="repay-pm-label">Payment Method</InputLabel>
          <Select
            labelId="repay-pm-label"
            value={repayMethod}
            onChange={(e) => setRepayMethod(e.target.value)}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="M-Pesa">M-Pesa</MenuItem>
          </Select>
        </FormControl>

        {repayMethod === 'M-Pesa' && (
          <>
            <FormControl size="small" sx={{ minWidth: 160, mt: 2 }}>
              <InputLabel id="repay-stk-mode-label">M-Pesa Mode</InputLabel>
              <Select
                labelId="repay-stk-mode-label"
                value={mpesaMode}
                onChange={(e) => setMpesaMode(e.target.value)}
              >
                <MenuItem value="stk">STK Push (Prompt on phone)</MenuItem>
                <MenuItem value="manual">Manual Till Payment (C2B)</MenuItem>
                <MenuItem value="txn">Use Transaction ID</MenuItem>
              </Select>
            </FormControl>

            {mpesaMode === 'stk' && (
              <TextField
                size="small"
                label="Customer Telephone (+254...)"
                value={repayCustomerTelephone}
                onChange={(e) => setRepayCustomerTelephone(e.target.value)}
                helperText={
                  validatePhone(repayCustomerTelephone)
                    ? 'Valid phone number'
                    : 'Format: +2547XXXXXXXX'
                }
                error={Boolean(repayCustomerTelephone) && !validatePhone(repayCustomerTelephone)}
                sx={{ mt: 2 }}
              />
            )}

            {mpesaMode === 'txn' && (
              <>
                <TextField
                  size="small"
                  label="M-Pesa Transaction ID"
                  value={transactionIdInput}
                  onChange={(e) => setTransactionIdInput(e.target.value)}
                  sx={{ mt: 2 }}
                  error={Boolean(transactionIdInput && transactionIdInput.length < 10)}
                  helperText={
                    transactionIdInput && transactionIdInput.length < 10
                      ? 'Transaction ID too short'
                      : 'Enter valid M-Pesa Transaction ID (e.g., MPESA123456789)'
                  }
                />
              </>
            )}

            {mpesaMode === 'manual' && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                Pay to Till Number: 9549191 (Credit Sale ID: {selectedCreditSale?.id})
              </Typography>
            )}

            {repayPaymentStatus === 'pending' && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Waiting for payment confirmation...
              </Alert>
            )}
            {repayPaymentStatus === 'confirmed' && (
              <Alert severity="success" sx={{ mt: 1 }}>
                Payment confirmed successfully!
              </Alert>
            )}
            {repayPaymentStatus === 'error' && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Error initiating payment. Please try again.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleRepay}
          disabled={
            loading ||
            (repayMethod === 'M-Pesa' &&
              mpesaMode === 'txn' &&
              !transactionIdInput) ||
            (repayMethod === 'M-Pesa' &&
              mpesaMode === 'stk' &&
              !validatePhone(repayCustomerTelephone)) ||
            (repayMethod !== 'M-Pesa' && !repayAmount) ||
            Number(repayAmount) > selectedCreditSale?.balance_remaining
          }
        >
          {loading ? 'Processing...' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}