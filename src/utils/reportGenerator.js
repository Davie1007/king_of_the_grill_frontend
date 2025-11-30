import client from './api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export default async function generateReport({ section='Sales', format='xlsx', start, end, branchId=null }) {
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;
  if (branchId) params.branch_id = branchId;

  let url = `/api/branches/${branchId}/sales`;
  switch(section) {
    case 'Sales': url = `/api/branches/${branchId}/sales`; break;
    case 'Inventory': url = `/api/branches/${branchId}/inventory`; break;
    case 'Employees': url = `/api/branches/${branchId}/employees`; break;
    case 'Expenses': url = `/api/branches/${branchId}/expenses`; break;
    case 'Payments': url = `/api/branches/${branchId}/payments`; break;
    case 'Branches': url = `/api/branches`; break;
    default: url = `/api/branches/${branchId}/sales`;
  }

  const res = await client.get(url, { params }).then(r=>r.data).catch(e=>{ console.warn('Report fetch failed', e); return []; });
  const data = Array.isArray(res) ? res : (res.data || []);
  const summary = { generated_at: new Date().toISOString(), section, rows: Array.isArray(data)?data.length:0 };
  const filenameBase = `report-${section.toLowerCase()}-${new Date().toISOString().replace(/[:.]/g,'-')}`;

  if (format==='xlsx') {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([summary]), 'Summary');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data || []), section.substring(0,31));
    const wbout = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([wbout], { type:'application/octet-stream' }), `${filenameBase}.xlsx`);
    return;
  }

  const doc = new jsPDF({ unit:'pt', format:'a4' });
  doc.setFontSize(14); doc.text(`${section} Report`, 40, 40); doc.setFontSize(10); doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);
  doc.autoTable({ startY:80, head: data.length? [Object.keys(data[0]).slice(0,8)]: [['No data']], body: data.length? data.map(r=>Object.values(r).slice(0,8)) : [['-']], styles:{fontSize:8}, margin:{left:40,right:40} });
  doc.save(`${filenameBase}.pdf`);
}
