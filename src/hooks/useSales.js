import { useQuery } from 'react-query';
import { client } from '../services/apiClient';

export const useSales = (branchId) => {
  return useQuery(['sales', branchId], async () => {
    const res = await client.get(`/api/branches/${branchId}/sales`);
    return res.data;
  }, { enabled: !!branchId });
};
// useSales hook
