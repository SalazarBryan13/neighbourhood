import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { supabase } from '../lib/supabaseClient';

export type DireccionPedido = {
  id_direccion: number;
  direccion: string;
  referencia?: string | null;
  latitud?: number | null;
  longitud?: number | null;
};

export type Pedido = {
  id_pedido: number;
  id_usuario: number;
  id_tienda: number;
  id_direccion: number;
  total: number;
  estado: string;
  fecha_pedido: string;
  fecha_confirmacion?: string | null;
  fecha_entrega?: string | null;
  created_at?: string;
  updated_at?: string;
  observaciones?: string | null;
  direccion?: DireccionPedido;
};

export type PedidoUpdateEstado = {
  estado: string;
};

/**
 * Hook para consumir los endpoints de FastAPI para gestión de pedidos
 */
export function usePedidosAPI() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(err instanceof Error ? err.message : message);
  };

  /**
   * Obtener direcciones de los pedidos desde Supabase
   */
  const obtenerDireccionesPedidos = useCallback(async (pedidos: Pedido[]): Promise<Pedido[]> => {
    if (!pedidos || pedidos.length === 0) return pedidos;

    // Obtener IDs únicos de direcciones
    const direccionIds = [...new Set(pedidos.map(p => p.id_direccion).filter(Boolean))];
    
    if (direccionIds.length === 0) {
      console.log('⚠️ No hay direcciones para obtener');
      return pedidos;
    }

    try {
      console.log('🔄 Obteniendo direcciones para', direccionIds.length, 'pedidos...');
      const { data: direccionesData, error: supaError } = await supabase
        .from('direcciones_usuario')
        .select('id_direccion, direccion, referencia, latitud, longitud')
        .in('id_direccion', direccionIds);

      if (supaError) {
        console.error('❌ Error obteniendo direcciones:', supaError);
        return pedidos; // Retornar pedidos sin direcciones si hay error
      }

      // Crear mapa de direcciones
      const direccionesMap = new Map(
        (direccionesData || []).map(d => [d.id_direccion, d as DireccionPedido])
      );

      // Combinar pedidos con direcciones
      const pedidosConDirecciones = pedidos.map(pedido => ({
        ...pedido,
        direccion: direccionesMap.get(pedido.id_direccion),
      }));

      console.log('✅ Direcciones obtenidas exitosamente');
      return pedidosConDirecciones;
    } catch (err) {
      console.error('❌ Error inesperado obteniendo direcciones:', err);
      return pedidos; // Retornar pedidos sin direcciones si hay error
    }
  }, []);

  /**
   * Obtener todos los pedidos de la tienda del usuario autenticado
   */
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Iniciando fetchPedidos...');
      const data = await apiClient.get<Pedido[]>('/pedidos/');
      console.log('✅ Pedidos obtenidos exitosamente:', data?.length || 0, 'pedidos');
      
      // Obtener direcciones para los pedidos
      const pedidosConDirecciones = await obtenerDireccionesPedidos(data || []);
      setPedidos(pedidosConDirecciones);
      return pedidosConDirecciones;
    } catch (err) {
      console.error('❌ Error en fetchPedidos:', err);
      handleError('No se pudieron obtener los pedidos', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [obtenerDireccionesPedidos]);

  /**
   * Obtener pedidos filtrados por estado
   */
  const fetchPedidosPorEstado = useCallback(async (estado: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔄 Iniciando fetchPedidosPorEstado con estado: ${estado}`);
      // Usar el endpoint correcto: /pedidos/estado/{estado}
      const data = await apiClient.get<Pedido[]>(`/pedidos/estado/${estado}`);
      console.log(`✅ Pedidos ${estado} obtenidos exitosamente:`, data?.length || 0, 'pedidos');
      
      // Obtener direcciones para los pedidos
      const pedidosConDirecciones = await obtenerDireccionesPedidos(data || []);
      setPedidos(pedidosConDirecciones);
      return pedidosConDirecciones;
    } catch (err) {
      console.error(`❌ Error en fetchPedidosPorEstado (${estado}):`, err);
      handleError(`No se pudieron obtener los pedidos ${estado}`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [obtenerDireccionesPedidos]);

  /**
   * Actualizar el estado de un pedido
   */
  const actualizarEstadoPedido = useCallback(async (
    id_pedido: number,
    estado: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔄 Actualizando estado del pedido ${id_pedido} a ${estado}`);
      const payload: PedidoUpdateEstado = { estado };
      const data = await apiClient.patch<Pedido>(
        `/pedidos/${id_pedido}/estado`,
        payload
      );
      console.log(`✅ Estado del pedido ${id_pedido} actualizado exitosamente`);
      
      // Obtener dirección del pedido actualizado si tiene id_direccion
      let pedidoActualizado = data;
      if (data && data.id_direccion) {
        const pedidosConDirecciones = await obtenerDireccionesPedidos([data]);
        pedidoActualizado = pedidosConDirecciones[0] || data;
      }
      
      // Actualizar el pedido en el estado local
      setPedidos((prev) =>
        prev.map((p) => (p.id_pedido === id_pedido ? pedidoActualizado : p))
      );
      
      return pedidoActualizado;
    } catch (err) {
      console.error(`❌ Error al actualizar estado del pedido ${id_pedido}:`, err);
      handleError('No se pudo actualizar el estado del pedido', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [obtenerDireccionesPedidos]);

  return {
    pedidos,
    loading,
    error,
    fetchPedidos,
    fetchPedidosPorEstado,
    actualizarEstadoPedido,
  };
}

