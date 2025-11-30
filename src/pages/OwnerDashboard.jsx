import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Modal,
  Paper,
  TextField,
  Divider,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Icon,
  Switch,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  Menu, 
  Slider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import InputBase from '@mui/material/InputBase';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import echo from "../components/echo";
import QRCode from "qrcode";

import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  People,
  Inventory as InventoryIcon,
  Sell as SellIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Savings as SavingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Paid as PaidIcon,
  PersonAdd as PersonAddIcon,
  TransferWithinAStation as TransferIcon,
  Block as SuspendIcon,
  CheckCircle as UnsuspendIcon,
  Store as BranchIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import fileDownload from 'js-file-download';
import PaymentsTable from "../components/PaymentsTable"
import AllBranchesDashboard from "../components/dashboard/AllBranchesDashboard"
import PersonIcon from '@mui/icons-material/Person';
import ArticleIcon from '@mui/icons-material/Article';
import { Link } from 'react-router-dom';
import AppleLoginForm from "../components/AppleLoginForm"
//import VoiceNavigator from "../components/dashboard/VoiceNavigator";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import Joyride from 'react-joyride';
import { API_BASE_URL} from "../components/clientPOS";

// --- CONFIG ---
const COLORS = [
  '#007AFF', // Blue
  '#5AC8FA', // Light Blue
  '#34C759', // Green
  '#FF9500', // Orange
  '#FF2D55', // Red
  '#8E8E93', // Gray
  '#5856D6', // Indigo
  '#FFCC00', // Yellow
  '#AF52DE', // Purple
  '#00C4B4', // Teal
  '#FF3B30', // Bright Red
  '#4CD964', // Bright Green
  '#FF9900', // Deep Orange
  '#6610F2', // Deep Purple
  '#00A8E8', // Cyan
  '#F4F4F4', // Light Gray
  '#212121', // Dark Gray
  '#E91E63', // Pink
  '#009688', // Deep Teal
  '#FFC107', // Amber
  '#3F51B5', // Deep Blue
  '#CDDC39', // Lime
  '#607D8B', // Blue Gray
  '#9C27B0', // Bright Purple
  '#FF5722', // Deep Orange
  '#795548', // Brown
  '#2196F3', // Bright Blue
  '#8BC34A', // Light Green
  '#FFEB3B', // Bright Yellow
  '#673AB7', // Deep Purple
  '#00BCD4', // Cyan
  '#F44336', // Bright Red
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#E040FB', // Bright Purple
  '#03A9F4', // Light Blue
  '#9E9E9E', // Gray
  '#D81B60', // Deep Pink
  '#4DB6AC', // Teal
  '#FFCA28', // Amber
  '#0288D1', // Blue
  '#7CB342', // Green
  '#FBC02D', // Yellow
  '#AB47BC', // Purple
  '#26A69A', // Teal
  '#EF5350', // Red
  '#29B6F6', // Light Blue
  '#EC407A', // Pink
  '#66BB6A', // Green
  '#FFA726', // Orange
  '#5C6BC0'  // Indigo
];

const queryClient = new QueryClient();
const client = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// --- Helpers ---
const formatCurrency = (v) => {
  if (v === null || v === undefined) return '-';
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(v);
};


  const downloadCSV = (filename, rows) => {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')].concat(rows.map((r) => keys.map((k) => `"${String(r[k] ?? '')}"`).join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// --- Small UI components ---
function StatCard({ title, value, subtitle, color = 'linear-gradient(135deg,#fff,#fff)', icon }) {
  return (
    <motion.div whileHover={{ y: -6 }} whileTap={{ scale: 0.98 }}>
      <Card
      elevation={0}
      sx={{
      borderRadius: 4,
      background: color,
      minHeight: 120,
      display: 'flex',
      alignItems: 'center',
      p: 3,
      boxShadow: '0 8px 30px rgba(0,0,0,0.05)'
      }}
      >
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>
        {title}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {value}
        </Typography>
        {subtitle && (
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
        {subtitle}
        </Typography>
        )}
      </Box>
      </Card>
    </motion.div>
  );
  }

// --- Owner dashboard app ---
function OwnerDashboardApp() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [section, setSection] = useState('Overview');
  const [branchId, setBranchId] = useState(null);
  const [savingsPct, setSavingsPct] = useState(0.2);
  const [showHow, setShowHow] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [period, setPeriod] = useState('daily')
  const [filterType, setFilterType] = useState('date'); // 'date' | 'month' | 'year'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingInventory, setEditingInventory] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseType, setExpenseType] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [transferringEmployee, setTransferringEmployee] = useState(null);
  const [positionFilter, setPositionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [editingBranch, setEditingBranch] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [editingBill, setEditingBill] = useState(null);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const confettiRef = useRef(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportSectionSelected, setReportSectionSelected] = useState('Overview');
  const [reportFormatSelected, setReportFormatSelected] = useState('xlsx');
  const [reportPreviewLimit] = useState(10);
  // Date filters for reports
  const [reportStartDate, setReportStartDate] = useState(null);
  const [reportEndDate, setReportEndDate] = useState(null);
  const [reportMonth, setReportMonth] = useState('');
  const [reportYear, setReportYear] = useState('');
  const [saleDetailOpen, setSaleDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleDetailLoading, setSaleDetailLoading] = useState(false);
  const [saleSearch, setSaleSearch] = useState('');
  const [filteredSales, setFilteredSales] = useState([]);
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const openNotifications = Boolean(notificationAnchorEl);
  const [notifications, setNotifications] = useState([]); // Fetch from API
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const openSearchResults = Boolean(searchAnchorEl) && searchQuery.length >= 2; // Show Popover only if query is long enough
  const [userPhoto, setUserPhoto] = useState(user?.photo ? `${API_BASE_URL}/storage/${user.photo}` : 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaEmzjpUf5XiWcRFKWeDt-Pxf4_cG77GIlsQ&s');
  const navigate = useNavigate();
  const [runTour, setRunTour] = useState(false);
  const [tourKey, setTourKey] = useState(0);
  const [steps, setSteps] = useState([]);
  const [payingBill, setPayingBill] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState(''); // Added for note
  // ──────────────────────────────────────────────────────────────────────
  // 1. NEW: Get current location when the user opens “Add Branch”
  // ──────────────────────────────────────────────────────────────────────
 const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!editingBranch?.id && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.warn('Geolocation error', err),
        { enableHighAccuracy: true }
      );
    }
  }, [editingBranch?.id]);   // <-- re-run when modal opens/closes


  const [salesData, setSalesData] = useState([]);
  const [salesMeta, setSalesMeta] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/api/branches/${branchId}/sales/statistics?period=${period}`);
        const stats = res.data;

        // Build chart data: each item has label, sales, target
        const target =
            period === "daily"
              ? stats.targets.daily_target
              : period === "weekly"
              ? stats.targets.weekly_target
              : period === "monthly"
              ? stats.targets.monthly_target
              : stats.targets.yearly_target;

        const chartData = (stats.data || []).map(d => ({
          label: d.label,
          sales: d.sales,
          target,
        }));

        setSalesData(chartData);
        setSalesMeta({ period: stats.period, range: stats.range, totals: stats.totals, targets: stats.targets });
      } catch (err) {
        console.error('Error loading sales data', err);
        setSalesData([]);
        setSalesMeta(null);
      } finally {
        setLoading(false);
      }
    };

    if (section === 'Sales' && branchId) fetchSales();
  }, [section, branchId, period]);


  const commonIntroStep = [
    {
      target: '#guide-button',
      content: `Hello ${username}, Click here anytime to start the quick guide!`,
      placement: 'bottom',
    },
    {
      target: 'body',
      content: `Welcome to your Dashboard! Manage everything from one point.`,
    },
    {
      target: '#drawer',
      content: `Click to show the sidebar and access more functionality. click away to close sidebar.`,
    },
    {
      target: '#search',
      content: `Access your search engine from here.`,
    },
    {
      target: '#notifications',
      content: `Find all POS availability, stocks updated in small quantities, large amount transactions, security breaches, etc.`,
    },
    {
      target: '#profile',
      content: `Update your profile here.`,
    },
    {
      target: '#logout',
      content: `Protect your account and log out from here.`,
    },
    {
      target: '#voice',
      content: 'Click here to listen in to various metrics.',
    },
    {
      target: '#common-data',
      content: `See sales, expenses and profit summaries here`,
    },
  ];
  

  const tourSteps = {
    Overview: [
      { target: '#overview-section', content: 'Here’s your Overview – total sales and KPIs.' },
      { target: '#all-branches-section', content: 'Visualize and compare branches trends over time here.' },
    ],
    Inventory: [
      { target: '#inventory-performance', content: 'See inventory performance for a given period.' },
      { target: '#modify-inventory', content: 'View, Modify, Add, Delete and Edit from this point.' },
    ],
    Employees: [
      { target: '#employees-section', content: 'Manage your team and permissions here.' },
    ],
    Payments: [
      { target: '#payments-section', content: 'See all payments, their payment methods, paid amount, paid time, transaction is.' },
    ],
  };
  

  const startTour = () => {
    const sectionSteps = tourSteps[section] || [];
    setSteps([...commonIntroStep, ...sectionSteps]); // 👈 merge intro + section steps
    setTourKey((k) => k + 1);
    setRunTour(true);
  };
  
  

  useEffect(() => {
    if (runTour) {
      localStorage.setItem('seenIntro', '1');
    }
  }, [runTour])
    

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await client.get(`${API_BASE_URL}/api/notifications`);
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            message: 'Unable to fetch notifications. Please check your login status.',
            created_at: new Date().toISOString(),
            link: null,
            type: 'error',
            priority: 'high',
          },
        ]);
      }
    };
    fetchNotifications();

    // Check API health for Butchery, Gas, and Drinks
    const checkApiHealth = async () => {
      const systems = ['butchery', 'gas', 'drinks'];
      for (const system of systems) {
        try {
          await client.get(`${API_BASE_URL}/api/health/${system}`);
        } catch (error) {
          setNotifications((prev) => [...prev, {
            id: `health-${system}-${Date.now()}`,
            message: `${system.charAt(0).toUpperCase() + system.slice(1)} POS API is unreachable.`,
            created_at: new Date().toISOString(),
            link: null,
          }]);
        }
      }
    };
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 1800000);
    echo.channel('notifications').listen('NotificationCreated', (e) => {
      setNotifications((prev) => [...prev, e.notification]);
    });

    return () => {
      clearInterval(interval);
      echo.disconnect();
    };
  }, [])


  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        if (!searchOpen) {
          setSearchAnchorEl(null); // Close Popover only if search input is not open
        }
        return;
      }
      try {
        const response = await client.get(`${API_BASE_URL}/api/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(response.data);
        if (searchOpen && searchInputRef.current) {
          setSearchAnchorEl(searchInputRef.current); // Keep Popover anchored to input
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
        setNotifications((prev) => [
          ...prev,
          {
            id: `search-error-${Date.now()}`,
            message: error.response?.status === 401
              ? 'Please log in to search.'
              : 'Search failed. Please check your connection.',
            created_at: new Date().toISOString(),
            link: null,
            type: 'error',
            priority: 'high',
          },
        ]);
      }
    };

    const debounceSearch = setTimeout(handleSearch, 300); // Debounce by 300ms

    return () => clearTimeout(debounceSearch);
  }, [searchQuery, searchOpen]);

  const handleSearchToggle = (event) => {
    setSearchOpen(!searchOpen);
    setSearchAnchorEl(event.currentTarget);
  };

  const handleSearchClose = () => {
    setSearchAnchorEl(null);
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await client.post(`${API_BASE_URL}/api/user/update-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the user photo in the UI
      setUserPhoto(`${API_BASE_URL}/storage/${response.data.photo}`);
    } catch (error) {
      console.error('Error uploading photo:', error);
      // Optionally show an error message to the user
      alert('Failed to update photo. Please try again.');
    }
  };

  const handleNotificationsClick = async (event) => {
    setNotificationAnchorEl(event.currentTarget);
    try {
      await client.post(`${API_BASE_URL}/api/notifications/mark-all-read`, {});
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setNotifications((prev) => [
        ...prev,
        {
          id: `mark-all-error-${Date.now()}`,
          message: error.response?.status === 401
            ? 'Please log in to mark notifications as read.'
            : 'Failed to mark notifications as read. Please try again.',
          created_at: new Date().toISOString(),
          link: null,
          type: 'error',
          priority: 'high',
        },
      ]);
    }
  };
  
  const handleNotificationsClose = () => {
    setNotificationAnchorEl(null);
    setNotifications([]); // Clear notifications since all are now read
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  useEffect(() => {
    const handleOffline = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleOffline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOffline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const resetFilters = () => {
    setFilterType('date');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    inventoryQuery.refetch();
  };
  
  const printSalePdf = async () => {
    if (!selectedSale) return alert("No sale selected");
  
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
  
    // === Watermark ===
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(60);
    doc.setFont("courier", "bold");
    const watermarkText = "King Of The Grill";
    for (let x = 20; x < 600; x += 200) {
      for (let yy = 60; yy < 800; yy += 200) {
        doc.text(watermarkText, x, yy, { angle: 45 });
      }
    }
  
    // === Header with logo ===
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 595, 60, "F");
  
    const logoImage = "/assets/images/1862d8b3-ca93-47a2-b6fa-230c357944b0.jpeg";
    try {
      doc.addImage(logoImage, "JPEG", 260, 5, 70, 40, undefined, "FAST");
    } catch (error) {
      console.warn("Logo failed to load:", error);
    }
  
    doc.setFontSize(16);
    doc.setFont("courier", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(`King Of The Grill — Sale #${selectedSale.id}`, 297, 52, { align: "center" });
  
    y = 80;
  
    // === Branch + Date Box ===
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.roundedRect(40, y, 515, 35, 4, 4, "S");
    doc.text(`Branch: ${selectedSale.branch || "N/A"}`, 50, y + 15);
    doc.text(`Date: ${new Date(selectedSale.created_at).toLocaleString()}`, 50, y + 28);
  
    y += 55;
  
    // === Items Table ===
    if (selectedSale.items && selectedSale.items.length > 0) {
      const tableData = selectedSale.items.map((i, idx) => [
        idx + 1,
        i.item,
        i.quantity,
        i.price,
        i.total,
      ]);
  
      autoTable(doc, {
        head: [["#", "Item", "Qty", "Price", "Subtotal"]],
        body: tableData,
        startY: y,
        styles: { fontSize: 10, font: "courier" },
        headStyles: { fillColor: [0, 31, 63], textColor: 255 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 40, right: 40 },
      });
  
      y = doc.lastAutoTable.finalY + 20;
    }
  
    // === Summary ===
    const totalItems = selectedSale.items.reduce((sum, i) => sum + Number(i.quantity), 0);
    const grandTotal = selectedSale.items.reduce((sum, i) => sum + Number(i.total), 0);
    doc.setFont("courier", "bold");
    doc.setFontSize(12);
    doc.text(`Total Items: ${totalItems}`, 50, y);
    doc.text(`Grand Total: KES ${grandTotal.toLocaleString()}`, 50, y + 15);
    y += 40;
  
    // === Credit info if any ===
    if (selectedSale.credit_sale) {
      doc.setFont("courier", "normal");
      doc.setFontSize(11);
      doc.text(`Credit Sale Total: KES ${selectedSale.credit_sale.total_amount.toLocaleString()}`, 50, y);
      doc.text(`Paid: KES ${selectedSale.credit_sale.amount_paid.toLocaleString()}`, 50, y + 15);
      doc.text(`Balance: KES ${selectedSale.credit_sale.balance.toLocaleString()}`, 50, y + 30);
      y += 50;
    }
  
    // === Customer Info / QR Code ===
    const qrText = `Sale #${selectedSale.id} | Total: KES ${grandTotal} | Branch: ${selectedSale.branch}`;
    try {
      const qrBase64 = await QRCode.toDataURL(qrText);
      doc.addImage(qrBase64, "PNG", 500, 60, 70, 70);
    } catch (error) {
      console.warn("Failed to generate QR code:", error);
    }
  
    // === Footer ===
    const footerY = doc.internal.pageSize.getHeight() - 40;
    doc.setFont("courier", "italic");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for shopping at King Of The Grill!", 297, footerY, { align: "center" });
    doc.text("Powered by kingofthegrill.co.ke", 297, footerY + 14, { align: "center" });
  
    doc.save(`Sale_${selectedSale.id}.pdf`);
  };

  // --- Reporting ---
  const generateReport = async (
    sectionName = 'Overview',
    format = 'xlsx',
    options = { email: null }
  ) => {
    setReportLoading(true);
    try {
      // 1️⃣ Refetch data if needed
      if (sectionName === 'Expenses') {
        await queryClient.refetchQueries([
          'expenses-list',
          branchId,
          page,
          filterType,
          startDate,
          endDate,
          expenseType,
        ]);
      } else if (sectionName === 'Payments') {
        await queryClient.refetchQueries(['payments', branchId]);
      }
  
      // 2️⃣ Lazy-load libraries
      if (format === 'xlsx' && !window._XLSX) {
        const mod = await import('xlsx');
        window._XLSX = mod.default || mod;
      }
      if (format === 'pdf' && !window._JSPDF) {
        const mod = await import('jspdf');
        const jsPDF = mod.jsPDF || mod.default || mod;
        window._JSPDF = jsPDF;
        const autoTableMod = await import('jspdf-autotable');
        const autoTableFn = autoTableMod.default || autoTableMod;
        autoTableFn(jsPDF);
      }
  
      // 3️⃣ Get rows AFTER all libraries and refetch
      const rows = getSectionRows(sectionName) || [];
      if (!Array.isArray(rows) || rows.length === 0) {
        setSnack({
          open: true,
          msg: `No data found for ${sectionName}`,
          severity: 'warning',
        });
        return;
      }
  
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filenameBase = `report-${sectionName.toLowerCase()}-${timestamp}`;
  
      // --- XLSX ---
      if (format === 'xlsx') {
        const XLSX = window._XLSX;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, sectionName.slice(0, 31));
  
        const summary = [
          { Key: 'Section', Value: sectionName },
          { Key: 'Generated At', Value: new Date().toLocaleString() },
          { Key: 'Total Rows', Value: rows.length },
          { Key: 'Total Sales', Value: metrics?.totalSales ?? 0 },
          { Key: 'Total Expenses', Value: metrics?.totalExpenses ?? 0 },
          { Key: 'Net Profit', Value: metrics?.netProfit ?? 0 },
        ];
        XLSX.utils.book_append_sheet(
          wb,
          XLSX.utils.json_to_sheet(summary),
          'Summary'
        );
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(
          new Blob([wbout], { type: 'application/octet-stream' }),
          `${filenameBase}.xlsx`
        );
      }
  
      // --- PDF ---
      else if (format === 'pdf') {
        const jsPDF = window._JSPDF;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });

        // === Watermark ===
        doc.setTextColor(245, 245, 245);
        doc.setFontSize(100);
        doc.setFont('courier', 'bold');
        const watermarkText = 'KOTG REPORT';
        for (let x = 50; x < 600; x += 200) {
          for (let y = 100; y < 800; y += 200) {
            doc.text(watermarkText, x, y, { angle: 45 });
          }
        }

        // === Header ===
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 595, 60, 'F');

        // Logo
        const logoImage = '/assets/images/1862d8b3-ca93-47a2-b6fa-230c357944b0.jpeg';
        try {
          doc.addImage(logoImage, 'JPEG', 260, 5, 70, 40, undefined, 'FAST');
        } catch (error) {
          console.warn('Logo failed to load:', error);
        }

        doc.setFontSize(18);
        doc.setFont('courier', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`King Of The Grill — ${sectionName} Report`, 297, 52, { align: 'center' });

        let y = 80;

        // === Report Info Box ===
        doc.setFont('courier', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        const reportStart = reportStartDate || startDate || 'Start';
        const reportEnd = reportEndDate || endDate || 'End';
        const fullPeriod = `Period: ${reportStart} — ${reportEnd}`;
        const lines = doc.splitTextToSize(fullPeriod, 250);
        const boxHeight = Math.max(35, 25 + lines.length * 12);

        doc.roundedRect(40, y, 515, boxHeight, 4, 4, 'S');
        doc.text(`Branch: ${branch?.name || 'N/A'}`, 50, y + 15);
        doc.text(`Report Type: ${sectionName}`, 50, y + 28);
        doc.text(lines, 540, y + 20, { align: 'right' });

        y += boxHeight + 20;

        // === Divider ===
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(40, y, 555, y);
        y += 15;

        // === Table Section ===
        const rows = getSectionRows(sectionName) || [];
        const keys = Object.keys(rows[0] ?? {}).slice(0, 10);

        if (rows.length > 0) {
          const { default: autoTable } = await import('jspdf-autotable');
          autoTable(doc, {
            head: [keys.map((k) => k.replace(/_/g, ' ').toUpperCase())],
            body: rows.map((r) => keys.map((k) => String(r[k] ?? ''))),
            startY: y,
            theme: 'striped',
            styles: { fontSize: 8, font: 'courier' },
            headStyles: { fillColor: [0, 31, 63], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [250, 250, 250] },
            margin: { left: 40, right: 40 },
            didDrawPage: () => {
              // watermark on every page
              for (let x = 50; x < 600; x += 200) {
                for (let y = 100; y < 800; y += 200) {
                  doc.setTextColor(245, 245, 245);
                  doc.text(watermarkText, x, y, { angle: 45 });
                }
              }
            },
          });
          y = doc.lastAutoTable.finalY + 20;
        } else {
          doc.setFont('courier', 'italic');
          doc.setFontSize(12);
          doc.setTextColor(120, 120, 120);
          doc.text('No data available for this section.', 50, y);
          y += 30;
        }

        // === Summary Box ===
        const pageHeight = doc.internal.pageSize.getHeight();
        if (y + 100 > pageHeight) {
          doc.addPage();
          y = 60;
        }

        doc.setFont('courier', 'normal');
        doc.setTextColor(30, 30, 30);
        doc.roundedRect(40, y, 515, 40, 4, 4, 'S');
        doc.setFontSize(12);
        doc.text(`Total Rows: ${rows.length}`, 50, y + 25);
        y += 70;

        // === Footer ===
        const footerY = doc.internal.pageSize.getHeight() - 40;
        doc.setFont('courier', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for using King Of The Grill Systems!', 297, footerY, { align: 'center' });
        doc.text('Powered by kingofthegrill.co.ke', 297, footerY + 14, { align: 'center' });

        // Save PDF
        doc.save(`${filenameBase}.pdf`);
      }

        
      // --- CSV ---
      else if (format === 'csv') {
        downloadCSV(`${filenameBase}.csv`, rows);
      }
  
      setSnack({
        open: true,
        msg: `${sectionName} report exported as ${format.toUpperCase()}`,
        severity: 'success',
      });
    } catch (err) {
      console.error('Report generation failed', err);
      setSnack({
        open: true,
        msg: `Report generation failed: ${err.message || 'Unknown error'}`,
        severity: 'error',
      });
    } finally {
      setReportLoading(false);
    }
  };
  
  

  // --- Report helper: map section -> rows ---
// --- Map data by section & apply filters (date / month / year) ---
// --- Report helper: map section -> rows ---
// --- Report helper: map section -> rows ---
const getSectionRows = (sectionName) => {
  // Helper to normalize query results for many response shapes
  const safe = (q) => {
    if (!q) {
      console.warn(`No query data for ${sectionName}`);
      return [];
    }
    if (Array.isArray(q)) return q;
    // Typical shapes:
    // 1) q = { data: [...] }
    if (Array.isArray(q.data)) return q.data;
    // 2) q = { data: { data: [...] } } (some APIs)
    if (Array.isArray(q.data?.data)) return q.data.data;
    // 3) q = { payments: { data: [...] } } (your paymentsQuery.data)
    if (Array.isArray(q.payments?.data)) return q.payments.data;
    // 4) q = { data: { payments: { data: [...] } } } (nested)
    if (Array.isArray(q.data?.payments?.data)) return q.data.payments.data;
    // fallback
    console.warn(`Unexpected data structure for ${sectionName}:`, q);
    return [];
  };

  // Step 1: Load raw rows by section
  const rawRows = (() => {
    switch ((sectionName || '').toString()) {
      case 'Sales':
        return safe(salesQuery);
      case 'Inventory':
        return safe(inventoryQuery);
      case 'Employees':
        return employees || [];
      case 'Expenses':
        return safe(expensesQuery);
      case 'Payments': {
        // Ensure paymentsQuery exists in scope (define it with useQuery above)
        if (typeof paymentsQuery === 'undefined') {
          console.warn('paymentsQuery is not defined in this scope');
          return [];
        }
        return safe(paymentsQuery.data);
      }
      case 'Branches':
        return branches || [];
      case 'Overview':
        return [
          {
            totalSales: metrics?.totalSales ?? 0,
            totalExpenses: metrics?.totalExpenses ?? 0,
            netProfit: metrics?.netProfit ?? 0,
            savings: metrics?.savings ?? 0,
            projectedNext30: predictiveMetrics?.projectedNext30 ?? null,
            dailyAvg: predictiveMetrics?.dailyAvg ?? null,
          },
        ];
      default:
        console.warn(`Unknown section: ${sectionName}`);
        return [];
    }
  })();

  // Debugging helper — remove or keep as needed
  // console.log(`Raw rows for ${sectionName}:`, rawRows);

  if (!rawRows || rawRows.length === 0) {
    // console.warn(`No data available for ${sectionName}`);
    return [];
  }

  // Step 2: Build filter params (use UI filters if report filters are not set)
  const start = reportStartDate || startDate;
  const end = reportEndDate || endDate;
  const month =
    reportMonth ||
    (filterType === 'month' && startDate ? new Date(startDate).getMonth() + 1 : null);
  const year =
    reportYear || (filterType === 'year' && startDate ? new Date(startDate).getFullYear() : null);

  // Step 3: Apply filters
  const filtered = rawRows.filter((row) => {
    try {
      // Find a date field, including payment-specific fields
      const dateValue =
        row.created_at ||
        row.date ||
        row.timestamp ||
        row.updated_at ||
        row.transaction_date ||
        row.payment_date ||
        null;

      // If no date field or no filters applied, include the row
      if (!dateValue || (!start && !end && !month && !year)) {
        return true;
      }

      const d = new Date(dateValue);
      if (Number.isNaN(d.getTime())) {
        console.warn(`Invalid date in row for ${sectionName}:`, dateValue, row);
        return true; // include rather than drop on parse error
      }

      // Date range filter
      if (start && end) {
        const s = new Date(start);
        const e = new Date(end);
        s.setHours(0, 0, 0, 0);
        e.setHours(23, 59, 59, 999);
        if (d < s || d > e) return false;
      }

      // Month filter
      if (month && d.getMonth() + 1 !== month) return false;

      // Year filter
      if (year && d.getFullYear() !== year) return false;

      return true;
    } catch (err) {
      console.error(`Error filtering row for ${sectionName}:`, err, row);
      return true; // Include row on error to avoid losing data
    }
  });

  // console.log(`Filtered rows for ${sectionName}:`, filtered);
  return filtered;
};



  const handleExportSelected = async () => {
    const section = reportSectionSelected || 'Overview';
    const format = reportFormatSelected || 'xlsx';
    const rows = getSectionRows(section) || [];

    if (!rows || rows.length === 0) {
      setSnack({ open: true, msg: `No data for ${section}`, severity: 'warning' });
      return;
    }

    try {
      if (format === 'csv') {
        // use existing downloadCSV helper
        downloadCSV(`${section.toLowerCase()}.csv`, rows);
        setSnack({ open: true, msg: `${section} exported (CSV)`, severity: 'success' });
      } else {
        // delegate to existing generateReport which handles xlsx and pdf
        await generateReport(section, format);
      }
    } catch (err) {
      console.error('Export failed', err);
      setSnack({ open: true, msg: 'Export failed', severity: 'error' });
    } finally {
      setReportDialogOpen(false);
    }
  };


  const fetchSaleDetails = async (saleId) => {
    try {
      setSaleDetailLoading(true);
      const { data } = await client.get(`api/sales/${saleId}`);
      setSelectedSale(data);
      setSaleDetailOpen(true);
    } catch (err) {
      console.error('Error fetching sale details', err);
      setSnack({ open: true, msg: 'Failed to load sale details', severity: 'error' });
    } finally {
      setSaleDetailLoading(false);
    }
  };
  
 

  const onLogin = async () => {
    /*
    if (isOffline) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === 'Owner') {
          setUser(parsedUser);
          setIsAuthenticated(true);
          setError('');
          return;
        }
      }
      setError('Offline: Please log in when online first');
      return;
    }
    */
    setLoading(true);
    try {
      const res = await client.post('/api/auth/token',
        { username, password },
        { withCredentials: true, headers: { 'Accept': 'application/json' } }
      );
      setUser(res.data.user);
      setUserPhoto(`${API_BASE_URL}/storage/${res.data.user.photo}`);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
      }
      if (res.data.user.branch?.id) {
        setBranchId(res.data.user.branch.id);
      } else {
        setError('Login successful, but no branch ID found for user.');
      }
      setError('');
    } catch (err) {
      console.error('Login error:', err.response || err.message);
      setError(err.response?.data?.detail || 'Invalid credentials or CSRF error');
    } finally {
      setLoading(false);
    }
  };

  
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setError('');
    setUsername('');
    setPassword('');
    setMobileOpen(false);
    queryClient.clear();
  };

  const expenseCategories = [
    'Fuel',
    'Salaries',
    'Utilities',
    'Rent',
    'Repairs',
    'Transport',
    'Miscellaneous'
  ];
  
  const resolvedArray = (q) => {
    // q might be undefined, an array, or a paginator object { data: [...] }
    if (!q) return [];
    if (Array.isArray(q)) return q;
    if (Array.isArray(q.data)) return q.data;
    return [];
  };

  // --- Queries ---
  const { data: branches = [], isLoading: branchesLoading, refetch: refetchBranches } = useQuery(
    'branches',
    async () => (await client.get('/api/branches')).data,
    { staleTime: 1000 * 60 * 2 }
  );
  const { data: employees = [], isLoading: employeesLoading, refetch: refetchEmployees } = useQuery(
    ['employees', branchId],
    async () => (await client.get(`/api/branches/${branchId}/employees`)).data,
    { enabled: !!branchId }
  );
  const { data: inventory = [], isLoading: inventoryLoading } = useQuery(
    ['inventory', branchId],
    async () => (await client.get(`/api/branches/${branchId}/inventory`)).data,
    { enabled: !!branchId }
  );
  const { data:payments = [], isLoading: paymentsLoading } = useQuery(
    ['payments', branchId, paymentMethod, page],
    () =>
      client.get(`/api/branches/${branchId}/payments`, {
        params: {
          page,
          payment_method: paymentMethod || undefined,
        },
      }).then(res => res.data),
    { keepPreviousData: true }
  );

  const { data: bills = [], isLoading: billsLoading } = useQuery(
    ['bills', branchId],
    async () => (await client.get(`/api/branches/${branchId}/bills`)).data,
    { enabled: !!branchId }
  );


  const { data: branchStats=[], isLoading } = useQuery(
    ['branchStats', branchId],
    async () => {
      const res = await client.get(`/api/branches/${branchId}/statistics`);
      return res.data;
    },
    { refetchInterval: 60_000 } // refresh every 1 minute
  );


  const { data: performance } = useQuery(
    ['inventoryPerformance', branchId, period],
    async () => {
      const response = await client.get(`/api/inventory/performance/${branchId}`, {
        params: { period },
      });
      return response.data;
    }
  );


  const rawData = performance?.data || [];

  const periods = [...new Set(rawData.map(p => p.period))].sort();
  const products = [...new Set(rawData.map(p => p.name))];

  const performanceData = periods.map(period => {
    const row = { period };
    products.forEach(product => {
      const entry = rawData.find(p => p.period === period && p.name === product);
      row[product] = entry ? entry.total_sold : 0; // ✅ total_sold field from backend
    });
    return row;
  });

  
  const chartData = useMemo(() => {
    if (!branchStats) return [];
    switch (period) {
      case 'daily':
        // daily_sales can be a single number → wrap in one data point
        return [{ name: 'Today', value: branchStats.daily_sales }];
      case 'weekly':
        return [{ name: 'This Week', value: branchStats.weekly_sales }];
      case 'monthly':
        return [{ name: 'This Month', value: branchStats.monthly_sales }];
      case 'yearly':
        return [{ name: 'This Year', value: branchStats.yearly_sales }];
      default:
        return [];
    }
  }, [branchStats, period]);



  const branch = branches.find(b => b.id === branchId);
  const isGasBranch = branch?.type === 'Gas';
  const isButcheryBranch = branch?.type === 'Butchery';
  const isDrinksBranch = branch?.type === 'Drinks';

  const salesQuery = useQuery(['sales', branchId], async () => (await client.get(`/api/branches/${branchId}/sales`, {
    params: {
      start: startDate || undefined,
      end: endDate || undefined,
      type: filterType || undefined,
    }
  })).data, { enabled: !!branchId });
  const groupedQuery = useQuery(['expenses-grouped', branchId,  period], async () => (await client.get(`/api/branches/${branchId}/expenses/grouped?period=${period}`)).data, { enabled: !!branchId });
  const expensesQuery = useQuery(
    ['expenses-list', branchId, page, filterType, startDate, endDate, expenseType],
    async () => {
      const res = await client.get(`/api/branches/${branchId}/expenses`, {
        params: {
          page,
          type: filterType || undefined,   // "date" | "month" | "year"
          start: startDate || undefined,
          end: endDate || undefined,
          category: expenseType || undefined, // Expense type/category filter
        },
      });
      return res.data;
    },
    {
      enabled: !!branchId,
      keepPreviousData: true,
    }
  );
  
  const paymentsQuery = useQuery(
    ['payments', branchId],
    async () => {
      const res = await client.get(`/api/branches/${branchId}/payments`);
      return res.data;
    },
    { enabled: !!branchId }
  );
  
  const inventoryQuery = useQuery(['inventory', branchId], async () => (await client.get(`/api/branches/${branchId}/inventory`, {
    params: {
      page,
      type: filterType || undefined,   // "date" | "month" | "year"
      start: startDate || undefined,
      end: endDate || undefined,
      category: expenseType || undefined, // Expense type/category filter
    },
  })).data, { enabled: !!branchId });
  // ✅ Payments Query
  
  

  
// ✅ Payments query definition (add this near your other useQuery hooks)
// Simple, self-contained payments query for OwnerDashboard.jsx
  
  const branchStatsQuery = useQuery(
    ['branchStats', branchId],
    async () => (await client.get(`/api/branches/${branchId}/statistics`, {
      params: {
        page,
        type: filterType || undefined,   // "date" | "month" | "year"
        start: startDate || undefined,
        end: endDate || undefined,
        category: expenseType || undefined, // Expense type/category filter
      },
    })).data,
    { enabled: !!branchId }
  );

  
  const refetchAllWithFilters = () => {
    queryClient.invalidateQueries(['sales', branchId, startDate, endDate]);
    queryClient.invalidateQueries(['expenses', branchId, startDate, endDate]);
    queryClient.invalidateQueries(['payments', branchId, startDate, endDate]);
    queryClient.invalidateQueries(['branchStats', branchId, startDate, endDate]);
    queryClient.invalidateQueries(['inventoryPerformance', branchId, startDate, endDate]);
  };
  

  const expensesChartData = groupedQuery.data || [];

  

  const addInventory = useMutation(
    async (payload) => {
      const formData = new FormData();
      // ✅ Append is_butchery (snake_case)
      formData.append('is_butchery', payload.isButchery ? '1' : '0');
      formData.append('name', payload.name);
      formData.append('price', payload.price.toString());
      formData.append('buying_price', payload.buying_price.toString());
      if (payload.isButchery) {
        formData.append('price2', '');
        formData.append('price3', '');
      } else {
        formData.append('price2', payload.price2.toString());
        formData.append('price3', payload.price3.toString());
      }
      if (branch?.type === 'drinks') {
        formData.append('price2', payload.price2?.toString() || '');
      }
      formData.append('stock', payload.stock.toString());
      formData.append('unit', payload.unit);
      if (payload.image instanceof File) {
        formData.append('image', payload.image);
      }
      return (
        await client.post(`/api/branches/${branchId}/inventory`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      ).data.item;
    },
    {
      onMutate: async (newItem) => {
        await queryClient.cancelQueries(['inventory', branchId]);
        const previous = queryClient.getQueryData(['inventory', branchId]) || [];
        queryClient.setQueryData(['inventory', branchId], [...previous, { ...newItem, id: `tmp-${Date.now()}` }]);
        return { previous };
      },
      onError: (err) => {
        const errorMsg = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : err.response?.data?.message || 'Failed to add item';
        setSnack({ open: true, msg: errorMsg, severity: 'error' });
        queryClient.setQueryData(['inventory', branchId], ctx.previous);
      },
      onSuccess: () => {
        setSnack({ open: true, msg: 'Inventory item added successfully', severity: 'success' });
      },
      onSettled: () => queryClient.invalidateQueries(['inventory', branchId]),
    }
  );

  const editInventory = useMutation(
    async ({ id, payload }) => {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      // still send is_butchery
      formData.append('is_butchery', payload.isButchery ? '1' : '0');
      formData.append('name', payload.name);
      formData.append('price', payload.price.toString());
      formData.append('buying_price', payload.buying_price.toString());
      if (payload.isButchery) {
        formData.append('price2', '');
        formData.append('price3', '');
      } else {
        formData.append('price2', payload.price2.toString());
        formData.append('price3', payload.price3.toString());
      }
      if (branch?.type === 'drinks') {
        formData.append('price2', payload.price2?.toString() || '');
      }
      formData.append('stock', payload.stock.toString());
      formData.append('unit', payload.unit);
      if (payload.image instanceof File) {
        formData.append('image', payload.image);
      }
      return (await client.post(`/api/branches/${branchId}/inventory/${id}`, formData)).data.item;
    },
    {
      onMutate: async ({ id, payload }) => {
        await queryClient.cancelQueries(['inventory', branchId]);
        const previous = queryClient.getQueryData(['inventory', branchId]) || [];
        queryClient.setQueryData(['inventory', branchId], previous.map((it) => (it.id === id ? { ...it, ...payload } : it)));
        return { previous };
      },
      onError: (err) => {
        const errorMsg = err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(', ')
          : err.response?.data?.message || 'Failed to update item';
        setSnack({ open: true, msg: errorMsg, severity: 'error' });
        queryClient.setQueryData(['inventory', branchId], ctx.previous);
      },
      onSuccess: () => {
        setSnack({ open: true, msg: 'Inventory item updated successfully', severity: 'success' });
      },
      onSettled: () => queryClient.invalidateQueries(['inventory', branchId]),
    }
  );

  const deleteInventory = useMutation(
    async (id) => (await client.delete(`/api/branches/${branchId}/inventory/${id}`)).data,
    {
      onMutate: async (idToDelete) => {
        await queryClient.cancelQueries(['inventory', branchId]);
        const previous = queryClient.getQueryData(['inventory', branchId]) || [];
        queryClient.setQueryData(['inventory', branchId], previous.filter((it) => it.id !== idToDelete));
        return { previous };
      },
      onError: (err) => {
        const errorMsg = err.response?.data?.message || 'Failed to delete item';
        setSnack({ open: true, msg: errorMsg, severity: 'error' });
        queryClient.setQueryData(['inventory', branchId], ctx.previous);
      },
      onSuccess: () => {
        setSnack({ open: true, msg: 'Inventory item deleted successfully', severity: 'success' });
      },
      onSettled: () => queryClient.invalidateQueries(['inventory', branchId]),
    }
  );



  const addExpense = useMutation(async (payload) => (await client.post(`/api/branches/${branchId}/expenses`, payload)).data, {
    onMutate: async (newExpense) => {
      await queryClient.cancelQueries(['expenses', branchId]);
      const previous = queryClient.getQueryData(['expenses', branchId]) || [];
      queryClient.setQueryData(['expenses', branchId], [...previous, { ...newExpense, id: `tmp-${Date.now()}` }]);
      return { previous };
    },
    onError: (err, newExpense, ctx) => {
      queryClient.setQueryData(['expenses', branchId], ctx.previous);
      setSnack({ open: true, msg: 'Failed to add expense', severity: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries(['expenses', branchId]),
  });

  const editExpense = useMutation(async ({ id, payload }) => (await client.put(`/api/branches/${branchId}/expenses/${id}`, payload)).data, {
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries(['expenses', branchId]);
      const previous = queryClient.getQueryData(['expenses', branchId]) || [];
      queryClient.setQueryData(['expenses', branchId], previous.map((it) => (it.id === id ? { ...it, ...payload } : it)));
      return { previous };
    },
    onError: (err, vars, ctx) => {
      queryClient.setQueryData(['expenses', branchId], ctx.previous);
      setSnack({ open: true, msg: 'Failed to update expense', severity: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries(['expenses', branchId]),
  });

  const deleteExpense = useMutation(async (id) => (await client.delete(`/api/branches/${branchId}/expenses/${id}`)).data, {
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries(['expenses', branchId]);
      const previous = queryClient.getQueryData(['expenses', branchId]) || [];
      queryClient.setQueryData(['expenses', branchId], previous.filter((it) => it.id !== idToDelete));
      return { previous };
    },
    onError: (err, idDeleted, ctx) => {
      queryClient.setQueryData(['expenses', branchId], ctx.previous);
      setSnack({ open: true, msg: 'Failed to delete expense', severity: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries(['expenses', branchId]),
  });

  const addSale = useMutation(async (payload) => (await client.post(`/api/branches/${branchId}/sales`, payload)).data, {
    onMutate: async (newSale) => {
      await queryClient.cancelQueries(['sales', branchId]);
      const previous = queryClient.getQueryData(['sales', branchId]) || [];
      queryClient.setQueryData(['sales', branchId], [...previous, { ...newSale, id: `tmp-${Date.now()}` }]);
      return { previous };
    },
    onError: (err, newSale, ctx) => {
      queryClient.setQueryData(['sales', branchId], ctx.previous);
      setSnack({ open: true, msg: 'Failed to record sale', severity: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries(['sales', branchId]),
  });

  const addEmployee = useMutation(
    async (payload) => {
      const formData = new FormData();
      formData.append('username', payload.username);
      formData.append('email', payload.email);
      formData.append('idNumber', payload.idNumber);
      formData.append('position', payload.position);
      formData.append('experience', payload.experience);
      formData.append('role', payload.role);
      formData.append('name', payload.name);
      formData.append('status', payload.status);
      if (payload.photo instanceof File) {
        formData.append('photo', payload.photo);
      }
      await client.post(`/api/branches/${branchId}/employees`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    {
      onMutate: async (newEmployee) => {
        await queryClient.cancelQueries(['employees', branchId]);
        const previous = queryClient.getQueryData(['employees', branchId]) || [];
        queryClient.setQueryData(['employees', branchId], [
          ...previous,
          { ...newEmployee, id: `tmp-${Date.now()}`, user: { username: newEmployee.username, email: newEmployee.email } },
        ]);
        return { previous };
      },
      onError: (err, newEmployee, ctx) => {
        queryClient.setQueryData(['employees', branchId], ctx.previous);
        setSnack({ open: true, msg: err.response?.data?.message || 'Failed to add employee', severity: 'error' });
      },
      onSettled: () => queryClient.invalidateQueries(['employees', branchId]),
    }
  );

  const editEmployee = useMutation(
    async ({ id, payload }) => {
      const formData = new FormData();
      formData.append('_method', 'PATCH');
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'photo' && value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      return (await client.post(`/api/branches/${branchId}/employees/${id}`, 
        formData)).data;
    },
    {
      onMutate: async ({ id, payload }) => {
        await queryClient.cancelQueries(['employees', branchId]);
        const previous = queryClient.getQueryData(['employees', branchId]) || [];
        queryClient.setQueryData(['employees', branchId], previous.map((it) => (it.id === id ? { ...it, ...payload, user: { ...it.user, ...payload } } : it)));
        return { previous };
      },
      onError: (err, vars, ctx) => {
        queryClient.setQueryData(['employees', branchId], ctx.previous);
        setSnack({ open: true, msg: err.response?.data?.message || 'Failed to update employee', severity: 'error' });
      },
      onSettled: () => queryClient.invalidateQueries(['employees', branchId]),
    }
  );

  const deleteEmployee = useMutation(
    async (id) => (await client.delete(`/api/branches/${branchId}/employees/${id}`)).data,
    {
      onMutate: async (idToDelete) => {
        await queryClient.cancelQueries(['employees', branchId]);
        const previous = queryClient.getQueryData(['employees', branchId]) || [];
        queryClient.setQueryData(['employees', branchId], previous.filter((it) => it.id !== idToDelete));
        return { previous };
      },
      onError: (err, idDeleted, ctx) => {
        queryClient.setQueryData(['employees', branchId], ctx.previous);
        setSnack({ open: true, msg: 'Failed to delete employee', severity: 'error' });
      },
      onSettled: () => queryClient.invalidateQueries(['employees', branchId]),
    }
  );

  const suspendEmployee = useMutation(
    async (id) => (await client.post(`/api/branches/${branchId}/employees/${id}/suspend`)).data,
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries(['employees', branchId]);
        const previous = queryClient.getQueryData(['employees', branchId]) || [];
        queryClient.setQueryData(['employees', branchId], previous.map((it) => (it.id === id ? { ...it, suspended: true, suspensionDate: new Date().toISOString() } : it)));
        return { previous };
      },
      onError: (err, id, ctx) => {
        queryClient.setQueryData(['employees', branchId], ctx.previous);
        setSnack({ open: true, msg: 'Failed to suspend employee', severity: 'error' });
      },
      onSettled: () => queryClient.invalidateQueries(['employees', branchId]),
    }
  );

  const unsuspendEmployee = useMutation(
    async (id) => (await client.post(`/api/branches/${branchId}/employees/${id}/unsuspend`)).data,
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries(['employees', branchId]);
        const previous = queryClient.getQueryData(['employees', branchId]) || [];
        queryClient.setQueryData(['employees', branchId], previous.map((it) => (it.id === id ? { ...it, suspended: false, suspensionDate: null } : it)));
        return { previous };
      },
      onError: (err, id, ctx) => {
        queryClient.setQueryData(['employees', branchId], ctx.previous);
        setSnack({ open: true, msg: 'Failed to unsuspend employee', severity: 'error' });
      },
      onSettled: () => queryClient.invalidateQueries(['employees', branchId]),
    }
  );

  const transferEmployee = useMutation(
    async ({ id, newBranchId }) => (await client.post(`/api/branches/${branchId}/employees/${id}/transfer`, { new_branch_id: newBranchId })).data,
    {
      onMutate: async ({ id, newBranchId }) => {
        await queryClient.cancelQueries(['employees', branchId]);
        const previous = queryClient.getQueryData(['employees', branchId]) || [];
        queryClient.setQueryData(['employees', branchId], previous.filter((it) => it.id !== id));
        return { previous };
      },
      onError: (err, vars, ctx) => {
        queryClient.setQueryData(['employees', branchId], ctx.previous);
        setSnack({ open: true, msg: 'Failed to transfer employee', severity: 'error' });
      },
      onSettled: () => queryClient.invalidateQueries(['employees', branchId]),
    }
  );

  const addBranch = useMutation(
    async (payload) => (await client.post('/api/branches', payload)).data,
    {
      onMutate: async (newBranch) => {
        await queryClient.cancelQueries('branches');
        const previous = queryClient.getQueryData('branches') || [];
        queryClient.setQueryData('branches', [...previous, { ...newBranch, id: `tmp-${Date.now()}` }]);
        return { previous };
      },
      onError: (err, newBranch, ctx) => {
        queryClient.setQueryData('branches', ctx.previous);
        setSnack({ open: true, msg: err.response?.data?.message || 'Failed to add branch', severity: 'error' });
      },
      onSettled: () => queryClient.invalidateQueries('branches'),
    }
  );

  const editBranch = useMutation(
    async ({ id, payload }) => (await client.put(`/api/branches/${id}`, payload)).data,
    {
      onMutate: async ({ id, payload }) => {
        await queryClient.cancelQueries('branches');
        const previous = queryClient.getQueryData('branches') || [];
        queryClient.setQueryData('branches', previous.map((it) => (it.id === id ? { ...it, ...payload } : it)));
        return { previous };
      },
      onError: (err, vars, ctx) => {
        queryClient.setQueryData('branches', ctx.previous);
        setSnack({ open: true, msg: err.response?.data?.message || 'Failed to update branch', severity: 'error' });
      },
      onSettled: () => queryClient.invalidateQueries('branches'),
    }
  );

  const deleteBranch = useMutation(
    async (id) => (await client.delete(`/api/branches/${id}`)).data,
    {
      onMutate: async (idToDelete) => {
        await queryClient.cancelQueries('branches');
        const previous = queryClient.getQueryData('branches') || [];
        queryClient.setQueryData('branches', previous.filter((it) => it.id !== idToDelete));
        return { previous };
      },
      onError: (err, idDeleted, ctx) => {
        queryClient.setQueryData('branches', ctx.previous);
        setSnack({ open: true, msg: 'Failed to delete branch', severity: 'error' });
      },
      onSettled: () => {
        queryClient.invalidateQueries('branches');
        // Reset branchId if the current branch is deleted
        if (branchId === idToDelete) {
          setBranchId(branches[0]?.id || null);
        }
      },
    }
  );

  const addBill = useMutation(
    async (payload) => (await client.post(`/api/branches/${branchId}/bills`, payload)).data.bill,
    {
      onSuccess: () => {
        setSnack({ open: true, msg: 'Bill added successfully', severity: 'success' });
        queryClient.invalidateQueries(['bills', branchId]);
      },
      onError: (err) => {
        setSnack({ open: true, msg: err.response?.data?.message || 'Failed to add bill', severity: 'error' });
      },
    }
  );

  const editBill = useMutation(
    async ({ id, payload }) => (await client.put(`/api/branches/${branchId}/bills/${id}`, payload)).data.bill,
    {
      onSuccess: () => {
        setSnack({ open: true, msg: 'Bill updated successfully', severity: 'success' });
        queryClient.invalidateQueries(['bills', branchId]);
      },
    }
  );

  const payMutation = useMutation(
  (data) =>
      client.post(`/branches/${branchId}/bills/${data.billId}/pay`, {
        amount: data.amount,
        note: data.note,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['bills']);
        setPayingBill(null);
        setPayAmount('');
        setPayNote('');
      },
    }
  );

  const handlePay = (bill) => {
    setPayingBill(bill);
    setPayAmount('');
    setPayNote('');
  };

  const deleteBill = useMutation(
    async (id) => (await client.delete(`/api/branches/${branchId}/bills/${id}`)).data,
    {
      onSuccess: () => {
        setSnack({ open: true, msg: 'Bill deleted', severity: 'info' });
        queryClient.invalidateQueries(['bills', branchId]);
      },
    }
  );


  const handleSaleSearch = async () => {
    const term = saleSearch.trim();
    if (!term) {
      // Reset to full list if empty
      setFilteredSales(salesQuery?.data || []);
      return;
    }
  
    // If it's a numeric ID, try fetching it directly from API
    if (/^\d+$/.test(term)) {
      try {
        setSaleDetailLoading(true);
        const { data } = await client.get(`api/sales/${term}`);
        setFilteredSales([data]);
        setSnack({ open: true, msg: `Found Sale #${term}`, severity: 'success' });
      } catch (err) {
        console.error('Sale search failed', err);
        setFilteredSales([]);
        setSnack({ open: true, msg: `Sale #${term} not found`, severity: 'warning' });
      } finally {
        setSaleDetailLoading(false);
      }
    } else {
      // fallback: filter locally by ID partial match
      const results = (salesQuery?.data || []).filter((s) =>
        String(s.id).includes(term)
      );
      setFilteredSales(results);
    }
  };
  
  useEffect(() => {
    if (!saleSearch.trim()) {
      setFilteredSales(salesQuery?.data || []);
    } else {
      const term = saleSearch.trim();
      const results = (salesQuery?.data || []).filter((s) =>
        String(s.id).includes(term)
      );
      setFilteredSales(results);
    }
  }, [saleSearch, salesQuery?.data])

  // --- Derived metrics ---
  const metrics = useMemo(() => {
    const sales = salesQuery.data || [];
    const expenses = resolvedArray(expensesQuery.data);
    const totalSales = sales.reduce((s, it) => s + Number(it.total || 0), 0);
    const totalExpenses = expenses.reduce((s, it) => s + Number(it.amount || 0), 0);
    const grossProfit = totalSales - totalExpenses;
    const savings = Math.max(0, grossProfit * savingsPct);
    const netProfit = grossProfit - savings;
    const level = Math.min(50, Math.floor(totalSales / 500));
    const xp = Math.min(100, ((totalSales % 500) / 500) * 100);
    return { totalSales, totalExpenses, grossProfit, savings, netProfit, level, xp };
  }, [salesQuery.data, expensesQuery.data, savingsPct]);

  // --- Additional derived metrics & tables ---
  const topProducts = useMemo(() => {
    const sales = salesQuery.data || [];
    const map = {};
    sales.forEach(s => {
      const name = s.item_purchased || s.item || 'Misc';
      const qty = Number(s.quantity) || 1;
      const total = Number(s.total) || 0;
      if (!map[name]) map[name] = { qty: 0, revenue: 0 };
      map[name].qty += qty;
      map[name].revenue += total;
    });
    return Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a,b) => b.revenue - a.revenue);
  }, [salesQuery.data]);

  const topCustomers = useMemo(() => {
    const sales = salesQuery.data || [];
    const map = {};
    sales.forEach(s => {
      const customer = (s.customer_name || s.customer || 'Walk-in').trim();
      const total = Number(s.total) || 0;
      if (!map[customer]) map[customer] = { visits: 0, spend: 0 };
      map[customer].visits += 1;
      map[customer].spend += total;
    });
    return Object.entries(map).map(([customer, v]) => ({ customer, ...v })).sort((a,b) => b.spend - a.spend);
  }, [salesQuery.data]);

  const comparativeMetrics = useMemo(() => {
    const sales = salesQuery.data || [];
    const lastPeriod = sales.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,30);
    const prevPeriod = sales.slice().sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(30,60);
    const sum = arr => arr.reduce((s,i) => s + Number(i.total||0),0);
    const cur = sum(lastPeriod);
    const prev = sum(prevPeriod) || 1;
    const pct = ((cur - prev) / prev) * 100;
    return { cur, prev, pct: Number(isFinite(pct) ? pct.toFixed(2) : 0) };
  }, [salesQuery.data]);

  // Simple predictive projection: linear growth based on last 30 days average
  const predictiveMetrics = useMemo(() => {
    const sales = salesQuery.data || [];
    const byDay = {};
    sales.forEach(s => {
      const d = (s.created_at || s.timestamp || '').slice(0,10);
      if (!d) return;
      byDay[d] = (byDay[d] || 0) + Number(s.total || 0);
    });
    const days = Object.keys(byDay).sort();
    if (days.length < 2) return { projectedNext30: 0, dailyAvg: 0, trend: 0 };
    const values = days.map(d => byDay[d]);
    const dailyAvg = values.reduce((a,b)=>a+b,0)/values.length;
    const trend = (values[values.length-1] - values[0]) / Math.max(1, values.length-1);
    const projectedNext30 = Math.max(0, dailyAvg + trend) * 30;
    return { projectedNext30: Number(projectedNext30.toFixed(2)), dailyAvg: Number(dailyAvg.toFixed(2)), trend: Number(trend.toFixed(2)) };
  }, [salesQuery.data]);

  // Expense efficiency: average expense per sale
  const expenseEfficiency = useMemo(() => {
    const totalExpenses = resolvedArray(expensesQuery.data).reduce((s, it) => s + Number(it.amount || 0), 0);
    const tx = (salesQuery.data || []).length || 1;
    return { avgExpensePerTx: totalExpenses / tx, totalExpenses };
  }, [expensesQuery.data, salesQuery.data]);

  // Employee productivity (basic): sales per employee
  const employeeProductivity = useMemo(() => {
    const tx = (salesQuery.data || []).length;
    const empCount = (employees || []).length || 1;
    const salesVal = (salesQuery.data || []).reduce((s,i)=>s+Number(i.total||0),0);
    return { salesPerEmployee: salesVal / empCount, txPerEmployee: tx / empCount };
  }, [salesQuery.data, employees]);

  // For table sorting
  const [topProductsSort, setTopProductsSort] = useState({ key: 'revenue', dir: 'desc' });
  const [topCustomersSort, setTopCustomersSort] = useState({ key: 'spend', dir: 'desc' });
  const sortedTopProducts = useMemo(() => {
    const arr = (topProducts || []).slice();
    arr.sort((a,b) => (topProductsSort.dir === 'desc' ? b[topProductsSort.key] - a[topProductsSort.key] : a[topProductsSort.key] - b[topProductsSort.key]));
    return arr.slice(0,20);
  }, [topProducts, topProductsSort]);
  const sortedTopCustomers = useMemo(() => {
    const arr = (topCustomers || []).slice();
    arr.sort((a,b) => (topCustomersSort.dir === 'desc' ? b[topCustomersSort.key] - a[topCustomersSort.key] : a[topCustomersSort.key] - b[topCustomersSort.key]));
    return arr.slice(0,20);
  }, [topCustomers, topCustomersSort]);


  // Charts
  const salesByDayChart = useMemo(() => {
    const sales = salesQuery.data || [];
    const map = {};
    sales.forEach((s) => {
      const d = (s.timestamp || s.created_at || '').slice(0, 10) || 'unknown';
      map[d] = (map[d] || 0) + Number(s.total || 0);
    });
    return Object.entries(map)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB)) // Sort dates ascending
      .slice(-14) // Last 14 days
      .map(([k, v]) => ({
        name: new Date(k).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format date
        total: Number(v.toFixed(2)), // Round to 2 decimals
      }));
  }, [salesQuery.data]);
  

  const salesDistribution = useMemo(() => {
    const sales = salesQuery.data || [];
    const map = {};

    sales.forEach((s) => {
      const item = s.item_purchased || s.item || 'Misc';
      const qty = Number(s.quantity) || 1;
      map[item] = (map[item] || 0) + qty;
    });

    // Convert to array and sort by value descending
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value: Number(value),
      }))
      .sort((a, b) => b.value - a.value); // 🔥 highest first
  }, [salesQuery.data]);


  const [cashFlowTarget, setCashFlowTarget] = useState(50000); // KES or fetch from API

  const cashFlow = useMemo(() => {
    const totalSales = (salesQuery.data || []).reduce((s, it) => s + Number(it.total || 0), 0);
    const totalExpenses = resolvedArray(expensesQuery.data).reduce((s, it) => s + Number(it.amount || 0), 0);
    return totalSales - totalExpenses;
  }, [salesQuery.data, expensesQuery.data]);

  const cashFlowPct = Math.min(100, (cashFlow / cashFlowTarget) * 100);

  const productMargins = useMemo(() => {
    const sales = salesQuery.data || [];
    const inv = inventoryQuery.data || [];
    const invMap = inv.reduce((acc, item) => {
      acc[item.name] = item; // assuming name unique
      return acc;
    }, {});
    const map = {};
  
    sales.forEach(s => {
      const name = s.item_purchased || s.item;
      const qty = Number(s.quantity) || 1;
      const price = Number(s.price) || Number(s.total) / qty || 0;
      const costPrice = Number(invMap[name]?.buying_price ?? invMap[name]?.price ?? 0);
      const profit = (price - costPrice) * qty;
  
      if (!map[name]) map[name] = { qty: 0, revenue: 0, profit: 0 };
      map[name].qty += qty;
      map[name].revenue += price * qty;
      map[name].profit += profit;
    });
  
    return Object.entries(map).map(([name, data]) => ({
      name,
      ...data,
      margin: data.revenue ? (data.profit / data.revenue) * 100 : 0
    }));
  }, [salesQuery.data, inventoryQuery.data]);
  

  const lowStockItems = useMemo(() => {
    const inv = inventoryQuery.data || [];
    return inv.filter(it => Number(it.stock) < 5); // threshold = 5
  }, [inventoryQuery.data]);

  // Set default branch
  useEffect(() => {
    if (branches && branches.length && !branchId) setBranchId(branches[0].id);
  }, [branches]);

  // Small helpers
  const safeCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Inventory handlers
  const openAddInventory = () => {
    setEditingInventory({
      name: '',
      buying_price: '',
      price: '',
      price2: isGasBranch || isDrinksBranch ? '' : null, // drinks & gas have price2
      price3: isGasBranch ? '' : null,                   // only gas uses price3
      stock: '',
      unit: '',
      isButchery: isButcheryBranch,                      // true only for butchery
      image: null,
    });
  };

  const openEditInventory = (it) => {
    setEditingInventory({
      id: it.id,
      name: it.name || '',
      price: it.price || '',
      // Drinks & Gas have price2
      price2: (isGasBranch || isDrinksBranch) ? (it.price2 || '') : null,
      // Only Gas has price3
      price3: isGasBranch ? (it.price3 || '') : null,
      stock: it.stock || '',
      unit: it.unit || '',
      isButchery: isButcheryBranch, // strictly follow branch type
      image: it.image || null,      // keep existing image
    });
  };

  const saveInventory = async () => {
    if (!editingInventory) return;

    // 🧱 Basic validation
    if (!editingInventory.name || !editingInventory.unit) {
      setSnack({ open: true, msg: 'Name and unit are required', severity: 'error' });
      return;
    }

    if (!editingInventory.price || isNaN(editingInventory.price) || Number(editingInventory.price) < 0) {
      setSnack({ open: true, msg: 'Price must be a valid non-negative number', severity: 'error' });
      return;
    }

    if (!editingInventory.stock || isNaN(editingInventory.stock) || Number(editingInventory.stock) < 0) {
      setSnack({ open: true, msg: 'Stock must be a valid non-negative number', severity: 'error' });
      return;
    }

    // 🥩 Butchery Validation
    if (isButcheryBranch) {
      if (editingInventory.price2 || editingInventory.price3) {
        setSnack({ open: true, msg: 'Butchery items cannot have Price 2 or Price 3', severity: 'error' });
        return;
      }
    }

    // 🔥 Gas Validation
    if (isGasBranch) {
      if (!editingInventory.price2 || isNaN(editingInventory.price2) || Number(editingInventory.price2) < 0) {
        editingInventory.price2 = editingInventory.price;
      }
      if (!editingInventory.price3 || isNaN(editingInventory.price3) || Number(editingInventory.price3) < 0) {
        editingInventory.price3 = editingInventory.price;
      }
    }

    // 🍾 Drinks Validation
    if (isDrinksBranch) {
      if (!editingInventory.price2 || isNaN(editingInventory.price2) || Number(editingInventory.price2) <= 0) {
        setSnack({ open: true, msg: 'Wholesale price is required for drinks and must be valid', severity: 'error' });
        return;
      }
      // Drinks do NOT use price3
      editingInventory.price3 = null;
    }

    // 🧩 Build payload safely
    const payload = {
      name: editingInventory.name.trim(),
      price: Number(editingInventory.price) || 0,
      buying_price: Number(editingInventory.buying_price) || 0,
      price2: isButcheryBranch ? '' : (Number(editingInventory.price2) || ''),
      price3: isButcheryBranch || isDrinksBranch ? '' : (Number(editingInventory.price3) || ''),
      stock: Number(editingInventory.stock) || 0,
      unit: editingInventory.unit.trim(),
      isButchery: isButcheryBranch,
      image: editingInventory.image instanceof File ? editingInventory.image : null,
    };

    try {
      if (editingInventory.id && !String(editingInventory.id).startsWith('tmp-')) {
        await editInventory.mutateAsync({ id: editingInventory.id, payload });
      } else {
        await addInventory.mutateAsync(payload);
      }
      setEditingInventory(null);
    } catch (e) {
      // Handle mutation errors globally
    }
  };



  const confirmDeleteInventory = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await deleteInventory.mutateAsync(id);
    setSnack({ open: true, msg: 'Item removed', severity: 'success' });
  };

  // Expense handlers
  const openAddExpense = () => setEditingExpense({ title: '', amount: '', note: '' });
  const openEditExpense = (it) => setEditingExpense({ ...it });
  const saveExpense = async () => {
    if (!editingExpense) return;
    const payload = {
      title: editingExpense.title,
      amount: Number(editingExpense.amount || 0),
      category: editingExpense.category || '',
      note: editingExpense.note,
    };    
    try {
      if (editingExpense.id && String(editingExpense.id).startsWith('tmp-')) {
        await addExpense.mutateAsync(payload);
      } else if (editingExpense.id) {
        await editExpense.mutateAsync({ id: editingExpense.id, payload });
      } else {
        await addExpense.mutateAsync(payload);
      }
      setEditingExpense(null);
      setSnack({ open: true, msg: 'Expense saved', severity: 'success' });
    } catch (e) {
      // Handled in mutation
    }
  };

  const confirmDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await deleteExpense.mutateAsync(id);
    setSnack({ open: true, msg: 'Expense removed', severity: 'success' });
  };

  // Employee handlers
  const openAddEmployee = () => setEditingEmployee({
    username: '',
    email: '',
    idNumber: '',
    position: '',
    experience: '',
    role: 'employee',
    name: '',
    status: 'active',
    photo: null,
  });

  const openEditEmployee = (emp) => setEditingEmployee({
    id: emp.id,
    username: emp.user?.username || '',
    email: emp.user?.email || '',
    idNumber: emp.idNumber || '',
    position: emp.position || '',
    experience: emp.experience || '',
    role: emp.user?.role || 'employee',
    name: emp.name || '',
    status: emp.status || 'active',
    photo: null,
  });

  const saveEmployee = async () => {
    if (!editingEmployee) return;
    const payload = {
      username: editingEmployee.username,
      email: editingEmployee.email,
      idNumber: editingEmployee.idNumber,
      position: editingEmployee.position,
      experience: editingEmployee.experience || null,
      role: editingEmployee.role || 'employee',
      name: editingEmployee.name || null,
      status: editingEmployee.status || 'active',
      photo: editingEmployee.photo || null,
    };
    try {
      if (editingEmployee.id && !String(editingEmployee.id).startsWith('tmp-')) {
        await editEmployee.mutateAsync({ id: editingEmployee.id, payload });
      } else {
        await addEmployee.mutateAsync(payload);
      }
      setEditingEmployee(null);
      setSnack({ open: true, msg: 'Employee saved', severity: 'success' });
    } catch (e) {
      // Handled in mutation
    }
  };

  const confirmDeleteEmployee = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    await deleteEmployee.mutateAsync(id);
    setSnack({ open: true, msg: 'Employee removed', severity: 'success' });
  };

  const confirmSuspendEmployee = async (id) => {
    if (!window.confirm('Suspend this employee?')) return;
    await suspendEmployee.mutateAsync(id);
    setSnack({ open: true, msg: 'Employee suspended', severity: 'success' });
  };

  const confirmUnsuspendEmployee = async (id) => {
    if (!window.confirm('Unsuspend this employee?')) return;
    await unsuspendEmployee.mutateAsync(id);
    setSnack({ open: true, msg: 'Employee unsuspended', severity: 'success' });
  };

  const openTransferEmployee = (emp) => setTransferringEmployee({
    id: emp.id,
    name: emp.name || emp.user?.username || 'Employee',
    newBranchId: '',
  });

  const saveTransfer = async () => {
    if (!transferringEmployee || !transferringEmployee.newBranchId) return;
    try {
      await transferEmployee.mutateAsync({ id: transferringEmployee.id, newBranchId: transferringEmployee.newBranchId });
      setTransferringEmployee(null);
      setSnack({ open: true, msg: 'Employee transferred', severity: 'success' });
    } catch (e) {
      // Handled in mutation
    }
  };

  // Branch handlers
  const openAddBranch = () => setEditingBranch({
    name: '',
    tillNumber: '',
    roleConfig: '',
    managerId: '',
    type: '',
    latitude: editingBranch?.latitude ?? userLocation?.lat ?? 0,
    longitude: editingBranch?.longitude ?? userLocation?.lng ?? 0,
    service_radius: editingBranch?.service_radius ?? 0,
    daily_target: editingBranch?.daily_target ?? 0,
    weekly_target: editingBranch?.weekly_target ?? 0,
    monthly_target: editingBranch?.monthly_target ?? 0,
    yearly_target: editingBranch?.yearly_target ?? 0,
  });

  const openEditBranch = (branch) => setEditingBranch({
    id: branch.id,
    name: branch.name || '',
    tillNumber: branch.tillNumber || '',
    roleConfig: branch.roleConfig || '',
    managerId: branch.managerId || '',
    type: branch.type || '',
    latitude: editingBranch?.latitude ?? userLocation?.lat ?? 0,
    longitude: editingBranch?.longitude ?? userLocation?.lng ?? 0,
    service_radius: editingBranch?.service_radius ?? 0,
    daily_target: editingBranch?.daily_target ?? 0,
    weekly_target: editingBranch?.weekly_target ?? 0,
    monthly_target: editingBranch?.monthly_target ?? 0,
    yearly_target: editingBranch?.yearly_target ?? 0,
  });

  const saveBranch = async () => {
    if (!editingBranch) return;
    const payload = {
      name: editingBranch.name,
      tillNumber: editingBranch.tillNumber,
      roleConfig: editingBranch.roleConfig || null,
      managerId: editingBranch.managerId || null,
      type: editingBranch.type || null,
      latitude: editingBranch.latitude ?? userLocation?.lat ?? 0,
      longitude: editingBranch.longitude ?? userLocation?.lng ?? 0,
      service_radius: editingBranch.service_radius ?? 0,
      daily_target: editingBranch.daily_target ?? 0,
      weekly_target: editingBranch.weekly_target ?? 0,
      monthly_target: editingBranch.monthly_target ?? 0,
      yearly_target: editingBranch.yearly_target ?? 0,
    };
    try {
      if (editingBranch.id && !String(editingBranch.id).startsWith('tmp-')) {
        await editBranch.mutateAsync({ id: editingBranch.id, payload });
      } else {
        await addBranch.mutateAsync(payload);
      }
      setEditingBranch(null);
      setSnack({ open: true, msg: 'Branch saved', severity: 'success' });
    } catch (e) {
      // Handled in mutation
    }
  };

  const confirmDeleteBranch = async (id) => {
    if (!window.confirm('Delete this branch? This action cannot be undone.')) return;
    await deleteBranch.mutateAsync(id);
    setSnack({ open: true, msg: 'Branch removed', severity: 'success' });
  };


  // Export handlers
  const exportSales = () => downloadCSV('sales.csv', salesQuery.data || []);
  const exportInventory = () => downloadCSV('inventory.csv', inventoryQuery.data || []);
  const exportExpenses = () => downloadCSV('expenses.csv', expensesQuery.data || []);
  const exportEmployees = () => downloadCSV('employees.csv', employees.map(emp => ({
    id: emp.id,
    name: emp.name || emp.user?.username || 'N/A',
    email: emp.user?.email || 'N/A',
    idNumber: emp.idNumber,
    position: emp.position,
    status: emp.status,
    suspended: emp.suspended ? 'Yes' : 'No',
    suspensionDate: emp.suspensionDate || 'N/A',
  })));
  const exportBranches = () => downloadCSV('branches.csv', branches.map(branch => ({
    id: branch.id,
    name: branch.name,
    tillNumber: branch.tillNumber,
    type: branch.type || 'N/A',
    managerId: branch.managerId || 'N/A',
    roleConfig: branch.roleConfig || 'N/A',
    latitude: editingBranch.latitude ?? userLocation?.lat ?? 0,
    longitude: editingBranch.longitude ?? userLocation?.lng ?? 0,
    service_radius: editingBranch.service_radius ?? 0,
    daily_target: editingBranch.daily_target ?? 0,
    weekly_target: editingBranch.weekly_target ?? 0,
    monthly_target: editingBranch.monthly_target ?? 0,
    yearly_target: editingBranch.yearly_target ?? 0,
  })));

  // Reload all
  const reloadAll = () => {
    queryClient.invalidateQueries('branches');
    queryClient.invalidateQueries(['sales', branchId]);
    queryClient.invalidateQueries(['expenses', branchId]);
    queryClient.invalidateQueries(['inventory', branchId]);
    queryClient.invalidateQueries(['payments', branchId]);
    queryClient.invalidateQueries(['employees', branchId]);
    queryClient.invalidateQueries(['branchStats', branchId]);
    setSnack({ open: true, msg: 'Refreshing data', severity: 'info' });
  };

  // Level milestone notification
  useEffect(() => {
    if (metrics.level > 0 && metrics.xp === 0) {
      setSnack({ open: true, msg: `Congrats — reached level ${metrics.level}!`, severity: 'success' });
    }
  }, [metrics.level]);

  useEffect(() => {
    if (!Array.isArray(employees)) {
      setFilteredEmployees([]);
      return;
    }
  
    let filtered = [...employees];
  
    if (positionFilter) {
      filtered = filtered.filter(e => e.position === positionFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter(e =>
        statusFilter === 'Suspended' ? e.suspended : e.status === statusFilter
      );
    }
    if (startDate) {
      filtered = filtered.filter(e => new Date(e.created_at) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(e => new Date(e.created_at) <= new Date(endDate));
    }
  
    setFilteredEmployees(filtered);
  }, [employees, positionFilter, statusFilter, startDate, endDate]);
  

  const XPBadge = (
    <Tooltip title={`Level ${metrics.level} • XP ${Math.round(metrics.xp)}`}>
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
    <CircularProgress variant="determinate" value={metrics.xp} size={50} thickness={6} sx={{ color: '#007AFF' }} />
    <Box sx={{
    top: 0, left: 0, bottom: 0, right: 0,
    position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
    <Typography variant="caption" sx={{ fontWeight: 700 }}>{metrics.level}</Typography>
    </Box>
    </Box>
    </Tooltip>
    );

  // --- Small UI pieces ---
  const drawerContent = (
    <Box sx={{ width: 280, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 800 }}>
        Owner Dashboard
      </Typography>
      <List>
        {[
          { key: 'Overview', icon: <StarIcon /> },
          { key: 'Sales', icon: <TrendingUpIcon /> },
          { key: 'Inventory', icon: <InventoryIcon /> },
          { key: 'Employees', icon: <People /> },
          { key: 'Expenses', icon: <PaidIcon /> },
          { key: 'Payments', icon: <PaymentIcon /> },
          { key: 'Bills', icon: <PaymentIcon /> },
          { key: 'Branches', icon: <BranchIcon /> },
        ].map((it) => (
          <ListItemButton key={it.key} selected={section === it.key} onClick={() => setSection(it.key)} sx={{ borderRadius: 1, mb: 1 }}>
            <ListItemIcon>{it.icon}</ListItemIcon>
            <ListItemText primary={it.key} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <FormControl fullWidth>
        <InputLabel>Branch</InputLabel>
        <Select value={branchId || ''} label="Branch" onChange={(e) => setBranchId(e.target.value)}>
          {branches.map((b) => (
            <MenuItem value={b.id} key={b.id}>{b.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption">Savings rule</Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {[0.1, 0.15, 0.2, 0.25].map((p) => (
            <Chip key={p} label={`${Math.round(p * 100)}%`} color={savingsPct === p ? 'primary' : 'default'} onClick={() => setSavingsPct(p)} />
          ))}
        </Box>
        <Button variant="text" size="small" onClick={() => setShowHow(true)} sx={{ mt: 1 }}>How savings are calculated</Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button startIcon={<RefreshIcon />} fullWidth onClick={reloadAll}>Refresh</Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button startIcon={<FileDownloadIcon />} fullWidth onClick={() => {
          exportSales();
          exportInventory();
          exportExpenses();
          exportEmployees();
          exportBranches();
          setSnack({ open: true, msg: 'Exported CSV files', severity: 'success' });
        }}>Export CSVs</Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button startIcon={<FileDownloadIcon />} fullWidth onClick={() => setReportDialogOpen(true)}>
          Reports (Preview & Export)
        </Button>
      </Box>
      <Box sx={{ mt: 3 }}>
      <Link to="/news" style={{ display: 'block', width: '100%' }}>
        <ArticleIcon /> News
      </Link>
      </Box>
    </Box>
  )

  // --- Report Dialog (Preview & Export) ---
// --- Report Dialog (Preview & Export) ---
function ReportDialog() {
  return (
    <Modal
      open={reportDialogOpen}
      onClose={() => setReportDialogOpen(false)}
      aria-labelledby="report-dialog-title"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', md: 800 },
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Generate & Download Report
        </Typography>

        {/* Section & Format */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Section</InputLabel>
            <Select
              value={reportSectionSelected}
              label="Section"
              onChange={(e) => setReportSectionSelected(e.target.value)}
            >
              {['Overview', 'Sales', 'Inventory', 'Employees', 'Expenses', 'Payments', 'Branches'].map(
                (s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={reportFormatSelected}
              label="Format"
              onChange={(e) => setReportFormatSelected(e.target.value)}
            >
              <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
              <MenuItem value="pdf">PDF (.pdf)</MenuItem>
              <MenuItem value="csv">CSV (.csv)</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            onClick={() => {
              setReportSectionSelected('Overview');
              setReportFormatSelected('xlsx');
            }}
          >
            Reset
          </Button>
        </Box>

        {/* Date Range + Month/Year Filters */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start date"
              value={reportStartDate}
              onChange={(newValue) => {
                setReportStartDate(newValue);
                setReportMonth('');
                setReportYear('');
              }}
              renderInput={(params) => <TextField size="small" {...params} />}
            />
            <DatePicker
              label="End date"
              value={reportEndDate}
              onChange={(newValue) => {
                setReportEndDate(newValue);
                setReportMonth('');
                setReportYear('');
              }}
              renderInput={(params) => <TextField size="small" {...params} />}
            />
          </LocalizationProvider>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Month</InputLabel>
            <Select
              value={reportMonth}
              label="Month"
              onChange={(e) => {
                setReportMonth(e.target.value);
                setReportStartDate(null);
                setReportEndDate(null);
              }}
            >
              <MenuItem value="">(Any)</MenuItem>
              {[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ].map((m, i) => (
                <MenuItem key={m} value={i + 1}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={reportYear}
              label="Year"
              onChange={(e) => {
                setReportYear(e.target.value);
                setReportStartDate(null);
                setReportEndDate(null);
              }}
            >
              <MenuItem value="">(Any)</MenuItem>
              {Array.from({ length: 11 }, (_, i) => {
                const y = new Date().getFullYear() - 5 + i;
                return (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        {/* Preview */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2">
            Preview (first {reportPreviewLimit} rows)
          </Typography>
          <Box
            sx={{
              maxHeight: 300,
              overflow: 'auto',
              mt: 1,
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 1,
              p: 1,
            }}
          >
            {(() => {
              const rows = getSectionRows(reportSectionSelected) || [];
              if (!rows.length)
                return <Typography variant="body2">No data to preview</Typography>;
              const keys = Object.keys(rows[0]).slice(0, 12);
              return (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {keys.map((k) => (
                        <TableCell key={k}>{k}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.slice(0, reportPreviewLimit).map((r, i) => (
                      <TableRow key={i}>
                        {keys.map((k) => (
                          <TableCell key={k + '-' + i}>
                            {String(r[k] ?? '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              );
            })()}
          </Box>
        </Box>

        {/* Export Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => setReportDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            onClick={() => {
              setReportFormatSelected('csv');
              handleExportSelected();
            }}
          >
            Download CSV
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setReportFormatSelected('pdf');
              handleExportSelected();
            }}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setReportFormatSelected('xlsx');
              handleExportSelected();
            }}
            startIcon={<FileDownloadIcon />}
          >
            Export Excel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

  

  // Login screen
  if (!isAuthenticated) {
    return (
      <AppleLoginForm
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            onLogin={onLogin}
            loading={loading}
            error={error}
          />
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      

    <AppBar position="sticky" elevation={0} sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open menu" id='drawer'>
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#007AFF' }}>
              KOTG — Owner
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, color: '#66afff' }}>
              Fast • Smooth • Delightful
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {searchOpen ? (
            <InputBase
              placeholder="Search inventory, employees, branches, sales, expenses, payments…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputRef={searchInputRef}
              sx={{ bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1, p: 1, mr: 1, width: 300 }}
              inputProps={{ 'aria-label': 'Search' }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleSearchClose();
                }
              }}
            />
          ) : (
            <IconButton onClick={handleSearchToggle} sx={{ p: 1 }} aria-label="Toggle search" id='search'>
              <SearchIcon />
            </IconButton>
          )}
          <Popover
            open={openSearchResults}
            anchorEl={searchAnchorEl}
            onClose={handleSearchClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            disableRestoreFocus
            sx={{ mt: 1 }}
          >
            <List sx={{ p: 2, maxWidth: 400, maxHeight: 400, overflow: 'auto' }}>
              {searchResults.length === 0 ? (
                <Typography>{searchQuery.length >= 2 ? 'No results found' : 'Type at least 2 characters'}</Typography>
              ) : (
                searchResults.map((result) => (
                  <ListItem
                    key={`${result.type}-${result.id}`}
                    button
                    onClick={() => {
                      navigate(result.link);
                      handleSearchClose();
                    }}
                  >
                    <ListItemText
                      primary={result.name}
                      secondary={`${result.type.toUpperCase()} - ${result.details}`}
                      primaryTypographyProps={{
                        color: result.type === 'inventory' && result.details.includes('Stock: 0') ? 'error.main' : 'text.primary',
                      }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Popover>
          <Badge badgeContent={notifications.length} color="error">
            <IconButton onClick={handleNotificationsClick} sx={{ p: 1 }} aria-label="Notifications" id='notifications'>
              <NotificationsIcon />
            </IconButton>
          </Badge>
          <Popover
            open={openNotifications}
            anchorEl={notificationAnchorEl}
            onClose={handleNotificationsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <List sx={{ p: 2, maxWidth: 300 }}>
              {notifications.length === 0 ? (
                <Typography>No new notifications</Typography>
              ) : (
                notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleMarkAsRead(notification.id)} aria-label="Mark as read">
                        <CheckIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={notification.message}
                      secondary={new Date(notification.created_at).toLocaleString()}
                      primaryTypographyProps={{
                        color: notification.priority === 'high' ? 'error.main' : 'text.primary',
                      }}
                      onClick={() => notification.link && navigate(notification.link)}
                      sx={{ cursor: notification.link ? 'pointer' : 'default' }}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Popover>
          <Tooltip title="Take a quick tour">
            <IconButton
              id="guide-button"            // 👈 anchor for Joyride
              onClick={startTour}
              sx={{ p: 1 }}
              aria-label="Start Guide"
            >
              <StarIcon color="primary" />
            </IconButton>
          </Tooltip>
          <motion.img
            src={userPhoto}
            alt="User profile"
            style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #ffffff', cursor: 'pointer' }}
            whileHover={{ scale: 1.08 }}
            onClick={handleProfileClick}
            sx={{ mx: 1 }}
            id='profile'
          />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => navigate('/profile')}>View Profile</MenuItem>
            <MenuItem onClick={handleImageClick}>Change Photo</MenuItem>
            <MenuItem onClick={() => navigate('/forgot-password')}>Change Password</MenuItem>
          </Menu>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <IconButton onClick={logout} sx={{ p: 1 }} aria-label="Logout" id='logout'>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Joyride
        key={tourKey}                  // Forces Joyride to reset when key changes
        steps={steps}                  // The steps set by startTour()
        run={runTour}                  // Whether the tour is active
        continuous                     // Enables "Next" button between steps
        showSkipButton                 // Adds a "Skip" button
        showProgress                   // Shows progress (Step x of y)
        scrollToFirstStep              // Auto-scrolls to the target if needed
        spotlightClicks                // Allow clicking highlighted areas
        disableBeacon={false}          // ✅ Keeps the ripple beacon visible on Guide button
        disableScrolling={false}
        styles={{
          options: {
            primaryColor: '#007AFF',
            zIndex: 4000,              // Keeps tour above modals and AppBar
            arrowColor: '#fff',
          },
          tooltip: {
            borderRadius: '12px',
            padding: '16px 20px',
            fontSize: '15px',
          },
          buttonNext: {
            backgroundColor: '#007AFF',
            color: '#fff',
            fontWeight: 600,
          },
        }}
        callback={({ status }) => {
          // When finished or skipped, stop the tour
          if (['finished', 'skipped'].includes(status)) {
            setRunTour(false);
          }
        }}
      />


    </AppBar>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{
            sx: {
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255,255,255,0.6)',
            },
          }}
          ModalProps={{
            BackdropProps: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(0px)'
              },
            },
          }}
        >
          {drawerContent}
        </Drawer>


        <Box sx={{ position: 'sticky', top: 16, padding: 2 }} >
      <Grid container spacing={2} id='common-data'>
        {/* StatCard for Total Sales */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <StatCard
              title="Total Sales"
              value={formatCurrency(metrics.totalSales)}
              subtitle={`${(salesQuery.data || []).length} transactions`}
              color={'linear-gradient(135deg,#007AFF33,#5AC8FA33)'}
              icon={<TrendingUpIcon sx={{ fontSize: 36, color: '#007AFF' }} />}
            />
          </motion.div>
        </Grid>

        {/* StatCard for Expenses */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <StatCard
              title="Expenses"
              value={formatCurrency(metrics.totalExpenses)}
              subtitle={`Bills, wages & costs`}
              color={'linear-gradient(135deg,#FF3B3022,#FF950022)'}
              icon={<SavingsIcon sx={{ fontSize: 36, color: '#FF3B30' }} />}
            />
          </motion.div>
        </Grid>

        {/* StatCard for Net Profit */}
        <Grid item xs={12} sm={6} md={4}>
          <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <StatCard
              title="Net Profit"
              value={formatCurrency(metrics.netProfit)}
              subtitle={`After ${Math.round(savingsPct * 100)}% savings`}
              color={'linear-gradient(135deg,#34C75922,#5AC8FA22)'}
              icon={<TrendingUpIcon sx={{ fontSize: 36, color: '#34C759' }} />}
            />
          </motion.div>
        </Grid>

        {/* Savings Goal Paper */}
        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Paper elevation={6} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2">Savings Goal</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {formatCurrency(metrics.savings)}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress variant="determinate" value={Math.min(100, (metrics.savings / Math.max(1, metrics.totalSales)) * 100)} />
              </Box>
              <Typography variant="caption">Goal: {Math.round(savingsPct * 100)}% of gross profit</Typography>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {section === 'Overview' && (
              <Box id="overview-section">
                {/* --- Additional Insights Panel --- */}
                <Box sx={{ my: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <StatCard title="Inventory Intelligence" value={inventoryQuery.data?.length ?? 0} subtitle={`Low stock: ${lowStockItems.length}`} icon={<InventoryIcon sx={{ fontSize: 36 }} />} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <StatCard title="Customer Behaviour" value={`${(topCustomers[0]?.spend || 0).toFixed(2)}`} subtitle={`${topCustomers.length} customers`} icon={<People sx={{ fontSize: 36 }} />} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <StatCard title="Cashflow Insights" value={formatCurrency(cashFlow)} subtitle={`Target ${formatCurrency(cashFlowTarget)}`} icon={<CurrencyExchangeIcon sx={{ fontSize: 36 }} />} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <StatCard title="Employee Productivity" value={`${formatCurrency(Number(employeeProductivity.salesPerEmployee || 0).toFixed(2))}`} subtitle={`Sales / emp`} icon={<PersonAddIcon sx={{ fontSize: 36 }} />} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card sx={{ p:2 }}>
                        <Typography variant="subtitle2">Top Products</Typography>
                        <Box sx={{ display:'flex', gap:1, my:1 }}>
                          <Button size="small" onClick={() => setTopProductsSort({ key: 'revenue', dir: topProductsSort.dir === 'desc' ? 'asc' : 'desc' })}>Sort by Revenue</Button>
                          <Button size="small" onClick={() => setTopProductsSort({ key: 'qty', dir: topProductsSort.dir === 'desc' ? 'asc' : 'desc' })}>Sort by Qty</Button>
                          <Button size="small" onClick={() => downloadCSV('top_products.csv', sortedTopProducts)}>Export</Button>
                        </Box>
                        <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
                          <Table size="small">
                            <TableHead><TableRow><TableCell>Product</TableCell><TableCell>Qty</TableCell><TableCell>Revenue</TableCell></TableRow></TableHead>
                            <TableBody>
                              {sortedTopProducts.map(p => (
                                <TableRow key={p.name}><TableCell>{p.name}</TableCell><TableCell>{p.qty}</TableCell><TableCell>{formatCurrency(p.revenue)}</TableCell></TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card sx={{ p:2 }}>
                        <Typography variant="subtitle2">Top Customers</Typography>
                        <Box sx={{ display:'flex', gap:1, my:1 }}>
                          <Button size="small" onClick={() => setTopCustomersSort({ key: 'spend', dir: topCustomersSort.dir === 'desc' ? 'asc' : 'desc' })}>Sort by Spend</Button>
                          <Button size="small" onClick={() => setTopCustomersSort({ key: 'visits', dir: topCustomersSort.dir === 'desc' ? 'asc' : 'desc' })}>Sort by Visits</Button>
                          <Button size="small" onClick={() => downloadCSV('top_customers.csv', sortedTopCustomers)}>Export</Button>
                        </Box>
                        <Box sx={{ maxHeight: 220, overflow: 'auto' }}>
                          <Table size="small">
                            <TableHead><TableRow><TableCell>Customer</TableCell><TableCell>Visits</TableCell><TableCell>Spend</TableCell></TableRow></TableHead>
                            <TableBody>
                              {sortedTopCustomers.map(c => (
                                <TableRow key={c.customer}><TableCell>{c.customer}</TableCell><TableCell>{c.visits}</TableCell><TableCell>{formatCurrency(c.spend)}</TableCell></TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card sx={{ p:2 }}>
                        <Typography variant="subtitle2">Predictive Metrics</Typography>
                        <Typography>Projected next 30 days: {formatCurrency(predictiveMetrics.projectedNext30)}</Typography>
                        <Typography>Daily avg: {formatCurrency(predictiveMetrics.dailyAvg)}</Typography>
                        <Typography>Trend (per day): {formatCurrency(predictiveMetrics.trend)}</Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Card sx={{ p:2 }}>
                        <Typography variant="subtitle2">Expense Efficiency</Typography>
                        <Typography>Avg expense per transaction: {formatCurrency(expenseEfficiency.avgExpensePerTx)}</Typography>
                        <Typography>Total expenses: {formatCurrency(expenseEfficiency.totalExpenses)}</Typography>
                      </Card>
                    </Grid>

                    <Grid item xs={12}>
                      <Card sx={{ p:2 }}>
                        <Typography variant="subtitle2">Comparative Metrics (last 30 vs previous 30)</Typography>
                        <Typography>Current: {formatCurrency(comparativeMetrics.cur)} • Previous: {formatCurrency(comparativeMetrics.prev)} • Change: {comparativeMetrics.pct}%</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                <hr style={{ marginTop: '50px', marginBottom: '50px' }} />
                <AllBranchesDashboard/>
              </Box>
            )}

            {section === 'Sales' && (
              <Box sx={{ p: { xs: 1, sm: 2 } }}>
                <Grid container spacing={3}>
                  {/* --- Sales (Last 14 Days) --- */}
                  <Grid item xs={12} md={8}>
                    <Card
                      elevation={4}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        background: "linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)",
                        boxShadow: "0px 4px 15px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="h6" fontWeight={700}>
                          Sales (Last 14 Days)
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          onClick={exportSales}
                        >
                          Export
                        </Button>
                      </Box>

                      {salesByDayChart?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={380}>
                          <ComposedChart
                            data={salesByDayChart}
                            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="grad14days" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#1976d2" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#1976d2" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                borderRadius: 8,
                              }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Area
                              type="monotone"
                              dataKey="total"
                              stroke="#1976d2"
                              fill="url(#grad14days)"
                              strokeWidth={3}
                              activeDot={{ r: 5 }}
                              name="Sales"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <Typography align="center" color="text.secondary" py={6}>
                          No data available for the last 14 days.
                        </Typography>
                      )}
                    </Card>
                  </Grid>

                  {/* --- Item Distribution --- */}
                  <Grid item xs={12} md={4}>
                    <Card
                      elevation={4}
                      sx={{
                        borderRadius: 4,
                        p: 3,
                        height: { xs: "auto", md: "100%" },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0px 4px 15px rgba(0,0,0,0.05)",
                      }}
                    >
                      {/* Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          Item Distribution
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          onClick={() => downloadCSV("item-dist.csv", salesDistribution)}
                        >
                          CSV
                        </Button>
                      </Box>

                      {/* Pie Chart */}
                      <Box
                        sx={{
                          width: "100%",
                          flexGrow: 1,
                          minHeight: 240,
                          mb: 3, // increased for breathing space below chart
                        }}
                      >
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              dataKey="value"
                              data={salesDistribution}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {salesDistribution.map((entry, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: 8,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>

                      {/* Top Performers */}
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                        sx={{ mb: 1, color: "text.secondary" }}
                      >
                        Top Performing Inventory
                      </Typography>

                      {/* Legend / List with badges */}
                      <Box
                        sx={{
                          mt: 1,
                          pt: 1,
                          borderTop: "1px solid #eee",
                        }}
                      >
                        {salesDistribution.slice(0, 6).map((d, index) => {
                          let badgeColor, badgeIcon;
                          switch (index) {
                            case 0:
                              badgeColor = "#FFD700"; // gold
                              badgeIcon = "🥇";
                              break;
                            case 1:
                              badgeColor = "#C0C0C0"; // silver
                              badgeIcon = "🥈";
                              break;
                            case 2:
                              badgeColor = "#CD7F32"; // bronze
                              badgeIcon = "🥉";
                              break;
                            default:
                              badgeColor = "#E0E0E0";
                              badgeIcon = "🏷️";
                          }

                          return (
                            <Box
                              key={d.name}
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                py: 0.8,
                                px: 1,
                                borderRadius: 2,
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.03)" },
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: "50%",
                                    backgroundColor: badgeColor,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 13,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                                  }}
                                >
                                  {badgeIcon}
                                </Box>
                                <Typography variant="body2">{d.name}</Typography>
                              </Box>

                              <Typography variant="body2" fontWeight={500}>
                                {d.value}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Card>
                  </Grid>



                  {/* --- Sales vs Targets --- */}
                  <Grid item xs={12}>
                    <Card
                      elevation={4}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        background: "linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)",
                        boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={3}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            Sales vs Targets
                          </Typography>
                          {salesMeta?.range && (
                            <Typography variant="body2" color="text.secondary">
                              Period: {salesMeta.range}
                            </Typography>
                          )}
                        </Box>

                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Period</InputLabel>
                          <Select
                            value={period}
                            label="Period"
                            onChange={(e) => setPeriod(e.target.value)}
                          >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>

                      {loading ? (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          height={350}
                        >
                          <CircularProgress />
                        </Box>
                      ) : salesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={380}>
                          <ComposedChart data={salesData}>
                            <defs>
                              <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1976d2" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="#1976d2" stopOpacity={0.05} />
                              </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                borderRadius: 8,
                              }}
                            />
                            <Legend verticalAlign="top" height={36} />

                            {/* SALES area */}
                            <Area
                              type="monotone"
                              dataKey="sales"
                              stroke="#1976d2"
                              fill="url(#gradSales)"
                              strokeWidth={3}
                              activeDot={{ r: 5 }}
                              name="Sales"
                            />

                            {/* TARGET line */}
                            <Line
                              type="monotone"
                              dataKey="target"
                              stroke="#43a047"
                              strokeWidth={2.5}
                              strokeDasharray="6 4"
                              dot={false}
                              name="Target"
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      ) : (
                        <Typography align="center" color="text.secondary" py={6}>
                          No sales data available for this period.
                        </Typography>
                      )}
                    </Card>
                  </Grid>

                  {/* --- Sales Table --- */}
                  <Grid item xs={12}>
                    <Card elevation={4} sx={{ borderRadius: 4, p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="h6" fontWeight={700}>
                          Sales Records
                        </Typography>
                        <Box>
                          <Button
                            startIcon={<FileDownloadIcon />}
                            size="small"
                            onClick={exportSales}
                          >
                            Export
                          </Button>
                          <Button
                            startIcon={<RefreshIcon />}
                            size="small"
                            onClick={() =>
                              queryClient.invalidateQueries(["sales", branchId])
                            }
                          >
                            Refresh
                          </Button>
                        </Box>
                      </Box>

                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {(salesQuery.data || []).length} rows
                      </Typography>

                      {/* Search Bar */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <TextField
                          label="Search Sale ID"
                          size="small"
                          value={saleSearch}
                          onChange={(e) => setSaleSearch(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaleSearch()}
                          placeholder="Enter Sale ID..."
                        />
                        <Button variant="contained" onClick={handleSaleSearch}>
                          Search
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSaleSearch("");
                            setFilteredSales(salesQuery?.data || []);
                          }}
                        >
                          Reset
                        </Button>
                      </Box>

                      {/* Table */}
                      <Box sx={{ maxHeight: 420, overflow: "auto" }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Item</TableCell>
                              <TableCell>Qty</TableCell>
                              <TableCell>Total</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(filteredSales.length ? filteredSales : salesQuery?.data || []).map(
                              (s) => (
                                <TableRow key={s.id || Math.random()}>
                                  <TableCell>
                                    {(s.timestamp || s.created_at || "").slice(0, 19)}
                                  </TableCell>
                                  <TableCell>{s.item_purchased || s.item || "—"}</TableCell>
                                  <TableCell>{s.quantity || s.qty || 1}</TableCell>
                                  <TableCell>
                                    {formatCurrency(Number(s.total || 0))}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => fetchSaleDetails(s.id)}
                                    >
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}


          {section === 'Inventory' && (

            <Card elevation={8} sx={{ borderRadius: 3, p: 2 }} id="inventory-section">
              <ToggleButtonGroup
                size="small"
                value={period}
                exclusive
                onChange={(e, v) => v && setPeriod(v)}
                sx={{ mb: 2, mt: 8 }}
              >
                <ToggleButton value="daily">Daily</ToggleButton>
                <ToggleButton value="weekly">Weekly</ToggleButton>
                <ToggleButton value="monthly">Monthly</ToggleButton>
                <ToggleButton value="yearly">Yearly</ToggleButton>
              </ToggleButtonGroup>
              {rawData.length > 0 && (
                <Paper
                  sx={{
                    p: 3,
                    mt: 3,
                    mb: 8,
                    borderRadius: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                    background: 'linear-gradient(145deg, #ffffff, #f9fafb)',
                  }}
                  id="inventory-performance"
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 2,
                    }}
                  >
                    Product Performance ({period})
                  </Typography>

                  <Box sx={{ width: '100%', height: 420 }}>
                    <ResponsiveContainer>
                      <LineChart data={performanceData}>
                        <defs>
                          {products.map((p, i) => {
                            const color = `hsl(${(i * 60) % 360},70%,50%)`;
                            return (
                              <linearGradient key={p} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="10%" stopColor={color} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                              </linearGradient>
                            );
                          })}
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12 }}
                          tickMargin={8}
                          stroke="#9e9e9e"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          stroke="#9e9e9e"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: 10,
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                          }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />

                        {products.map((p, i) => {
                          const color = `hsl(${(i * 60) % 360},70%,50%)`;
                          return (
                            <Line
                              key={p}
                              type="monotone"
                              dataKey={p}
                              stroke={color}
                              strokeWidth={2}
                              dot={false}
                              fillOpacity={1}
                              fill={`url(#color${i})`}
                            />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              )}



              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} id='modify-inventory'>
                <Typography variant="h6">Inventory</Typography>
                <Box>
                  <Button startIcon={<FileDownloadIcon />} size="small" onClick={() => downloadCSV('inventory.csv', inventory.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    buying_price: item.buying_price,
                    price2: item.price2 || 'N/A',
                    price3: item.price3 || 'N/A',
                    stock: item.stock,
                    unit: item.unit,
                    type: item.isButchery ? 'Butchery' : 'Gas',
                    image: item.image || 'N/A',
                  })))}>Export</Button>
                  <Button startIcon={<AddIcon />} size="small" onClick={openAddInventory}>Add Item</Button>
                </Box>
              </Box>
              <Typography variant="body2">{inventory.length} items</Typography>
                {lowStockItems.length > 0 && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                    {lowStockItems.length} items low in stock:
                    {lowStockItems.map(it => (
                      <Chip key={it.id} label={`${it.name} (${it.stock})`} sx={{ ml: 1 }} />
                    ))}
                  </Alert>
                )}
              {inventoryLoading ? (
                <Typography variant="body2">Loading inventory...</Typography>
              ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {inventory.map((it) => (
                    <Grid item xs={12} sm={6} md={4} key={it.id}>
                      <Paper elevation={6} sx={{ p: 2, borderRadius: 2 }}>
                        {it.image && (
                          <CardMedia
                            component="img"
                            height="140"
                            image={`${API_BASE_URL}/storage/${it.image}`}
                            alt={it.name}
                            sx={{ borderRadius: 2, mb: 1 }}
                          />
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{it.name}</Typography>
                          <Chip label={`${it.stock} ${it.unit}`} />
                        </Box>
                        <Typography variant="caption">
                          {it.isButchery ? `Price: ${formatCurrency(it.price)}` : `Prices: ${formatCurrency(it.price)} / ${formatCurrency(it.price2)} / ${formatCurrency(it.price3)}`}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          Buying price:  {it.buying_price}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          Per unit profit:  {formatCurrency(it.price - it.buying_price)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Type: {it.isButchery ? 'Butchery' : 'Gas'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button size="small" startIcon={<EditIcon />} onClick={() => openEditInventory(it)}>Edit</Button>
                          <Button size="small" startIcon={<DeleteIcon />} onClick={() => confirmDeleteInventory(it.id)}>Delete</Button>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Card>
          )}

          {section === "Expenses" && (
            <Grid container spacing={3}>
              {/* EXPENSES OVERVIEW */}
              <Grid item xs={12}>
                <Card
                  elevation={4}
                  sx={{
                    borderRadius: 4,
                    p: 3,
                    background: "linear-gradient(145deg, #ffffff, #f9f9f9)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {/* Header / Filters */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          background: "linear-gradient(90deg,#1976d2,#4cafef)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Expense Overview
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Track expenditure by category and trend.
                      </Typography>
                    </Box>

                    <Select
                      size="small"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      sx={{
                        minWidth: 140,
                        fontWeight: 500,
                        backgroundColor: "#fff",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ddd" },
                      }}
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                    </Select>
                  </Box>

                  {/* KPI Summary Row */}
                  <Stack direction="row" spacing={2} flexWrap="wrap" mb={2}>
                    <Chip
                      label={`Total: ${formatCurrency(
                        (expensesChartData || []).reduce((sum, row) => {
                          // sum numeric fields in row
                          const numericSum = Object.values(row)
                            .filter((v) => typeof v === "number")
                            .reduce((a, b) => a + b, 0);
                          return sum + numericSum;
                        }, 0)
                      )}`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip label="Fuel ↑12%" sx={{ backgroundColor: "#e3f2fd" }} />
                    <Chip label="Salaries steady" sx={{ backgroundColor: "#e8f5e9" }} />
                    <Chip label="Rent stable" sx={{ backgroundColor: "#fff3e0" }} />
                  </Stack>

                  {/* Chart */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 350,
                      background: "#fff",
                      borderRadius: 3,
                      boxShadow: "inset 0 1px 4px rgba(0,0,0,0.05)",
                      p: 1.5,
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={expensesChartData || []}>
                        <defs>
                          <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1976d2" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#1976d2" stopOpacity={0} />
                          </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#555" }} />
                        <YAxis tick={{ fontSize: 12, fill: "#555" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ddd",
                            borderRadius: 10,
                          }}
                        />
                        <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />

                        {[
                          "Fuel",
                          "Salaries",
                          "Utilities",
                          "Rent",
                          "Repairs",
                          "Transport",
                          "Miscellaneous",
                        ].map((cat, idx) => (
                          <Bar
                            key={cat}
                            dataKey={cat}
                            stackId="expenses"
                            fill={[
                              "#1976d2",
                              "#4caf50",
                              "#ff9800",
                              "#9c27b0",
                              "#f44336",
                              "#009688",
                              "#00bcd4",
                            ][idx % 7]}
                            radius={[4, 4, 0, 0]}
                            animationDuration={700}
                          />
                        ))}

                        {/* Optional trend line */}
                        <Line
                          type="monotone"
                          dataKey="Total"
                          stroke="#000"
                          strokeWidth={2}
                          dot={false}
                          name="Trend"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </Card>
              </Grid>

              {/* EXPENSES LIST */}
              <Grid item xs={12}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 4,
                    p: 3,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      Expense Records
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportExpenses}>
                        Export
                      </Button>
                      <Button startIcon={<AddIcon />} size="small" onClick={openAddExpense} variant="contained">
                        Add
                      </Button>
                    </Box>
                  </Box>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Note</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(expensesQuery.data?.data || []).map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{(e.created_at || "").slice(0, 19)}</TableCell>
                          <TableCell>{e.title}</TableCell>
                          <TableCell>{formatCurrency(Number(e.amount || 0))}</TableCell>
                          <TableCell>{e.category || "—"}</TableCell>
                          <TableCell>{e.note || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                      page={page}
                      count={expensesQuery.data?.last_page || 1}
                      onChange={(_, val) => setPage(val)}
                    />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          )}



            {section === 'Employees' && (
              <Card elevation={8} sx={{ borderRadius: 3, p: 3 }}>
                {/* ====== HEADER ====== */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }} id='employees-section'>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Employees
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportEmployees}>
                      Export
                    </Button>
                    <Button startIcon={<PersonAddIcon />} size="small" onClick={openAddEmployee}>
                      Add Employee
                    </Button>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {employees.length} employees
                </Typography>


                {/* ====== EMPLOYEE TABLE ====== */}
                <Box sx={{ mt: 2, maxHeight: 420, overflow: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>ID Number</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Suspended</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEmployees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            {emp.user?.photo ? (
                              <img
                                src={`${API_BASE_URL}/storage/${emp.user.photo}`}
                                alt={emp.name || emp.user?.username || 'Employee'}
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <PersonIcon sx={{ width: 40, height: 40 }} />
                            )}
                          </TableCell>
                          <TableCell>{emp.name || emp.user?.username || 'N/A'}</TableCell>
                          <TableCell>{emp.user?.email || 'N/A'}</TableCell>
                          <TableCell>{emp.idNumber}</TableCell>
                          <TableCell>{emp.position}</TableCell>
                          <TableCell>{emp.status}</TableCell>
                          <TableCell>
                            {emp.suspended
                              ? `Yes (${emp.suspensionDate?.slice(0, 10) || 'N/A'})`
                              : 'No'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => openEditEmployee(emp)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => confirmDeleteEmployee(emp.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              size="small"
                              startIcon={emp.suspended ? <UnsuspendIcon /> : <SuspendIcon />}
                              onClick={() =>
                                emp.suspended
                                  ? confirmUnsuspendEmployee(emp.id)
                                  : confirmSuspendEmployee(emp.id)
                              }
                            >
                              {emp.suspended ? 'Unsuspend' : 'Suspend'}
                            </Button>
                            <Button
                              size="small"
                              startIcon={<TransferIcon />}
                              onClick={() => openTransferEmployee(emp)}
                            >
                              Transfer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredEmployees.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            No employees found for the selected filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Card>
            )}


            {section === 'Payments' && (
              <PaymentsTable branchId={branchId} />
            )}

            {section === 'Bills' && (
              <Box id="bills-section" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Bills</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setEditingBill({
                        supplier: '',
                        amount: '',
                        category: '',
                        description: '',
                        bill_date: new Date().toISOString().slice(0, 10),
                        due_date: '',
                        status: 'unpaid',
                      });
                      setBillDialogOpen(true);
                    }}
                  >
                    Add Bill
                  </Button>
                </Box>

                {billsLoading ? (
                  <CircularProgress />
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Supplier</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(bills.data ?? bills ?? []).map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{bill.supplier}</TableCell>
                          <TableCell>{formatCurrency(bill.amount)}</TableCell>
                          <TableCell>{bill.due_date || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={bill.status}
                              color={
                                bill.status === 'paid'
                                  ? 'success'
                                  : bill.status === 'partially_paid'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => {
                                setEditingBill(bill);
                                setBillDialogOpen(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => deleteBill.mutate(bill.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <Dialog open={!!payingBill} onClose={() => setPayingBill(null)}>
                  <DialogTitle>Pay Bill – {payingBill?.supplier}</DialogTitle>
                  <DialogContent>
                    <TextField
                      label="Amount"
                      fullWidth
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      sx={{ mt: 1 }}
                    />
                    <TextField
                      label="Note"
                      fullWidth
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setPayingBill(null)}>Cancel</Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        payMutation.mutate({
                          billId: payingBill.id,
                          amount: parseFloat(payAmount),
                          note: payNote,
                        });
                      }}
                      disabled={payMutation.isLoading}
                    >
                      {payMutation.isLoading ? 'Processing...' : 'Confirm Payment'}
                    </Button>
                  </DialogActions>
                </Dialog>

              </Box>
            )}


            {section === 'Branches' && (
            <Card elevation={8} sx={{ borderRadius: 3, p: 2, mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Branches</Typography>
                <Box>
                  <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportBranches}>Export</Button>
                  <Button startIcon={<AddIcon />} size="small" onClick={openAddBranch}>Add Branch</Button>
                </Box>
              </Box>

              <Typography variant="body2" sx={{ mt: 1 }}>
                {branches.length} branch{branches.length !== 1 ? 'es' : ''}
              </Typography>

              {branchesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <CircularProgress />
                </Box>
              ) : branches.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  No branches yet. Click “Add Branch” to create one.
                </Typography>
              ) : (
                <Box sx={{ mt: 2, overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Till #</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Latitude</strong></TableCell>
                        <TableCell><strong>Longitude</strong></TableCell>
                        <TableCell><strong>Radius (km)</strong></TableCell>
                        <TableCell><strong>Daily Target</strong></TableCell>
                        <TableCell><strong>Weekly Target</strong></TableCell>
                        <TableCell><strong>Monthly Target</strong></TableCell>
                        <TableCell><strong>Yearly Target</strong></TableCell>
                        <TableCell><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {branches.map((b) => (
                        <TableRow key={b.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>{b.name || '—'}</TableCell>
                          <TableCell>{b.tillNumber || '—'}</TableCell>
                          <TableCell>{b.type || '—'}</TableCell>

                          {/* Latitude & Longitude – always show value if present, even 0 */}
                          <TableCell>{b.latitude != null ? Number(b.latitude).toFixed(4) : '—'}</TableCell>
                          <TableCell>{b.longitude != null ? Number(b.longitude).toFixed(4) : '—'}</TableCell>

                          {/* Radius – show 0 if null */}
                          <TableCell>{b.service_radius != null ? b.service_radius : 0}</TableCell>

                          {/* Targets – formatted as currency, show 0 if null */}
                          <TableCell>{formatCurrency(b.daily_target != null ? b.daily_target : 0)}</TableCell>
                          <TableCell>{formatCurrency(b.weekly_target != null ? b.weekly_target : 0)}</TableCell>
                          <TableCell>{formatCurrency(b.monthly_target != null ? b.monthly_target : 0)}</TableCell>
                          <TableCell>{formatCurrency(b.yearly_target != null ? b.yearly_target : 0)}</TableCell>

                          {/* Actions */}
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => openEditBranch(b)}
                              sx={{ mr: 0.5 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DeleteIcon />}
                              color="error"
                              onClick={() => confirmDeleteBranch(b.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Card>
          )}
          </motion.div>
        </Grid>
      </Grid>

      {/* Modals & forms */}
      <Modal open={!!editingInventory} onClose={() => setEditingInventory(null)}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, maxHeight: '90vh', overflowY: 'auto' }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6">{editingInventory?.id ? 'Edit Item' : 'Add Item'}</Typography>
            <TextField
              fullWidth
              label="Name"
              sx={{ mt: 2 }}
              value={editingInventory?.name || ''}
              onChange={(e) => setEditingInventory((s) => ({ ...s, name: e.target.value }))}
              required
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              label={
                branch?.type === 'drinks'
                  ? 'Retail Price (KES)'
                  : branch?.type === 'gas'
                  ? 'Price (KES)'
                  : 'Selling Price (KES)'
              }
              sx={{ mt: 2 }}
              name="price"
              type="number"
              fullWidth
              required
              value={editingInventory?.price || ''}
              onChange={(e) =>
                setEditingInventory({ ...editingInventory, price: e.target.value })
              }
            />
            {branch?.type === 'drinks' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Wholesale Price (KES)"
                  sx={{ mt: 2 }}
                  name="price2"
                  type="number"
                  fullWidth
                  value={editingInventory?.price2 || ''}
                  onChange={(e) =>
                    setEditingInventory({ ...editingInventory, price2: e.target.value })
                  }
                />
              </Grid>
            )}
            {!editingInventory?.isButchery && isGasBranch && (
              <>
                <TextField
                  fullWidth
                  label="Price 2"
                  type="number"
                  sx={{ mt: 2 }}
                  value={editingInventory?.price2 || ''}
                  onChange={(e) => setEditingInventory((s) => ({ ...s, price2: e.target.value }))}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <TextField
                  fullWidth
                  label="Price 3"
                  type="number"
                  sx={{ mt: 2 }}
                  value={editingInventory?.price3 || ''}
                  onChange={(e) => setEditingInventory((s) => ({ ...s, price3: e.target.value }))}
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </>
            )}
             <TextField
              fullWidth
              label="Buying Price"
              type="number"
              sx={{ mt: 2 }}
              value={editingInventory?.buying_price || ''}
              onChange={(e) => setEditingInventory((s) => ({ ...s, buying_price: e.target.value }))}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              label="Stock"
              type="number"
              sx={{ mt: 2 }}
              value={editingInventory?.stock || ''}
              onChange={(e) => setEditingInventory((s) => ({ ...s, stock: e.target.value }))}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              label="Unit"
              sx={{ mt: 2 }}
              value={editingInventory?.unit || ''}
              onChange={(e) => setEditingInventory((s) => ({ ...s, unit: e.target.value }))}
              required
              inputProps={{ maxLength: 50 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Item Type: {editingInventory?.isButchery ? 'Butchery' : 'Gas'}</Typography>
                <Switch
                  checked={branch?.type === 'butchery' || false}
                  onChange={(e) => setEditingInventory((s) => ({ ...s, isButchery: e.target.checked }))}
                  disabled={!!branch?.type} // Lock based on branch type
                  inputProps={{ 'aria-label': 'Item Type (Butchery or Gas)' }}
                />
              </Box>
              {branch?.type && (
                <Typography variant="caption" color="textSecondary">
                  Type locked to {branch.type} based on branch configuration
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              type="file"
              label="Image"
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
              onChange={(e) => setEditingInventory((s) => ({ ...s, image: e.target.files[0] }))}
              inputProps={{ accept: 'image/jpeg,image/png,image/gif' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setEditingInventory(null)}>Cancel</Button>
              <Button onClick={saveInventory} variant="contained" sx={{ ml: 1 }}>Save</Button>
            </Box>
          </Paper>
        </Box>
      </Modal>

      <Modal open={!!editingExpense} onClose={() => setEditingExpense(null)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6">{editingExpense && editingExpense.id ? 'Edit expense' : 'Add expense'}</Typography>
            <TextField fullWidth label="Title" sx={{ mt: 2 }} value={editingExpense?.title || ''} onChange={(e) => setEditingExpense((s) => ({ ...s, title: e.target.value }))} />
            <TextField fullWidth label="Amount" sx={{ mt: 2 }} value={editingExpense?.amount || ''} onChange={(e) => setEditingExpense((s) => ({ ...s, amount: e.target.value }))} />
            <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={editingExpense?.category || ''}
              label="Category"
              onChange={(e) =>
                setEditingExpense((s) => ({ ...s, category: e.target.value }))
              }
            >
              {expenseCategories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
            <TextField fullWidth label="Note" sx={{ mt: 2 }} value={editingExpense?.note || ''} onChange={(e) => setEditingExpense((s) => ({ ...s, note: e.target.value }))} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setEditingExpense(null)}>Cancel</Button>
              <Button onClick={saveExpense} variant="contained" sx={{ ml: 1 }}>Save</Button>
            </Box>
          </Paper>
        </Box>
      </Modal>

      <Modal open={!!editingEmployee} onClose={() => setEditingEmployee(null)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, maxHeight: '90vh', overflowY: 'auto' }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6">{editingEmployee && editingEmployee.id ? 'Edit Employee' : 'Add Employee'}</Typography>
            <TextField
              fullWidth
              label="Username"
              sx={{ mt: 2 }}
              value={editingEmployee?.username || ''}
              onChange={(e) => setEditingEmployee((s) => ({ ...s, username: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Email"
              sx={{ mt: 2 }}
              value={editingEmployee?.email || ''}
              onChange={(e) => setEditingEmployee((s) => ({ ...s, email: e.target.value }))}
            />
            <TextField
              fullWidth
              label="ID Number"
              sx={{ mt: 2 }}
              value={editingEmployee?.idNumber || ''}
              onChange={(e) => setEditingEmployee((s) => ({ ...s, idNumber: e.target.value }))}
              disabled={editingEmployee?.id}
            />
            <TextField
              fullWidth
              label="Name"
              sx={{ mt: 2 }}
              value={editingEmployee?.name || ''}
              onChange={(e) => setEditingEmployee((s) => ({ ...s, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Position"
              sx={{ mt: 2 }}
              value={editingEmployee?.position || ''}
              onChange={(e) => setEditingEmployee((s) => ({ ...s, position: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Experience"
              sx={{ mt: 2 }}
              value={editingEmployee?.experience || ''}
              onChange={(e) => setEditingEmployee((s) => ({ ...s, experience: e.target.value }))}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editingEmployee?.status || 'active'}
                label="Status"
                onChange={(e) => setEditingEmployee((s) => ({ ...s, status: e.target.value }))}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="file"
              label="Photo"
              InputLabelProps={{ shrink: true }}
              sx={{ mt: 2 }}
              onChange={(e) => setEditingEmployee((s) => ({ ...s, photo: e.target.files[0] }))}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setEditingEmployee(null)}>Cancel</Button>
              <Button onClick={saveEmployee} variant="contained" sx={{ ml: 1 }}>Save</Button>
            </Box>
          </Paper>
        </Box>
      </Modal>

      <Modal open={!!transferringEmployee} onClose={() => setTransferringEmployee(null)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6">Transfer Employee: {transferringEmployee?.name}</Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>New Branch</InputLabel>
              <Select
                value={transferringEmployee?.newBranchId || ''}
                label="New Branch"
                onChange={(e) => setTransferringEmployee((s) => ({ ...s, newBranchId: e.target.value }))}
              >
                {branches.filter(b => b.id !== branchId).map((b) => (
                  <MenuItem value={b.id} key={b.id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setTransferringEmployee(null)}>Cancel</Button>
              <Button onClick={saveTransfer} variant="contained" sx={{ ml: 1 }} disabled={!transferringEmployee?.newBranchId}>Transfer</Button>
            </Box>
          </Paper>
        </Box>
      </Modal>

      <Modal open={!!editingBranch} onClose={() => setEditingBranch(null)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', md: 560 },
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {editingBranch?.id ? 'Edit Branch' : 'Add Branch'}
          </Typography>

          {/* Existing Fields */}
          <TextField fullWidth label="Name" sx={{ mt: 2 }} value={editingBranch?.name || ''} onChange={e => setEditingBranch({ ...editingBranch, name: e.target.value })} />
          <TextField fullWidth label="Till Number" sx={{ mt: 2 }} value={editingBranch?.tillNumber || ''} onChange={e => setEditingBranch({ ...editingBranch, tillNumber: e.target.value })} />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Branch Type</InputLabel>
            <Select value={editingBranch?.type || ''} label="Branch Type" onChange={e => setEditingBranch({ ...editingBranch, type: e.target.value })}>
              <MenuItem value="butchery">Butchery</MenuItem>
              <MenuItem value="gas">Gas</MenuItem>
              <MenuItem value="drinks">Drinks</MenuItem>
            </Select>
          </FormControl>

          <TextField fullWidth label="Manager ID" sx={{ mt: 2 }} value={editingBranch?.managerId || ''} onChange={e => setEditingBranch({ ...editingBranch, managerId: e.target.value })} />
          <TextField fullWidth label="Role Config" sx={{ mt: 2 }} value={editingBranch?.roleConfig || ''} onChange={e => setEditingBranch({ ...editingBranch, roleConfig: e.target.value })} />

          {/* ─────── LOCATION (lat/lng) ─────── */}
          <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Location</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  inputProps={{ step: 'any' }}
                  value={editingBranch?.latitude ?? (userLocation?.lat ?? '')}
                  onChange={e => setEditingBranch({ ...editingBranch, latitude: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  inputProps={{ step: 'any' }}
                  value={editingBranch?.longitude ?? (userLocation?.lng ?? '')}
                  onChange={e => setEditingBranch({ ...editingBranch, longitude: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
            </Grid>
            {userLocation && !editingBranch?.id && (
              <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                Using your current location
              </Typography>
            )}
          </Box>

          {/* ─────── SERVICE RADIUS SLIDER ─────── */}
          <Box sx={{ mt: 3, px: 2 }}>
            <Typography gutterBottom>
              Service Radius (km): <strong>{(editingBranch?.service_radius ?? 0).toFixed(1)}</strong>
            </Typography>
            <Slider
              value={editingBranch?.service_radius ?? 0}
              onChange={(_, v) => setEditingBranch({ ...editingBranch, service_radius: Number(v) })}
              step={0.5}
              min={0}
              max={100}
              marks={[
                { value: 0, label: '0' },
                { value: 25, label: '25' },
                { value: 50, label: '50' },
                { value: 75, label: '75' },
                { value: 100, label: '100' },
              ]}
              valueLabelDisplay="auto"
            />
          </Box>

          {/* ─────── TARGETS ─────── */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
              <Grid item xs={6} key={period}>
                <TextField
                  fullWidth
                  label={`${period.charAt(0).toUpperCase() + period.slice(1)} Target (KES)`}
                  type="number"
                  value={editingBranch?.[`${period}_target`] ?? ''}
                  onChange={e => setEditingBranch({ ...editingBranch, [`${period}_target`]: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
            ))}
          </Grid>

          {/* Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
            <Button onClick={() => setEditingBranch(null)}>Cancel</Button>
            <Button variant="contained" onClick={saveBranch}>
              {editingBranch?.id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={showHow} onClose={() => setShowHow(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6">How savings are calculated</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              We calculate gross profit (sales - expenses), then reserve <strong>{Math.round(savingsPct * 100)}%</strong> of that amount as savings. The remaining amount is net profit available for reinvestment or distribution.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setShowHow(false)}>Close</Button>
            </Box>
          </Paper>
        </Box>
      </Modal>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={safeCloseSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={safeCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
          <ReportDialog />
          <Modal open={saleDetailOpen} onClose={() => setSaleDetailOpen(false)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', md: 700 },
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 2,
                boxShadow: 24,
              }}
            >
              {saleDetailLoading ? (
                <Typography>Loading sale details...</Typography>
              ) : selectedSale ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Sale #{selectedSale.id}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Branch:</strong> {selectedSale.branch} <br />
                    <strong>Payment:</strong> {selectedSale.payment_method} ({selectedSale.payment_status}) <br />
                    <strong>Total:</strong> KES {Number(selectedSale.total).toLocaleString()} <br />
                    <strong>Customer:</strong> {selectedSale.customer_name || 'N/A'} ({selectedSale.customer_telephone_number || 'N/A'}) <br />
                    <strong>Date:</strong> {new Date(selectedSale.created_at).toLocaleString()}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Items Sold
                  </Typography>
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Price (KES)</TableCell>
                          <TableCell align="right">Subtotal (KES)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedSale.items.map((i, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{i.item}</TableCell>
                            <TableCell align="right">{i.quantity}</TableCell>
                            <TableCell align="right">{i.price.toLocaleString()}</TableCell>
                            <TableCell align="right">{i.total.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  {/* Summary */}
                  <Divider sx={{ my: 2 }} />
                  {(() => {
                    const totalItems = selectedSale.items.reduce((sum, i) => sum + Number(i.quantity), 0);
                    const grandTotal = selectedSale.items.reduce((sum, i) => sum + Number(i.total), 0);
                    return (
                      <Typography variant="body2">
                        <strong>Total Items Sold:</strong> {totalItems} <br />
                        <strong>Grand Total:</strong> KES {grandTotal.toLocaleString()}
                      </Typography>
                    );
                  })()}

                  {/* Credit Sale Info */}
                  {selectedSale.credit_sale && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1">Credit Info</Typography>
                      <Typography variant="body2">
                        Total: KES {selectedSale.credit_sale.total_amount.toLocaleString()} <br />
                        Paid: KES {selectedSale.credit_sale.amount_paid.toLocaleString()} <br />
                        Balance: KES {selectedSale.credit_sale.balance.toLocaleString()}
                      </Typography>
                    </>
                  )}
                <Button
                  variant="outlined"
                  onClick={printSalePdf}
                  startIcon={<FileDownloadIcon />}
                >
                  Export PDF
                </Button>
                  <Box sx={{ textAlign: 'right', mt: 2 }}>
                    <Button onClick={() => setSaleDetailOpen(false)}>Close</Button>
                  </Box>
                </>

              ) : (
                <Typography>No sale selected</Typography>
              )}
            </Box>
          </Modal>
          
          <Modal open={billDialogOpen} onClose={() => setBillDialogOpen(false)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 2,
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                {editingBill?.id ? 'Edit Bill' : 'Add Bill'}
              </Typography>

              <TextField
                label="Supplier"
                fullWidth
                sx={{ mb: 2 }}
                value={editingBill?.supplier || ''}
                onChange={(e) => setEditingBill({ ...editingBill, supplier: e.target.value })}
              />
              <TextField
                label="Amount (KES)"
                fullWidth
                sx={{ mb: 2 }}
                type="number"
                value={editingBill?.amount || ''}
                onChange={(e) => setEditingBill({ ...editingBill, amount: e.target.value })}
              />
              <TextField
                label="Category"
                fullWidth
                sx={{ mb: 2 }}
                value={editingBill?.category || ''}
                onChange={(e) => setEditingBill({ ...editingBill, category: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
                value={editingBill?.description || ''}
                onChange={(e) => setEditingBill({ ...editingBill, description: e.target.value })}
              />
              <TextField
                label="Bill Date"
                type="date"
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                value={editingBill?.bill_date || ''}
                onChange={(e) => setEditingBill({ ...editingBill, bill_date: e.target.value })}
              />
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                value={editingBill?.due_date || ''}
                onChange={(e) => setEditingBill({ ...editingBill, due_date: e.target.value })}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingBill?.status || 'unpaid'}
                  onChange={(e) => setEditingBill({ ...editingBill, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="partially_paid">Partially Paid</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setBillDialogOpen(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (editingBill.id) {
                      // edit existing
                      editBill.mutate({ id: editingBill.id, payload: editingBill });
                    } else {
                      // add new
                      addBill.mutate(editingBill);
                    }
                  }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Modal>

          

    </Container>
  );
}

export default function OwnerDashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <OwnerDashboardApp />
      <Box
      component="footer"
      sx={{
        mt: 6,
        py: 2,
        px: 2,
        textAlign: 'center',
        //backgroundColor: theme.palette.background.default, // same as your page
        borderTop: '1px solid #D3D3D3',   // subtle divider
      }}
    >
      <Typography variant="caption" color="text.secondary">
        © {new Date().getFullYear()} karanjadavid.com — All rights reserved.
      </Typography>
    </Box>
    </QueryClientProvider>
  );
}