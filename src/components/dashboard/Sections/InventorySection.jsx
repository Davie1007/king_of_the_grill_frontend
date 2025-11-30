// src/components/dashboard/Sections/InventorySection.jsx
import { Box, Grid, Card, Typography, Button, Paper, Alert, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { downloadCSV } from '../../../services/csvExport';
import { formatCurrency } from '../../../services/formatters';
import PerformanceChart from '../Charts/PerformanceChart';

export default function InventorySection({
  branchType,
  inventory,
  lowStockItems,
  performance,
  performanceData,
  products,
  period,
  setPeriod,
  openAddInventory,
  exportInventory,
}) {
  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <ToggleButtonGroup
        size="small"
        value={period}
        exclusive
        onChange={(e, v) => v && setPeriod(v)}
        sx={{ mb: 2, mt: 2 }}
      >
        <ToggleButton value="daily">Daily</ToggleButton>
        <ToggleButton value="weekly">Weekly</ToggleButton>
        <ToggleButton value="monthly">Monthly</ToggleButton>
        <ToggleButton value="yearly">Yearly</ToggleButton>
      </ToggleButtonGroup>

      {performance && performance.length > 0 && (
        <Paper sx={{ p: 2, mt: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Product Performance ({period})
          </Typography>
          <PerformanceChart data={performanceData} products={products} />
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Inventory ({branchType})</Typography>
        <Box>
          <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportInventory}>Export</Button>
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

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {inventory.map((it) => (
          <Grid item xs={12} sm={6} md={4} key={it.id}>
            <Paper elevation={6} sx={{ p: 2, borderRadius: 2 }}>
              {it.image && <img src={it.image} alt={it.name} width="100%" style={{ borderRadius: 6, marginBottom: 8 }} />}
              <Typography variant="subtitle1">{it.name}</Typography>
              <Typography variant="body2">Stock: {it.stock}</Typography>
              <Typography variant="body2">Price: {formatCurrency(it.price)}</Typography>
              <Typography variant="body2">Buy: {formatCurrency(it.buying_price)}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
// Inventory section
