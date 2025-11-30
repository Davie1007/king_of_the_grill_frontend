import React, { useState, useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  CircularProgress,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { FileDownload as FileDownloadIcon, Search as SearchIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import fileDownload from 'js-file-download';

const API_BASE_URL = 'http://127.0.0.1:8000';
const client = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default function PaymentsTable({ branchId }) {
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [period, setPeriod] = useState('daily');
  const [page, setPage] = useState(1);

  const [filterType, setFilterType] = useState('date');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionId, setTransactionId] = useState('');

  // unified refetch
  const refetchAll = () => {
    queryClient.invalidateQueries(['payments', branchId]);
    queryClient.invalidateQueries(['payments-grouped', branchId]);
  };

  // reset all filters
  const resetFilters = () => {
    setPaymentMethod('');
    setPeriod('daily');
    setFilterType('date');
    setStartDate('');
    setEndDate('');
    setTransactionId('');
    setPage(1);
    refetchAll();
  };

  // payments list
  const { data, isLoading, isError } = useQuery(
    ['payments', branchId, paymentMethod, page, startDate, endDate, filterType, transactionId],
    () =>
      client
        .get(`/api/branches/${branchId}/payments`, {
          params: {
            page,
            payment_method: paymentMethod || undefined,
            transaction_id: transactionId || undefined,
            start: startDate || undefined,
            end: endDate || undefined,
            type: filterType || undefined,
          },
        })
        .then((res) => res.data),
    { keepPreviousData: true, enabled: !!branchId }
  );

  // grouped payments (for chart)
  const groupedQuery = useQuery(
    ['payments-grouped', branchId, period, startDate, endDate, filterType],
    () =>
      client
        .get(`/api/branches/${branchId}/payments/grouped`, {
          params: { period, start: startDate, end: endDate, type: filterType },
        })
        .then((res) => res.data),
    { enabled: !!branchId }
  );

  const chartData = useMemo(() => {
    const arr = Array.isArray(groupedQuery.data)
      ? groupedQuery.data
      : groupedQuery.data?.data ?? [];
    const grouped = {};
    arr.forEach((row) => {
      if (!grouped[row.period]) grouped[row.period] = { period: row.period };
      grouped[row.period][row.payment_method || 'Other'] = Number(row.total_amount);
    });
    return Object.values(grouped);
  }, [groupedQuery.data]);

  const payments = data?.payments?.data || [];
  const lastPage = data?.payments?.last_page || 1;

  // compute summary totals
  const totals = useMemo(() => {
    const sums = { Cash: 0, 'M-Pesa': 0, Card: 0, total: 0 };
    payments.forEach((p) => {
      const method = p.payment_method || 'Other';
      sums[method] = (sums[method] || 0) + Number(p.total);
      sums.total += Number(p.total);
    });
    return sums;
  }, [payments]);

  const downloadCSV = () => {
    if (!payments.length) return;
    const keys = Object.keys(payments[0]);
    const csv = [keys.join(',')]
      .concat(payments.map((p) => keys.map((k) => `"${String(p[k] ?? '')}"`).join(',')))
      .join('\n');
    fileDownload(csv, `payments_${Date.now()}.csv`);
  };

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (isError)
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Failed to load payments. Please try again.</Typography>
      </Box>
    );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: 'rgba(255,255,255,0.9)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Payments — {data?.branch_name || 'Branch'}
      </Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }} id='payments-section'>
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={paymentMethod}
            label="Payment Method"
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="M-Pesa">M-Pesa</MenuItem>
            <MenuItem value="Card">Card</MenuItem>
          </Select>
        </FormControl>

        {/* transaction_id search */}
        {paymentMethod === 'M-Pesa' && (
          <TextField
            size="small"
            label="Search Transaction ID"
            placeholder="e.g. QFT23H7XX"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            InputProps={{ endAdornment: <SearchIcon color="action" /> }}
          />
        )}

        <FormControl sx={{ minWidth: 140 }}>
          <InputLabel>Period</InputLabel>
          <Select value={period} label="Period" onChange={(e) => setPeriod(e.target.value)}>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Totals Summary */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          p: 2,
          background: '#f9f9f9',
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Typography>💵 Cash: {totals.Cash.toFixed(2)}</Typography>
        <Typography>📱 M-Pesa: {totals['M-Pesa'].toFixed(2)}</Typography>
        <Typography>💳 Card: {totals.Card.toFixed(2)}</Typography>
        <Divider orientation="vertical" flexItem />
        <Typography sx={{ fontWeight: 600 }}>Total: {totals.total.toFixed(2)}</Typography>
      </Box>

      {/* Chart */}
      <Box sx={{ width: '100%', height: 300, mb: 3 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Cash" stackId="a" fill="#4caf50" radius={[6, 6, 0, 0]} />
            <Bar dataKey="M-Pesa" stackId="a" fill="#2196f3" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Card" stackId="a" fill="#ff9800" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Customer</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Transaction ID</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id} hover>
              <TableCell>{p.customer_name}</TableCell>
              <TableCell>{p.customer_phone}</TableCell>
              <TableCell>{p.transaction_id || '-'}</TableCell>
              <TableCell>{p.payment_method}</TableCell>
              <TableCell>{p.total}</TableCell>
              <TableCell>{p.payment_status}</TableCell>
              <TableCell>{p.created_at}</TableCell>
            </TableRow>
          ))}
          {payments.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No payments found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={lastPage} page={page} onChange={(e, newPage) => setPage(newPage)} />
      </Box>
    </Paper>
  );
}
