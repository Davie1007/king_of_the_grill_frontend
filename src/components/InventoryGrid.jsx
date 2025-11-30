import React from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import { API_BASE_URL } from "../components/clientPOS";

const LOW_STOCK_THRESHOLD = 5;

const formatNumber = (num, decimals = 0) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);

// Animation Variants
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const InventoryGrid = ({
  loading,
  filteredInventory,
  quickAddToCart,
  openAddToCartModal,
}) => {
  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      style={{ width: "100%" }}
    >
      {loading && filteredInventory.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress color="info" />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {[...filteredInventory]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => {
              const isOutOfStock = item.stock <= 0;
              const isLowStock =
                item.stock > 0 && item.stock <= LOW_STOCK_THRESHOLD;
              const stockStatus = isOutOfStock
                ? "Out of Stock"
                : isLowStock
                ? "Low Stock"
                : null;
              const stockColor = isOutOfStock
                ? "#FF5252"
                : isLowStock
                ? "#FFB400"
                : "#40C4FF";

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <Card
                      sx={{
                        borderRadius: 2,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        backdropFilter: "blur(18px)",
                        background:
                          "linear-gradient(180deg, rgba(20,20,20,0.8) 0%, rgba(17,17,17,0.85) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        transition: "all 0.3s ease",
                        opacity: isOutOfStock ? 0.6 : 1,
                        "&:hover": {
                          boxShadow: `0 0 18px ${stockColor}40`,
                          borderColor: `${stockColor}80`,
                          transform: isOutOfStock ? "none" : "translateY(-4px)",
                        },
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="160"
                        image={
                          item.image
                            ? `${API_BASE_URL}/storage/${item.image}`
                            : "/placeholder.png"
                        }
                        alt={item.name}
                        sx={{
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          objectFit: "cover",
                          filter: isOutOfStock ? "grayscale(100%)" : "none",
                          opacity: isOutOfStock ? 0.6 : 1,
                        }}
                      />
                      <CardContent sx={{ flex: 1, px: 2.5, py: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 700,
                            color: "#FFFFFF",
                            mb: 0.5,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.name}
                        </Typography>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            Stock: {formatNumber(item.stock, 2)}{" "}
                            {item.unit ? item.unit : ""}
                          </Typography>
                          {stockStatus && (
                            <Chip
                              label={stockStatus}
                              size="small"
                              sx={{
                                fontSize: "0.7rem",
                                height: 20,
                                color: "#FFF",
                                backgroundColor: `${stockColor}30`,
                                border: `1px solid ${stockColor}70`,
                              }}
                            />
                          )}
                          {(isOutOfStock || isLowStock) && (
                            <WarningIcon
                              sx={{ fontSize: "1rem", color: stockColor }}
                            />
                          )}
                        </Stack>
                      </CardContent>

                      <CardActions
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                          px: 2,
                          pb: 2,
                          gap: 1,
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                          {[1, 2, 3].map((tier) => {
                            const priceKey = `price${tier === 1 ? "" : tier}`;
                            return (
                              <Tooltip
                                key={tier}
                                title={
                                  isOutOfStock ? "Item is out of stock" : ""
                                }
                                arrow
                              >
                                <span style={{ flex: 1 }}>
                                  <Button
                                    fullWidth
                                    size="small"
                                    variant="contained"
                                    disabled={isOutOfStock}
                                    onClick={() =>
                                      quickAddToCart(item, priceKey)
                                    }
                                    sx={{
                                      borderRadius: 999,
                                      textTransform: "none",
                                      fontWeight: 600,
                                      fontSize: "0.8rem",
                                      color: "#0A0A0A",
                                      background:
                                        "linear-gradient(90deg, #40C4FF, #0092C7)",
                                      "&:hover": {
                                        boxShadow:
                                          "0 0 12px rgba(64,196,255,0.5)",
                                        background:
                                          "linear-gradient(90deg, #6FE8FF, #00B8FF)",
                                      },
                                    }}
                                  >
                                    P{tier} KES{" "}
                                    {formatNumber(item[priceKey] || 0)}
                                  </Button>
                                </span>
                              </Tooltip>
                            );
                          })}
                        </Stack>

                        <Tooltip
                          title={
                            isOutOfStock
                              ? "Item is out of stock"
                              : "Configure item"
                          }
                          arrow
                        >
                          <span>
                            <Button
                              startIcon={
                                isOutOfStock ? <WarningIcon /> : <AddIcon />
                              }
                              onClick={() => openAddToCartModal(item)}
                              fullWidth
                              disabled={isOutOfStock}
                              sx={{
                                borderRadius: 999,
                                fontWeight: 700,
                                textTransform: "none",
                                backgroundColor: isOutOfStock
                                  ? "rgba(255,255,255,0.12)"
                                  : "rgba(64,196,255,0.15)",
                                color: isOutOfStock ? "#AAA" : "#40C4FF",
                                border: `1px solid ${
                                  isOutOfStock
                                    ? "rgba(255,255,255,0.15)"
                                    : "rgba(64,196,255,0.5)"
                                }`,
                                "&:hover": {
                                  backgroundColor: isOutOfStock
                                    ? "rgba(255,255,255,0.12)"
                                    : "rgba(64,196,255,0.25)",
                                },
                              }}
                            >
                              {isOutOfStock ? "Out of Stock" : "Add / Configure"}
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
  );
};

export default InventoryGrid;

