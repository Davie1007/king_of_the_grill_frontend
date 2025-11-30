import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { DashboardContext } from '../../context/DashboardContext';
import useDashboardData from '../../hooks/useDashboardData';

function TransferModal({ branchId }) {
  const { transferringEmployee, setTransferringEmployee, setSnack } = useContext(DashboardContext);
  const { branches, transferEmployee } = useDashboardData(branchId);
  const [newBranchId, setNewBranchId] = useState('');

  const handleSubmit = async () => {
    try {
      await transferEmployee.mutateAsync({ id: transferringEmployee.id, newBranchId });
      setTransferringEmployee(null);
      setNewBranchId('');
      setSnack({ open: true, msg: `Employee ${transferringEmployee.name} transferred successfully`, severity: 'success' });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to transfer employee', severity: 'error' });
    }
  };

  return (
    <Dialog
      open={!!transferringEmployee}
      onClose={() => {
        setTransferringEmployee(null);
        setNewBranchId('');
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle>Transfer Employee: {transferringEmployee?.name}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Select a new branch to transfer {transferringEmployee?.name} to.
        </Typography>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>New Branch</InputLabel>
          <Select
            value={newBranchId}
            onChange={(e) => setNewBranchId(e.target.value)}
            label="New Branch"
            required
          >
            {branches
              .filter((b) => b.id !== branchId)
              .map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name} ({b.location})
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setTransferringEmployee(null);
            setNewBranchId('');
          }}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!newBranchId}
          sx={{ borderRadius: 2 }}
        >
          Transfer
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TransferModal;