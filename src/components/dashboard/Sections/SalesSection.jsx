// src/components/dashboard/Sections/SalesSection.jsx
import { Box, Grid, Card, Typography, Button, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import SalesChart from '../Charts/SalesChart';
import ItemDistributionChart from '../Charts/ItemDistributionChart';
import { downloadCSV } from '../../../services/csvExport';
import { formatCurrency } from '../../../services/formatters';

export default function SalesSection({ sales, salesDistribution, branchId, exportSales, refetchSales }) {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Sales (last 14 days)</Typography>
              <Box>
                <Button size="small" startIcon={<FileDownloadIcon />} onClick={exportSales}>Export</Button>
              </Box>
            </Box>
            <SalesChart data={sales} />
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2">Item distribution</Typography>
              <Button
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={() => downloadCSV('item-dist.csv', salesDistribution)}
              >
                CSV
              </Button>
            </Box>
            <ItemDistributionChart data={salesDistribution} />
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Sales</Typography>
              <Box>
                <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportSales}>Export</Button>
                <Button startIcon={<RefreshIcon />} size="small" onClick={refetchSales}>Refresh</Button>
              </Box>
            </Box>
            <Typography variant="body2">{sales.length} rows</Typography>
            <Box sx={{ mt: 2, maxHeight: 420, overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales.slice().reverse().map((s) => (
                    <TableRow key={s.id || Math.random()}>
                      <TableCell>{(s.timestamp || s.created_at || '').slice(0, 19)}</TableCell>
                      <TableCell>{s.item_purchased || s.item || '—'}</TableCell>
                      <TableCell>{s.quantity || s.qty || 1}</TableCell>
                      <TableCell>{formatCurrency(Number(s.total || 0))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
// Sales section
