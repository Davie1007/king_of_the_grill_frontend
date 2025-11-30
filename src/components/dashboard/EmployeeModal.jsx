import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { DashboardContext } from '../../context/DashboardContext';
import useDashboardData from '../../hooks/useDashboardData';

function EmployeeModal({ branchId }) {
  const { editingEmployee, setEditingEmployee, setSnack } = useContext(DashboardContext);
  const { addEmployee, editEmployee } = useDashboardData(branchId);
  const [form, setForm] = useState({
    username: editingEmployee?.username || '',
    email: editingEmployee?.email || '',
    idNumber: editingEmployee?.idNumber || '',
    position: editingEmployee?.position || '',
    experience: editingEmployee?.experience || '',
    role: editingEmployee?.role || 'Employee',
    name: editingEmployee?.name || '',
    status: editingEmployee?.status || 'Active',
    photo: editingEmployee?.photo || null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      if (editingEmployee?.id) {
        await editEmployee.mutateAsync({ id: editingEmployee.id, payload: form });
      } else {
        await addEmployee.mutateAsync(form);
      }
      setEditingEmployee(null);
      setSnack({ open: true, msg: editingEmployee?.id ? 'Employee updated successfully' : 'Employee added successfully', severity: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to save employee', severity: 'error' });
    }
  };

  return (
    <Dialog
      open={!!editingEmployee}
      onClose={() => setEditingEmployee(null)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{editingEmployee?.id ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
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
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="ID Number"
            name="idNumber"
            value={form.idNumber}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Position"
            name="position"
            value={form.position}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Experience (years)"
            name="experience"
            type="number"
            value={form.experience}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={form.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="Employee">Employee</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={form.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="file"
            name="photo"
            onChange={handleFileChange}
            fullWidth
            inputProps={{ accept: 'image/*' }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditingEmployee(null)}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.name || !form.username || !form.position}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeModal;