import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from '@mui/material';
import CreditRepaymentModal from '../components/CreditRepaymentModal'; // adjust path
import echo from '../components/echo';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 3,
  p: 3,
  maxHeight: '80%',
  maxWidth: '90%',
  overflow: 'auto',
};

export default function CreditRepaymentManager({
  open,
  onClose,
  creditSales,
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
  const [creditSearchQuery, setCreditSearchQuery] = useState('');
  const [selectedCreditSale, setSelectedCreditSale] = useState(null);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    // Listen for any credit repayment updates
    const channel = echo.channel('credit-repayments');
    channel.listen('.PaymentReceived', (data) => {
      console.log('Credit Repayment Update:', data);
      setToast({
        open: true,
        msg: `Payment of KES ${formatNumber(data.receipt.amount_paid)} received for ${data.receipt.customer}`,
        sev: 'success',
      });
      fetchCreditSales();
    });

    return () => {
      channel.stopListening('.PaymentReceived');
      echo.leaveChannel('credit-repayments');
    };
  }, [open, setToast, formatNumber, fetchCreditSales]);

  const filteredCreditSales = creditSales.filter(
    (sale) =>
      sale.customer.toLowerCase().includes(creditSearchQuery.toLowerCase()) ||
      sale.phone.toLowerCase().includes(creditSearchQuery.toLowerCase())
  );

  return (
    <>
      {/* CREDIT LIST MODAL */}
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="credit-modal-title"
        aria-describedby="credit-modal-description"
      >
        <Box sx={{ ...modalStyle, width: 600 }}>
          <Typography id="credit-modal-title" variant="h6" component="h2">
            Credit Repayments
          </Typography>
          <TextField
            fullWidth
            label="Search by customer or phone"
            value={creditSearchQuery}
            onChange={(e) => setCreditSearchQuery(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          {loading ? (
            <CircularProgress />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Balance</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCreditSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>{sale.phone}</TableCell>
                    <TableCell>KES {formatNumber(sale.balance_remaining)}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setSelectedCreditSale(sale);
                          setIsRepayModalOpen(true);
                        }}
                      >
                        Repay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Modal>

      {/* REPAY DIALOG */}
      <CreditRepaymentModal
        open={isRepayModalOpen}
        onClose={() => setIsRepayModalOpen(false)}
        selectedCreditSale={selectedCreditSale}
        fetchCreditSales={fetchCreditSales}
        showError={showError}
        setToast={setToast}
        setReceiptData={setReceiptData}
        setIsReceiptOpen={setIsReceiptOpen}
        formatNumber={formatNumber}
        validatePhone={validatePhone}
        loading={loading}
        setLoading={setLoading}
      />
    </>
  );
}
