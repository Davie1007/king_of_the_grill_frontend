// Gas.jsx — Upgraded look & feel to match OwnerDashboard
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Grid,
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Alert,
  Snackbar,
  IconButton,
  CircularProgress,
  Tooltip,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  Badge,
  Drawer,
  Fade,
  Modal,
  Chip,
} from "@mui/material";
import {
  ShoppingCart,
  Logout,
  Add as AddIcon,
  RemoveCircleOutline,
  Close as CloseIcon,
  Contrast,
  Print,
  Download,
  WarningAmberRounded as WarningIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import debounce from "lodash.debounce";
import echo from "../components/echo";
import { API_BASE_URL, clientPOS } from "../components/clientPOS";
import AppleLoginForm from "../components/AppleLoginForm"
import { baseTheme, highContrastTheme} from "../components/gas/gasTheme";
import { CartPanel } from "../components/cartPanel"
import CreditRepaymentManager from '../components/CreditRepaymentManager';
import AppHeader from '../components/AppHeader';
import InventoryGrid from '../components/InventoryGrid'
import {Helmet} from "react-helmet";

// -------------------- THEME & HELPERS --------------------


function formatNumber(v, digits = 2) {
  const n = Number(v);
  if (Number.isNaN(n)) return (0).toFixed(digits);
  return n.toFixed(digits);
}

const priceForTier = (item, tier) => {
  if (!item) return 0;
  if (tier === "price2") return Number(item.price2 ?? item.price ?? 0);
  if (tier === "price3") return Number(item.price3 ?? item.price ?? 0);
  return Number(item.price ?? 0);
};

const buildCartId = (item, tier) => `${item.id}-${tier}`;

// Motion variants
const cardMotion = { whileHover: { y: -6, scale: 1.02 }, transition: { type: "spring", stiffness: 320 } };
const dialogMotion = { initial: { opacity: 0, y: 12, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 12, scale: 0.98 } };

// -------------------- COMPONENT --------------------


export default function Gas() {
  // auth/UI state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // app state
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]); // each entry: { cartId, id, name, price, priceTier, quantity, stock, unit }
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerIdNumber, setCustomerIdNumber] = useState('');
  const [customerRegistered, setCustomerRegistered] = useState(false);
  const [cardNumber, setCardNumber] = useState(null);
  const [cardBalance, setCardBalance] = useState(0);
  const [customerTelephone, setCustomerTelephone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [topupAmount, setTopupAmount] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [mpesaMode, setMpesaMode] = useState(true);
  const [paymentRef, setPaymentRef] = useState(null);
  const [repayCustomerTelephone, setRepayCustomerTelephone] = useState('');

  // UI/UX
  const [toast, setToast] = useState({ open: false, msg: "", sev: "info", action: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedTier, setSelectedTier] = useState("price"); // 'price'|'price2'|'price3'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  // Credit repayment states
  const [creditSales, setCreditSales] = useState([]);
  const [creditSearchQuery, setCreditSearchQuery] = useState('');
  const [selectedCreditSale, setSelectedCreditSale] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMethod, setRepayMethod] = useState('Cash');
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [repayPaymentStatus, setRepayPaymentStatus] = useState(null);
  const [repayTransactionId, setRepayTransactionId] = useState(null);

  const isMobile = useMediaQuery(baseTheme.breakpoints.down("sm"));
  const theme = isHighContrast ? highContrastTheme : baseTheme;

  // derived
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + Number(i.quantity || 0), 0), [cart]);


  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCreditSales = useMemo(() =>
    creditSales.filter(sale =>
      sale.customer.toLowerCase().includes(creditSearchQuery.toLowerCase()) ||
      sale.phone.toLowerCase().includes(creditSearchQuery.toLowerCase())
    ), [creditSales, creditSearchQuery]);

  const handleCreditModalOpen = () => setCreditModalOpen(true);
  const handleCreditModalClose = () => setCreditModalOpen(false);

  const validatePhone = phone => /^\+254\d{9}$/.test(phone);

  const showError = msg => {
    setError(msg);
    setToast({ open: true, msg, sev: 'error', action: null });
  };

  // caching helper for inventory
  const cacheInventory = (branchId, data) => {
    if (!branchId) return;
    try {
      localStorage.setItem(`gas_inventory_${branchId}`, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
  };
  const getCachedInventory = (branchId) => {
    try {
      const raw = localStorage.getItem(`gas_inventory_${branchId}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || Date.now() - parsed.ts > 5 * 60 * 1000) return null;
      return parsed.data;
    } catch {
      return null;
    }
  };

  // fetch inventory
  const fetchInventory = useCallback(
    debounce(async (branchId) => {
      if (!branchId) {
        setToast({ open: true, msg: "Missing branch ID for inventory fetch", sev: "error" });
        return;
      }
      setLoading(true);
      try {
        const res = await clientPOS.get(`/api/branches/${branchId}/inventory?type=gas`);
        const raw = Array.isArray(res.data?.data) ? res.data.data : res.data || [];
        const normalized = raw.map((it) => ({
          ...it,
          stock: Number(it.stock ?? 0),
          price: Number(it.price ?? 0),
          price2: Number(it.price2 ?? it.price ?? 0),
          price3: Number(it.price3 ?? it.price ?? 0),
        }));
        setInventory(normalized);
        cacheInventory(branchId, normalized);
      } catch (err) {
        console.error("fetchInventory error", err);
        setToast({ open: true, msg: "Failed to fetch inventory", sev: "error" });
      } finally {
        setLoading(false);
      }
    }, 250),
    []
  );

    // fetch credit sales
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

    // handle credit repayment

    // Listen for M-Pesa payment confirmations (PaymentReceived)
  useEffect(() => {
    if (!user?.branch?.id) return;

    const branchChannel = echo.channel(`payments.${user.branch.id}`);

    branchChannel.listen('PaymentReceived', (data) => {
      console.log("📡 PaymentReceived event:", data);

      setToast({
        open: true,
        msg: `Payment received via ${data.receipt?.payment_method || 'M-Pesa'} — Sale #${data.sale_id || ''}`,
        sev: 'success',
      });

      // Auto-show receipt popup
      if (data.receipt) {
        setReceiptData(data.receipt);
        setIsReceiptOpen(true);
      }

      // Refresh inventory after sale
      if (user?.branch?.id) fetchInventory(user.branch.id);
    });

    return () => {
      echo.leaveChannel(`payments.${user.branch.id}`);
    };
  }, [user]);



  const CartPanelContent = React.memo(({cart, cartCount, cartTotal, updateCartQuantity, removeFromCart, ...rest}) => (
    <Paper
      sx={{
        p: 3,
        minHeight: '100%',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65))',
        borderRadius: 3,
        boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* your table + payment controls here, exactly as before */}
    </Paper>
  ));
  
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

  // initial auth check
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        setIsAuthenticated(true);
        const cached = getCachedInventory(u.branch?.id);
        if (cached) setInventory(cached);
        else if (u.branch?.id) fetchInventory(u.branch.id);
      } catch {}
    }
  }, [fetchInventory]);

  const registerCard = async () => {
    if (!customerName.trim() || !customerTelephone.trim()) {
      setToast({ open: true, msg: 'Enter name and phone', sev: 'warning' });
      return;
    }
    try {
      const res = await clientPOS.post('/api/cards/register', {
        customer_name: customerName,
        phone: customerTelephone,
      });
      setCustomerName(customerName);
      setCustomerTelephone(customerTelephone);
      setCardNumber(res.data.cardNumber);
      setCardBalance(res.data.balance || 0);
      setToast({ open: true, msg: 'Card registered', sev: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ open: true, msg: 'Failed to register card', sev: 'error' });
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

  const issueCard = async () => {
    const res = await clientPOS.post('/loyalty/issue-card', {
      name: customerName,
      phone: customerTelephone,
    });
    // res contains card number and starting balance
    setCardNumber(res.data.cardNumber);       // <— this flips the UI
    setCardBalance(res.data.balance || 0);
  };
  

  // -------------------- AUTH --------------------
  const onLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setInventory([]); // clear old inventory
    setUser(null);    // clear old user
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (!username.trim() || !password.trim()) {
      setToast({ open: true, msg: "Enter username and password", sev: "warning" });
      return;
    }
    setLoading(true);
    try {
      const res = await clientPOS.post("/api/auth/token", { username, password });
      const u = res.data?.user;
      if (!u) throw new Error("No user returned");
      setUser(u);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(u));
      if (res.data?.access_token) localStorage.setItem("access_token", res.data.access_token);
      if (u.branch?.id) fetchInventory(u.branch.id);
      setToast({ open: true, msg: "Logged in", sev: "success" });
    } catch (err) {
      console.error("login", err);
      setToast({ open: true, msg: "Login failed", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setInventory([]);
    setCart([]);
    setToast({ open: true, msg: "Logged out", sev: "info" });
  };

  // -------------------- CART LOGIC - FIXED --------------------

  // open add-to-cart modal
  const openAddToCartModal = (item) => {
    if (Number(item.stock ?? 0) <= 0) {
      setToast({ open: true, msg: `No stock for ${item.name}`, sev: "warning" });
      return;
    }
    setSelectedItem(item);
    setModalQuantity(1);
    setSelectedTier("price");
    setIsModalOpen(true);
  };

  // quick add (price tier optional)
  const quickAddToCart = (item, tier = "price") => {
    const stock = Number(item.stock ?? 0);
    if (stock <= 0) {
      setToast({ open: true, msg: `No stock for ${item.name}`, sev: "warning" });
      return;
    }
    const selectedPrice = priceForTier(item, tier);
    const cartId = buildCartId(item, tier);
    const qtyToAdd = 1;

    setCart((prev) => {
      const exists = prev.find((c) => c.cartId === cartId);
      if (exists) {
        const newQty = Number(exists.quantity || 0) + qtyToAdd;
        if (!Number.isNaN(stock) && newQty > stock) {
          setToast({ open: true, msg: `Stock limit reached for ${item.name}`, sev: "warning" });
          return prev;
        }
        return prev.map((c) => (c.cartId === cartId ? { ...c, quantity: newQty } : c));
      }
      return [
        ...prev,
        {
          cartId,
          id: item.id,
          name: item.name,
          price: selectedPrice,
          priceTier: tier,
          quantity: qtyToAdd,
          stock,
          unit: item.unit ?? "",
        },
      ];
    });

    setToast({ open: true, msg: `${item.name} added (${tier})`, sev: "success" });
  };

  // ... (inside the Gas component)

  const addToCartWithQty = (item, tier = 'price', qty) => {
    if (Number.isNaN(qty) || qty <= 0) return;
    if (item.stock < qty) {
      setToast({ open: true, msg: `Not enough stock for ${item.name}`, sev: "warning" });
      return;
    }

    const price = priceForTier(item, tier);
    const cartId = buildCartId(item, tier);

    setCart((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      const newQuantity = (existing ? existing.quantity : 0) + qty;
      if (newQuantity > item.stock) {
        setToast({ open: true, msg: `Cannot add, stock limit reached for ${item.name}`, sev: "warning" });
        return prev;
      }
      if (existing) {
        return prev.map((i) => (i.cartId === cartId ? { ...i, quantity: newQuantity } : i));
      }
      return [...prev, { cartId, id: item.id, name: item.name, price, priceTier: tier, quantity: newQuantity, stock: item.stock, unit: item.unit }];
    });

    setToast({ open: true, msg: `${qty} x ${item.name} added to cart at ${tier}`, sev: "success" });
  };

  // confirm add from modal
  const confirmAddToCart = () => {
    if (!selectedItem) return;
    const qty = Number(modalQuantity || 0);
    if (!qty || qty <= 0) {
      setToast({ open: true, msg: "Enter a valid quantity", sev: "warning" });
      return;
    }
    const stock = Number(selectedItem.stock ?? 0);
    if (!Number.isNaN(stock) && qty > stock) {
      setToast({ open: true, msg: `Quantity exceeds stock (${stock})`, sev: "warning" });
      return;
    }

    const cartId = buildCartId(selectedItem, selectedTier);
    const selectedPrice = priceForTier(selectedItem, selectedTier);

    setCart((prev) => {
      const exists = prev.find((c) => c.cartId === cartId);
      if (exists) {
        const newQty = Number(exists.quantity || 0) + qty;
        if (!Number.isNaN(stock) && newQty > stock) {
          setToast({ open: true, msg: `Stock limit reached for ${selectedItem.name}`, sev: "warning" });
          return prev;
        }
        return prev.map((c) => (c.cartId === cartId ? { ...c, quantity: newQty } : c));
      }
      return [
        ...prev,
        {
          cartId,
          id: selectedItem.id,
          name: selectedItem.name,
          price: selectedPrice,
          priceTier: selectedTier,
          quantity: qty,
          stock,
          unit: selectedItem.unit ?? "",
        },
      ];
    });

    setIsModalOpen(false);
    setSelectedItem(null);
    setModalQuantity(1);
    setSelectedTier("price");
    setToast({ open: true, msg: "Added to cart", sev: "success" });
  };

  // remove with undo
  const removeFromCart = (cartId) => {
    const removed = cart.find((c) => c.cartId === cartId);
    if (!removed) return;
    setCart((prev) => prev.filter((c) => c.cartId !== cartId));
    setToast({
      open: true,
      msg: `Removed ${removed.name}`,
      sev: "info",
      action: (
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            setCart((prev) => {
              const exists = prev.find((p) => p.cartId === removed.cartId);
              if (exists) {
                return prev.map((p) => (p.cartId === removed.cartId ? { ...p, quantity: Number(p.quantity || 0) + Number(removed.quantity || 0) } : p));
              }
              return [...prev, removed];
            });
            setToast({ open: false, msg: "", sev: "success", action: null });
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  // update quantity
  const updateCartQuantity = (cartId, newQty) => {
    const entry = cart.find((c) => c.cartId === cartId);
    if (!entry) return;
    if (newQty <= 0) {
      removeFromCart(cartId);
      return;
    }
    const stock = Number(entry.stock ?? 0);
    if (!Number.isNaN(stock) && newQty > stock) {
      setToast({ open: true, msg: `Cannot exceed stock (${stock})`, sev: "warning" });
      return;
    }
    setCart((prev) => prev.map((c) => (c.cartId === cartId ? { ...c, quantity: newQty } : c)));
  };

  // -------------------- CHECKOUT --------------------
  const checkout = async (data) => {
    console.log('Checkout called:', { data, paymentMethod, mpesaMode, customerTelephone, cart });
  
    if (cart.length === 0) {
      setError('Cart is empty');
      setToast({ open: true, msg: 'Cart is empty', sev: 'error' });
      return;
    }
  
    if (paymentMethod === 'Credit' && (!customerName.trim() || !customerIdNumber.trim() || !customerTelephone.trim())) {
      setError('Please fill all customer details for credit sale');
      setToast({ open: true, msg: 'Please fill all customer details for credit sale', sev: 'error' });
      return;
    }
  
    if (paymentMethod === 'M-Pesa' && mpesaMode === 'stk' && !validatePhone(customerTelephone)) {
      setError('Please enter a valid phone number for STK Push');
      setToast({ open: true, msg: 'Please enter a valid phone number for STK Push', sev: 'error' });
      return;
    }
  
    if (paymentMethod !== 'Credit' && paymentMethod !== 'M-Pesa' && Number(amountPaid || 0) < cartTotal) {
      setError('Insufficient amount paid');
      setToast({ open: true, msg: 'Insufficient amount paid', sev: 'error' });
      return;
    }
  
    setLoading(true);
    try {
      // For 'txn' mode, use verified data from handleVerifyTransaction
      if (paymentMethod === 'M-Pesa' && mpesaMode === 'txn' && data) {
        console.log('Processing txn mode checkout with data:', data);
        const saleId = data.sale_id || data.id;
        setReceiptData({
          branch: user.branch,
          timestamp: new Date().toLocaleString(),
          items: cart,
          payment_method: paymentMethod,
          cash_tendered: 0,
          total: cartTotal,
          change: 0,
          seller_id: user.username,
          reference: saleId,
          transaction_id: data.transaction_id,
        });
        setIsReceiptOpen(true);
        setIsCartOpen(false);
        setCart([]); // Clear cart
        setAmountPaid('');
        setCustomerName('');
        setCustomerIdNumber('');
        setCustomerTelephone('');
        if (user?.branch?.id) await fetchInventory(user.branch.id);
        setToast({ open: true, msg: `Sale recorded (Ref: ${saleId})`, sev: 'success' });
        return;
      }
  
      // For manual C2B from PaymentReceived (automatic confirmation) - skip verify, directly process
      if (paymentMethod === 'M-Pesa' && mpesaMode === 'manual' && data && data.receipt) {
        console.log('Processing automatic C2B confirmation (PaymentReceived):', data);
        const saleId = data.receipt?.sale_id || data.sale_id || data.id;
        const txId = data.transaction_id || data.receipt?.transaction_id;
        setReceiptData({
          branch: user.branch,
          timestamp: new Date().toLocaleString(),
          items: cart,
          payment_method: paymentMethod,
          cash_tendered: 0,
          total: cartTotal,
          change: 0,
          seller_id: user.username,
          reference: saleId,
          transaction_id: txId,
        });
        setIsReceiptOpen(true);
        setIsCartOpen(false);
        setCart([]); // Clear cart
        setAmountPaid('');
        setCustomerName('');
        setCustomerIdNumber('');
        setCustomerTelephone('');
        if (user?.branch?.id) await fetchInventory(user.branch.id);
        setToast({ open: true, msg: `Sale recorded (Ref: ${saleId})`, sev: 'success' });
        return;
      }
  
      // For manual C2B from user-initiated verify (not from PaymentReceived)
      if (paymentMethod === 'M-Pesa' && mpesaMode === 'manual' && data?.transaction_id && !data.receipt) {
        console.log('Processing manual C2B verification:', data);
        try {
          const res = await clientPOS.post('/api/mpesa/verify', {
            transaction_id: data.transaction_id,
            context: 'cart',
            branch_id: user.branch.id,
            items: cart.map(item => ({
              item: item.id,
              quantity: item.quantity,
              price: Number(item.price),
            })),
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}`, Accept: 'application/json' },
          });
  
          console.log('Verification response:', res.data);
  
          if (res.data.status === 'success' || res.data.status === 'verified') {
            const saleId = res.data.sale_id || res.data.id;
            setReceiptData({
              branch: user.branch,
              timestamp: new Date().toLocaleString(),
              items: cart,
              payment_method: paymentMethod,
              cash_tendered: 0,
              total: cartTotal,
              change: 0,
              seller_id: user.username,
              reference: saleId,
              transaction_id: data.transaction_id,
            });
            setIsReceiptOpen(true);
            setIsCartOpen(false);
            setCart([]); // Clear cart
            setAmountPaid('');
            setCustomerName('');
            setCustomerIdNumber('');
            setCustomerTelephone('');
            if (user?.branch?.id) await fetchInventory(user.branch.id);
            setToast({ open: true, msg: `Sale recorded (Ref: ${saleId})`, sev: 'success' });
          } else {
            const errorMsg = res.data.message || 'Transaction verification failed';
            setError(errorMsg);
            setToast({ open: true, msg: errorMsg, sev: 'error' });
          }
        } catch (err) {
          console.error('Verification error:', err.response?.data);
          const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to verify transaction';
          setError(errorMsg);
          setToast({ open: true, msg: errorMsg, sev: 'error' });
        }
        return;
      }
  
      // For other payment methods (Cash, Credit, STK Push) - use existing logic
      const payload = {
        branch: user.branch.id,
        items: cart.map(item => ({
          item: item.id,
          quantity: item.quantity,
          price: Number(item.price),
        })),
        payment_method: paymentMethod,
        seller_id: user.username,
        ...(paymentMethod === 'Credit' && {
          customer_name: customerName,
          customer_id_number: customerIdNumber,
          customer_telephone_number: customerTelephone,
        }),
        ...(paymentMethod === 'M-Pesa' && mpesaMode !== 'txn' && {
          customer_telephone_number: customerTelephone,
          mpesa_mode: mpesaMode,
          use_stkpush: mpesaMode === 'stk',
        }),
        ...(paymentMethod === 'Cash' && {
          cash_tendered: Number(amountPaid),
        }),
      };
  
      const endpoint = paymentMethod === 'M-Pesa' && mpesaMode === 'stk' ? '/api/sales/mpesa/start' : '/api/sales';
  
      console.log('Sending checkout request:', { endpoint, payload });
  
      const res = await clientPOS.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}`, Accept: 'application/json' },
      });
  
      console.log('Checkout response:', res.data);
  
      const saleId = res.data.sale_id || res.data.id;
      const ref = res.data.reference || saleId;
  
      setPaymentRef(ref);
  
      if (paymentMethod === 'M-Pesa') {
        if (mpesaMode === 'stk') {
          setToast({
            open: true,
            msg: `STK push sent (Ref: ${ref}). Waiting for payment confirmation…`,
            sev: 'info',
          });
        } else if (mpesaMode === 'manual') {
          setToast({
            open: true,
            msg: `Please pay to Till/Paybill using Ref: ${ref} as account. Waiting for confirmation…`,
            sev: 'info',
          });
        }
      } else {
        // Cash or Credit
        setReceiptData({
          branch: user.branch,
          timestamp: new Date().toLocaleString(),
          items: cart,
          payment_method: paymentMethod,
          cash_tendered: paymentMethod !== 'Credit' ? amountPaid : 0,
          total: cartTotal,
          change: paymentMethod !== 'Credit' ? Number(amountPaid || 0) - cartTotal : 0,
          seller_id: user.username,
          reference: ref,
          ...(paymentMethod === 'Credit' && {
            customer_name: customerName,
            customer_id_number: customerIdNumber,
            customer_telephone: customerTelephone,
          }),
        });
        setIsReceiptOpen(true);
        setIsCartOpen(false);
        setCart([]); // Clear cart
        setAmountPaid('');
        setCustomerName('');
        setCustomerIdNumber('');
        setCustomerTelephone('');
        if (user?.branch?.id) await fetchInventory(user.branch.id);
        setToast({ open: true, msg: `Sale recorded (Ref: ${ref})`, sev: 'success' });
      }
    } catch (err) {
      console.error('Checkout error:', err.response?.data);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to process checkout';
      setError(errorMsg);
      setToast({ open: true, msg: errorMsg, sev: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  

  // generate PDF receipt
  // generate PDF receipt
const downloadReceipt = async () => {
  if (!receiptData) return;

  const doc = new jsPDF();

  // === Watermark ===
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(60);
  doc.setFont("courier", "bold");
  const watermarkText = "Gas POS"; // <-- extra spacing

  // Repeat watermark diagonally across page
  for (let x = 20; x < 210; x += 80) {   // wider spacing horizontally
    for (let y = 60; y < 297; y += 80) { // wider spacing vertically
      doc.text(watermarkText, x, y, { angle: 45 });
    }
  }

  // === Header ===
  doc.setFillColor(0, 31, 63);
  doc.rect(0, 0, 210, 40, "F");
  doc.setFontSize(22);
  doc.setFont("courier", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("King Of The Grill Gas POS Receipt", 105, 20, { align: "center" });

  // Receipt Number / Reference
  doc.setFontSize(11);
  doc.setTextColor(200, 200, 200);
  doc.text(`Receipt No: ${receiptData.reference || receiptData.sale_id || "N/A"}`, 105, 30, { align: "center" });
  doc.text("Powered by karanjadavid.com", 105, 37, { align: "center" });

  // === Branch + timestamp ===
  doc.setFontSize(11);
  doc.setFont("courier", "normal");
  doc.setTextColor(0, 0, 0);
  doc.roundedRect(15, 50, 180, 20, 3, 3, "S");
  doc.text(`Branch: ${receiptData.branch?.name || "N/A"}`, 20, 58);
  doc.text(`Time: ${receiptData.timestamp || new Date().toLocaleString()}`, 20, 66);

  // === Divider ===
  doc.setDrawColor(100, 149, 237);
  doc.setLineWidth(0.5);
  doc.line(20, 73, 190, 73);
  doc.setDrawColor(200, 200, 255);
  doc.setLineWidth(0.2);
  doc.line(20, 74, 190, 74);

  let y = 80;

  // === Section Title ===
  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 51, 102);
  doc.text("Transaction Details", 20, y);
  y += 10;

  // === Table / Items ===
  if (receiptData.items) {
    doc.roundedRect(15, y - 4, 180, receiptData.items.length * 10 + 40, 3, 3, "S");
    doc.setFont("courier", "normal");
    doc.setFontSize(10);

    receiptData.items.forEach((it) => {
      doc.setTextColor(50, 50, 50);
      doc.text(`${it.name}`, 20, y + 4);
      doc.text(`${formatNumber(it.quantity, 2)} x KES ${formatNumber(it.price)}`, 150, y + 4, { align: "right" });
      doc.setTextColor(0, 102, 204);
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
    doc.text(`Subtotal: KES ${formatNumber(subtotal)}`, 190, y, { align: "right" });
    y += 7;
    doc.text(`VAT (16%): KES ${formatNumber(tax)}`, 190, y, { align: "right" });
    y += 7;
    doc.setFont("courier", "bold");
    doc.text(`Grand Total: KES ${formatNumber(receiptData.total)}`, 190, y, { align: "right" });
    y += 12;

    if (receiptData.cash_tendered) {
      doc.setFont("courier", "normal");
      doc.text(`Cash Tendered: KES ${formatNumber(receiptData.cash_tendered)}`, 190, y, { align: "right" });
      y += 7;
      doc.text(`Change: KES ${formatNumber(receiptData.change || 0)}`, 190, y, { align: "right" });
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
  y += 20;

  // === QR Code ===
  const qrText = `Receipt: ${receiptData.reference || "N/A"} | Txn: ${receiptData.transaction_id || "N/A"} | Total: KES ${formatNumber(receiptData.total || 0)} | Branch: ${receiptData.branch?.name || "N/A"}`;
  const qrBase64 = await QRCode.toDataURL(qrText);
  doc.addImage(qrBase64, "PNG", 150, y, 40, 40);
  y += 55;

  // === Terms & Policies ===
  doc.setFont("courier", "italic");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  const terms = [
    "Goods once sold are not returnable.",
    "All payments are final.",
    "Please retain this receipt for reference.",
    "Powered by karanjadavid.com."
  ];
  let ty = y;
  terms.forEach((t) => {
    doc.text(t, 20, ty);
    ty += 6;
  });

  // === Footer ===
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 285, 190, 285);
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 292, { align: "center" });

  // Save
  doc.save(`receipt_${receiptData.reference || Date.now()}.pdf`);
}; 
  


  // -------------------- UI SUBCOMPONENTS --------------------
// put this ABOVE export default Gas

  // -------------------- RENDER --------------------
  return (
  <ThemeProvider theme={theme}>
    {/* === HULY-STYLE AMBIENT BACKGROUND === */}
    <Helmet>
      <title>Gas: King of the grill</title>
      <meta name="theme-color" content="#0092C7" />
      <link rel="icon" href="/assets/images/gas-lpg-with-fire-illustration-vector.jpg" type="image/png" />
    </Helmet>
    <Box
      sx={{
        position: "fixed",
        inset: 0, // shorthand for top:0, right:0, bottom:0, left:0
        overflow: "hidden",
        bgcolor: "#0A0A0A",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Motion gradient glows */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {/* Blue glow (moves slightly with cursor) */}
        <motion.div
          animate={{
            x: ["-15%", "5%", "-15%"],
            y: ["-10%", "15%", "-10%"],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: "80vmax",
            height: "80vmax",
            top: "-25vmax",
            left: "-25vmax",
            background:
              "radial-gradient(circle at center, rgba(64,196,255,0.35), transparent 70%)",
            filter: "blur(140px)",
          }}
        />

        {/* Purple glow */}
        <motion.div
          animate={{
            x: ["-15%", "10%", "-15%"],
            y: ["-10%", "15%", "-10%"],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            width: "85vmax",
            height: "85vmax",
            top: "-25vmax",
            left: "-25vmax",
            background:
              "radial-gradient(circle at center, rgba(64,196,255,0.35), transparent 70%)",
            filter: "blur(140px)",
          }}
        />
      </motion.div>

      {/* === MAIN FOREGROUND === */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <Container maxWidth="lg" maxWidth={false}
          disableGutters
          sx={{
            px: { xs: 2, sm: 4 },
            pt: 4,
            pb: 8,
            width: "100%",
          }}>
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
                cartItemCount={cartCount}
                isHighContrast={isHighContrast}
                setIsHighContrast={setIsHighContrast}
                setIsCartModalOpen={setIsCartOpen}
                handleCreditModalOpen={handleCreditModalOpen}
                logout={logout}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setRepayOpen={handleCreditModalOpen}
                inventory={inventory}
                cart={cart}
                addToCart={addToCartWithQty}
                updateCartQuantity={updateCartQuantity}
                removeFromCart={removeFromCart}
                openAddToCartModal={openAddToCartModal}
                setModalQuantity={setModalQuantity}
                openCheckout={() => setIsCartOpen(true)}
              />

              {/* Header Row */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "text.primary" }}
                >
                  Inventory
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => user?.branch?.id && fetchInventory(user.branch.id)}
                  sx={{
                    borderRadius: 10,
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    "&:hover": {
                      borderColor: "#40C4FF",
                      backgroundColor: "rgba(64,196,255,0.08)",
                    },
                  }}
                >
                  Refresh
                </Button>
              </Box>

              {/* Search */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  placeholder="Search products…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  size="small"
                  InputProps={{
                    sx: {
                      borderRadius: 999,
                      backdropFilter: "blur(12px)",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      "& input::placeholder": {
                        fontStyle: "italic",
                        color: "rgba(255,255,255,0.4)",
                      },
                    },
                  }}
                />
              </Box>

              <InventoryGrid
                loading={loading}
                filteredInventory={filteredInventory}
                quickAddToCart={quickAddToCart}
                openAddToCartModal={openAddToCartModal}
              />
            </>
          )}
        </Container>

                {isAuthenticated && (
                  <Box sx={{ position: 'fixed', bottom: 88, right: 18, bgcolor: 'primary.main', color: 'white', borderRadius: 12, p: 2, boxShadow: '0 6px 18px rgba(0,0,0,0.16)', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Badge badgeContent={cartCount} color="primary"><ShoppingCart /></Badge>
                    <Typography variant="body2">KES {cartTotal.toFixed(2)}</Typography>
                  </Box>
                )}
        
                {/* CART DRAWER */}
                <Drawer
                  anchor="right"
                  open={isCartOpen}
                  onClose={() => setIsCartOpen(false)}
                  ModalProps={{ keepMounted: true }}
                  PaperProps={{
                    sx: {
                      width: isMobile ? '100vw' : 600,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backdropFilter: 'blur(16px)',
                      backgroundColor: 'rgba(255,255,255,0.28)',
                      borderRadius: 0,
                    },
                  }}
                  >
                  <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Cart
                      </Typography>
                      <IconButton onClick={() => setIsCartOpen(false)}>
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                  <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                    <CartPanel
                      cart={cart}
                      setCart={setCart}
                      cartCount={cartCount}
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
                      setError={setError}
                      user={user}
                      setToast={setToast}
                      paymentRef={paymentRef} // Add paymentRef
                      setIsReceiptOpen={setIsReceiptOpen} // Add to control receipt dialog
                      setReceiptData={setReceiptData} // Add to set receipt data
                      setIsCartOpen = {setIsCartOpen}
                    />
                  </Box>
                </Drawer>
        
        
        
        
        
                {/* ADD TO CART DIALOG */}
                <Dialog
                  open={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  fullWidth
                  maxWidth="xs"
                  PaperProps={{ sx: { backdropFilter: "blur(20px)", backgroundColor: "rgba(255,255,255,0.88)", borderRadius: 3 } }}
                >
                  <motion.div initial="hidden" animate="visible" variants={dialogMotion}>
                    <DialogTitle sx={{ pb: 1, fontWeight: 800 }}>Add to cart</DialogTitle>
                    <DialogContent>
                      {selectedItem ? (
                        <Stack spacing={2}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {selectedItem.name}
                          </Typography>
        
                          <FormControl fullWidth size="small">
                            <InputLabel id="tier-label">Price Tier</InputLabel>
                            <Select labelId="tier-label" label="Price Tier" value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
                              <MenuItem value="price">Price 1 — KES {formatNumber(selectedItem.price)}</MenuItem>
                              <MenuItem value="price2">Price 2 — KES {formatNumber(selectedItem.price2)}</MenuItem>
                              <MenuItem value="price3">Price 3 — KES {formatNumber(selectedItem.price3)}</MenuItem>
                            </Select>
                          </FormControl>
        
                          <TextField label="Quantity" type="number" value={modalQuantity} onChange={(e) => setModalQuantity(Number(e.target.value))} inputProps={{ step: "0.01", min: 0 }} />
        
                          <Alert severity="info">Selected price: KES {formatNumber(priceForTier(selectedItem, selectedTier))}</Alert>
                        </Stack>
                      ) : (
                        <Typography>No item selected</Typography>
                      )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                      <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button variant="contained" onClick={confirmAddToCart} sx={{ borderRadius: 8 }}>
                        Add
                      </Button>
                    </DialogActions>
                  </motion.div>
                </Dialog>
        
                {/* RECEIPT DIALOG */}
                <Dialog open={isReceiptOpen} onClose={() => setIsReceiptOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { backdropFilter: "blur(18px)", backgroundColor: "rgba(255,255,255,0.88)" } }}>
                  <motion.div initial="hidden" animate="visible" variants={dialogMotion}>
                    <DialogTitle sx={{ fontWeight: 800 }}>Receipt</DialogTitle>
                    <DialogContent>
                      {receiptData ? (
                        <Paper sx={{ p: 2, background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(250,250,250,0.82))" }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            Branch: {receiptData.branch?.name}
                          </Typography>
                          <Typography variant="body2">Time: {receiptData.timestamp || receiptData.date}</Typography>
                          <Divider sx={{ my: 2 }} />
                          {receiptData.items ? (
                            <Table size="small">
                              <TableBody>
                                {receiptData.items.map((it) => (
                                  <TableRow key={it.cartId}>
                                    <TableCell>{it.name}</TableCell>
                                    <TableCell>{formatNumber(it.quantity)}</TableCell>
                                    <TableCell>KES {formatNumber(it.price)}</TableCell>
                                    <TableCell>KES {formatNumber(it.quantity * it.price)}</TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell colSpan={2} />
                                  <TableCell sx={{ fontWeight: 800 }}>Total</TableCell>
                                  <TableCell sx={{ fontWeight: 800 }}>KES {formatNumber(receiptData.total)}</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          ) : (
                            <>
                              <Typography>Customer: {receiptData.customer}</Typography>
                              <Typography>Phone: {receiptData.phone}</Typography>
                              <Typography>Total Credit: KES {formatNumber(receiptData.total_credit)}</Typography>
                              <Typography>Amount Paid: KES {formatNumber(receiptData.amount_paid)}</Typography>
                              <Typography>Balance Remaining: KES {formatNumber(receiptData.balance_remaining)}</Typography>
                              <Typography>Payment Method: {receiptData.payment_method}</Typography>
                            </>
                          )}
                        </Paper>
                      ) : (
                        <Typography>No receipt data</Typography>
                      )}
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setIsReceiptOpen(false)}>Close</Button>
                      <Button variant="contained" onClick={downloadReceipt} startIcon={<Download />} sx={{ borderRadius: 8 }}>
                        Download
                      </Button>
                    </DialogActions>
                  </motion.div>
                </Dialog>
        
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
        
        
                {/* TOAST */}
                <Snackbar open={toast.open} autoHideDuration={5000} onClose={() => setToast((t) => ({ ...t, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                  <Alert
                    onClose={() => setToast((t) => ({ ...t, open: false }))}
                    severity={toast.sev}
                    action={toast.action}
                    sx={{
                      width: "100%",
                      backdropFilter: "blur(8px)",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      borderRadius: 2,
                    }}
                  >
                    {toast.msg}
                  </Alert>
                </Snackbar>

        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            textAlign: "center",
            backgroundColor: "transparent",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <Typography variant="caption">
            © {new Date().getFullYear()} karanjadavid.com — All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
{/* === HULY-STYLE TOP REFLECTION (BREATHING EFFECT) === */}
<motion.div
  initial={{ opacity: 0.35 }}
  animate={{
    opacity: [0.25, 0.55, 0.25],
    filter: [
      "blur(20px) brightness(1.05)",
      "blur(24px) brightness(1.2)",
      "blur(20px) brightness(1.05)",
    ],
  }}
  transition={{
    duration: 15,
    repeat: Infinity,
    ease: "easeInOut",
  }}
  style={{
    position: "fixed",
    top: 0,
    right: 0,
    width: "100%",
    height: "140px",
    pointerEvents: "none",
    zIndex: 999,
    background:
      "radial-gradient(circle at 80% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.1) 25%, transparent 70%)",
    WebkitMaskImage:
      "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%)",
    maskImage:
      "linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%)",
    backdropFilter: "blur(22px)",
    mixBlendMode: "screen",
  }}
/>

    <Box
  sx={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "60px",
    pointerEvents: "none",
    background:
      "linear-gradient(to top, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 60%, transparent 100%)",
    zIndex: 998,
  }}
/>

  </ThemeProvider>
);

}

