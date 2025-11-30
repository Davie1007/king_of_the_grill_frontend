// CSV export utility
export const downloadCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(',')]
      .concat(rows.map((r) => keys.map((k) => `"${String(r[k] ?? '')}"`).join(',')))
      .join('\n');
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  