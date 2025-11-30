import React from 'react';
import { List, ListItemButton, ListItemText, Box, Button } from '@mui/material';

export default function SidebarMenu({ section, setSection, onOpenReports }) {
  const sections = ['Overview','Sales','Inventory','Employees','Expenses','Payments','Branches'];
  return (
    <Box sx={{ position:'sticky', top:16 }}>
      <List>
        {sections.map(s => (
          <ListItemButton key={s} selected={section===s} onClick={()=>setSection(s)}>
            <ListItemText primary={s} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt:2 }}>
        <Button fullWidth variant="contained" onClick={onOpenReports}>Generate Reports</Button>
      </Box>
    </Box>
  );
}
