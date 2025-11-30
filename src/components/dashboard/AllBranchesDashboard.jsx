import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Paper,
} from '@mui/material';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import confetti from 'canvas-confetti';
import { API_BASE_URL, clientPOS } from "../../components/clientPOS";

// Axios setup
const client = axios.create({ baseURL: `${API_BASE_URL}/api`, withCredentials: true });
client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Tooltip
const CustomTooltip = React.memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, e) => sum + (Number(e.value) || 0), 0);
    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: 8,
        padding: 10
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        {payload.map((e, i) => (
          <p key={i} style={{ margin: 0, color: e.stroke || e.fill }}>
            {`${e.name}: ${Number(e.value).toFixed(2)}`}
          </p>
        ))}
        <p style={{ margin: 0, fontWeight: 'bold' }}>Total: {total.toFixed(2)}</p>
      </div>
    );
  }
  return null;
});

// 🎨 Color Palette
const colorPalette = [
  '#1976d2', '#9c27b0', '#ff9800', '#4caf50', '#009688',
  '#e91e63', '#673ab7', '#3f51b5', '#2196f3', '#00bcd4',
  '#8bc34a', '#ffc107', '#ff5722', '#795548', '#607d8b'
];
const getColor = (i) => colorPalette[i % colorPalette.length];

export default function AllBranchesDashboard() {
  const [period, setPeriod] = useState('daily');

  // 🎉 Confetti once when component mounts
  useEffect(() => {
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  }, []);

  // Queries
  const salesQ = useQuery(['sales', period], () => client.get('analytics/sales/grouped', { params: { period } }).then(r => r.data));
  const productsQ = useQuery(['products', period], () => client.get('analytics/products/distribution', { params: { period } }).then(r => r.data));
  const paymentsQ = useQuery(['payments', period], () => client.get('analytics/payments/grouped/all', { params: { period } }).then(r => r.data));
  const turnoverQ = useQuery(['turnover', period], () => client.get('analytics/stock/turnover', { params: { period } }).then(r => r.data));
  const customersQ = useQuery(['customers', period], () => client.get('analytics/customers/new-returning', { params: { period } }).then(r => r.data));
  const financialsQ = useQuery(['financials', period], () => client.get('analytics/financials/revenue-expense-profit', { params: { period } }).then(r => r.data));

  // Process Data
  const branchList = useMemo(() => {
    const names = new Set();
    [salesQ.data, productsQ.data, paymentsQ.data, turnoverQ.data].forEach(arr => arr?.forEach(r => names.add(r.branch)));
    return Array.from(names);
  }, [salesQ.data, productsQ.data, paymentsQ.data, turnoverQ.data]);

  const makeGroupedData = (data, key, subKey, valueKey) => {
    const grouped = {};
    (data || []).forEach(r => {
      const id = r[key];
      if (!grouped[id]) grouped[id] = { [key]: id };
      grouped[id][r[subKey]] = (grouped[id][r[subKey]] || 0) + Number(r[valueKey]);
    });
    return Object.values(grouped);
  };

  const salesData = useMemo(() => makeGroupedData(salesQ.data, 'period', 'branch', 'total'), [salesQ.data]);
  const productData = useMemo(() => makeGroupedData(productsQ.data, 'product', 'branch', 'value'), [productsQ.data]);
  const paymentsData = useMemo(() => makeGroupedData(paymentsQ.data, 'branch', 'payment_method', 'total_amount'), [paymentsQ.data]);
  const turnoverData = useMemo(() => makeGroupedData(turnoverQ.data, 'branch', 'item', 'turnover_rate'), [turnoverQ.data]);
  const customersData = useMemo(() => customersQ.data || [], [customersQ.data]);
  const financialsData = useMemo(() => financialsQ.data || [], [financialsQ.data]);

  const ChartContainer = React.memo(({ title, children }) => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>{title}</Typography>
      <Box sx={{ width: '100%', height: 300 }}>{children}</Box>
    </Paper>
  ));

  // Memoize gradient defs for stability
  const GradientDefs = React.memo(({ ids }) => (
    <defs>
      {ids.map((id, i) => (
        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={getColor(i)} stopOpacity={0.8} />
          <stop offset="95%" stopColor={getColor(i)} stopOpacity={0.1} />
        </linearGradient>
      ))}
    </defs>
  ));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>All Branches Dashboard</Typography>
        <ToggleButtonGroup size="small" value={period} exclusive onChange={(e, v) => v && setPeriod(v)}>
          {['daily', 'weekly', 'monthly', 'yearly'].map(v => (
            <ToggleButton key={v} value={v}>{v}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* SALES */}
      {salesData.length > 0 && (
        <ChartContainer title="Sales Trend by Branch">
          <ResponsiveContainer>
            <BarChart data={salesData}>
              <GradientDefs ids={branchList.map((_, i) => `gradSales${i}`)} />
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {branchList.map((b, i) => (
                <Bar key={b} dataKey={b} fill={`url(#gradSales${i})`} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* PRODUCTS */}
      {productData.length > 0 && (
        <ChartContainer title="Product Distribution by Branch">
          <ResponsiveContainer>
            <BarChart data={productData}>
              <GradientDefs ids={branchList.map((_, i) => `gradProd${i}`)} />
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {branchList.map((b, i) => (
                <Bar key={b} dataKey={b} fill={`url(#gradProd${i})`} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* PAYMENTS */}
      {paymentsData.length > 0 && (
        <ChartContainer title="Payments by Method per Branch">
          <ResponsiveContainer>
            <BarChart data={paymentsData}>
              {(() => {
                const keys = Object.keys(paymentsData[0] || {}).filter(k => k !== 'branch');
                return (
                  <>
                    <GradientDefs ids={keys.map((_, i) => `gradPay${i}`)} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branch" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {keys.map((k, i) => (
                      <Bar key={k} dataKey={k} fill={`url(#gradPay${i})`} />
                    ))}
                  </>
                );
              })()}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* TURNOVER */}
      {turnoverData.length > 0 && (
        <ChartContainer title="Stock Turnover per Branch">
          <ResponsiveContainer>
            <BarChart data={turnoverData}>
              {(() => {
                const keys = Object.keys(turnoverData[0] || {}).filter(k => k !== 'branch');
                return (
                  <>
                    <GradientDefs ids={keys.map((_, i) => `gradTurn${i}`)} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branch" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {keys.map((k, i) => (
                      <Bar key={k} dataKey={k} fill={`url(#gradTurn${i})`} />
                    ))}
                  </>
                );
              })()}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {customersData.length > 0 && (
        <ChartContainer title="New vs Returning Customers">
          <ResponsiveContainer>
            <AreaChart data={customersData}>
              <defs>
                <linearGradient id="gradNewCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRetCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#9c27b0" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {/* Smooth curves with gradient fill */}
              <Area
                type="monotone"
                dataKey="new_customers"
                stroke="#1976d2"
                strokeWidth={2}
                fill="url(#gradNewCust)"
                activeDot={{ r: 5 }}
              />
              <Area
                type="monotone"
                dataKey="returning_customers"
                stroke="#9c27b0"
                strokeWidth={2}
                fill="url(#gradRetCust)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}



      {/* FINANCIALS */}
      {financialsData.length > 0 && (
        <ChartContainer title="Revenue, Expense & Profit (Curved Gradient)">
          <ResponsiveContainer>
            <AreaChart data={financialsData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f44336" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4caf50" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#1976d2" fill="url(#revGrad)" strokeWidth={2}/>
              <Area type="monotone" dataKey="expense" stroke="#f44336" fill="url(#expGrad)" strokeWidth={2}/>
              <Area type="monotone" dataKey="profit" stroke="#4caf50" fill="url(#profitGrad)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </Box>
  );
}
