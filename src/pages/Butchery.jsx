// Butchery.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Paper, Grid, Box, Card, CardMedia, CardContent, CardActions, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Table, TableHead,
  TableRow, TableCell, TableBody, Stack, Alert, Snackbar, IconButton, CircularProgress, Tooltip, useMediaQuery, ThemeProvider,
  createTheme, LinearProgress, Badge, Drawer, BottomNavigation, BottomNavigationAction, Modal,
} from '@mui/material';
import {
  ShoppingCart, Logout, Add, Close, ErrorOutline, Print, Download, RemoveCircleOutline, Search, CreditCard, Contrast
} from '@mui/icons-material';
import { MPesa } from 'react-pay-icons';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import jsPDF from 'jspdf';
import QRCode from "qrcode";
import debounce from 'lodash.debounce';
import { FocusTrap } from '@mui/base/FocusTrap';
import { useManualTillPayment } from '../components/useManualTillPayment';
import { API_BASE_URL, clientPOS } from "../components/clientPOS";
import { baseTheme, highContrastTheme, cardVariants, dialogVariants } from "../components/butchery/butcheryTheme";
import { CartPanel } from "../components/cartPanel"
import { useLocation } from 'react-router-dom';
import AppleLoginForm from "../components/AppleLoginForm"
import CreditRepaymentManager from '../components/CreditRepaymentManager';
import AppHeader from '../components/AppHeader';
import styles from  '../styles/Butchery.module.css'
import {Helmet} from "react-helmet";

function formatNumber(v, digits = 2) {
  const n = Number(v);
  if (Number.isNaN(n)) return (0).toFixed(digits);
  return n.toFixed(digits);
}

class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ m: 4, borderRadius: 4 }}>
          Something went wrong. Please refresh or contact support.
          <Button variant="outlined" color="error" onClick={() => window.location.reload()} sx={{ mt: 2 }}>Refresh</Button>
        </Alert>
      );
    }
    return this.props.children;
  }
}


export default function Butchery() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalSpendAmount, setModalSpendAmount] = useState('');
  const [useSpendAmount, setUseSpendAmount] = useState(true);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerIdNumber, setCustomerIdNumber] = useState('');
  const [customerTelephone, setCustomerTelephone] = useState('');
  const [toast, setToast] = useState({ open: false, msg: '', sev: 'success', action: null });
  const [repayOpen, setRepayOpen] = useState(false);
  const [creditSales, setCreditSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [repayForm, setRepayForm] = useState({ amount: '', method: 'Cash' });
  const [creditRepaymentMessage, setCreditRepaymentMessage] = useState('');
  const [creditRepaymentReceipt, setCreditRepaymentReceipt] = useState(null);
  const [iscreditRepaymentReceiptModalOpen, setCreditRepaymentReceiptModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [creditSearchQuery, setCreditSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [lastRemovedItem, setLastRemovedItem] = useState(null);
  const itemsPerPage = 12;
  const isMobile = useMediaQuery(baseTheme.breakpoints.down('sm'));
  const [cardNumber, setCardNumber] = useState('');
  const [cardBalance, setCardBalance] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [mpesaMode, setMpesaMode] = useState(true);
  const [useStkPush, setUseStkPush] = useState(true);
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [selectedCreditSale, setSelectedCreditSale] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [repayCustomerTelephone, setRepayCustomerTelephone] = useState('');

  const { initiateManualTillPayment, paymentStatus, transactionId } = useManualTillPayment();


  // remove stray raw <select> — we use MUI Select later

  const theme = isHighContrast ? highContrastTheme : baseTheme;

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);

  const filteredInventory = useMemo(() =>
    inventory.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (categoryFilter === 'all' || item.category === categoryFilter)
    ), [inventory, searchQuery, categoryFilter]);

  const paginatedInventory = useMemo(() =>
    filteredInventory.slice(0, (page + 1) * itemsPerPage), [filteredInventory, page]);

  const filteredCreditSales = useMemo(() =>
    creditSales.filter(sale =>
      sale.customer.toLowerCase().includes(creditSearchQuery.toLowerCase()) ||
      sale.phone.toLowerCase().includes(creditSearchQuery.toLowerCase())
    ), [creditSales, creditSearchQuery]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
      const cachedInventory = getCachedInventory(parsedUser.branch?.id);
      if (cachedInventory) setInventory(cachedInventory);
      else if (parsedUser.branch?.id) fetchInventory(parsedUser.branch.id);
      else showError('No branch ID found for user. Please re-login or contact admin.');
    }
    if (!localStorage.getItem('cartHintShown')) {
      setToast({ open: true, msg: 'Press Ctrl+C to view your cart', sev: 'info' });
      localStorage.setItem('cartHintShown', 'true');
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.ctrlKey && e.key === 'c') setIsCartModalOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cacheInventory = (data, branchId) => {
    localStorage.setItem(`inventory_${branchId}`, JSON.stringify({ data, timestamp: Date.now() }));
  };

  const getCachedInventory = branchId => {
    const cached = localStorage.getItem(`inventory_${branchId}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) return data;
    }
    return null;
  };

  const fetchInventory = useCallback(debounce(async branchId => {
    if (!branchId) { showError('Cannot fetch inventory: Missing branch ID'); return; }
    setLoading(true);
    try {
      const res = await clientPOS.get(`/api/branches/${branchId}/inventory?type=butchery`);
      console.log(res.data)
      const items = Array.isArray(res.data) ? res.data : [];
      console.log(items)
      setInventory(items);
      cacheInventory(items, branchId);
      setError('');
    } catch (err) {
      console.log(err.response)
      const errorMsg = err.response
        ? `Failed to fetch inventory: ${err.response.status} - ${err.response.data?.message || 'Server error'}`
        : 'Network error: Unable to connect to server';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, 300), []);


  const onLogin = async () => {
    setInventory([]); // clear old inventory
    setUser(null);    // clear old user
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (!username.trim() || !password.trim()) { showError('Please enter both username and password'); return; }
    setLoading(true);
    try {
      const res = await clientPOS.post('/api/auth/token', { username, password }, { withCredentials: true, headers: { 'Accept': 'application/json' } });
      setUser(res.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
      }
      if (res.data.user.branch?.id) await fetchInventory(res.data.user.branch.id);
      else showError('Login successful, but no branch ID found for user. Please re-login or contact admin.');
    } catch (err) {
      const errorMsg = err.response
        ? `Login failed: ${err.response.data?.detail || 'Invalid credentials'}`
        : 'Network error: Unable to connect to server';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditModalOpen = () => setCreditModalOpen(true);
  const handleCreditModalClose = () => setCreditModalOpen(false);

  const handleKeyDown = event => { if (event.key === 'Enter') login(); };

  const validatePhone = phone => /^\+254\d{9}$/.test(phone);

  const showError = msg => {
    setError(msg);
    setToast({ open: true, msg, sev: 'error', action: null });
  };

  const registerCard = async () => {
    try {
      const res = await clientPOS.post(`/api/cards/register`, {
        customer_name: customerName,
        phone: customerTelephone,
      });
      setToast({ open: true, msg: `Card registered: ${res.data.card_number}`, sev: 'success' });
      setCardNumber(res.data.card_number);
      setCardBalance(res.data.balance);
    } catch (err) {
      setToast({ open: true, msg: err.response?.data?.message || 'Could not register card', sev: 'error' });
    }
  };

  const redeemCard = async () => {
    try {
      const res = await clientPOS.post(`/api/cards/redeem`, {
        card_number: cardNumber,
        amount: redeemAmount,
      });
      setCardBalance(res.data.new_balance);
      setToast({ open: true, msg: `Redeemed KES ${redeemAmount}. Balance: ${res.data.new_balance}`, sev: 'success' });
    } catch (err) {
      setToast({ open: true, msg: err.response?.data?.message || 'Could not redeem card', sev: 'error' });
    }
  };

  const topupCard = async () => {
    try {
      const res = await clientPOS.post(`/api/cards/topup`, {
        card_number: cardNumber,
        amount: topupAmount,
      });
      setCardBalance(res.data.new_balance);
      setToast({ open: true, msg: `Topped up KES ${topupAmount}. Balance: ${res.data.new_balance}`, sev: 'success' });
      setTopupAmount('');
    } catch (err) {
      setToast({ open: true, msg: err.response?.data?.message || 'Could not top up card', sev: 'error' });
    }
  };

  const openAddToCartModal = item => {
    setSelectedItem(item);
    setModalQuantity(1);
    setModalSpendAmount('');
    setUseSpendAmount(true);
    setIsModalOpen(true);
  };

  const quickAddToCart = item => {
    if (item.stock < 1) { showError(`No stock available for ${item.name}`); return; }
    setCart(prev => {
      const cartItem = prev.find(i => i.id === item.id);
      if (cartItem) {
        const newQuantity = cartItem.quantity + 1;
        if (newQuantity > item.stock) {
          setToast({ open: true, msg: `Cannot add more, stock limit reached for ${item.name}`, sev: 'warning' });
          return prev;
        }
        return prev.map(i => i.id === item.id ? { ...i, quantity: newQuantity } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setToast({ open: true, msg: `${item.name} added to cart`, sev: 'success' });
  };

  // ... (inside the Butchery component)

const addToCartWithQty = (item, qty) => {
  if (Number.isNaN(qty) || qty <= 0) return;
  if (item.stock < qty) {
    showError(`Not enough stock for ${item.name}`);
    return;
  }

  setCart((prev) => {
    const cartItem = prev.find((i) => i.id === item.id);
    const newQuantity = (cartItem ? cartItem.quantity : 0) + qty;
    if (newQuantity > item.stock) {
      setToast({ open: true, msg: `Cannot add more, stock limit reached for ${item.name}`, sev: 'warning' });
      return prev;
    }
    if (cartItem) {
      return prev.map((i) => (i.id === item.id ? { ...i, quantity: newQuantity } : i));
    }
    return [...prev, { ...item, quantity: newQuantity }];
  });

  setToast({ open: true, msg: `${qty} x ${item.name} added to cart`, sev: 'success' });
};

const confirmAddToCart = () => {
  let quantity = modalQuantity;
  let finalSpend = 0;

  if (useSpendAmount) {
    const spendAmount = parseFloat(modalSpendAmount);
    const price = parseFloat(selectedItem.price);

    if (isNaN(spendAmount) || spendAmount <= 0) {
      showError('Please enter a valid spend amount');
      return;
    }

    // ✅ Compute precise quantity so that quantity * price = spendAmount exactly
    const exactQty = spendAmount / price;

    // Keep internal precision (up to 6 decimals avoids mismatch)
    quantity = parseFloat(exactQty.toFixed(6));

    // ✅ Always store the exact spend amount entered by user
    finalSpend = spendAmount;

    if (quantity > selectedItem.stock) {
      showError(
        `Spend amount exceeds available stock (${selectedItem.stock} ${selectedItem.unit})`
      );
      return;
    }

    if (quantity <= 0) {
      showError('Spend amount too low for this item');
      return;
    }
  } 
  else if (modalQuantity <= 0) {
    showError('Quantity must be greater than 0');
    return;
  } 
  else if (modalQuantity > selectedItem.stock) {
    showError(`Quantity exceeds available stock (${selectedItem.stock} ${selectedItem.unit})`);
    return;
  } 
  else {
    finalSpend = Number((quantity * Number(selectedItem.price)).toFixed(2));
  }

  // ✅ Update cart safely
  setCart((prev) => {
    const cartItem = prev.find((i) => i.id === selectedItem.id);
    const newQuantity = (cartItem ? cartItem.quantity : 0) + quantity;

    if (newQuantity > selectedItem.stock) {
      setToast({
        open: true,
        msg: `Cannot add more, stock limit reached for ${selectedItem.name}`,
        sev: 'warning',
      });
      return prev;
    }

    if (cartItem) {
      return prev.map((i) =>
        i.id === selectedItem.id
          ? { ...i, quantity: newQuantity, spendAmount: finalSpend }
          : i
      );
    }

    return [...prev, { ...selectedItem, quantity, spendAmount: finalSpend }];
  });

  // ✅ Cleanup and toast
  setIsModalOpen(false);
  setSelectedItem(null);
  setModalQuantity(1);
  setModalSpendAmount('');
  setToast({
    open: true,
    msg: `${selectedItem.name} added to cart (KSh ${finalSpend.toFixed(2)})`,
    sev: 'success',
  });
};


  // FIXED undo bug: capture removedItem in local var and use it in undo action
  const removeFromCart = itemId => {
    setCart(prev => {
      const removedItem = prev.find(item => item.id === itemId);
      if (!removedItem) return prev;
      const newCart = prev.filter(item => item.id !== itemId);
      setLastRemovedItem(removedItem);
      setToast({
        open: true,
        msg: `Removed ${removedItem.name} from cart`,
        sev: 'success',
        action: (
          <Button color="inherit" size="small" onClick={() => {
            setCart(prev2 => {
              const exists = prev2.find(i => i.id === removedItem.id);
              if (exists) return prev2.map(i => i.id === removedItem.id ? { ...i, quantity: i.quantity + removedItem.quantity } : i);
              return [...prev2, removedItem];
            });
            setToast(prevToast => ({ ...prevToast, open: false }));
          }}>
            Undo
          </Button>
        )
      });
      return newCart;
    });
  };

  const updateCartQuantity = (item, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
      return;
    }
    if (newQuantity > item.stock) {
      setToast({ open: true, msg: `Cannot set quantity above stock (${item.stock}) for ${item.name}`, sev: 'warning' });
      return;
    }
    setCart(prev => prev.map(i => (i.id === item.id ? { ...i, quantity: newQuantity } : i)));
  };

  const checkout = async () => {
    if (cart.length === 0) { showError('Cart is empty'); return; }
    if (paymentMethod === 'Credit' && (!customerName.trim() || !customerIdNumber.trim() || !customerTelephone.trim())) {
      showError('Please fill all customer details for credit sale');
      return;
    }
    if (paymentMethod === 'M-Pesa' && !customerTelephone.trim()) {
      showError('Customer telephone is required for M-Pesa');
      return;
    }
    if (paymentMethod !== 'Credit' && paymentMethod !== 'M-Pesa' && amountPaid < cartTotal) {
      showError('Insufficient amount paid');
      return;
    }

    setLoading(true);
    try {
      // build payload with conditional spreads (safe)
      const salePayload = {
        branch: user.branch.id,
        items: cart.map(item => ({
          item: item.id,
          quantity: item.quantity,
          price: Number(item.price)
        })),
        payment_method: paymentMethod,
        seller_id: user.username,
        ...(paymentMethod === 'Credit' && {
          customer_name: customerName,
          customer_id_number: customerIdNumber,
          customer_telephone_number: customerTelephone
        }),
        ...(paymentMethod === 'M-Pesa' && {
          customer_telephone_number: customerTelephone,
          use_stkpush: useStkPush,
        }),
        ...(paymentMethod === 'Cash' && {
          cash_tendered: Number(amountPaid)
        }),
        ...(paymentMethod === 'card' && {
          customer_name: customerName,
          customer_telephone_number: customerTelephone,
          card_number: cardNumber,
          redeem_amount: redeemAmount
        }),
      };

      // create sale
      const saleRes = await clientPOS.post('/api/sales', salePayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}`, Accept: 'application/json' }
      });

      const saleId = saleRes.data.sale_id || saleRes.data.id;

      if (paymentMethod === 'M-Pesa') {
        if (useStkPush) {
          setToast({ open: true, msg: 'STK push sent. Waiting for payment confirmation…', sev: 'info' });
        } else {
          setToast({ open: true, msg: `Please pay to Till/Paybill using Sale ID ${saleId} as account ref. Waiting for confirmation…`, sev: 'info' });
        }
      } else {
        setReceiptData({
          branch: user.branch,
          reference: saleId,
          timestamp: new Date().toLocaleString(),
          items: cart,
          payment_method: paymentMethod,
          cash_tendered: paymentMethod !== 'Credit' ? amountPaid : 0,
          total: cartTotal,
          change: paymentMethod !== 'Credit' ? amountPaid - cartTotal : 0,
          seller_id: user.username,
          ...(paymentMethod === 'Credit' && {
            customer_name: customerName,
            customer_id_number: customerIdNumber,
            customer_telephone: customerTelephone
          })
        });
        setIsReceiptModalOpen(true);
        setIsCartModalOpen(false);
      }

      // post-checkout cleanup
      setCart([]);
      setAmountPaid(0);
      setCustomerName('');
      setCustomerIdNumber('');
      setCustomerTelephone('');
      setError('');
      await fetchInventory(user.branch.id);
      setToast({ open: true, msg: 'Sale recorded', sev: 'success' });
    } catch (err) {
      const errorMsg = err.response
        ? `Checkout failed: ${err.response.data?.message || 'Server error'}`
        : 'Network error: Unable to connect to server';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  const fetchCreditSales = async () => {
    setLoading(true);
    try {
      const res = await clientPOS.get('api/credit-sales', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setCreditSales(res.data);
    } catch (err) {
      const errorMsg = err.response
        ? `Failed to fetch credit sales: ${err.response.status} - ${err.response.data?.message || 'Server error'}`
        : 'Network error: Unable to connect to server';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (creditModalOpen) fetchCreditSales();
  }, [creditModalOpen]);

  const submitRepayment = async () => {
    if (!selectedSale) { showError('Please select a credit sale'); return; }
    if (!repayForm.amount || Number(repayForm.amount) <= 0) { showError('Please enter a valid payment amount'); return; }
    setLoading(true);
    try {
      const res = await clientPOS.post(`api/credit-sales/${selectedSale.id}/pay`, repayForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setCreditRepaymentMessage(res.data.message);
      setCreditRepaymentReceipt(res.data.receipt);
      setCreditRepaymentReceiptModalOpen(true);
      fetchCreditSales();
    } catch (err) {
      const errorMsg = err.response
        ? `Payment failed: ${err.response.data?.error || 'Server error'}`
        : 'Network error: Unable to connect to server';
      showError(errorMsg);
    } finally {
      setRepayForm({ amount: '', method: 'Cash' });
      setSelectedSale(null);
      setRepayOpen(false);
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (!receiptData) return;
  
    const doc = new jsPDF();
  
    // === Watermark ===
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(60);
    doc.setFont("courier", "bold");
    const watermarkText = "Butchery POS";
  
    // Repeat watermark diagonally across page
    for (let x = 20; x < 210; x += 80) {
      for (let y = 60; y < 297; y += 80) {
        doc.text(watermarkText, x, y, { angle: 45 });
      }
    }
  
    // === Header ===
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 40, "F");
    
    // Logo in header
    const logoImage = "/assets/images/1862d8b3-ca93-47a2-b6fa-230c357944b0.jpeg";
    try {
      doc.addImage(logoImage, "PNG", 85, 2, 40, 20, undefined, "FAST");
    } catch (error) {
      console.warn("Failed to load logo image:", error);
    }
  
    // Header text
    doc.setFontSize(16);
    doc.setFont("courier", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("King Of The Grill Butchery - POS Receipt", 105, 28, { align: "center" });
  
    // Receipt Number / Reference and Business Info
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Receipt No: ${receiptData.reference || "N/A"}`, 105, 34, { align: "center" });
    doc.text("Powered by kingofthegrill.co.ke", 105, 39, { align: "center" });
  
    // === Branch + timestamp + QR Code ===
    doc.setFontSize(11);
    doc.setFont("courier", "normal");
    doc.setTextColor(0, 0, 0);
    doc.roundedRect(15, 50, 180, 20, 3, 3, "S");
    // Branch and timestamp on the left
    doc.text(`Branch: ${receiptData.branch?.name || "N/A"}`, 20, 58);
    doc.text(`Time: ${receiptData.timestamp || new Date().toLocaleString()}`, 20, 66);
    // QR Code on the right
    const qrText = `Receipt: ${receiptData.reference || "N/A"} | Txn: ${receiptData.transaction_id || "N/A"} | Total: KES ${formatNumber(receiptData.total || 0)} | Branch: ${receiptData.branch?.name || "N/A"}`;
    try {
      const qrBase64 = await QRCode.toDataURL(qrText);
      doc.addImage(qrBase64, "PNG", 165, 50, 20, 20);
    } catch (error) {
      console.warn("Failed to generate QR code:", error);
    }
  
    // === Divider ===
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 73, 190, 73);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(20, 74, 190, 74);
  
    let y = 80;
  
    // === Section Title ===
    doc.setFont("courier", "bold");
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("Transaction Details", 20, y);
    y += 10;
  
    // === Table / Items ===
    if (receiptData.items) {
      doc.roundedRect(15, y - 4, 180, receiptData.items.length * 10 + 40, 3, 3, "S");
      doc.setFont("courier", "normal");
      doc.setFontSize(10);
  
      receiptData.items.forEach((it) => {
        doc.setTextColor(50, 50, 50);
        doc.text(`${it.name} (${it.unit || "kg"})`, 20, y + 4);
        doc.text(`${formatNumber(it.quantity, 2)} x KES ${formatNumber(it.price)}`, 150, y + 4, { align: "right" });
        doc.setTextColor(256, 0, 0);
        doc.text(`KES ${formatNumber(it.quantity * it.price)}`, 190, y + 4, { align: "right" });
        y += 10;
        doc.line(15, y, 195, y);
      });
  
      // === Totals ===
      y += 5;
      doc.setFont("courier", "normal");
      doc.setTextColor(30, 30, 30);
      const total = receiptData.subtotal || receiptData.total || 0;
      const tax = receiptData.tax || total * 0.16;
      const subtotal = total - tax;
      doc.text(`Subtotal (KES): ${formatNumber(subtotal)}`, 190, y, { align: "right" });
      y += 7;
      doc.text(`VAT (16%): KES ${formatNumber(tax)}`, 190, y, { align: "right" });
      y += 7;
      doc.setFont("courier", "bold");
      doc.text(`Grand Total (KES): ${formatNumber(receiptData.total)}`, 190, y, { align: "right" });
      y += 12;
  
      if (receiptData.cash_tendered) {
        doc.setFont("courier", "normal");
        doc.text(`Cash Tendered (KES): ${formatNumber(receiptData.cash_tendered)}`, 190, y, { align: "right" });
        y += 7;
        doc.text(`Change (KES): ${formatNumber(receiptData.change || 0)}`, 190, y, { align: "right" });
        y += 10;
      }
    }
  
    // === Customer Info (for Credit / M-Pesa) ===
    if (receiptData.payment_method === "Credit" || receiptData.payment_method === "M-Pesa") {
      doc.setFont("courier", "normal");
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Customer: ${receiptData.customer_name || "N/A"}`, 20, y);
      y += 6;
      if (receiptData.customer_id_number) {
        doc.text(`ID: ${receiptData.customer_id_number}`, 20, y);
        y += 6;
      }
      if (receiptData.customer_telephone) {
        doc.text(`Phone: ${receiptData.customer_telephone}`, 20, y);
        y += 8;
      }
    }
  
    // === Payment Method ===
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text(`Payment Method: ${receiptData.payment_method || "N/A"}`, 20, y);
    y += 6;
  
    if (receiptData.transaction_id) {
      doc.text(`Transaction ID: ${receiptData.transaction_id}`, 20, y);
      y += 8;
    }
  
    // === Served By ===
    doc.setFont("courier", "italic");
    doc.setTextColor(80, 80, 80);
    doc.text(`Served by: ${receiptData.seller_id || "N/A"}`, 20, y);
    y += 15;
  
    // === Thank You Message ===
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text("Thank you for shopping with us!", 105, y, { align: "center" });
  
    // Save
    doc.save(`receipt_${receiptData.reference || Date.now()}.pdf`);
};
  

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setInventory([]);
    setCart([]);
    setError('');
    setUsername('');
    setPassword('');
    setToast({ open: true, msg: 'Logged in successfully', sev: 'success' });
  };

  const calculatedQuantity = useSpendAmount ? (modalSpendAmount / (selectedItem?.price || 1)).toFixed(2) : modalQuantity;
  const calculatedTotal = useSpendAmount ? modalSpendAmount : (modalQuantity * (selectedItem?.price || 0)).toFixed(2);


  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>Butchery: King of the grill</title>
        <meta name="theme-color" content="#7F0000" />
        <link rel="icon" href="/assets/images/1862d8b3-ca93-47a2-b6fa-230c357944b0.jpeg" type="image/png" />
      </Helmet>
      <div className={styles.body}>
      <ErrorBoundary>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          {!isAuthenticated ? (
            <AppleLoginForm
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            onLogin={onLogin}
            loading={loading}
            error={error}
          />
          ) : (
            <>

              <AppHeader
                isMobile={isMobile}
                user={user}
                cartItemCount={cartItemCount}
                isHighContrast={isHighContrast}
                setIsHighContrast={setIsHighContrast}
                setIsCartModalOpen={setIsCartModalOpen}
                handleCreditModalOpen={handleCreditModalOpen}
                logout={logout}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setRepayOpen={setRepayOpen}  // Adjust if needed
                inventory={inventory}
                cart={cart}
                addToCart={addToCartWithQty}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
                openAddToCartModal={openAddToCartModal}
                setModalQuantity={setModalQuantity}
                openCheckout={() => setIsCartModalOpen(true)}
              />

              <Container sx={{ py: 5, flexGrow: 1 }} maxWidth="lg">
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, #FFD700, #B71C1C, #FFD700)',
                    marginBottom: '1.5rem',
                    boxShadow: '0 0 10px rgba(255,215,0,0.6)',
                  }}
                />
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48 }}>
                      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>Inventory</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                        <TextField label="Search Items" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} variant="outlined" fullWidth InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />, endAdornment: searchQuery && (<IconButton onClick={() => setSearchQuery('')} aria-label="Clear search"><Close /></IconButton>) }} />
                        <FormControl sx={{ minWidth: 160 }}>
                          <InputLabel id="category-label">Category</InputLabel>
                          <Select labelId="category-label" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} label="Category" aria-label="Filter by category">
                            <MenuItem value="all">All</MenuItem>
                            {[...new Set(inventory.map(item => item.category))].map(category => (<MenuItem key={category} value={category}>{category}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </motion.div>

                    {loading ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.48 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 8, flexDirection: 'column', gap: 3 }}>
                          <CircularProgress size={60} color="primary" thickness={5} />
                          <LinearProgress sx={{ width: '200px', borderRadius: 5, height: 6 }} />
                          <Typography variant="body1" color="text.secondary">Loading inventory...</Typography>
                        </Box>
                      </motion.div>
                    ) : paginatedInventory.length ? (
                      <InfiniteScroll dataLength={paginatedInventory.length} next={() => setPage(prev => prev + 1)} hasMore={paginatedInventory.length < filteredInventory.length} loader={<Box sx={{ textAlign: 'center', my: 4 }}><CircularProgress size={40} /></Box>}>
                        <Grid container spacing={4}>
                          {paginatedInventory.map((item, index) => (
                            <Grid key={item.id} item xs={12} sm={6} md={4} lg={3}>
                              <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: index * 0.06 }}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                  {item.stock <= 5 && (<Badge badgeContent="Low Stock" color="error" sx={{ position: 'absolute', top: 16, right: 16 }} />)}
                                  <CardMedia component="img" height="200" image={item?.image ? `${API_BASE_URL}/storage/${item.image}` : 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?cs=srgb&dl=pexels-mali-65175.jpg&fm=webp'} alt={item?.name || 'Inventory Item'} loading="lazy" onError={e => { e.target.onerror = null; e.target.src = 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?cs=srgb&dl=pexels-mali-65175.jpg&fm=webp'; }} sx={{ objectFit: 'cover', borderRadius: '16px 16px 0 0' }} />
                                  <CardContent sx={{ flexGrow: 1, pt: 3, px: 3, pb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{item.name}</Typography>
                                    <Typography variant="body1" color="primary" sx={{ fontWeight: 600, mb: 0.5 }}>KES {Number(item.price).toFixed(2)} / {item.unit}</Typography>
                                    <Typography variant="body2" color="text.secondary">Stock: {item.stock}</Typography>
                                  </CardContent>
                                  <CardActions sx={{ px: 3, pb: 3, display: 'flex', gap: 1 }}>
                                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                                      <Button fullWidth variant="contained" color="primary" startIcon={<Add />} onClick={() => openAddToCartModal(item)} disabled={loading || item.stock <= 0} size="large" aria-label={`Add ${item.name} to cart`}>Add to Cart</Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                                      <Button variant="outlined" color="primary" onClick={() => quickAddToCart(item)} disabled={loading || item.stock <= 0} size="small" aria-label={`Quick add ${item.name} to cart`}>Quick Add</Button>
                                    </motion.div>
                                  </CardActions>
                                </Card>
                              </motion.div>
                            </Grid>
                          ))}
                        </Grid>
                      </InfiniteScroll>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.48 }}>
                        <Grid item xs={12}>
                          <Alert severity="info" icon={<ErrorOutline fontSize="large" />} sx={{ bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main', p: 4, borderRadius: 4, textAlign: 'center' }}>
                            No butchery items available. {error ? `Error: ${error}` : 'Check branch ID, login status, or contact admin to assign a branch.'}
                            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3 }}>
                              {user?.branch?.id && (
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                                  <Button variant="outlined" color="info" size="medium" onClick={() => fetchInventory(user.branch.id)} disabled={loading} aria-label="Retry fetching inventory">Retry</Button>
                                </motion.div>
                              )}
                              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="outlined" color="info" size="medium" onClick={logout} disabled={loading} aria-label="Re-login">Re-login</Button>
                              </motion.div>
                            </Stack>
                          </Alert>
                        </Grid>
                      </motion.div>
                    )}
                  </Grid>
                </Grid>
              </Container>


              <Box sx={{
                  position: 'fixed',
                  bottom: 88,
                  right: 18,
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #FFD700 0%, #B71C1C 100%)',
                  color: '#000',
                  boxShadow: '0 0 20px rgba(255,215,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontWeight: 700,
                }}>
                <Badge badgeContent={cartItemCount} color="primary"><ShoppingCart /></Badge>
                <Typography variant="body2">KES {cartTotal.toFixed(2)}</Typography>
              </Box>

              <AnimatePresence>
                {isCartModalOpen && !isMobile && (
                  <Drawer anchor="right" open={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 560 }, p: 2 } }}>
                    <FocusTrap open>
                      <motion.div variants={dialogVariants} initial="hidden" animate="visible" exit="exit">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>Shopping Cart</Typography>
                          <IconButton onClick={() => setIsCartModalOpen(false)} aria-label="Close cart"><Close /></IconButton>
                        </Box>
                        <Box sx={{ p: 2 }}>
                        <CartPanel
                          cart={cart}
                          setCart={setCart}
                          cartCount={cartItemCount}
                          cartTotal={cartTotal}
                          loading={loading}
                          isMobile={isMobile}
                          paymentMethod={paymentMethod}
                          amountPaid={amountPaid}
                          customerTelephone={customerTelephone}
                          customerName={customerName}
                          customerIdNumber={customerIdNumber}
                          cardNumber={cardNumber}
                          cardBalance={cardBalance}
                          redeemAmount={redeemAmount}
                          topupAmount={topupAmount}
                          registerName={registerName}
                          registerPhone={registerPhone}
                          mpesaMode={mpesaMode}
                          setMpesaMode={setMpesaMode}
                          updateCartQuantity={updateCartQuantity}
                          removeFromCart={removeFromCart}
                          setPaymentMethod={setPaymentMethod}
                          setAmountPaid={setAmountPaid}
                          setCustomerTelephone={setCustomerTelephone}
                          setCustomerName={setCustomerName}
                          setCustomerIdNumber={setCustomerIdNumber}
                          validatePhone={validatePhone}
                          registerCard={registerCard}
                          redeemCard={redeemCard}
                          topupCard={topupCard}
                          checkout={checkout}
                          formatNumber={formatNumber}
                          error={error}
                          setError={setError} // Add setError
                          user={user} // Add user
                          setToast={setToast}
                        />
                        </Box>
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={() => setIsCartModalOpen(false)} color="secondary" variant="outlined" sx={{ borderRadius: 10 }} aria-label="Close cart">Close</Button>
                          </motion.div>
                          {cart.length > 0 && (
                            <>
                              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="contained" color="primary" onClick={checkout} disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null} sx={{ borderRadius: 10 }} aria-label="Checkout cart">Checkout</Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="outlined" color="primary" onClick={() => window.print()} startIcon={<Print />} sx={{ borderRadius: 10 }} aria-label="Print cart">Print</Button>
                              </motion.div>
                            </>
                          )}
                        </Box>
                      </motion.div>
                    </FocusTrap>
                  </Drawer>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isCartModalOpen && isMobile && (
                  <Dialog open={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
                    <FocusTrap open>
                      <motion.div variants={dialogVariants} initial="hidden" animate="visible" exit="exit">
                        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '20px 20px 0 0', pb: 2 }}>
                          Shopping Cart
                          <IconButton onClick={() => setIsCartModalOpen(false)} sx={{ position: 'absolute', right: 16, top: 16, color: 'white' }} aria-label="Close cart"><Close /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ pt: 4, mt: 2 }}>
                          <CartPanel
                            cart={cart}
                            setCart={setCart}
                            cartCount={cartItemCount}
                            cartTotal={cartTotal}
                            loading={loading}
                            isMobile={isMobile}
                            paymentMethod={paymentMethod}
                            amountPaid={amountPaid}
                            customerTelephone={customerTelephone}
                            customerName={customerName}
                            customerIdNumber={customerIdNumber}
                            cardNumber={cardNumber}
                            cardBalance={cardBalance}
                            redeemAmount={redeemAmount}
                            topupAmount={topupAmount}
                            registerName={registerName}
                            registerPhone={registerPhone}
                            mpesaMode={mpesaMode}
                            setMpesaMode={setMpesaMode}
                            updateCartQuantity={updateCartQuantity}
                            removeFromCart={removeFromCart}
                            setPaymentMethod={setPaymentMethod}
                            setAmountPaid={setAmountPaid}
                            setCustomerTelephone={setCustomerTelephone}
                            setCustomerName={setCustomerName}
                            setCustomerIdNumber={setCustomerIdNumber}
                            validatePhone={validatePhone}
                            registerCard={registerCard}
                            redeemCard={redeemCard}
                            topupCard={topupCard}
                            checkout={checkout}
                            formatNumber={formatNumber}
                            error={error}
                            setError={setError} // Add setError
                            user={user} // Add user
                            setToast={setToast}
                          />
                        </DialogContent>
                        <DialogActions sx={{ px: 4, pb: 4 }}>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={() => setIsCartModalOpen(false)} color="secondary" variant="outlined" sx={{ borderRadius: 10 }} aria-label="Close cart">Close</Button>
                          </motion.div>
                          {cart.length > 0 && (
                            <>
                              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="contained" color="primary" onClick={checkout} disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null} sx={{ borderRadius: 10 }} aria-label="Checkout cart">Checkout</Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                                <Button variant="outlined" color="primary" onClick={() => window.print()} startIcon={<Print />} sx={{ borderRadius: 10 }} aria-label="Print cart">Print</Button>
                              </motion.div>
                            </>
                          )}
                        </DialogActions>
                      </motion.div>
                    </FocusTrap>
                  </Dialog>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isModalOpen && (
                  <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="xs" fullWidth>
                    <FocusTrap open>
                      <motion.div variants={dialogVariants} initial="hidden" animate="visible" exit="exit">
                        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', position: 'relative', borderRadius: '20px 20px 0 0', pb: 2 }}>
                          Add to Cart - {selectedItem?.name}
                          <IconButton onClick={() => setIsModalOpen(false)} sx={{ position: 'absolute', right: 16, top: 16, color: 'white' }} aria-label="Close add to cart dialog"><Close /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ pt: 4, pb: 2, mt: 2 }}>
                          <Stack spacing={3}>
                            <FormControl fullWidth variant="outlined">
                              <InputLabel id="mode-label">Add By</InputLabel>
                              <Select labelId="mode-label" label="Add By" value={useSpendAmount ? 'spend' : 'quantity'} onChange={e => setUseSpendAmount(e.target.value === 'spend')} aria-label="Select add by method">
                                <MenuItem value="spend">Spend Amount</MenuItem>
                                <MenuItem value="quantity">Quantity</MenuItem>
                              </Select>
                            </FormControl>
                            {useSpendAmount ? (
                              <>
                                <TextField type="number" inputProps={{ step: '0.01' }} label="Spend Amount (KES)" value={modalSpendAmount} onChange={e => setModalSpendAmount(e.target.value)} fullWidth variant="outlined" helperText="Enter the amount to spend" />
                                <Typography variant="body2" color="text.secondary">Calculated Quantity: {calculatedQuantity} {selectedItem?.unit}</Typography>
                              </>
                            ) : (
                              <>
                                <TextField type="number" inputProps={{ step: '0.01', min: 0 }} label={`Quantity (${selectedItem?.unit})`} value={modalQuantity} onChange={e => setModalQuantity(Number(e.target.value))} fullWidth variant="outlined" helperText={`Enter quantity in ${selectedItem?.unit}`} />
                                <Typography variant="body2" color="text.secondary">Calculated Total: KES {calculatedTotal}</Typography>
                              </>
                            )}
                            <Alert severity="info" variant="outlined">Price: KES {Number(selectedItem?.price || 0).toFixed(2)} / {selectedItem?.unit} • Stock: {selectedItem?.stock}</Alert>
                          </Stack>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 3 }}>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={() => setIsModalOpen(false)} color="secondary" variant="outlined" fullWidth={isMobile} aria-label="Cancel add to cart">Cancel</Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="contained" color="primary" onClick={confirmAddToCart} startIcon={<Add />} fullWidth={isMobile} aria-label="Confirm add to cart">Add</Button>
                          </motion.div>
                        </DialogActions>
                      </motion.div>
                    </FocusTrap>
                  </Dialog>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isReceiptModalOpen && (
                  <Dialog open={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} maxWidth="sm" fullWidth>
                    <FocusTrap open>
                      <motion.div variants={dialogVariants} initial="hidden" animate="visible" exit="exit">
                        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '20px 20px 0 0', pb: 2 }}>
                          Receipt
                          <IconButton onClick={() => setIsReceiptModalOpen(false)} sx={{ position: 'absolute', right: 16, top: 16, color: 'white' }} aria-label="Close receipt"><Close /></IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ pt: 4, mt: 2 }}>
                          {receiptData ? (
                            <Paper
                              elevation={4}
                              sx={{
                                p: 3,
                                borderRadius: 4,
                                background: 'linear-gradient(145deg, #fdfdfd, #f5f5f5)', // Softer off-white
                                color: '#1a1a1a', // High-contrast dark text
                              }}
                            >
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                                Branch: {receiptData.branch?.name}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 2, color: '#2d2d2d' }}>
                                Time: {receiptData.timestamp}
                              </Typography>

                              {receiptData.payment_method === 'Credit' && (
                                <>
                                  <Typography variant="body2" sx={{ mb: 1, color: '#2d2d2d' }}>
                                    Customer: {receiptData.customer_name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 1, color: '#2d2d2d' }}>
                                    ID: {receiptData.customer_id_number}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mb: 1, color: '#2d2d2d' }}>
                                    Phone: {receiptData.customer_telephone}
                                  </Typography>
                                </>
                              )}

                              {receiptData.payment_method === 'M-Pesa' && (
                                <Typography variant="body2" sx={{ mb: 1, color: '#2d2d2d' }}>
                                  Phone: {receiptData.customer_telephone_number}
                                </Typography>
                              )}

                              <Divider sx={{ my: 3, bgcolor: 'grey.400' }} />

                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.875rem' }}>Item</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.875rem' }}>Qty</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.875rem' }}>Price</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.875rem' }}>Total</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {receiptData.items.map((i) => (
                                    <TableRow key={i.id}>
                                      <TableCell sx={{ color: '#2d2d2d' }}>{i.name}</TableCell>
                                      <TableCell sx={{ color: '#2d2d2d' }}>{i.quantity}</TableCell>
                                      <TableCell sx={{ color: '#2d2d2d' }}>KES {Number(i.price).toFixed(2)}</TableCell>
                                      <TableCell sx={{ color: '#2d2d2d' }}>KES {(Number(i.price) * i.quantity).toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow>
                                    <TableCell colSpan={3} sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                                      Total
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#d32f2f' }}> {/* Red for emphasis */}
                                      KES {receiptData.total.toFixed(2)}
                                    </TableCell>
                                  </TableRow>

                                  {receiptData.payment_method !== 'Credit' && (
                                    <>
                                      <TableRow>
                                        <TableCell colSpan={3} sx={{ color: '#2d2d2d' }}>Cash Tendered</TableCell>
                                        <TableCell sx={{ color: '#2d2d2d' }}>KES {Number(receiptData.cash_tendered).toFixed(2)}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell colSpan={3} sx={{ color: '#2d2d2d' }}>Change</TableCell>
                                        <TableCell sx={{ color: '#2d2d2d' }}>KES {Number(receiptData.change).toFixed(2)}</TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                </TableBody>
                              </Table>

                              <Typography variant="body2" sx={{ mt: 3, color: '#2d2d2d' }}>
                                Payment Method: {receiptData.payment_method}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#2d2d2d' }}>
                                Seller: {receiptData.seller_id}
                              </Typography>
                            </Paper>
                          ) : (
                            <Typography variant="body1" color="#555">
                              No receipt data available.
                            </Typography>
                          )}
                        </DialogContent>
                        <DialogActions sx={{ px: 4, pb: 4 }}>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                            <Button onClick={() => setIsReceiptModalOpen(false)} color="secondary" variant="outlined" sx={{ borderRadius: 10 }} aria-label="Close receipt">Close</Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="contained" color="primary" onClick={downloadReceipt} startIcon={<Download />} sx={{ borderRadius: 10 }} aria-label="Download receipt as PDF">Download PDF</Button>
                          </motion.div>
                        </DialogActions>
                      </motion.div>
                    </FocusTrap>
                  </Dialog>
                )}
              </AnimatePresence>

              <CreditRepaymentManager
                open={creditModalOpen}
                onClose={() => setCreditModalOpen(false)}
                creditSales={creditSales}
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

              {/* Toast / Snackbar */}
              <Snackbar open={toast.open} autoHideDuration={6000} onClose={() => setToast(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert elevation={6} onClose={() => setToast(prev => ({ ...prev, open: false }))} severity={toast.sev} action={toast.action} sx={{ minWidth: 280 }}>
                  {toast.msg}
                </Alert>
              </Snackbar>

            </>
          )}
        </motion.div>
      </ErrorBoundary>
      </div>
      
    </ThemeProvider>
  );
}

