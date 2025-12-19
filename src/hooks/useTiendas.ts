import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// Estructura real de la tabla `tienda` en Supabase
export type Tienda = {
  id_tienda: number;
  id_propietario: number;
  nombre_tienda: string;
  descripcion?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  estado: string;
  imagen_url?: string | null;
  // Campos opcionales solo para UI (no están en la tabla):
  tiempoEntrega?: string;
  distancia?: string;
  rating?: number;
  reviews?: number;
};

type NuevaTienda = Omit<Tienda, 'id_tienda'>;
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
      .select(
        'id_tienda, id_propietario, nombre_tienda, descripcion, telefono, direccion, estado, imagen_url'
      )
      .order('nombre_tienda', { ascending: true });

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
      .from('tienda')
      .select(
        'id_tienda, id_propietario, nombre_tienda, descripcion, telefono, direccion, estado, imagen_url'
      )
      .eq('id_tienda', id)
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
      .from('tienda')
      .insert(payload)
      .select(
        'id_tienda, id_propietario, nombre_tienda, descripcion, telefono, direccion, estado, imagen_url'
      )
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
      .from('tienda')
      .update(payload)
      .eq('id_tienda', id)
      .select(
        'id_tienda, id_propietario, nombre_tienda, descripcion, telefono, direccion, estado, imagen_url'
      )
      .single();

    if (supaError) {
      handleError('No se pudo actualizar la tienda', supaError);
      setLoading(false);
      return null;
    }

    const updated = data as Tienda;
    setTiendas((prev) =>
      prev.map((t) => (t.id_tienda === Number(id) ? updated : t))
    );
    setLoading(false);
    return updated;
  }, []);

  const deleteTienda = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const { error: supaError } = await supabase.from('tienda').delete().eq('id_tienda', id);

    if (supaError) {
      handleError('No se pudo eliminar la tienda', supaError);
      setLoading(false);
      return false;
    }

    setTiendas((prev) => prev.filter((t) => t.id_tienda !== Number(id)));
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

