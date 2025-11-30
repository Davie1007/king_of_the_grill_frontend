import React, { useContext } from 'react';
import { Card, Box, Typography, Button, Grid, Paper, Chip, Alert } from '@mui/material';
import { CardMedia } from '@mui/material';
import { Add, Edit, Delete, FileDownload } from '@mui/icons-material';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardContext } from '../../context/DashboardContext';
import { downloadCSV, formatCurrency } from '../../utils/formatters';
import useDashboardData from '../../hooks/useDashboardData';
import InventoryModal from './InventoryModal';
import { API_BASE_URL } from '../../utils/api';

function InventoryList({ branchId, inventory }) {
  const { period, setPeriod, setEditingInventory, setSnack } = useContext(DashboardContext);
  const { performance, inventoryLoading, deleteInventory, branches } = useDashboardData(branchId, period);
  const branch = branches.find((b) => b.id === branchId);
  const isGasBranch = branch?.type === 'gas';

  const lowStockItems = inventory.filter((it) => Number(it.stock) < 5);

  const periods = [...new Set((performance || []).map((p) => p.period))].sort();
  const products = [...new Set((performance || []).map((p) => p.product))];
  const performanceData = periods.map((period) => {
    const row = { period };
    products.forEach((product) => {
      const entry = (performance || []).find((p) => p.period === period && p.product === product);
      row[product] = entry ? entry.total : 0;
    });
    return row;
  });

  const openAddInventory = () => setEditingInventory({
    name: '',
    buying_price: '',
    price: '',
    price2: isGasBranch ? '' : null,
    price3: isGasBranch ? '' : null,
    stock: '',
    unit: '',
    isButchery: !isGasBranch,
    image: null,
  });

  const openEditInventory = (it) => setEditingInventory({
    id: it.id,
    name: it.name || '',
    price: it.price || '',
    price2: it.price2 || '',
    price3: it.price3 || '',
    stock: it.stock || '',
    unit: it.unit || '',
    isButchery: !!it.isButchery,
    image: it.image || null,
  });

  const confirmDeleteInventory = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await deleteInventory.mutateAsync(id);
    setSnack({ open: true, msg: 'Inventory item deleted successfully', severity: 'success' });
  };

  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
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
      {performance && performance.length > 0 && (
        <Paper sx={{ p: 2, mt: 3, mb: 8, borderRadius: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Product Performance ({period})
          </Typography>
          <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                {products.map((p, i) => (
                  <Line
                    key={p}
                    type="monotone"
                    dataKey={p}
                    stroke={`hsl(${(i * 60) % 360},70%,50%)`}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Inventory ({isGasBranch ? 'Gas' : 'Butchery'} Branch)</Typography>
        <Box>
          <Button
            startIcon={<FileDownload />}
            size="small"
            onClick={() =>
              downloadCSV(
                'inventory.csv',
                inventory.map((item) => ({
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
                }))
              )
            }
          >
            Export
          </Button>
          <Button startIcon={<Add />} size="small" onClick={openAddInventory}>
            Add Item
          </Button>
        </Box>
      </Box>
      <Typography variant="body2">{inventory.length} items</Typography>
      {lowStockItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          {lowStockItems.length} items low in stock:
          {lowStockItems.map((it) => (
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
                  {it.isButchery
                    ? `Price: ${formatCurrency(it.price)}`
                    : `Prices: ${formatCurrency(it.price)} / ${formatCurrency(it.price2)} / ${formatCurrency(it.price3)}`}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Buying price: {formatCurrency(it.buying_price)}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Per unit profit: {formatCurrency(it.price - it.buying_price)}
                </Typography>
                <Typography variant="caption" display="block">
                  Type: {it.isButchery ? 'Butchery' : 'Gas'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button size="small" startIcon={<Edit />} onClick={() => openEditInventory(it)}>
                    Edit
                  </Button>
                  <Button size="small" startIcon={<Delete />} onClick={() => confirmDeleteInventory(it.id)}>
                    Delete
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      <InventoryModal branchId={branchId} />
    </Card>
  );
}

export default InventoryList;