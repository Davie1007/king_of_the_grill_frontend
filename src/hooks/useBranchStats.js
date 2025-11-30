import { useQuery } from 'react-query';
import { client } from '../services/apiClient';

export const useBranchStats = (branchId, period = 'daily') => {
  return useQuery(['branchStats', branchId, period], async () => {
    const res = await client.get(`/api/branches/${branchId}/statistics?period=${period}`);
    return res.data;
  }, { enabled: !!branchId });
};
// useBranchStats hook
