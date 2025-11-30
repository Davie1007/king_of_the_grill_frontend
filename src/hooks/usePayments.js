import { useQuery } from 'react-query';
import { client } from '../services/apiClient';

export const usePayments = (branchId, page = 1, paymentMethod = null) => {
  return useQuery(['payments', branchId, page, paymentMethod], async () => {
    const res = await client.get(`/api/branches/${branchId}/payments`, {
      params: { page, payment_method: paymentMethod || undefined }
    });
    return res.data;
  }, { enabled: !!branchId });
};
// usePayments hook
