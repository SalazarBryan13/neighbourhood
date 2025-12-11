import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Tienda = {
  id: string;
  nombre: string;
  categoria?: string;
  rating?: number;
  reviews?: number;
  tiempoEntrega?: string;
  distancia?: string;
  imagen_url?: string;
};




type NuevaTienda = Omit<Tienda, 'id' | 'created_at'>;
type TiendaUpdate = Partial<NuevaTienda>;

/**
 * Hook CRUD para la tabla `tiendas`
 * Ajusta nombres de columnas según tu esquema real.
 */
export function useTiendas() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(message);
  };

  const fetchTiendas = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: supaError } = await supabase
      .from('tienda')
      .select('*')

    if (supaError) {
      handleError('No se pudieron obtener las tiendas', supaError);
      setLoading(false);
      return;
    }

    setTiendas((data as Tienda[]) ?? []);
    setLoading(false);
  }, []);

  const fetchTiendaById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const { data, error: supaError } = await supabase
      .from('tiendas')
      .select('*')
      .eq('id', id)
      .single();

    if (supaError) {
      handleError('No se pudo obtener la tienda', supaError);
      setLoading(false);
      return null;
    }

    setLoading(false);
    return data as Tienda;
  }, []);

  const createTienda = useCallback(async (payload: NuevaTienda) => {
    setLoading(true);
    setError(null);
    const { data, error: supaError } = await supabase
      .from('tiendas')
      .insert(payload)
      .select()
      .single();

    if (supaError) {
      handleError('No se pudo crear la tienda', supaError);
      setLoading(false);
      return null;
    }

    const tienda = data as Tienda;
    setTiendas((prev) => [tienda, ...prev]);
    setLoading(false);
    return tienda;
  }, []);

  const updateTienda = useCallback(async (id: string, payload: TiendaUpdate) => {
    setLoading(true);
    setError(null);
    const { data, error: supaError } = await supabase
      .from('tiendas')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (supaError) {
      handleError('No se pudo actualizar la tienda', supaError);
      setLoading(false);
      return null;
    }

    const updated = data as Tienda;
    setTiendas((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setLoading(false);
    return updated;
  }, []);

  const deleteTienda = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const { error: supaError } = await supabase.from('tiendas').delete().eq('id', id);

    if (supaError) {
      handleError('No se pudo eliminar la tienda', supaError);
      setLoading(false);
      return false;
    }

    setTiendas((prev) => prev.filter((t) => t.id !== id));
    setLoading(false);
    return true;
  }, []);

  return {
    tiendas,
    loading,
    error,
    fetchTiendas,
    fetchTiendaById,
    createTienda,
    updateTienda,
    deleteTienda,
  };
}

