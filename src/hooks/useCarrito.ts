import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type ItemCarrito = {
  id_carrito: number;
  id_pedido: number | null;
  id_usuario: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: {
    id_producto: number;
    nombre: string;
    descripcion?: string;
    imagen_url?: string;
    precio: number;
    id_inventario: number;
    inventario?: {
      id_tienda: number;
      tienda?: {
        id_tienda: number;
        nombre_tienda: string;
      };
    };
  };
};

/**
 * Hook para gestionar el carrito de compras
 */
export function useCarrito() {
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(message);
  };

  // Obtener el ID del usuario desde auth
  const getUsuarioId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Obtener id_usuario desde la tabla usuario
    const { data, error } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      console.error('Error obteniendo id_usuario:', error);
      return null;
    }

    return data.id_usuario;
  }, []);

  // Obtener el carrito del usuario (id_pedido IS NULL)
  const fetchCarrito = useCallback(async (overrideUsuarioId?: number) => {
    const idToUse = overrideUsuarioId ?? usuarioId;
    if (!idToUse) return;

    setLoading(true);
    setError(null);

    const { data, error: supaError } = await supabase
      .from('carrito')
      .select(`
        *,
        producto:producto(
          id_producto,
          nombre,
          descripcion,
          imagen_url,
          precio,
          id_inventario,
          inventario:inventario(
            id_tienda,
            tienda:tienda(
              id_tienda,
              nombre_tienda
            )
          )
        )
      `)
      .eq('id_usuario', idToUse)
      .is('id_pedido', null)
      .order('id_carrito', { ascending: false });

    if (supaError) {
      handleError('No se pudo obtener el carrito', supaError);
      setLoading(false);
      return;
    }

    setCarrito((data as ItemCarrito[]) ?? []);
    setLoading(false);
  }, [usuarioId]);

  // Agregar producto al carrito
  const agregarAlCarrito = useCallback(async (
    idProducto: number,
    cantidad: number = 1,
    precioUnitario: number
  ) => {
    setLoading(true);
    setError(null);

    // Asegurar que tenemos el usuarioId
    let currentUsuarioId = usuarioId;
    if (!currentUsuarioId) {
      const id = await getUsuarioId();
      if (!id) {
        handleError('No se pudo obtener el usuario', null);
        setLoading(false);
        return false;
      }
      setUsuarioId(id);
      currentUsuarioId = id;
    }

    // Verificar si el producto ya está en el carrito
    const { data: existingItem } = await supabase
      .from('carrito')
      .select('*')
      .eq('id_usuario', currentUsuarioId)
      .eq('id_producto', idProducto)
      .is('id_pedido', null)
      .maybeSingle();

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const nuevaCantidad = existingItem.cantidad + cantidad;
      const nuevoSubtotal = nuevaCantidad * precioUnitario;

      const { error: updateError } = await supabase
        .from('carrito')
        .update({
          cantidad: nuevaCantidad,
          precio_unitario: precioUnitario,
          subtotal: nuevoSubtotal,
        })
        .eq('id_carrito', existingItem.id_carrito);

      if (updateError) {
        handleError('No se pudo actualizar el carrito', updateError);
        setLoading(false);
        return false;
      }
    } else {
      // Insertar nuevo item
      const subtotal = cantidad * precioUnitario;

      const { error: insertError } = await supabase
        .from('carrito')
        .insert({
          id_usuario: currentUsuarioId,
          id_producto: idProducto,
          cantidad: cantidad,
          precio_unitario: precioUnitario,
          subtotal: subtotal,
          id_pedido: null,
        });

      if (insertError) {
        handleError('No se pudo agregar al carrito', insertError);
        setLoading(false);
        return false;
      }
    }

    // Refrescar el carrito después de agregar
    if (currentUsuarioId) {
      // Si el usuarioId cambió, actualizar el estado primero
      if (currentUsuarioId !== usuarioId) {
        setUsuarioId(currentUsuarioId);
      }
      await fetchCarrito(currentUsuarioId);
    }
    setLoading(false);
    return true;
  }, [usuarioId, getUsuarioId, fetchCarrito]);

  // Actualizar cantidad de un item
  const actualizarCantidad = useCallback(async (
    idCarrito: number,
    nuevaCantidad: number
  ) => {
    if (nuevaCantidad <= 0) {
      return eliminarDelCarrito(idCarrito);
    }

    setLoading(true);
    setError(null);

    const { data: item } = await supabase
      .from('carrito')
      .select('precio_unitario')
      .eq('id_carrito', idCarrito)
      .single();

    if (!item) {
      handleError('Item no encontrado', null);
      setLoading(false);
      return false;
    }

    const nuevoSubtotal = nuevaCantidad * item.precio_unitario;

    const { error } = await supabase
      .from('carrito')
      .update({
        cantidad: nuevaCantidad,
        subtotal: nuevoSubtotal,
      })
      .eq('id_carrito', idCarrito);

    if (error) {
      handleError('No se pudo actualizar la cantidad', error);
      setLoading(false);
      return false;
    }

    await fetchCarrito();
    setLoading(false);
    return true;
  }, [fetchCarrito]);

  // Eliminar item del carrito
  const eliminarDelCarrito = useCallback(async (idCarrito: number) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from('carrito')
      .delete()
      .eq('id_carrito', idCarrito);

    if (error) {
      handleError('No se pudo eliminar del carrito', error);
      setLoading(false);
      return false;
    }

    await fetchCarrito();
    setLoading(false);
    return true;
  }, [fetchCarrito]);

  // Obtener total del carrito
  const getTotal = useCallback(() => {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  }, [carrito]);

  // Obtener cantidad de items en el carrito
  const getCantidadItems = useCallback(() => {
    return carrito.reduce((sum, item) => sum + item.cantidad, 0);
  }, [carrito]);

  // Inicializar usuario al montar
  useEffect(() => {
    getUsuarioId().then(id => {
      if (id) {
        setUsuarioId(id);
      }
    });
  }, [getUsuarioId]);

  // Cargar carrito cuando se obtiene el usuario
  useEffect(() => {
    if (usuarioId) {
      fetchCarrito();
    }
  }, [usuarioId, fetchCarrito]);

  return {
    carrito,
    loading,
    error,
    total: getTotal(),
    cantidadItems: getCantidadItems(),
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    refetch: fetchCarrito,
  };
}

