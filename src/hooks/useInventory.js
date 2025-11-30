import { useQuery } from 'react-query';
import { client } from '../services/apiClient';

export const useInventory = (branchId) => {
  return useQuery(['inventory', branchId], async () => {
    const res = await client.get(`/api/branches/${branchId}/inventory`);
    return res.data;
  }, { enabled: !!branchId });
};
// useInventory hook
