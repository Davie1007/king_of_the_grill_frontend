import React, { useContext } from 'react';
import { Card, Box, Typography, Button } from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { downloadCSV } from '../../utils/formatters';
import { DashboardContext } from '../../context/DashboardContext';

const COLORS = [
  '#007AFF', '#5AC8FA', '#34C759', '#FF9500', '#FF2D55', '#8E8E93', '#5856D6', '#FFCC00',
  '#AF52DE', '#00C4B4', '#FF3B30', '#4CD964', '#FF9900', '#6610F2', '#00A8E8', '#F4F4F4',
  '#212121', '#E91E63', '#009688', '#FFC107', '#3F51B5', '#CDDC39', '#607D8B', '#9C27B0',
  '#FF5722', '#795548', '#2196F3', '#8BC34A', '#FFEB3B', '#673AB7', '#00BCD4', '#F44336',
  '#4CAF50', '#FF9800', '#E040FB', '#03A9F4', '#9E9E9E', '#D81B60', '#4DB6AC', '#FFCA28',
  '#0288D1', '#7CB342', '#FBC02D', '#AB47BC', '#26A69A', '#EF5350', '#29B6F6', '#EC407A',
  '#66BB6A', '#FFA726', '#5C6BC0',
];

function ItemDistributionChart({ salesDistribution }) {
  const { setSnack } = useContext(DashboardContext);

  const handleExport = () => {
    downloadCSV('item-dist.csv', salesDistribution);
    setSnack({ open: true, msg: 'Item distribution exported to CSV', severity: 'success' });
  };

  return (
    <Card elevation={8} sx={{ borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2">Item Distribution</Typography>
        <Button size="small" onClick={handleExport} startIcon={<FileDownload />}>
          CSV
        </Button>
      </Box>
      <Box sx={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey="value" data={salesDistribution} cx="50%" cy="50%" outerRadius={70} label>
              {salesDistribution.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} units`} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ mt: 1 }}>
        {salesDistribution.slice(0, 6).map((d) => (
          <Box key={d.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">{d.name}</Typography>
            <Typography variant="body2">{d.value}</Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

export default ItemDistributionChart;