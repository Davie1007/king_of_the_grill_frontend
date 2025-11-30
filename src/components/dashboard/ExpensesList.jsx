import React, { useContext } from 'react';
import { Card, Box, Typography, Button, Grid, Table, TableHead, TableRow, TableCell, TableBody, Select, MenuItem, Pagination } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Add, Edit, Delete, FileDownload } from '@mui/icons-material';
import { DashboardContext } from '../../context/DashboardContext';
import { downloadCSV, formatCurrency } from '../../utils/formatters';
import useDashboardData from '../../hooks/useDashboardData';
import ExpenseModal from './ExpenseModal';

function ExpensesList({ branchId }) {
  const { period, setPeriod, page, setPage, setEditingExpense, setSnack } = useContext(DashboardContext);
  const { groupedQuery, expensesQuery, deleteExpense } = useDashboardData(branchId, period, null, page);

  const expensesChartData = groupedQuery.data || [];
  const expenses = expensesQuery.data?.data || [];
  const totalPages = expensesQuery.data?.last_page || 1;

  const openAddExpense = () => setEditingExpense({ title: '', amount: '', note: '' });

  const openEditExpense = (expense) => setEditingExpense({
    id: expense.id,
    title: expense.title || '',
    amount: expense.amount || '',
    note: expense.note || '',
  });

  const confirmDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await deleteExpense.mutateAsync(id);
    setSnack({ open: true, msg: 'Expense deleted successfully', severity: 'success' });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 3,
            background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(90deg,#4cafef,#1976d2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Expenses Summary
            </Typography>
            <Select
              size="small"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              sx={{
                minWidth: 120,
                fontWeight: 500,
                backgroundColor: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' },
              }}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </Box>
          <Box sx={{ mt: 2, width: '100%', height: 300, background: '#fff', borderRadius: 3, boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.05)', p: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesChartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: '#555' }} />
                <YAxis tick={{ fontSize: 12, fill: '#555' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
                {['Fuel', 'Salaries', 'Utilities', 'Rent', 'Repairs', 'Transport', 'Miscellaneous'].map((cat, idx) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={['#1976d2', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#009688', '#00bcd4'][idx % 7]}
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Expenses</Typography>
            <Box>
              <Button
                startIcon={<FileDownload />}
                size="small"
                onClick={() =>
                  downloadCSV(
                    'expenses.csv',
                    expenses.map((item) => ({
                      id: item.id,
                      title: item.title,
                      amount: item.amount,
                      note: item.note || 'N/A',
                      created_at: item.created_at,
                    }))
                  )
                }
              >
                Export
              </Button>
              <Button startIcon={<Add />} size="small" onClick={openAddExpense}>
                Add Expense
              </Button>
            </Box>
          </Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.note || 'N/A'}</TableCell>
                    <TableCell>{new Date(expense.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<Edit />} onClick={() => openEditExpense(expense)}>
                        Edit
                      </Button>
                      <Button size="small" startIcon={<Delete />} onClick={() => confirmDeleteExpense(expense.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No expenses found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Card>
      </Grid>
      <ExpenseModal />
    </Grid>
  );
}

export default ExpensesList;