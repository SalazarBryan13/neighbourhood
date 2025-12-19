import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Direccion = {
  id_direccion: number;
  id_usuario: number;
  direccion: string;
  referencia?: string;
  latitud?: number;
  longitud?: number;
};

/**
 * Hook para obtener direcciones del usuario
 */
export function useDirecciones() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
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

  const fetchDirecciones = useCallback(async () => {
    setLoading(true);
    setError(null);

    const usuarioId = await getUsuarioId();
    if (!usuarioId) {
      handleError('No se pudo obtener el usuario', null);
      setLoading(false);
      return;
    }

    const { data, error: supaError } = await supabase
      .from('direcciones_usuario')
      .select('*')
      .eq('id_usuario', usuarioId)
      .order('id_direccion', { ascending: false });

    if (supaError) {
      handleError('No se pudieron obtener las direcciones', supaError);
      setLoading(false);
      return;
    }

    setDirecciones((data as Direccion[]) ?? []);
    setLoading(false);
  }, [getUsuarioId]);

  useEffect(() => {
    fetchDirecciones();
  }, [fetchDirecciones]);

  return {
    direcciones,
    loading,
    error,
    refetch: fetchDirecciones,
  };
}



