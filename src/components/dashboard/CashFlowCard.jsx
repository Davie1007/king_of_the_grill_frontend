import React from 'react';
import { Paper, Typography, LinearProgress, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

function CashFlowCard({ savings, totalSales, savingsPct }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
      <Paper elevation={6} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2">Savings Goal</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {formatCurrency(savings)}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={Math.min(100, (savings / Math.max(1, totalSales)) * 100)} />
        </Box>
        <Typography variant="caption">Goal: {Math.round(savingsPct * 100)}% of gross profit</Typography>
      </Paper>
    </motion.div>
  );
}

export default CashFlowCard;