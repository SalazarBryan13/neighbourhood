import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export type Categoria = {
  id_categoria: number;
  id_tienda: number;
  nombre: string;
  descripcion?: string;
};

/**
 * Hook para obtener categorías de una tienda específica
 * @param tiendaId - ID de la tienda para obtener sus categorías (requerido)
 */
export function useCategorias(tiendaId?: number) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(err instanceof Error ? err.message : message);
  };

  const fetchCategorias = useCallback(async () => {
    if (!tiendaId) {
      console.warn('⚠️ No se proporcionó tiendaId, no se pueden obtener categorías');
      setCategorias([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Obteniendo categorías para tienda:', tiendaId);
      // Usar el endpoint de la API que filtra por tienda
      const data = await apiClient.get<Categoria[]>(`/categorias/${tiendaId}`);
      console.log('✅ Categorías obtenidas:', data?.length || 0, 'categorías');
      setCategorias((data || []).sort((a, b) => a.nombre.localeCompare(b.nombre)));
    } catch (err) {
      console.error('❌ Error obteniendo categorías:', err);
      handleError('No se pudieron obtener las categorías', err);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  }, [tiendaId]);

  return {
    categorias,
    loading,
    error,
    refetch: fetchCategorias,
  };
}









