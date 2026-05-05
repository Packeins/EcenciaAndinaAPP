import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Client, Convenio } from '@/types';

// Fetchers
const fetchClientes = async (): Promise<Client[]> => {
  const response = await apiFetch('/clientes');
  if (!response.ok) {
    throw new Error('Error al obtener clientes');
  }
  return response.json();
};

const fetchConvenios = async (): Promise<Convenio[]> => {
  const response = await apiFetch('/convenios');
  if (!response.ok) {
    throw new Error('Error al obtener convenios');
  }
  return response.json();
};

// Custom Hook
export const useClientsAndConvenios = () => {
  const clientsQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: fetchClientes,
    staleTime: 1000 * 60 * 5, // 5 minutos de caché antes de considerar los datos obsoletos
  });

  const conveniosQuery = useQuery({
    queryKey: ['convenios'],
    queryFn: fetchConvenios,
    staleTime: 1000 * 60 * 5,
  });

  return {
    clientes: clientsQuery.data || [],
    convenios: conveniosQuery.data || [],
    isLoading: clientsQuery.isLoading || conveniosQuery.isLoading,
    isError: clientsQuery.isError || conveniosQuery.isError,
    error: clientsQuery.error || conveniosQuery.error,
    refetchClients: clientsQuery.refetch,
    refetchConvenios: conveniosQuery.refetch,
  };
};
