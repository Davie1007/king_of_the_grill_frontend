// Format helpers (e.g., formatCurrency)
export const formatCurrency = (v) => {
    if (v === null || v === undefined) return '-';
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(v);
  };
  