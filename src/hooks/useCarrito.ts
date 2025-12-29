import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type ItemCarrito = {
  id_carrito: number;
  id_pedido: number | null;
  id_usuario: string; // UUID, no número
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
  const [usuarioUuid, setUsuarioUuid] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(message);
  };

  // Obtener el UUID del usuario desde auth
  // carrito.id_usuario referencia a usuario.id_propietario (UUID), no a usuario.id_usuario (número)
  const getUsuarioUuid = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Verificar que existe el usuario en la tabla usuario con ese id_propietario
    // carrito.id_usuario debe coincidir con usuario.id_propietario (UUID)
    const { data: usuarioData, error } = await supabase
      .from('usuario')
      .select('id_propietario')
      .eq('id_propietario', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error verificando usuario:', error);
      return null;
    }

    if (!usuarioData) {
      console.warn('No se encontró registro de usuario con id_propietario:', user.id);
      return null;
    }

    // Retornar el UUID (id_propietario) que es lo que usa carrito.id_usuario
    // carrito.id_usuario = usuario.id_propietario (UUID)
    return user.id;
  }, []);

  // Obtener el carrito del usuario (id_pedido IS NULL)
  const fetchCarrito = useCallback(async (overrideUsuarioUuid?: string) => {
    const uuidToUse = overrideUsuarioUuid ?? usuarioUuid;
    if (!uuidToUse) return;

    setLoading(true);
    setError(null);

    // Primero obtener los items del carrito sin relaciones
    const { data: carritoData, error: supaError } = await supabase
      .from('carrito')
      .select('*')
      .eq('id_usuario', uuidToUse)
      .is('id_pedido', null)
      .order('id_carrito', { ascending: false });

    if (supaError) {
      handleError('No se pudo obtener el carrito', supaError);
      setLoading(false);
      return;
    }

    if (!carritoData || carritoData.length === 0) {
      setCarrito([]);
      setLoading(false);
      return;
    }

    // Obtener los productos relacionados
    const productoIds = [...new Set(carritoData.map(item => item.id_producto))];
    const { data: productosData } = await supabase
      .from('producto')
      .select('id_producto, nombre, descripcion, imagen_url, precio, id_inventario')
      .in('id_producto', productoIds);

    // Obtener inventarios relacionados
    const inventarioIds = [...new Set((productosData || []).map(p => p.id_inventario).filter(Boolean))];
    let inventariosData: any[] = [];
    let tiendasData: any[] = [];

    if (inventarioIds.length > 0) {
      const { data: invData } = await supabase
        .from('inventario')
        .select('id_inventario, id_tienda')
        .in('id_inventario', inventarioIds);

      inventariosData = invData || [];

      // Obtener tiendas relacionadas
      const tiendaIds = [...new Set(inventariosData.map(inv => inv.id_tienda).filter(Boolean))];
      if (tiendaIds.length > 0) {
        const { data: tiendaData } = await supabase
          .from('tienda')
          .select('id_tienda, nombre_tienda')
          .in('id_tienda', tiendaIds);

        tiendasData = tiendaData || [];
      }
    }

    // Construir mapas para acceso rápido
    const productosMap = new Map((productosData || []).map(p => [p.id_producto, p]));
    const inventariosMap = new Map(inventariosData.map(inv => [inv.id_inventario, inv]));
    const tiendasMap = new Map(tiendasData.map(t => [t.id_tienda, t]));

    // Combinar los datos
    const data = carritoData.map(item => {
      const producto = productosMap.get(item.id_producto);
      if (!producto) return item;

      const inventario = producto.id_inventario ? inventariosMap.get(producto.id_inventario) : null;
      const tienda = inventario?.id_tienda ? tiendasMap.get(inventario.id_tienda) : null;

      return {
        ...item,
        producto: {
          ...producto,
          inventario: inventario ? {
            ...inventario,
            tienda: tienda || undefined,
          } : undefined,
        },
      };
    });

    setCarrito((data as ItemCarrito[]) ?? []);
    setLoading(false);
  }, [usuarioUuid]);

  // Agregar producto al carrito
  const agregarAlCarrito = useCallback(async (
    idProducto: number,
    cantidad: number = 1,
    precioUnitario: number
  ) => {
    setLoading(true);
    setError(null);

    // Asegurar que tenemos el usuarioUuid
    let currentUsuarioUuid = usuarioUuid;
    if (!currentUsuarioUuid) {
      const uuid = await getUsuarioUuid();
      if (!uuid) {
        handleError('No se pudo obtener el usuario', null);
        setLoading(false);
        return false;
      }
      setUsuarioUuid(uuid);
      currentUsuarioUuid = uuid;
    }

    // Verificar si el producto ya está en el carrito
    const { data: existingItem, error: checkError } = await supabase
      .from('carrito')
      .select('*')
      .eq('id_usuario', currentUsuarioUuid)
      .eq('id_producto', idProducto)
      .is('id_pedido', null)
      .maybeSingle();

    if (checkError) {
      console.error('Error verificando carrito:', checkError);
      handleError('No se pudo verificar el carrito', checkError);
      setLoading(false);
      return false;
    }

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
          id_usuario: currentUsuarioUuid,
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
    if (currentUsuarioUuid) {
      // Si el usuarioUuid cambió, actualizar el estado primero
      if (currentUsuarioUuid !== usuarioUuid) {
        setUsuarioUuid(currentUsuarioUuid);
      }
      await fetchCarrito(currentUsuarioUuid);
    }
    setLoading(false);
    return true;
  }, [usuarioUuid, getUsuarioUuid, fetchCarrito]);

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
    getUsuarioUuid().then(uuid => {
      if (uuid) {
        setUsuarioUuid(uuid);
      }
    });
  }, [getUsuarioUuid]);

  // Cargar carrito cuando se obtiene el usuario
  useEffect(() => {
    if (usuarioUuid) {
      fetchCarrito();
    }
  }, [usuarioUuid, fetchCarrito]);

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

