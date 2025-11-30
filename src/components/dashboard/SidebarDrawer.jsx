// Navigation drawer
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Button,
  } from '@mui/material';
  import {
    Star as StarIcon,
    TrendingUp as TrendingUpIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    Paid as PaidIcon,
    Payment as PaymentIcon,
    Store as StoreIcon,
    Refresh as RefreshIcon,
    FileDownload as FileDownloadIcon,
  } from '@mui/icons-material';
  
  /**
   * SidebarDrawer
   * Reusable navigation and control panel for Owner Dashboard.
   */
  export default function SidebarDrawer({
    open,
    onClose,
    section,
    setSection,
    branches,
    branchId,
    setBranchId,
    savingsPct,
    setSavingsPct,
    reloadAll,
    exportAll,
  }) {
    const sections = [
      { key: 'Overview', icon: <StarIcon /> },
      { key: 'Sales', icon: <TrendingUpIcon /> },
      { key: 'Inventory', icon: <InventoryIcon /> },
      { key: 'Employees', icon: <PeopleIcon /> },
      { key: 'Expenses', icon: <PaidIcon /> },
      { key: 'Payments', icon: <PaymentIcon /> },
      { key: 'Branches', icon: <StoreIcon /> },
    ];
  
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: 280, p: 2 } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* === Header === */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Owner Dashboard
          </Typography>
  
          {/* === Navigation === */}
          <List>
            {sections.map((item) => (
              <ListItemButton
                key={item.key}
                selected={section === item.key}
                onClick={() => {
                  setSection(item.key);
                  onClose();
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor: section === item.key ? 'primary.main' : 'transparent',
                  color: section === item.key ? '#fff' : 'inherit',
                  '&:hover': { bgcolor: 'primary.light', color: '#fff' },
                }}
              >
                <ListItemIcon sx={{ color: section === item.key ? '#fff' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.key} />
              </ListItemButton>
            ))}
          </List>
  
          <Divider sx={{ my: 1 }} />
  
          {/* === Branch Selector === */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Branch</InputLabel>
            <Select
              value={branchId || ''}
              label="Branch"
              onChange={(e) => setBranchId(e.target.value)}
            >
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
  
          {/* === Savings Percentage === */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Savings rule
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {[0.1, 0.15, 0.2, 0.25].map((p) => (
                <Chip
                  key={p}
                  label={`${Math.round(p * 100)}%`}
                  color={savingsPct === p ? 'primary' : 'default'}
                  size="small"
                  onClick={() => setSavingsPct(p)}
                />
              ))}
            </Box>
          </Box>
  
          <Divider sx={{ my: 1 }} />
  
          {/* === Actions === */}
          <Box sx={{ mt: 'auto' }}>
            <Button
              startIcon={<RefreshIcon />}
              fullWidth
              variant="outlined"
              onClick={reloadAll}
              sx={{ mb: 1, borderRadius: 2 }}
            >
              Refresh
            </Button>
  
            <Button
              startIcon={<FileDownloadIcon />}
              fullWidth
              variant="contained"
              onClick={exportAll}
              sx={{ borderRadius: 2 }}
            >
              Export CSVs
            </Button>
          </Box>
        </Box>
      </Drawer>
    );
  }
  