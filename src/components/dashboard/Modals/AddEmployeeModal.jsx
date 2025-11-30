// src/components/dashboard/Modals/AddEmployeeModal.jsx
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
  import { useMutation, useQueryClient } from 'react-query';
  import { client } from '../../../services/apiClient';
  import { useState } from 'react';
  
  export default function AddEmployeeModal({ open, onClose, branchId }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: '', position: '', status: 'Active', salary: '' });
  
    const mutation = useMutation(
      async () => {
        const res = await client.post(`/api/branches/${branchId}/employees`, form);
        return res.data;
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['employees', branchId]);
          onClose();
        },
      }
    );
  
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Add Employee</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" name="name" value={form.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Position" name="position" value={form.position} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Salary (KES)" name="salary" type="number" value={form.salary} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Status" name="status" value={form.status} onChange={handleChange}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} variant="contained" disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  // Add employee modal
