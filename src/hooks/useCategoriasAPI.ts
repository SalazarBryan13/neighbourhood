import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export type Categoria = {
  id_categoria: number;
  id_tienda: number;
  nombre: string;
  descripcion?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CategoriaCreate = {
  id_tienda: number;
  nombre: string;
  descripcion?: string | null;
};

export type CategoriaUpdate = {
  nombre?: string | null;
  descripcion?: string | null;
};

/**
 * Hook para consumir los endpoints de FastAPI para gestión de categorías
 */
export function useCategoriasAPI() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(err instanceof Error ? err.message : message);
  };

  /**
   * Obtener todas las categorías de una tienda específica
   * @param id_tienda - ID de la tienda para filtrar las categorías
   */
  const fetchCategorias = useCallback(async (id_tienda: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Obteniendo categorías para tienda:', id_tienda);
      const data = await apiClient.get<Categoria[]>(`/categorias/${id_tienda}`);
      console.log('✅ Categorías obtenidas:', data?.length || 0, 'categorías');
      setCategorias(data || []);
    } catch (err) {
      console.error('❌ Error obteniendo categorías:', err);
      handleError('No se pudieron obtener las categorías', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear una nueva categoría
   */
  const crearCategoria = useCallback(async (payload: CategoriaCreate) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📤 Creando categoría con payload:', payload);
      const data = await apiClient.post<Categoria>('/categorias/', payload);
      console.log('✅ Categoría creada exitosamente:', data);
      setCategorias((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('❌ Error al crear categoría:', err);
      handleError('No se pudo crear la categoría', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar una categoría existente
   */
  const actualizarCategoria = useCallback(async (id_categoria: number, payload: CategoriaUpdate) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`📝 Actualizando categoría ${id_categoria} con payload:`, payload);
      const data = await apiClient.put<Categoria>(`/categorias/${id_categoria}`, payload);
      console.log('✅ Categoría actualizada exitosamente:', data);
      setCategorias((prev) =>
        prev.map((c) => (c.id_categoria === id_categoria ? data : c))
      );
      return data;
    } catch (err) {
      console.error(`❌ Error al actualizar categoría ${id_categoria}:`, err);
      handleError('No se pudo actualizar la categoría', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar una categoría
   */
  const eliminarCategoria = useCallback(async (id_categoria: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🗑️ Intentando eliminar categoría con id: ${id_categoria}`);
      await apiClient.delete(`/categorias/${id_categoria}`);
      console.log(`✅ Categoría ${id_categoria} eliminada exitosamente`);
      setCategorias((prev) => prev.filter((c) => c.id_categoria !== id_categoria));
      return true;
    } catch (err) {
      console.error(`❌ Error al eliminar categoría ${id_categoria}:`, err);
      handleError('No se pudo eliminar la categoría', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categorias,
    loading,
    error,
    fetchCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  };
}

