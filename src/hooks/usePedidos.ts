import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Pedido = {
  id_pedido: number;
  id_usuario: string; // UUID, no número - referencia a usuario.id_propietario
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

  // Obtener el UUID del usuario desde auth
  // Para carrito: carrito.id_usuario es UUID que referencia a usuario.id_propietario
  // Para pedido: pedido.id_usuario es UUID que referencia a usuario.id_propietario
  const getUsuarioUuid = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ No hay usuario autenticado');
      return null;
    }
    
    // Verificar que existe el usuario en la tabla usuario
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

    console.log('✅ UUID obtenido para carrito:', user.id);
    // Retornar el UUID (id_propietario) que es lo que usa carrito.id_usuario
    return user.id;
  }, []);

  // Ya no necesitamos getUsuarioId porque pedido.id_usuario también es UUID
  // Se eliminó esta función porque pedido.id_usuario es UUID que referencia a usuario.id_propietario

  // Crear pedido desde el carrito
  const crearPedido = useCallback(async (
    idTienda: number,
    idDireccion: number,
    observaciones?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Obtener UUID del usuario (para carrito y pedido)
      // Tanto carrito.id_usuario como pedido.id_usuario son UUID que referencia a usuario.id_propietario
      const usuarioUuid = await getUsuarioUuid();
      if (!usuarioUuid) {
        const errorMsg = 'No se pudo obtener el UUID del usuario';
        console.error(errorMsg);
        handleError(errorMsg, null);
        setLoading(false);
        return null;
      }

      console.log('Creando pedido para usuario (UUID):', usuarioUuid, 'tienda:', idTienda, 'dirección:', idDireccion);

      console.log('🔑 UUID del usuario para carrito:', usuarioUuid);
      console.log('🔑 Tipo de usuarioUuid:', typeof usuarioUuid);
      console.log('🔑 usuarioUuid es string?', typeof usuarioUuid === 'string');
      console.log('🔑 usuarioUuid tiene formato UUID?', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usuarioUuid || ''));

      // Validar que usuarioUuid es un UUID válido
      if (!usuarioUuid || typeof usuarioUuid !== 'string') {
        const errorMsg = 'El UUID del usuario no es válido';
        console.error(errorMsg, { usuarioUuid, tipo: typeof usuarioUuid });
        handleError(errorMsg, null);
        setLoading(false);
        return null;
      }

      const { data: itemsCarrito, error: carritoError } = await supabase
        .from('carrito')
        .select('*')
        .eq('id_usuario', usuarioUuid)
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
      // pedido.id_usuario es UUID que referencia a usuario.id_propietario
      const pedidoData: any = {
        id_usuario: usuarioUuid, // Usar UUID, no número
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
      // Usar el UUID para actualizar el carrito
      const { error: updateError } = await supabase
        .from('carrito')
        .update({ id_pedido: pedido.id_pedido })
        .eq('id_usuario', usuarioUuid)
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
  }, [getUsuarioUuid]);

  // Obtener pedidos del usuario
  const obtenerPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);

    // pedido.id_usuario es UUID que referencia a usuario.id_propietario
    const usuarioUuid = await getUsuarioUuid();
    if (!usuarioUuid) {
      handleError('No se pudo obtener el usuario', null);
      setLoading(false);
      return [];
    }

    // Obtener pedidos sin relaciones primero
    const { data: pedidosData, error: supaError } = await supabase
      .from('pedido')
      .select('*')
      .eq('id_usuario', usuarioUuid)
      .order('fecha_pedido', { ascending: false });

    if (supaError) {
      handleError('No se pudieron obtener los pedidos', supaError);
      setLoading(false);
      return [];
    }

    if (!pedidosData || pedidosData.length === 0) {
      setLoading(false);
      return [];
    }

    // Obtener tiendas relacionadas
    const tiendaIds = [...new Set(pedidosData.map(p => p.id_tienda).filter(Boolean))];
    let tiendasMap = new Map();
    if (tiendaIds.length > 0) {
      const { data: tiendasData } = await supabase
        .from('tienda')
        .select('id_tienda, nombre_tienda')
        .in('id_tienda', tiendaIds);
      
      tiendasMap = new Map((tiendasData || []).map(t => [t.id_tienda, t]));
    }

    // Obtener direcciones relacionadas
    const direccionIds = [...new Set(pedidosData.map(p => p.id_direccion).filter(Boolean))];
    let direccionesMap = new Map();
    if (direccionIds.length > 0) {
      const { data: direccionesData } = await supabase
        .from('direcciones_usuario')
        .select('id_direccion, direccion')
        .in('id_direccion', direccionIds);
      
      direccionesMap = new Map((direccionesData || []).map(d => [d.id_direccion, d]));
    }

    // Combinar los datos
    const data = pedidosData.map(pedido => ({
      ...pedido,
      tienda: tiendasMap.get(pedido.id_tienda) || undefined,
      direccion: direccionesMap.get(pedido.id_direccion) || undefined,
    }));

    if (supaError) {
      handleError('No se pudieron obtener los pedidos', supaError);
      setLoading(false);
      return [];
    }

    setLoading(false);
    return (data as Pedido[]) ?? [];
  }, [getUsuarioUuid]);

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

