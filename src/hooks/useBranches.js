import { useQuery, useMutation, useQueryClient } from 'react-query';
import { client } from '../services/apiClient';

export const useBranches = () => {
  const queryClient = useQueryClient();

  const branchesQuery = useQuery('branches', async () => {
    const res = await client.get('/api/branches');
    return res.data;
  });

  const addBranch = useMutation(
    async (payload) => (await client.post('/api/branches', payload)).data,
    { onSuccess: () => queryClient.invalidateQueries('branches') }
  );

  return { branchesQuery, addBranch };
};
// useBranches hook
