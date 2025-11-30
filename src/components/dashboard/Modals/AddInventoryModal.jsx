// src/components/dashboard/Modals/AddInventoryModal.jsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
  } from '@mui/material';
  import { useState } from 'react';
  import { useMutation, useQueryClient } from 'react-query';
  import { client } from '../../../services/apiClient';
  
  export default function AddInventoryModal({ open, onClose, branchId }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
      name: '',
      stock: 0,
      price: 0,
      buying_price: 0,
    });
  
    const mutation = useMutation(
      async () => (await client.post(`/api/branches/${branchId}/inventory`, form)).data,
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['inventory', branchId]);
          onClose();
        },
      }
    );
  
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Add Inventory Item</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Stock" name="stock" value={form.stock} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Selling Price (KES)" name="price" value={form.price} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth type="number" label="Buying Price (KES)" name="buying_price" value={form.buying_price} onChange={handleChange} />
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
  // Add inventory modal
