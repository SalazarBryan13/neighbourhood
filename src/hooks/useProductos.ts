import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Producto = {
  id_producto: number;
  id_inventario: number;
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagen_url?: string;
  activo: boolean;
  inventario?: {
    id_inventario: number;
    id_tienda: number;
    stock: number;
    tienda?: {
      id_tienda: number;
      nombre_tienda: string;
    };
  };
};

/**
 * Hook para obtener productos.
 * - Puede filtrar por categoría (`categoriaId`)
 * - Puede filtrar por tienda (`tiendaId`) usando la relación inventario.id_tienda
 */
export function useProductos(categoriaId?: number, tiendaId?: number) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(message);
  };

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    let query = supabase
      .from('producto')
      .select(`
        *,
        inventario:inventario(
          id_inventario,
          id_tienda,
          stock,
          tienda:tienda(
            id_tienda,
            nombre_tienda
          )
        )
      `)
      .eq('activo', true);

    if (categoriaId) {
      query = query.eq('id_categoria', categoriaId);
    }

    if (tiendaId) {
      // Filtrar por tienda usando la relación de inventario
      query = query.eq('inventario.id_tienda', tiendaId);
    }

    const { data, error: supaError } = await query.order('nombre', { ascending: true });

    if (supaError) {
      handleError('No se pudieron obtener los productos', supaError);
      setLoading(false);
      return;
    }

    setProductos((data as Producto[]) ?? []);
    setLoading(false);
  }, [categoriaId, tiendaId]);

  return {
    productos,
    loading,
    error,
    fetchProductos,
  };
}



