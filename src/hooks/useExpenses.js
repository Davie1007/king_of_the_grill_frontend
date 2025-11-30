import { useQuery } from 'react-query';
import { client } from '../services/apiClient';

export const useExpenses = (branchId, page = 1) => {
  return useQuery(['expenses', branchId, page], async () => {
    const res = await client.get(`/api/branches/${branchId}/expenses?page=${page}`);
    return res.data;
  }, { enabled: !!branchId });
};
// useExpenses hook
