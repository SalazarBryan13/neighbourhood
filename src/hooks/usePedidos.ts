import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Pedido = {
  id_pedido: number;
  id_usuario: number;
  id_tienda: number;
  id_direccion: number;
  estado: string;
  total: number;
  observaciones?: string;
  fecha_pedido: string;
  fecha_confirmacion?: string;
  fecha_entrega?: string;
  tienda?: {
    nombre_tienda: string;
  };
  direccion?: {
    direccion: string;
  };
};

/**
 * Hook para gestionar pedidos
 */
export function usePedidos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(message);
  };

  // Obtener el ID del usuario desde auth
  const getUsuarioId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

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

  // Crear pedido desde el carrito
  const crearPedido = useCallback(async (
    idTienda: number,
    idDireccion: number,
    observaciones?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const usuarioId = await getUsuarioId();
      if (!usuarioId) {
        const errorMsg = 'No se pudo obtener el usuario';
        console.error(errorMsg);
        handleError(errorMsg, null);
        setLoading(false);
        return null;
      }

      console.log('Creando pedido para usuario:', usuarioId, 'tienda:', idTienda, 'dirección:', idDireccion);

      // Obtener items del carrito
      const { data: itemsCarrito, error: carritoError } = await supabase
        .from('carrito')
        .select('*')
        .eq('id_usuario', usuarioId)
        .is('id_pedido', null);

      if (carritoError) {
        console.error('Error obteniendo carrito:', carritoError);
        const errorMsg = `Error al obtener el carrito: ${carritoError.message}`;
        handleError(errorMsg, carritoError);
        setLoading(false);
        return null;
      }

      if (!itemsCarrito || itemsCarrito.length === 0) {
        const errorMsg = 'El carrito está vacío';
        console.error(errorMsg);
        handleError(errorMsg, null);
        setLoading(false);
        return null;
      }

      console.log('Items del carrito:', itemsCarrito.length);

      // Calcular total
      const total = itemsCarrito.reduce((sum, item) => sum + item.subtotal, 0);
      console.log('Total calculado:', total);

      // Crear pedido
      const pedidoData: any = {
        id_usuario: usuarioId,
        id_tienda: idTienda,
        id_direccion: idDireccion,
        total: total,
        estado: 'pendiente',
        fecha_pedido: new Date().toISOString(), // Agregar fecha explícitamente
      };

      if (observaciones) {
        pedidoData.observaciones = observaciones;
      }

      console.log('📝 Insertando pedido con datos:', JSON.stringify(pedidoData, null, 2));
      console.log('📋 Campos a insertar:', {
        id_usuario: typeof pedidoData.id_usuario,
        id_tienda: typeof pedidoData.id_tienda,
        id_direccion: typeof pedidoData.id_direccion,
        total: typeof pedidoData.total,
        estado: typeof pedidoData.estado,
        fecha_pedido: typeof pedidoData.fecha_pedido,
        observaciones: pedidoData.observaciones ? typeof pedidoData.observaciones : 'undefined'
      });

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedido')
        .insert(pedidoData)
        .select()
        .single();

      if (pedidoError) {
        console.error('❌ Error creando pedido:', pedidoError);
        console.error('❌ Detalles del error:', JSON.stringify(pedidoError, null, 2));
        let errorMsg = `Error al crear el pedido: ${pedidoError.message || JSON.stringify(pedidoError)}`;
        
        // Mensajes más descriptivos según el tipo de error
        if (pedidoError.message?.includes('row-level security') || pedidoError.message?.includes('RLS')) {
          errorMsg = 'Error de permisos: No tienes permisos para crear pedidos. Verifica las políticas RLS en Supabase.';
        } else if (pedidoError.message?.includes('foreign key') || pedidoError.message?.includes('violates foreign key')) {
          errorMsg = 'Error de datos: La tienda o dirección seleccionada no existe o no es válida.';
        } else if (pedidoError.message?.includes('null value') || pedidoError.message?.includes('NOT NULL')) {
          errorMsg = 'Error de datos: Faltan datos requeridos para crear el pedido. Verifica que todos los campos estén completos.';
        } else if (pedidoError.message?.includes('violates')) {
          errorMsg = `Error de validación: ${pedidoError.message}`;
        } else if (pedidoError.message) {
          errorMsg = `Error: ${pedidoError.message}`;
        }
        
        console.error('❌ Mensaje de error final:', errorMsg);
        handleError(errorMsg, pedidoError);
        setLoading(false);
        return null;
      }

      if (!pedido) {
        console.error('No se recibió el pedido creado');
        const errorMsg = 'No se pudo crear el pedido';
        handleError(errorMsg, null);
        setLoading(false);
        return null;
      }

      console.log('Pedido creado exitosamente:', pedido.id_pedido);

      // Actualizar items del carrito con id_pedido
      const { error: updateError } = await supabase
        .from('carrito')
        .update({ id_pedido: pedido.id_pedido })
        .eq('id_usuario', usuarioId)
        .is('id_pedido', null);

      if (updateError) {
        console.error('Error actualizando carrito:', updateError);
        let errorMsg = `Error al confirmar el carrito: ${updateError.message}`;
        
        // Mensajes más descriptivos
        if (updateError.message.includes('row-level security')) {
          errorMsg = 'Error de permisos: No tienes permisos para actualizar el carrito. Verifica las políticas de seguridad en Supabase.';
        } else if (updateError.message.includes('null value')) {
          errorMsg = 'Error de datos: No se pudo actualizar el carrito con el ID del pedido.';
        }
        
        handleError(errorMsg, updateError);
        setLoading(false);
        return null;
      }

      console.log('Carrito actualizado exitosamente');
      setLoading(false);
      return pedido as Pedido;
    } catch (err) {
      console.error('Error inesperado al crear pedido:', err);
      const errorMsg = `Error inesperado: ${err instanceof Error ? err.message : 'Error desconocido'}`;
      handleError(errorMsg, err);
      setLoading(false);
      return null;
    }
  }, [getUsuarioId]);

  // Obtener pedidos del usuario
  const obtenerPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const usuarioId = await getUsuarioId();
    if (!usuarioId) {
      handleError('No se pudo obtener el usuario', null);
      setLoading(false);
      return [];
    }

    const { data, error: supaError } = await supabase
      .from('pedido')
      .select(`
        *,
        tienda:tienda(
          nombre_tienda
        ),
        direccion:direcciones_usuario(
          direccion
        )
      `)
      .eq('id_usuario', usuarioId)
      .order('fecha_pedido', { ascending: false });

    if (supaError) {
      handleError('No se pudieron obtener los pedidos', supaError);
      setLoading(false);
      return [];
    }

    setLoading(false);
    return (data as Pedido[]) ?? [];
  }, [getUsuarioId]);

  // Obtener productos de un pedido
  const obtenerProductosPedido = useCallback(async (idPedido: number) => {
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
          imagen_url
        )
      `)
      .eq('id_pedido', idPedido)
      .order('id_carrito', { ascending: false });

    if (supaError) {
      handleError('No se pudieron obtener los productos del pedido', supaError);
      setLoading(false);
      return [];
    }

    setLoading(false);
    return data ?? [];
  }, []);

  return {
    loading,
    error,
    crearPedido,
    obtenerPedidos,
    obtenerProductosPedido,
  };
}

