import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
};

/**
 * Hook para obtener categorías de la tabla categoria
 */
export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(message);
  };

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: supaError } = await supabase
      .from('categoria')
      .select('*')
      .order('nombre', { ascending: true });

    if (supaError) {
      handleError('No se pudieron obtener las categorías', supaError);
      setLoading(false);
      return;
    }

    setCategorias((data as Categoria[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  return {
    categorias,
    loading,
    error,
    refetch: fetchCategorias,
  };
}

