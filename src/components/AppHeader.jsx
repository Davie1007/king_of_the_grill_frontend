// src/components/AppHeader.js
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  IconButton,
  Tooltip,
  Badge,
  Box,
  Button,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import { Contrast, ShoppingCart, CreditCard, Logout } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Mic, MicOff } from '@mui/icons-material';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import SearchModal from '../components/SearchModal';
import SearchIcon from '@mui/icons-material/Search';

const APP_HEADER_CONFIGS = {
    gas: {
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD3QJkCdMnxWKUvOvRoM3smAb7CJL-ICBOSg&s',
      title: 'Gas POS',
      primaryColor: '#c62828', // gas theme colour
    },
    butchery: {
      logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbvzOLz-ptkXHMQ7cJ0gDFU88o2Mo9uAcLV4qWQuNvcUpRmWUbYWEcTj8&s',
      title: 'Butchery POS',
      primaryColor: '#007AFF', // butchery theme colour
    },
    owner_dashboard: {
      logo: '/logos/owner.png',
      title: 'Owner Dashboard',
      primaryColor: '#000000', // owner theme colour
    },
  };


export default function AppHeader({
  isMobile,
  user,
  cartItemCount,
  isHighContrast,
  setIsHighContrast,
  setIsCartModalOpen,
  handleCreditModalOpen,
  logout,
  activeTab,
  setActiveTab,
  setRepayOpen,
  inventory,
  setModalQuantity={setModalQuantity},
  openAddToCartModal={openAddToCartModal},
  addToCart={addToCart},           
  openCheckout={openCheckout}
}) {

    const location = useLocation();
    const variant = location.pathname.includes('owner_dashboard') ? 'owner_dashboard' : 
                        location.pathname.includes('gas') ? 'gas' : 
                        location.pathname.includes('butchery') ? 'butchery' : 'butchery';
    const config = APP_HEADER_CONFIGS[variant] || APP_HEADER_CONFIGS.butchery;

    const [open, setOpen] = useState(false);
    
    const speak = (text) => {
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
        }
      };

      const handleVoiceCommand = (text) => {
        const lower = text.toLowerCase();
      
        // Checkout: Open cart modal/drawer
        if (lower.includes('checkout') || lower.includes('check out')) {
          openCheckout();
          speak('Opening checkout');
          return;
        }
      
        // Add: "add [qty] [item] [price/tier #]"
        const addMatch = lower.match(/add\s+(\d+(\.\d+)?)?\s*([\w\s]+?)(?:\s*(price|tier)\s*(\d))?$/i);
        if (addMatch) {
          const qty = parseFloat(addMatch[1] || 1);
          let itemName = addMatch[3].trim();
          let tier = 'price';
          const tierType = addMatch[4];
          const tierNum = addMatch[5];
          if (tierType && tierNum) {
            tier = `price${tierNum === '1' ? '' : tierNum}`;
          }
      
          const matchingItems = inventory.filter((it) =>
            it.name.toLowerCase().includes(itemName)
          );
      
          if (matchingItems.length > 1) {
            speak('Multiple items match, please be more specific');
          } else if (matchingItems.length === 1) {
            const item = matchingItems[0];
            if (variant === 'gas') {
              addToCart(item, tier, qty);
            } else {
              addToCart(item, qty);
            }
            speak(`Added ${qty} ${item.name} to cart`);
          } else {
            speak(`I couldn’t find ${itemName} in your inventory`);
          }
          return;
        }
      
        // Remove: "remove [qty or all] [item]"
        const removeMatch = lower.match(/remove\s+(all|\d+(\.\d+)?)?\s*([\w\s]+)/i);
        if (removeMatch) {
          const qtyStr = removeMatch[1] || '1';
          const qty = qtyStr === 'all' ? Infinity : parseFloat(qtyStr);
          const itemName = removeMatch[3].trim();
      
          const matchingItems = cart.filter((it) =>
            it.name.toLowerCase().includes(itemName)
          );
      
          if (matchingItems.length > 1) {
            speak('Multiple items match, please be more specific');
          } else if (matchingItems.length === 1) {
            const item = matchingItems[0];
            const id = item.cartId || item.id; // Gas uses cartId, Butchery uses id
            const currentQty = item.quantity;
            let newQty = qty === Infinity ? 0 : Math.max(0, currentQty - qty);
            updateCartQuantity(id, newQty);
            speak(`${qty === Infinity ? 'Removed all' : `Removed ${qty}`} ${item.name} from cart`);
          } else {
            speak(`I couldn’t find ${itemName} in your cart`);
          }
          return;
        }
      };
    
      const { listening, startListening, stopListening } = useVoiceCommands({
        onCommand: handleVoiceCommand,
        lang: 'en-KE',
        interimResults: false,
        autoRestart: true, // ✅ keeps listening across phrases
      });

  return (
    <>
      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'primary.main',
            color: 'white',
            height: 62,
            zIndex: 1000,
          }}
        >
          <BottomNavigationAction
            label="Cart"
            icon={
              <Badge badgeContent={cartItemCount} color="primary">
                <ShoppingCart />
              </Badge>
            }
            onClick={() => setIsCartModalOpen(true)}
            aria-label={`Open cart with ${cartItemCount} items`}
            sx={{
              color: 'white',
              '&.Mui-selected': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
              '& .MuiTouchRipple-root': {
                color: 'rgba(255,255,255,0.2)',
              },
            }}
          />
          <BottomNavigationAction
            label="Credit"
            icon={<CreditCard />}
            onClick={() => setRepayOpen(true)}
            aria-label="Open credit repayment"
            sx={{
              color: 'white',
              '&.Mui-selected': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
              '& .MuiTouchRipple-root': {
                color: 'rgba(255,255,255,0.2)',
              },
            }}
          />
          <BottomNavigationAction
            label="Logout"
            icon={<Logout />}
            onClick={logout}
            aria-label="Logout"
            sx={{
              color: 'white',
              '&.Mui-selected': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.08)',
              },
              '& .MuiTouchRipple-root': {
                color: 'rgba(255,255,255,0.2)',
              },
            }}
          />
        </BottomNavigation>
      )}

      {/* DESKTOP/TABLET APPBAR */}
      <AppBar position="static" color="primary">
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              py: 1,
              px: { xs: 1, sm: 2 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <motion.img
                  src={config.logo}
                  alt="Logo"
                  style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #ffffff' }}
                  whileHover={{ scale: 1.08 }}
                />
              </Box>
            </motion.div>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: '1rem', sm: '1.18rem' } }}>
              {config.title} - {user.branch?.name || 'No Branch'}
            </Typography>
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.14 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Tooltip title={isHighContrast ? 'Switch to standard theme' : 'Switch to high-contrast theme'}>
                  <IconButton
                    color="inherit"
                    onClick={() => setIsHighContrast(!isHighContrast)}
                    aria-label={isHighContrast ? 'Switch to standard theme' : 'Switch to high-contrast theme'}
                  >
                    <Contrast />
                  </IconButton>
                </Tooltip>

                <IconButton color="inherit" onClick={listening ? stopListening : startListening}>
                    {listening ? <MicOff /> : <Mic />}
                </IconButton>
                 <Button variant="inherit" onClick={() => setOpen(true)}>
                  <SearchIcon />
                </Button>

                <SearchModal
                  open={open}
                  onClose={() => setOpen(false)}
                  branchId={user.branch?.id}
                />

                {/* Show desktop buttons only */}
                {!isMobile && (
                  <>
                    <Tooltip title="Cart (Ctrl+C)">
                      <IconButton
                        color="inherit"
                        onClick={() => setIsCartModalOpen(true)}
                        sx={{ p: 1 }}
                        aria-label={`Open cart with ${cartItemCount} items`}
                      >
                        <Badge badgeContent={cartItemCount} color="primary">
                          <ShoppingCart />
                        </Badge>
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Credit Repayment">
                      <Button color="inherit" onClick={handleCreditModalOpen}>
                        <CreditCard />
                      </Button>
                    </Tooltip>

                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <motion.img
                        src={
                          user?.photo ||
                          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaEmzjpUf5XiWcRFKWeDt-Pxf4_cG77GIlsQ&s'
                        }
                        alt="User profile"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '50%',
                          border: '2px solid #ffffff',
                        }}
                        whileHover={{ scale: 1.08 }}
                      />
                    </Box>

                    <Tooltip title="Logout">
                      <IconButton color="inherit" onClick={logout} aria-label="Logout">
                        <Logout />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </motion.div>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}
