// src/components/dashboard/Modals/AddBranchModal.jsx
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
  import { useBranches } from '../../../hooks/useBranches';
  
  export default function AddBranchModal({ open, onClose }) {
    const { addBranch } = useBranches();
    const [form, setForm] = useState({ name: '', tillNumber: '', type: 'general' });
  
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
    const handleSubmit = () => {
      addBranch.mutate(form, { onSuccess: onClose });
    };
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Add Branch</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Branch Name" name="name" value={form.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Till Number" name="tillNumber" value={form.tillNumber} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Type" name="type" value={form.type} onChange={handleChange}>
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="butchery">Butchery</MenuItem>
                <MenuItem value="gas">Gas</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={addBranch.isLoading}>
            {addBranch.isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
  // Add branch modal
