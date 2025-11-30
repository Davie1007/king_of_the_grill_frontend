import React, { useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, RadioGroup, FormControlLabel,
  Radio, CircularProgress, Typography, Box, Divider, Table,
  TableBody, TableRow, TableCell, TableHead, Autocomplete, Paper
} from '@mui/material';
import { API_BASE_URL, clientPOS } from "../components/clientPOS";

export default function SearchModal({ open, onClose }) {
  const [searchType, setSearchType] = useState('transaction');
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const printRef = useRef();

  // === Auto-suggest ===
  const handleInputChange = async (e, value) => {
    setQuery(value);
    if (value.length < 2) return;

    try {
      const res = await clientPOS.get(`/api/search/suggestions`, {
        params: { q: value, type: searchType },
      });
      setOptions(res.data);
    } catch {
      setOptions([]);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await clientPOS.get(`/api/payments/search/${query}`);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'No matching record found.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const newWin = window.open('', '_blank');
    newWin.document.write(`
      <html>
        <head>
          <title>Payment & Sale Details</title>
          <style>
            body {
              font-family: "Roboto", sans-serif;
              margin: 24px;
              color: #333;
            }
            h1, h2 {
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            .section {
              margin-top: 20px;
            }
            .divider {
              height: 2px;
              background: #1976d2;
              margin: 16px 0;
            }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    newWin.document.close();
    newWin.print();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>🔍 Search Payment or Sale</DialogTitle>
      <DialogContent dividers>
        <FormControl component="fieldset" sx={{ mb: 2 }}>
          <RadioGroup
            row
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <FormControlLabel value="transaction" control={<Radio />} label="By M-Pesa Transaction ID" />
            <FormControlLabel value="sale" control={<Radio />} label="By Sale ID" />
          </RadioGroup>
        </FormControl>

        <Box display="flex" gap={2} mb={3}>
          <Autocomplete
            freeSolo
            options={options}
            value={query}
            onInputChange={handleInputChange}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={searchType === 'transaction' ? 'M-Pesa Transaction ID' : 'Sale ID'}
                variant="outlined"
                fullWidth
                sx={{
                  '& .MuiInputBase-root': { fontSize: '1.1rem', py: 1.2 },
                }}
              />
            )}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            sx={{ px: 4 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
          </Button>
        </Box>

        {error && <Typography color="error">{error}</Typography>}

        {result && (
          <Box ref={printRef} mt={3} component={Paper} sx={{ p: 3 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Payment & Sale Details
            </Typography>

            {result.payment && (
              <Box className="section">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Payment Details</Typography>
                <Divider className="divider" />
                <Table size="small">
                  <TableBody>
                    {Object.entries(result.payment).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 600 }}>{key}</TableCell>
                        <TableCell>{String(value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {result.sale && (
              <Box className="section">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Sale Details</Typography>
                <Divider className="divider" />
                <Table size="small">
                  <TableBody>
                    {Object.entries(result.sale).map(([key, value]) => {
                      if (key === 'sale_items' || key === 'saleItems') return null;
                      return (
                        <TableRow key={key}>
                          <TableCell sx={{ fontWeight: 600 }}>{key}</TableCell>
                          <TableCell>{String(value)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {result.sale.sale_items?.length > 0 || result.sale.saleItems?.length > 0 ? (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 600 }}>
                      Sale Items
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(result.sale.sale_items || result.sale.saleItems || []).map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{item.item_name || item.name || '-'}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : null}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {result && <Button onClick={handlePrint} variant="outlined">Print</Button>}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

