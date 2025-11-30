import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DashboardContext } from '../../context/DashboardContext';
import useDashboardData from '../../hooks/useDashboardData';

function BranchModal() {
  const { editingBranch, setEditingBranch, setSnack } = useContext(DashboardContext);
  const { addBranch, editBranch } = useDashboardData();
  const [form, setForm] = useState({
    name: editingBranch?.name || '',
    location: editingBranch?.location || '',
    tillNumber: editingBranch?.tillNumber || '',
    type: editingBranch?.type || 'butchery',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingBranch?.id) {
        await editBranch.mutateAsync({ id: editingBranch.id, payload: form });
      } else {
        await addBranch.mutateAsync(form);
      }
      setEditingBranch(null);
      setSnack({ open: true, msg: editingBranch?.id ? 'Branch updated successfully' : 'Branch added successfully', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to save branch', severity: 'error' });
    }
  };

  return (
    <Dialog
      open={!!editingBranch}
      onClose={() => setEditingBranch(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{editingBranch?.id ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Till Number"
            name="tillNumber"
            value={form.tillNumber}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={form.type}
              onChange={handleChange}
              label="Type"
            >
              <MenuItem value="butchery">Butchery</MenuItem>
              <MenuItem value="gas">Gas</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditingBranch(null)}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.name || !form.location}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BranchModal;