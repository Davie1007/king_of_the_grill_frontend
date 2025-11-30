// src/components/dashboard/Modals/AddExpenseModal.jsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    MenuItem,
  } from '@mui/material';
  import { useState } from 'react';
  import { useMutation, useQueryClient } from 'react-query';
  import { client } from '../../../services/apiClient';
  
  export default function AddExpenseModal({ open, onClose, branchId }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ title: '', category: '', amount: '', note: '' });
  
    const mutation = useMutation(
      async () => (await client.post(`/api/branches/${branchId}/expenses`, form)).data,
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['expenses', branchId]);
          onClose();
        },
      }
    );
  
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title" name="title" value={form.title} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Category" name="category" value={form.category} onChange={handleChange}>
                <MenuItem value="Utilities">Utilities</MenuItem>
                <MenuItem value="Wages">Wages</MenuItem>
                <MenuItem value="Supplies">Supplies</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="number" label="Amount (KES)" name="amount" value={form.amount} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Note" name="note" value={form.note} onChange={handleChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  // Add expense modal
