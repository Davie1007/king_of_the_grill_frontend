import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { DashboardContext } from '../../context/DashboardContext';
import useDashboardData from '../../hooks/useDashboardData';

function InventoryModal({ branchId }) {
  const { editingInventory, setEditingInventory, setSnack } = useContext(DashboardContext);
  const { addInventory, editInventory, branches } = useDashboardData(branchId);
  const branch = branches.find((b) => b.id === branchId);
  const isGasBranch = branch?.type === 'gas';

  const [form, setForm] = useState({
    name: editingInventory?.name || '',
    buying_price: editingInventory?.buying_price || '',
    price: editingInventory?.price || '',
    price2: isGasBranch ? '' : editingInventory?.price2 || '',
    price3: isGasBranch ? '' : editingInventory?.price3 || '',
    stock: editingInventory?.stock || '',
    unit: editingInventory?.unit || '',
    isButchery: editingInventory?.isButchery !== undefined ? editingInventory.isButchery : !isGasBranch,
    image: editingInventory?.image || null,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (editingInventory?.id) {
        await editInventory.mutateAsync({ id: editingInventory.id, payload });
      } else {
        await addInventory.mutateAsync(payload);
      }
      setEditingInventory(null);
      setSnack({
        open: true,
        msg: editingInventory?.id ? 'Inventory item updated successfully' : 'Inventory item added successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to save inventory item', severity: 'error' });
    }
  };

  return (
    <Dialog
      open={!!editingInventory}
      onClose={() => setEditingInventory(null)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle>{editingInventory?.id ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
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
            label="Buying Price (KES)"
            name="buying_price"
            type="number"
            value={form.buying_price}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Selling Price (KES)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
            required
          />
          {!form.isButchery && (
            <>
              <TextField
                label="Price 2 (KES)"
                name="price2"
                type="number"
                value={form.price2}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Price 3 (KES)"
                name="price3"
                type="number"
                value={form.price3}
                onChange={handleChange}
                fullWidth
              />
            </>
          )}
          <TextField
            label="Stock"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              label="Unit"
              required
            >
              <MenuItem value="kg">kg</MenuItem>
              <MenuItem value="units">units</MenuItem>
              <MenuItem value="litres">litres</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Checkbox
                name="isButchery"
                checked={form.isButchery}
                onChange={handleChange}
                disabled={isGasBranch}
              />
            }
            label="Butchery Item"
          />
          <TextField
            type="file"
            name="image"
            onChange={handleFileChange}
            fullWidth
            inputProps={{ accept: 'image/*' }}
            helperText={form.image && !(form.image instanceof File) ? 'Current image: ' + form.image : 'Upload new image'}
          />
          {isGasBranch && (
            <Typography variant="caption" color="text.secondary">
              Note: Gas branches only support single price tier.
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditingInventory(null)} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!form.name || !form.buying_price || !form.price || !form.stock || !form.unit}
          sx={{ borderRadius: 2 }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default InventoryModal;