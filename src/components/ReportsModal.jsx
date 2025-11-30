import React, { useState } from 'react';
import { Modal, Box, Typography, Button, MenuItem, Select, FormControl, InputLabel, TextField } from '@mui/material';
import generateReport from '../utils/reportGenerator';

export default function ReportsModal({ open, onClose }) {
  const [section, setSection] = useState('Sales');
  const [format, setFormat] = useState('xlsx');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateReport({ section, format, start, end });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', bgcolor:'#fff', p:3, width:480, borderRadius:2 }}>
        <Typography variant="h6">Generate Report</Typography>
        <FormControl fullWidth sx={{ mt:2 }}>
          <InputLabel>Section</InputLabel>
          <Select value={section} label="Section" onChange={(e)=>setSection(e.target.value)}>
            {['Overview','Sales','Inventory','Employees','Expenses','Payments','Branches'].map(s=><MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mt:2 }}>
          <InputLabel>Format</InputLabel>
          <Select value={format} label="Format" onChange={(e)=>setFormat(e.target.value)}>
            <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
            <MenuItem value="pdf">PDF</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display:'flex', gap:1, mt:2 }}>
          <TextField label="Start (YYYY-MM-DD)" value={start} onChange={(e)=>setStart(e.target.value)} fullWidth />
          <TextField label="End (YYYY-MM-DD)" value={end} onChange={(e)=>setEnd(e.target.value)} fullWidth />
        </Box>
        <Box sx={{ display:'flex', gap:1, mt:2, justifyContent:'flex-end' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerate} disabled={loading}>{loading? 'Generating...':'Generate'}</Button>
        </Box>
      </Box>
    </Modal>
  );
}
