import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';

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
   * Obtener todos los pedidos de la tienda del usuario autenticado
   */
  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Iniciando fetchPedidos...');
      const data = await apiClient.get<Pedido[]>('/pedidos/');
      console.log('✅ Pedidos obtenidos exitosamente:', data?.length || 0, 'pedidos');
      setPedidos(data || []);
      return data || [];
    } catch (err) {
      console.error('❌ Error en fetchPedidos:', err);
      handleError('No se pudieron obtener los pedidos', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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
      setPedidos(data || []);
      return data || [];
    } catch (err) {
      console.error(`❌ Error en fetchPedidosPorEstado (${estado}):`, err);
      handleError(`No se pudieron obtener los pedidos ${estado}`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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
      
      // Actualizar el pedido en el estado local
      setPedidos((prev) =>
        prev.map((p) => (p.id_pedido === id_pedido ? data : p))
      );
      
      return data;
    } catch (err) {
      console.error(`❌ Error al actualizar estado del pedido ${id_pedido}:`, err);
      handleError('No se pudo actualizar el estado del pedido', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pedidos,
    loading,
    error,
    fetchPedidos,
    fetchPedidosPorEstado,
    actualizarEstadoPedido,
  };
}

