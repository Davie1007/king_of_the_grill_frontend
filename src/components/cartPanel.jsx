import React, { useState, useEffect, useRef } from 'react';
import {
  Typography, Paper, Box, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Divider, Table, TableHead,
  TableRow, TableCell, TableBody, Stack, Alert, IconButton, CircularProgress
} from '@mui/material';
import { RemoveCircleOutline, Print } from '@mui/icons-material';
import { MPesa } from 'react-pay-icons';
import { useManualTillPayment } from './useManualTillPayment';
import { clientPOS } from './clientPOS';
import echo from './echo';

export const CartPanel = React.memo(function CartPanel(props) {
  const {
    variant = 'butchery',
    cart,
    cartItemCount,
    cartTotal,
    loading,
    isMobile = false,
    paymentMethod,
    amountPaid,
    customerTelephone,
    customerName,
    customerIdNumber,
    cardNumber,
    cardBalance,
    redeemAmount,
    topupAmount,
    user,
    updateCartQuantity,
    removeFromCart,
    setPaymentMethod,
    setAmountPaid,
    setCustomerTelephone,
    setCustomerName,
    setCustomerIdNumber,
    validatePhone,
    registerCard,
    redeemCard,
    topupCard,
    checkout,
    error,
    setError,
    setToast,
    mpesaMode,
    setMpesaMode,
    paymentRef,
    formatNumber = (v, digits = 2) => Number(v).toFixed(digits),
    setCart,
    setReceiptData,
    setIsReceiptOpen,
    setIsCartOpen,
  } = props;

  const [transactionIdInput, setTransactionIdInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const processedTransactions = useRef(new Set());
  const audioRef = useRef(null);

  const branchId = user?.branch?.id;
  const isEnabled = paymentMethod === 'M-Pesa' && mpesaMode === 'manual';

  const {
    initiateManualTillPayment,
    paymentStatus,
    transactionId,
    cartRef,
    resetPayment,
  } = useManualTillPayment(isEnabled, cart, branchId, setToast, setError, '174379');

  const cartItems = cart.map(item => ({
    item: item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  // Load sound once
  useEffect(() => {
    audioRef.current = new Audio('/assets/sounds/short-success-sound-glockenspiel-treasure-video-game-6346.mp3');
  }, []);

  /** 🔹 Reset state after cart is cleared */
  useEffect(() => {
    if (cart.length === 0) {
      resetPayment();
      setTransactionIdInput('');
      setMpesaMode('stk');
    }
  }, [cart, resetPayment, setMpesaMode]);

  /** 🔹 Handle real-time PaymentReceived */
  useEffect(() => {
    if (!branchId) return;
  
    const channel = echo.channel(`payments.${branchId}`);
    channel.listen('.PaymentReceived', (event) => {
      console.log('💵 PaymentReceived event:', event);
      const txId = event.transaction_id || event.receipt?.transactionId;
      const eventCartRef = event.cart_ref || event.receipt?.cart_ref; // From server receipt
      if (!txId || !eventCartRef) {
        console.warn('Missing transaction_id or cart_ref in PaymentReceived event:', event);
        return;
      }
  
      // Check if the event matches the current cart
      const cartMatch = eventCartRef === paymentRef && Math.abs(event.amount - cartTotal) <= 0.01;
      if (!cartMatch) {
        console.log('PaymentReceived event does not match current cart:', { eventCartRef, paymentRef, eventAmount: event.amount, cartTotal });
        return;
      }
  
      if (processedTransactions.current.has(txId)) {
        console.log('Ignoring duplicate PaymentReceived for:', txId);
        return;
      }
      processedTransactions.current.add(txId);
  
      try {
        audioRef.current?.play().catch((err) => console.warn('Audio playback failed:', err));
      } catch (err) {
        console.warn('Audio playback error:', err);
      }

      // Enrich receipt items with full cart details
    const enrichedItems = event.receipt.items.map((receivedItem) => {
      const cartItem = cart.find((c) => c.id === receivedItem.item);
      return {
        ...receivedItem,
        cartId: cartItem?.cartId || `${receivedItem.item}-${receivedItem.price}`, // Fallback cartId
        name: cartItem?.name || 'Unknown Item',
        priceTier: cartItem?.priceTier || 'price',
        stock: cartItem?.stock || 0,
        unit: cartItem?.unit || '',
      };
    });

    // Set enriched receipt data
    setReceiptData({
      ...event.receipt,
      items: enrichedItems,
      branch: event.receipt.branch,
      timestamp: event.receipt.timestamp || new Date().toLocaleString(),
      payment_method: event.receipt.payment_method,
      total: event.receipt.total,
      customer_telephone: event.receipt.customer_telephone,
      transaction_id: event.receipt.transactionId,
      sale_id: event.receipt.sale_id,
      cart_ref: event.receipt.cart_ref,
    });
  
      setToast({
        open: true,
        msg: `✅ Payment of KES ${event.amount} received! (Transaction ID: ${txId})`,
        sev: 'success',
      });
  
      //setReceiptData(event.receipt);
      setIsReceiptOpen(true);
      setIsCartOpen(false);
      setCart([]);
      resetPayment();
      setTransactionIdInput('');
      setMpesaMode('stk');
    });
  
    return () => {
      channel.stopListening('.PaymentReceived');
      echo.leave(`payments.${branchId}`);
    };
  }, [branchId, cartRef, cartTotal, checkout, setToast, setCart, resetPayment, setMpesaMode]);

  useEffect(() => {
    if (!branchId || !cartRef) return;
  
    const channel = echo.channel(`payments.${cartRef}`);
    channel.listen('.PaymentFailed', (event) => {
      console.log('💥 PaymentFailed event:', event);
      setToast({
        open: true,
        msg: `Payment failed: ${event.error_message} (Error Code: ${event.error_code})`,
        sev: 'error',
      });
      setError(`Payment failed: ${event.error_message}`);
      resetPayment();
    });
  
    return () => {
      channel.stopListening('.PaymentFailed');
      echo.leave(`payments.${cartRef}`);
    };
  }, [branchId, cartRef, setToast, setError, resetPayment]);

  /** 🔹 Manual transaction verification */
  const handleVerifyTransaction = async () => {
    setError(null);
    setToast({ open: false, msg: '', sev: '' });

    if (!transactionIdInput.trim()) {
      const msg = 'Please enter a valid M-Pesa Transaction ID';
      setError(msg);
      setToast({ open: true, msg, sev: 'error' });
      return;
    }
    if (!branchId) {
      const msg = 'Branch ID is missing. Please re-login or contact support.';
      setError(msg);
      setToast({ open: true, msg, sev: 'error' });
      return;
    }
    if (!cartItems.length) {
      const msg = 'Cart is empty. Add items to proceed.';
      setError(msg);
      setToast({ open: true, msg, sev: 'error' });
      return;
    }

    if (processedTransactions.current.has(transactionIdInput)) {
      setToast({
        open: true,
        msg: `Transaction ${transactionIdInput} was already processed. Cart cleared.`,
        sev: 'info',
      });
      return;
    }

    setVerifyLoading(true);
    try {
      const res = await clientPOS.post(
        '/api/mpesa/verify',
        {
          transaction_id: transactionIdInput,
          context: 'cart',
          branch_id: branchId,
          items: cartItems,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
      );

      if (res.data.success || res.data.status === 'verified') {
        processedTransactions.current.add(transactionIdInput);

        try {
          audioRef.current?.play().catch(() => {});
        } catch {}

        setToast({
          open: true,
          msg: `Payment ${transactionIdInput} verified successfully! Cart cleared.`,
          sev: 'success',
        });
        checkout(res.data);
        setCart([]);
        resetPayment();
        setTransactionIdInput('');
        setMpesaMode('stk');
      } else {
        const msg = res.data.message || 'Transaction verification failed';
        setError(msg);
        setToast({ open: true, msg, sev: 'error' });
      }
    } catch (err) {
      let errorMsg = 'Failed to verify transaction.';
      if (err.response?.status === 401) {
        errorMsg = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 404) {
        errorMsg = `Transaction ${transactionIdInput} not found. Ensure it was processed via M-Pesa.`;
      } else if (err.response?.data?.error === 'Transaction already used') {
        errorMsg = `Transaction ${transactionIdInput} was already used. Cart cleared.`;
        processedTransactions.current.add(transactionIdInput);
        setCart([]);
        resetPayment();
        setTransactionIdInput('');
        setMpesaMode('stk');
      } else {
        errorMsg = err.response?.data?.error || err.response?.data?.message || errorMsg;
      }
      setError(errorMsg);
      setToast({ open: true, msg: errorMsg, sev: 'error' });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setError(null);
    setToast({ open: false, msg: '', sev: '' });
    resetPayment();
  };

  const handleMpesaModeChange = (e) => {
    setMpesaMode(e.target.value);
    setError(null);
    setToast({ open: false, msg: '', sev: '' });
    resetPayment();
  };

  const handleInitiatePayment = async () => {
    await initiateManualTillPayment(cartTotal, cartItems, branchId, customerTelephone);
  };

  /** 🔹 Primary Action Button */
  const getPrimaryActionButton = () => {
    if (paymentMethod === 'M-Pesa') {
      if (mpesaMode === 'manual') {
        return (
          <Button
            variant="contained"
            onClick={handleInitiatePayment}
            disabled={paymentStatus === 'pending' || paymentStatus === 'confirmed' || verifyLoading}
          >
            Initiate Manual Payment
          </Button>
        );
      }
      if (mpesaMode === 'txn') {
        return (
          <Button
            variant="contained"
            onClick={handleVerifyTransaction}
            disabled={!transactionIdInput || verifyLoading}
          >
            {verifyLoading ? <CircularProgress size={20} /> : 'Verify Transaction'}
          </Button>
        );
      }
    }
    return (
      <Button
        variant="contained"
        onClick={() => checkout()}
        disabled={verifyLoading || (paymentMethod === 'Cash' && Number(amountPaid || 0) < cartTotal)}
      >
        {`Checkout KES ${formatNumber(cartTotal, 0)}`}
      </Button>
    );
  };

  return (
    <Paper elevation={4} sx={{ p: variant === 'butchery' ? 4 : 3, borderRadius: variant === 'butchery' ? 4 : 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : cart.length ? (
        <>
          {/* Cart Table */}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                {variant === 'gas' && <TableCell>Tier</TableCell>}
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cart.map((item) => (
                <TableRow key={item.cartId}>
                  <TableCell>{item.name}</TableCell>
                  {variant === 'gas' && <TableCell>{item.priceTier}</TableCell>}
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ step: '0.01', min: 0 }}
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.cartId, Number(e.target.value))}
                      sx={{ width: 100, '& input': { textAlign: 'center' } }}
                    />
                  </TableCell>
                  <TableCell>KES {formatNumber(item.price)}</TableCell>
                  <TableCell>KES {formatNumber(item.price * item.quantity)}</TableCell>
                  <TableCell>
                    <IconButton color="error" onClick={() => removeFromCart(item.cartId)}>
                      <RemoveCircleOutline fontSize="medium" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={variant === 'butchery' ? 3 : 4}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                  KES {formatNumber(cartTotal)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>

          <Divider sx={{ my: 3 }} />

          {/* Payment Controls */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap">
            {/* Payment Method Select */}
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="pm-label">Payment Method</InputLabel>
              <Select labelId="pm-label" value={paymentMethod} onChange={handlePaymentMethodChange}>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="M-Pesa">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MPesa style={{ width: 22, marginRight: 8 }} /> M-Pesa
                  </Box>
                </MenuItem>
                <MenuItem value="Credit">Credit</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
              </Select>
            </FormControl>
            {/* 🔹 Different flows depending on method */}
            {paymentMethod === 'Cash' && (
              <TextField
                size="small"
                type="number"
                label="Cash Tendered (KES)"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                error={amountPaid < cartTotal}
                helperText={amountPaid < cartTotal ? 'Amount is less than total' : 'Enter amount'}
              />
            )}

            {paymentMethod === 'M-Pesa' && (
              <>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel id="mpesa-mode-label">M-Pesa Mode</InputLabel>
                  <Select labelId="mpesa-mode-label" value={mpesaMode} onChange={handleMpesaModeChange}>
                    <MenuItem value="stk">STK Push (Prompt on phone)</MenuItem>
                    <MenuItem value="manual">Manual Till Payment (C2B)</MenuItem>
                    <MenuItem value="txn">Use Transaction ID</MenuItem>
                  </Select>
                </FormControl>

                {mpesaMode === 'stk' && (
                  <TextField
                    size="small"
                    label="Customer Telephone (+254...)"
                    value={customerTelephone}
                    onChange={(e) => setCustomerTelephone(e.target.value)}
                    error={Boolean(customerTelephone) && !validatePhone(customerTelephone)}
                    helperText={validatePhone(customerTelephone) ? 'Valid phone number' : 'Format: +2547XXXXXXXX'}
                  />
                )}

                {mpesaMode === 'manual' && (
                  <>
                    {paymentStatus === 'pending' && (
                      <Typography variant="body2" color="text.secondary">
                        Waiting for payment confirmation... (Cart Ref: {cartRef})
                      </Typography>
                    )}
                    {paymentStatus === 'confirmed' && (
                      <Alert severity="success">Payment confirmed successfully!</Alert>
                    )}
                    {paymentStatus === 'error' && (
                      <Alert severity="error">Error initiating payment. Please try again.</Alert>
                    )}
                  </>
                )}

                {mpesaMode === 'txn' && (
                  <TextField
                    size="small"
                    label="M-Pesa Transaction ID"
                    value={transactionIdInput}
                    onChange={(e) => setTransactionIdInput(e.target.value)}
                    disabled={verifyLoading}
                    error={Boolean(error && error.includes('Transaction ID'))}
                    helperText={error && error.includes('Transaction ID') ? error : 'Enter valid M-Pesa Transaction ID'}
                  />
                )}
              </>
            )}

            {/* Credit method */}
            {paymentMethod === 'Credit' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField size="small" label="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                <TextField size="small" label="Customer ID Number" value={customerIdNumber} onChange={(e) => setCustomerIdNumber(e.target.value)} />
                <TextField
                  size="small"
                  label="Customer Telephone (+254...)"
                  value={customerTelephone}
                  onChange={(e) => setCustomerTelephone(e.target.value)}
                  error={Boolean(customerTelephone) && !validatePhone(customerTelephone)}
                  helperText={validatePhone(customerTelephone) ? 'Valid phone number' : 'Format: +2547XXXXXXXX'}
                />
              </Stack>
            )}

            {/* Card method */}
            {paymentMethod === 'Card' && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField size="small" label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} helperText={cardBalance !== null ? `Balance: KES ${formatNumber(cardBalance)}` : ''} />
                <TextField size="small" label="Redeem Amount (KES)" type="number" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} />
                <Button variant="contained" onClick={redeemCard} disabled={!cardNumber || !redeemAmount}>Redeem</Button>
                <TextField size="small" label="Top-up Amount (KES)" type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} />
                <Button variant="contained" onClick={topupCard} disabled={!cardNumber || !topupAmount}>Top-up</Button>
                <Button variant="outlined" onClick={registerCard} disabled={!customerName || !customerTelephone}>Register Card</Button>
              </Stack>
            )}

            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1}>
              {variant === 'gas' && (
                <Button variant="outlined" startIcon={<Print />} onClick={() => window.print()}>
                  Print
                </Button>
              )}
              {getPrimaryActionButton()}
            </Stack>
          </Stack>
        </>
      ) : (
        <Alert severity="info">Your cart is empty</Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} variant="filled">
          {error}
        </Alert>
      )}
    </Paper>
  );
});
