import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';

export type Producto = {
  id_producto: number;
  id_tienda: number;
  id_inventario: number;
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
  activo: boolean;
};

/**
 * Hook para obtener productos.
 * - Puede filtrar por categoría (`categoriaId`) - se filtra en el frontend después de obtener los productos
 * - Debe filtrar por tienda (`tiendaId`) usando el endpoint /productos/{id_tienda}
 */
export function useProductos(categoriaId?: number, tiendaId?: number) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(err instanceof Error ? err.message : message);
  };

  const fetchProductos = useCallback(async () => {
    if (!tiendaId) {
      console.warn('⚠️ No se proporcionó tiendaId, no se pueden obtener productos');
      setProductos([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Obteniendo productos para tienda:', tiendaId);
      // Usar el endpoint de la API que filtra por tienda
      const data = await apiClient.get<Producto[]>(`/productos/${tiendaId}`);
      console.log('✅ Productos obtenidos:', data?.length || 0, 'productos');
      
      // Asegurar que precio sea un número
      const productosNormalizados = (data || []).map(producto => ({
        ...producto,
        precio: typeof producto.precio === 'string' ? parseFloat(producto.precio) : producto.precio,
      }));
      
      // Filtrar por categoría en el frontend si se proporciona categoriaId
      let productosFiltrados = productosNormalizados;
      if (categoriaId) {
        productosFiltrados = productosFiltrados.filter(p => p.id_categoria === categoriaId);
        console.log(`✅ Productos filtrados por categoría ${categoriaId}:`, productosFiltrados.length);
      }
      
      setProductos(productosFiltrados);
    } catch (err) {
      console.error('❌ Error obteniendo productos:', err);
      handleError('No se pudieron obtener los productos', err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [tiendaId, categoriaId]);

  return {
    productos,
    loading,
    error,
    fetchProductos,
  };
}



