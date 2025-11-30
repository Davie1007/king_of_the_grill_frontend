// src/components/dashboard/Sections/PaymentsSection.jsx
import { Box, Card, Typography, Table, TableHead, TableBody, TableCell, TableRow, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { downloadCSV } from '../../../services/csvExport';
import { formatCurrency } from '../../../services/formatters';

export default function PaymentsSection({ payments, exportPayments }) {
  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Payments</Typography>
        <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportPayments}>
          Export
        </Button>
      </Box>
      <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Reference</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{(p.created_at || '').slice(0, 19)}</TableCell>
                <TableCell>{p.payment_method}</TableCell>
                <TableCell>{formatCurrency(p.amount)}</TableCell>
                <TableCell>{p.reference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
// Payments section
