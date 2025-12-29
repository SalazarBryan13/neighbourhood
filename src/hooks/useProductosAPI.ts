import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export type Producto = {
  id_producto: number;
  id_tienda: number;
  id_inventario: number;
  id_categoria: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  imagen_url?: string | null;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ProductoCreate = {
  id_tienda: number;
  id_inventario: number;
  id_categoria: number;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  imagen_url?: string | null;
  activo?: boolean;
};

export type ProductoUpdate = {
  id_inventario?: number | null;
  id_categoria?: number | null;
  nombre?: string | null;
  descripcion?: string | null;
  precio?: number | null;
  imagen_url?: string | null;
  activo?: boolean | null;
};

/**
 * Hook para consumir los endpoints de FastAPI para gestión de productos
 */
export function useProductosAPI() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(err instanceof Error ? err.message : message);
  };

  /**
   * Obtener todos los productos de una tienda específica
   * @param id_tienda - ID de la tienda para filtrar los productos
   */
  const fetchProductos = useCallback(async (id_tienda: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Obteniendo productos para tienda:', id_tienda);
      const data = await apiClient.get<Producto[]>(`/productos/${id_tienda}`);
      console.log('✅ Productos obtenidos:', data?.length || 0, 'productos');
      setProductos(data || []);
    } catch (err) {
      console.error('❌ Error obteniendo productos:', err);
      handleError('No se pudieron obtener los productos', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear un nuevo producto
   */
  const crearProducto = useCallback(async (payload: ProductoCreate) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📤 Creando producto con payload:', payload);
      const data = await apiClient.post<Producto>('/productos/', payload);
      console.log('✅ Producto creado exitosamente:', data);
      setProductos((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('❌ Error al crear producto:', err);
      handleError('No se pudo crear el producto', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar un producto existente
   */
  const actualizarProducto = useCallback(async (id_producto: number, payload: ProductoUpdate) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`📝 Actualizando producto ${id_producto} con payload:`, payload);
      const data = await apiClient.put<Producto>(`/productos/${id_producto}`, payload);
      console.log('✅ Producto actualizado exitosamente:', data);
      setProductos((prev) =>
        prev.map((p) => (p.id_producto === id_producto ? data : p))
      );
      return data;
    } catch (err) {
      console.error(`❌ Error al actualizar producto ${id_producto}:`, err);
      handleError('No se pudo actualizar el producto', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar un producto
   */
  const eliminarProducto = useCallback(async (id_producto: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🗑️ Intentando eliminar producto con id: ${id_producto}`);
      await apiClient.delete(`/productos/${id_producto}`);
      console.log(`✅ Producto ${id_producto} eliminado exitosamente`);
      setProductos((prev) => prev.filter((p) => p.id_producto !== id_producto));
      return true;
    } catch (err) {
      console.error(`❌ Error al eliminar producto ${id_producto}:`, err);
      handleError('No se pudo eliminar el producto', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    productos,
    loading,
    error,
    fetchProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
  };
}

