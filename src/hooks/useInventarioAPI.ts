import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export type Inventario = {
  id_inventario: number;
  id_tienda: number;
  stock: number;
  descripcion?: string | null;
  fecha_actualizacion?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type InventarioCreate = {
  id_tienda: number;
  stock: number;
  descripcion?: string | null;
};

export type InventarioUpdate = {
  stock?: number | null;
  descripcion?: string | null;
};

/**
 * Hook para consumir los endpoints de FastAPI para gestión de inventario
 */
export function useInventarioAPI() {
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(err instanceof Error ? err.message : message);
  };

  /**
   * Obtener inventarios de una tienda específica
   * @param id_tienda - ID de la tienda para filtrar los inventarios
   */
  const fetchInventario = useCallback(async (id_tienda: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Obteniendo inventarios para tienda:', id_tienda);
      const data = await apiClient.get<Inventario[]>(`/inventarios/${id_tienda}`);
      console.log('✅ Inventarios obtenidos:', data?.length || 0, 'inventarios');
      setInventario(data || []);
    } catch (err) {
      console.error('❌ Error obteniendo inventarios:', err);
      handleError('No se pudieron obtener los inventarios', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear un nuevo item de inventario
   */
  const crearInventario = useCallback(async (payload: InventarioCreate) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📤 Creando inventario con payload:', payload);
      const data = await apiClient.post<Inventario>('/inventarios/', payload);
      console.log('✅ Inventario creado exitosamente:', data);
      setInventario((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('❌ Error al crear inventario:', err);
      handleError('No se pudo crear el item de inventario', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar un item de inventario existente
   */
  const actualizarInventario = useCallback(async (id_inventario: number, payload: InventarioUpdate) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`📝 Actualizando inventario ${id_inventario} con payload:`, payload);
      const data = await apiClient.put<Inventario>(`/inventarios/${id_inventario}`, payload);
      console.log('✅ Inventario actualizado exitosamente:', data);
      setInventario((prev) =>
        prev.map((i) => (i.id_inventario === id_inventario ? data : i))
      );
      return data;
    } catch (err) {
      console.error(`❌ Error al actualizar inventario ${id_inventario}:`, err);
      handleError('No se pudo actualizar el item de inventario', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar un item de inventario
   */
  const eliminarInventario = useCallback(async (id_inventario: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🗑️ Intentando eliminar inventario con id: ${id_inventario}`);
      await apiClient.delete(`/inventarios/${id_inventario}`);
      console.log(`✅ Inventario ${id_inventario} eliminado exitosamente`);
      setInventario((prev) => prev.filter((i) => i.id_inventario !== id_inventario));
      return true;
    } catch (err) {
      console.error(`❌ Error al eliminar inventario ${id_inventario}:`, err);
      handleError('No se pudo eliminar el item de inventario', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    inventario,
    loading,
    error,
    fetchInventario,
    crearInventario,
    actualizarInventario,
    eliminarInventario,
  };
}



