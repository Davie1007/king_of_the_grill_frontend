import React, { useContext } from 'react';
import { Drawer, Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider, FormControl, InputLabel, Select, MenuItem, Button, Chip } from '@mui/material';
import { Star, TrendingUp, Inventory, People, Paid, Payment, Store, FileDownload, Refresh } from '@mui/icons-material';
import { DashboardContext } from '../../context/DashboardContext';
import { downloadCSV } from '../../utils/formatters';
import { useQueryClient } from 'react-query';

function NavigationDrawer({ section, setSection, branchId, setBranchId, branches, savingsPct, setSavingsPct }) {
  const queryClient = useQueryClient();
  const { setSnack, setShowHow } = useContext(DashboardContext);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const exportAll = () => {
    // Placeholder: Implement export logic for sales, inventory, expenses, employees, branches
    setSnack({ open: true, msg: 'Exported CSV files', severity: 'success' });
  };

  const reloadAll = () => {
    queryClient.invalidateQueries('branches');
    queryClient.invalidateQueries(['sales', branchId]);
    queryClient.invalidateQueries(['expenses', branchId]);
    queryClient.invalidateQueries(['inventory', branchId]);
    queryClient.invalidateQueries(['payments', branchId]);
    queryClient.invalidateQueries(['employees', branchId]);
    queryClient.invalidateQueries(['branchStats', branchId]);
    setSnack({ open: true, msg: 'Refreshing data', severity: 'info' });
  };

  const drawerContent = (
    <Box sx={{ width: 280, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 800 }}>
        Owner Dashboard
      </Typography>
      <List>
        {[
          { key: 'Overview', icon: <Star /> },
          { key: 'Sales', icon: <TrendingUp /> },
          { key: 'Inventory', icon: <Inventory /> },
          { key: 'Employees', icon: <People /> },
          { key: 'Expenses', icon: <Paid /> },
          { key: 'Payments', icon: <Payment /> },
          { key: 'Branches', icon: <Store /> },
        ].map((it) => (
          <ListItemButton key={it.key} selected={section === it.key} onClick={() => setSection(it.key)} sx={{ borderRadius: 1, mb: 1 }}>
            <ListItemIcon>{it.icon}</ListItemIcon>
            <ListItemText primary={it.key} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 1 }} />
      <FormControl fullWidth>
        <InputLabel>Branch</InputLabel>
        <Select value={branchId || ''} label="Branch" onChange={(e) => setBranchId(e.target.value)}>
          {branches.map((b) => (
            <MenuItem value={b.id} key={b.id}>{b.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption">Savings rule</Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          {[0.1, 0.15, 0.2, 0.25].map((p) => (
            <Chip key={p} label={`${Math.round(p * 100)}%`} color={savingsPct === p ? 'primary' : 'default'} onClick={() => setSavingsPct(p)} />
          ))}
        </Box>
        <Button variant="text" size="small" onClick={() => setShowHow(true)} sx={{ mt: 1 }}>
          How savings are calculated
        </Button>
      </Box>
      <Box sx={{ mt: 3 }}>
        <Button startIcon={<Refresh />} fullWidth onClick={reloadAll}>
          Refresh
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button startIcon={<FileDownload />} fullWidth onClick={exportAll}>
          Export CSVs
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      PaperProps={{
        sx: {
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(255,255,255,0.6)',
        },
      }}
      ModalProps={{
        BackdropProps: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(0px)',
          },
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export default NavigationDrawer;