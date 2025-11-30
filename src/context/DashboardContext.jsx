import React, { createContext, useState } from 'react';

export const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [section, setSection] = useState('Overview');
  const [branchId, setBranchId] = useState(null);
  const [savingsPct, setSavingsPct] = useState(0.2);
  const [period, setPeriod] = useState('daily');
  const [page, setPage] = useState(1);
  const [editingInventory, setEditingInventory] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [transferringEmployee, setTransferringEmployee] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [showHow, setShowHow] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  return (
    <DashboardContext.Provider
      value={{
        section,
        setSection,
        branchId,
        setBranchId,
        savingsPct,
        setSavingsPct,
        period,
        setPeriod,
        page,
        setPage,
        editingInventory,
        setEditingInventory,
        editingExpense,
        setEditingExpense,
        editingEmployee,
        setEditingEmployee,
        transferringEmployee,
        setTransferringEmployee,
        editingBranch,
        setEditingBranch,
        showHow,
        setShowHow,
        snack,
        setSnack,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};