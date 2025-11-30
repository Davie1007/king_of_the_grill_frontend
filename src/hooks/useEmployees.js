import { useQuery } from 'react-query';
import { client } from '../services/apiClient';

export const useEmployees = (branchId) => {
  return useQuery(['employees', branchId], async () => {
    const res = await client.get(`/api/branches/${branchId}/employees`);
    return res.data;
  }, { enabled: !!branchId });
};
// useEmployees hook
