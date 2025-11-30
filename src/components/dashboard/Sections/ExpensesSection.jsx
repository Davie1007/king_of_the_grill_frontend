// src/components/dashboard/Sections/ExpensesSection.jsx
import { Box, Card, Grid, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import { downloadCSV } from '../../../services/csvExport';
import { formatCurrency } from '../../../services/formatters';

export default function ExpensesSection({ expenses, exportExpenses, openAddExpense }) {
  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Expenses</Typography>
        <Box>
          <Button startIcon={<FileDownloadIcon />} size="small" onClick={exportExpenses}>Export</Button>
          <Button startIcon={<AddIcon />} size="small" onClick={openAddExpense}>Add</Button>
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Note</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell>{ex.title}</TableCell>
                <TableCell>{ex.category}</TableCell>
                <TableCell>{formatCurrency(ex.amount)}</TableCell>
                <TableCell>{ex.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
// Expenses section
