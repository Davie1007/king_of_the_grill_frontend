// src/components/InventoryGrid.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import { API_BASE_URL } from '../components/clientPOS';

const LOW_STOCK_THRESHOLD = 5;

/* ------------------------------------------------------------------ */
/*  WATER THEME DETECTION                                             */
/* ------------------------------------------------------------------ */
function useWaterTheme() {
  const [theme, setTheme] = useState('neutral');
  useEffect(() => {
    const check = () => {
      const hasColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--scene-color')
        .trim();
      setTheme(hasColor ? 'water' : 'neutral');
    };
    check();
    window.addEventListener('resize', check);
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => {
      window.removeEventListener('resize', check);
      observer.disconnect();
    };
  }, []);
  return theme;
}

/* ------------------------------------------------------------------ */
/*  CLICK + HOVER BUBBLE BURST                                        */
/* ------------------------------------------------------------------ */
function BubbleBurst({ x, y, keyId }) {
  const bubbles = useRef(
    Array.from({ length: 5 + Math.floor(Math.random() * 3) }, (_, i) => ({
      id: `${keyId}-${i}`,
      size: 4 + Math.random() * 6, // smaller bubbles
      speed: 0.6 + Math.random() * 1,
      maxLife: 1 + Math.random() * 1.2,
    }))
  ).current;

  return (
    <>
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          initial={{ x, y, scale: 0, opacity: 1 }}
          animate={{
            y: y - (40 + Math.random() * 60),
            x: x + (Math.random() - 0.5) * 30,
            scale: [0, 1, 0.5],
            opacity: [0.8, 0.5, 0],
          }}
          transition={{
            duration: b.maxLife,
            ease: 'easeOut',
          }}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 30%, #b4ecff, #61d0ff, transparent)',
            boxShadow: '0 0 6px rgba(120, 200, 255, 0.3)',
            zIndex: 9999,
            mixBlendMode: 'screen',
          }}
        />
      ))}
    </>
  );
}


function useBubbleBurst() {
  const [bursts, setBursts] = useState([]);

  const triggerBurst = (e) => {
    const id = Date.now();
    const x = e.clientX; // exact cursor X
    const y = e.clientY; // exact cursor Y

    setBursts((prev) => [...prev, { x, y, id }]);

    // Clean up after animation
    setTimeout(() => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, 2000);
  };

  const BurstElements = bursts.map((b) => <BubbleBurst key={b.id} {...b} />);
  return [triggerBurst, BurstElements];
}


/* ------------------------------------------------------------------ */
/*  PARALLAX EFFECT                                                   */
/* ------------------------------------------------------------------ */
function useParallax() {
  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 10;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      document.documentElement.style.setProperty('--parallax-x', `${x}px`);
      document.documentElement.style.setProperty('--parallax-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  STOCK CAPSULE COMPONENT                                           */
/* ------------------------------------------------------------------ */
const StockCapsule = ({ stock, unit, isLow, isOut }) => {
  let bg, glow;
  if (isOut) {
    bg = 'linear-gradient(90deg, #ff4d4d, #ff2b2b)';
    glow = '0 0 12px rgba(255, 80, 80, 0.6)';
  } else if (isLow) {
    bg = 'linear-gradient(90deg, #ffcc00, #ffaa00)';
    glow = '0 0 12px rgba(255, 220, 100, 0.5)';
  } else {
    bg = 'linear-gradient(90deg, #00d4ff, #00ffa3)';
    glow = '0 0 12px rgba(100, 255, 200, 0.4)';
  }

  return (
    <motion.div
      animate={{
        scale: isOut ? [1, 1.05, 1] : isLow ? [1, 1.03, 1] : 1,
      }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '20px',
        background: bg,
        boxShadow: glow,
        color: '#fff',
        fontSize: '0.8rem',
        fontWeight: 700,
      }}
    >
      {stock.toFixed(2)} {unit || ''}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  MAIN GRID COMPONENT                                               */
/* ------------------------------------------------------------------ */
const InventoryGrid = ({
  loading,
  filteredInventory,
  quickAddToCart,
  openAddToCartModal,
}) => {
  const theme = useWaterTheme();
  const [triggerBurst, BurstElements] = useBubbleBurst();
  useParallax();

  return (
    <>
      {theme === 'water' && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 30%, rgba(0,163,224,0.05), transparent 70%)',
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {BurstElements}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {loading && filteredInventory.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {[...filteredInventory]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((item) => {
                const isOutOfStock = item.stock <= 0;
                const isLowStock = item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD;
                const stockStatus = isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Available';

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ duration: 0.3 }}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          opacity: isOutOfStock ? 0.75 : 1,
                          transform: `translate(
                            calc(var(--parallax-x, 0px) * 0.3),
                            calc(var(--parallax-y, 0px) * 0.3)
                          )`,
                          border: '1px solid rgba(var(--scene-color-rgb, 0,163,224), 0.25)',
                          background:
                            theme === 'water'
                              ? 'linear-gradient(145deg, rgba(0,163,224,0.15), rgba(255,255,255,0.1))'
                              : 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(245,245,245,0.85))',
                          backdropFilter: 'blur(20px) saturate(180%)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.12), inset 0 0 12px rgba(0,163,224,0.12)',
                          transition: 'transform 0.4s ease, box-shadow 0.4s ease, background 0.5s ease',
                          '&:hover': {
                            boxShadow: '0 6px 36px rgba(0,163,224,0.35), inset 0 0 12px rgba(0,163,224,0.2)',
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="160"
                          image={
                            item.image
                              ? `${API_BASE_URL}/storage/${item.image}`
                              : '/placeholder.png'
                          }
                          alt={item.name}
                          sx={{
                            filter: isOutOfStock ? 'grayscale(100%)' : 'none',
                            opacity: isOutOfStock ? 0.6 : 1,
                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        />

                        <CardContent sx={{ pb: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              mb: 0.5,
                              color: theme === 'water' ? '#eaf6ff' : 'text.primary',
                              textShadow: theme === 'water'
                                ? '0 1px 4px rgba(0,0,0,0.3)'
                                : '0 1px 2px rgba(255,255,255,0.6)',
                            }}
                          >
                            {item.name}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <StockCapsule
                              stock={item.stock}
                              unit={item.unit}
                              isLow={isLowStock}
                              isOut={isOutOfStock}
                            />
                            <Chip
                              label={stockStatus}
                              size="small"
                              color={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}
                              variant="filled"
                              sx={{
                                fontSize: '0.7rem',
                                height: '20px',
                                fontWeight: 600,
                                boxShadow: isOutOfStock
                                  ? '0 0 8px rgba(255,100,100,0.5)'
                                  : isLowStock
                                  ? '0 0 8px rgba(255,200,100,0.5)'
                                  : '0 0 8px rgba(100,255,200,0.4)',
                              }}
                            />
                          </Box>

                          <Stack direction="row" spacing={1}>
                            {(() => {
                              // Detect branch type from the item or its parent props
                              const branchType = item.branch_type || item.branch?.type || ''; // adjust based on your data
                              const tiers =
                                branchType.toLowerCase() === 'drinks'
                                  ? ['price', 'price2'] // retail + wholesale only
                                  : ['price', 'price2', 'price3']; // fallback for others

                              return tiers.map((tier) => {
                                const label =
                                  tier === 'price'
                                    ? branchType.toLowerCase() === 'drinks'
                                      ? 'Retail'
                                      : 'Price 1'
                                    : tier === 'price2'
                                    ? branchType.toLowerCase() === 'drinks'
                                      ? 'Wholesale'
                                      : 'Price 2'
                                    : 'Price 3';

                                const price =
                                  tier === 'price2'
                                    ? item.price2
                                    : tier === 'price3'
                                    ? item.price3
                                    : item.price;

                                if (!price || Number(price) <= 0) return null;

                                return (
                                  <Tooltip key={tier} title={isOutOfStock ? 'Item is out of stock' : label} arrow>
                                    <span>
                                      <Button
                                        size="small"
                                        variant={isLowStock ? 'outlined' : 'contained'}
                                        disabled={isOutOfStock}
                                        onClick={(e) => {
                                          triggerBurst(e);
                                          quickAddToCart(item, tier);
                                        }}
                                        sx={{
                                          textTransform: 'none',
                                          borderRadius: 2,
                                          fontWeight: 600,
                                          px: 1.6,
                                          borderColor: isLowStock ? 'warning.main' : undefined,
                                          background:
                                            theme === 'water'
                                              ? 'linear-gradient(90deg, #009fe3, #00d4ff)'
                                              : undefined,
                                        }}
                                      >
                                        {label}: KES {new Intl.NumberFormat('en-US').format(price)}
                                      </Button>
                                    </span>
                                  </Tooltip>
                                );
                              });
                            })()}
                          </Stack>

                        </CardContent>

                        <CardActions sx={{ p: 2 }}>
                          <Tooltip title={isOutOfStock ? 'Item is out of stock' : ''} arrow>
                            <span>
                              <Button
                                startIcon={isOutOfStock ? <WarningIcon /> : <AddIcon />}
                                onClick={() => openAddToCartModal(item)}
                                fullWidth
                                disabled={isOutOfStock}
                                sx={{
                                  borderRadius: 2,
                                  fontWeight: 700,
                                  py: 1,
                                  borderColor: isLowStock ? 'warning.main' : undefined,
                                  variant: isLowStock ? 'outlined' : 'contained',
                                  background:
                                    theme === 'water'
                                      ? 'linear-gradient(90deg, #00b4ff, #0090ff)'
                                      : undefined,
                                }}
                              >
                                {isOutOfStock ? 'Out of Stock' : 'Add / Configure'}
                              </Button>
                            </span>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </motion.div>
                  </Grid>
                );
              })}
          </Grid>
        )}
      </motion.div>
    </>
  );
};

export default InventoryGrid;

