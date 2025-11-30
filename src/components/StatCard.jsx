import React from 'react';
import { Card, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, subtitle }) {
  return (
    <motion.div whileHover={{ y:-4 }} style={{ minWidth:180 }}>
      <Card sx={{ p:2, borderRadius:2 }}>
        <Box>
          <Typography variant="caption">{title}</Typography>
          <Typography variant="h6" sx={{ fontWeight:700 }}>{value}</Typography>
          {subtitle && <Typography variant="caption">{subtitle}</Typography>}
        </Box>
      </Card>
    </motion.div>
  );
}
