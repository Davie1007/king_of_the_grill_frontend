import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { DashboardContext } from '../../context/DashboardContext';
import useDashboardData from '../../hooks/useDashboardData';

function ExpenseModal({ branchId }) {
  const { editingExpense, setEditingExpense, setSnack } = useContext(DashboardContext);
  const { addExpense, editExpense } = useDashboardData(branchId);
  const [form, setForm] = useState({
    title: editingExpense?.title || '',
    amount: editingExpense?.amount || '',
    note: editingExpense?.note || '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingExpense?.id) {
        await editExpense.mutateAsync({ id: editingExpense.id, payload: form });
      } else {
        await addExpense.mutateAsync(form);
      }
      setEditingExpense(null);
      setSnack({ open: true, msg: editingExpense?.id ? 'Expense updated successfully' : 'Expense added successfully', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to save expense', severity: 'error' });
    }
  };

  return (
    <Dialog
      open={!!editingExpense}
      onClose={() => setEditingExpense(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{editingExpense?.id ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Note"
            name="note"
            value={form.note}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditingExpense(null)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!form.title || !form.amount}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ExpenseModal;