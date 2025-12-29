import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';
import { Tienda } from './useTiendas';

export type TiendaCreate = {
  id_propietario: string;
  nombre_tienda: string;
  descripcion?: string;
  telefono?: string;
  direccion?: string;
  estado: string;
  imagen_url?: string;
};

export type TiendaUpdate = Partial<TiendaCreate>;

/**
 * Hook para consumir los endpoints de FastAPI para gestión de tiendas
 */
export function useTiendasAPI() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(err instanceof Error ? err.message : message);
  };

  /**
   * Obtener todas las tiendas del usuario autenticado
   */
  const fetchTiendas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Iniciando fetchTiendas...');
      const data = await apiClient.get<Tienda[]>('/tiendas/');
      console.log('✅ Tiendas obtenidas exitosamente:', data?.length || 0, 'tiendas');
      setTiendas(data || []);
    } catch (err) {
      console.error('❌ Error en fetchTiendas:', err);
      handleError('No se pudieron obtener las tiendas', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear una nueva tienda
   */
  const crearTienda = useCallback(async (payload: Omit<TiendaCreate, 'id_propietario'>) => {
    setLoading(true);
    setError(null);
    try {
      // Obtener el id_propietario del usuario autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      // Agregar id_propietario al payload
      const payloadCompleto: TiendaCreate = {
        ...payload,
        id_propietario: user.id,
      };

      const data = await apiClient.post<Tienda>('/tiendas/', payloadCompleto);
      setTiendas((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      handleError('No se pudo crear la tienda', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar una tienda existente
   */
  const actualizarTienda = useCallback(async (id_tienda: number, payload: TiendaUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.put<Tienda>(`/tiendas/${id_tienda}`, payload);
      setTiendas((prev) =>
        prev.map((t) => (t.id_tienda === id_tienda ? data : t))
      );
      return data;
    } catch (err) {
      handleError('No se pudo actualizar la tienda', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar una tienda
   */
  const eliminarTienda = useCallback(async (id_tienda: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🗑️ Intentando eliminar tienda con id: ${id_tienda}`);
      await apiClient.delete(`/tiendas/${id_tienda}`);
      console.log(`✅ Tienda ${id_tienda} eliminada exitosamente`);
      setTiendas((prev) => prev.filter((t) => t.id_tienda !== id_tienda));
      return true;
    } catch (err) {
      console.error(`❌ Error al eliminar tienda ${id_tienda}:`, err);
      handleError('No se pudo eliminar la tienda', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tiendas,
    loading,
    error,
    fetchTiendas,
    crearTienda,
    actualizarTienda,
    eliminarTienda,
  };
}

