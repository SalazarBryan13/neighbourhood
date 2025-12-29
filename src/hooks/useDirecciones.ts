import { useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Direccion = {
  id_direccion: number;
  id_usuario: string; // UUID, no número
  direccion: string;
  referencia?: string | null;
  latitud?: number | null;
  longitud?: number | null;
};

export type DireccionCreate = {
  direccion: string;
  referencia?: string | null;
  latitud?: number | null;
  longitud?: number | null;
};

export type DireccionUpdate = {
  direccion?: string;
  referencia?: string | null;
  latitud?: number | null;
  longitud?: number | null;
};

/**
 * Hook para gestionar direcciones del usuario
 */
export function useDirecciones() {
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (message: string, err: unknown) => {
    console.error(message, err);
    setError(message);
  };

  // Obtener el UUID del usuario desde auth
  // direcciones_usuario.id_usuario es UUID que referencia a usuario.id_propietario
  const getUsuarioUuid = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
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

    // Retornar el UUID (id_propietario) que es lo que usa direcciones_usuario.id_usuario
    return user.id;
  }, []);

  const fetchDirecciones = useCallback(async () => {
    setLoading(true);
    setError(null);

    const usuarioUuid = await getUsuarioUuid();
    if (!usuarioUuid) {
      handleError('No se pudo obtener el usuario', null);
      setLoading(false);
      return;
    }

    try {
      const { data, error: supaError } = await supabase
        .from('direcciones_usuario')
        .select('*')
        .eq('id_usuario', usuarioUuid)
        .order('id_direccion', { ascending: false });

      if (supaError) {
        console.error('Error obteniendo direcciones:', supaError);
        handleError('No se pudieron obtener las direcciones', supaError);
        setDirecciones([]);
        setLoading(false);
        return;
      }

      setDirecciones((data as Direccion[]) ?? []);
    } catch (err) {
      console.error('Error inesperado obteniendo direcciones:', err);
      handleError('Error inesperado al obtener direcciones', err);
      setDirecciones([]);
    } finally {
      setLoading(false);
    }
  }, [getUsuarioUuid]);

  // Crear una nueva dirección
  const crearDireccion = useCallback(async (direccionData: DireccionCreate) => {
    setLoading(true);
    setError(null);

    const usuarioUuid = await getUsuarioUuid();
    if (!usuarioUuid) {
      handleError('No se pudo obtener el usuario', null);
      setLoading(false);
      return null;
    }

    try {
      const { data, error: supaError } = await supabase
        .from('direcciones_usuario')
        .insert({
          ...direccionData,
          id_usuario: usuarioUuid,
        })
        .select()
        .single();

      if (supaError) {
        console.error('Error creando dirección:', supaError);
        handleError('No se pudo crear la dirección', supaError);
        setLoading(false);
        return null;
      }

      await fetchDirecciones();
      setLoading(false);
      return data as Direccion;
    } catch (err) {
      console.error('Error inesperado creando dirección:', err);
      handleError('Error inesperado al crear la dirección', err);
      setLoading(false);
      return null;
    }
  }, [getUsuarioUuid, fetchDirecciones]);

  // Actualizar una dirección existente
  const actualizarDireccion = useCallback(async (
    idDireccion: number,
    direccionData: DireccionUpdate
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supaError } = await supabase
        .from('direcciones_usuario')
        .update(direccionData)
        .eq('id_direccion', idDireccion)
        .select()
        .single();

      if (supaError) {
        console.error('Error actualizando dirección:', supaError);
        handleError('No se pudo actualizar la dirección', supaError);
        setLoading(false);
        return null;
      }

      await fetchDirecciones();
      setLoading(false);
      return data as Direccion;
    } catch (err) {
      console.error('Error inesperado actualizando dirección:', err);
      handleError('Error inesperado al actualizar la dirección', err);
      setLoading(false);
      return null;
    }
  }, [fetchDirecciones]);

  // Eliminar una dirección
  const eliminarDireccion = useCallback(async (idDireccion: number) => {
    setLoading(true);
    setError(null);

    try {
      const { error: supaError } = await supabase
        .from('direcciones_usuario')
        .delete()
        .eq('id_direccion', idDireccion);

      if (supaError) {
        console.error('Error eliminando dirección:', supaError);
        handleError('No se pudo eliminar la dirección', supaError);
        setLoading(false);
        return false;
      }

      await fetchDirecciones();
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error inesperado eliminando dirección:', err);
      handleError('Error inesperado al eliminar la dirección', err);
      setLoading(false);
      return false;
    }
  }, [fetchDirecciones]);

  useEffect(() => {
    fetchDirecciones();
  }, [fetchDirecciones]);

  return {
    direcciones,
    loading,
    error,
    refetch: fetchDirecciones,
    crearDireccion,
    actualizarDireccion,
    eliminarDireccion,
  };
}







