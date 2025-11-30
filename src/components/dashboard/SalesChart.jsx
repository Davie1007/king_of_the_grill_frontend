import React, { useContext } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Card } from '@mui/material';
import { TrendingUp, Refresh, FileDownload } from '@mui/icons-material';
import { DashboardContext } from '../../context/DashboardContext';
import useDashboardData from '../../hooks/useDashboardData';
import { downloadCSV, formatCurrency } from '../../utils/formatters';
import { useQueryClient } from 'react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function SalesChart({ branchId }) {
  const { period, setPeriod, setSnack } = useContext(DashboardContext);
  const { sales, salesLoading, branches, salesError } = useDashboardData(branchId, period);
  const queryClient = useQueryClient();

  const branch = branches.find((b) => b.id === branchId);
  const branchName = branch ? branch.name : 'All Branches';

  const handleRefresh = () => {
    queryClient.invalidateQueries(['sales', branchId]);
    setSnack({ open: true, msg: 'Sales data refreshed', severity: 'info' });
  };

  const handleExport = () => {
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      setSnack({ open: true, msg: 'No sales data available to export', severity: 'warning' });
      return;
    }
    downloadCSV(
      `sales_${branchName}_${period}.csv`,
      sales.map((sale) => ({
        date: sale.date,
        amount: formatCurrency(sale.amount),
      }))
    );
    setSnack({ open: true, msg: 'Sales exported to CSV', severity: 'success' });
  };

  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp sx={{ color: '#1976d2' }} />
          <Typography variant="h6">Sales - {branchName}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              label="Period"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <Button startIcon={<Refresh />} onClick={handleRefresh}>
            Refresh
          </Button>
          <Button startIcon={<FileDownload />} onClick={handleExport}>
            Export
          </Button>
        </Box>
      </Box>
      {salesLoading ? (
        <Typography variant="body2">Loading sales data...</Typography>
      ) : salesError ? (
        <Typography variant="body2" color="error">
          Error loading sales data: {salesError.message || 'Unknown error'}
        </Typography>
      ) : sales && Array.isArray(sales) && sales.length > 0 ? (
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={sales}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) => `KES ${value.toFixed(0)}`}
              />
              <Tooltip
                formatter={(value) => `KES ${value.toFixed(2)}`}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                name="Sales (KES)"
                stroke="#1976d2"
                fill="rgba(25, 118, 210, 0.2)"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Typography variant="body2">No sales data available</Typography>
      )}
    </Card>
  );
}

export default SalesChart;