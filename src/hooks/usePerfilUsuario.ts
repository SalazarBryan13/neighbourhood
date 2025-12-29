import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type UsuarioPerfil = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  telefono?: string | null;
  rol?: string | null;
  id_propietario: string | null; // uuid que referencia a auth.users.id
};

export function usePerfilUsuario() {
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarPerfil = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('Error obteniendo usuario de auth:', userError);
        setError('No se pudo obtener la sesión de usuario.');
        setLoading(false);
        return;
      }

      if (!user) {
        setError('No hay usuario autenticado.');
        setLoading(false);
        return;
      }

      setEmail(user.email || '');

      const { data, error: perfilError } = await supabase
        .from('usuario')
        .select('*')
        .eq('id_propietario', user.id)
        .maybeSingle();

      if (perfilError) {
        console.error('Error obteniendo perfil:', perfilError);
        setError('No se pudo obtener tu perfil.');
        setLoading(false);
        return;
      }

      if (!data) {
        console.warn('No se encontró registro de usuario con id_propietario:', user.id);
        setError('No se encontró tu perfil de usuario.');
        setLoading(false);
        return;
      }

      setPerfil(data as UsuarioPerfil);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando perfil:', err);
      setError('Ocurrió un error al cargar tu perfil.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarPerfil();

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth state changed:', event, session?.user?.email);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Recargar perfil cuando el usuario inicia sesión o se refresca el token
        cargarPerfil();
      } else if (event === 'SIGNED_OUT') {
        // Limpiar perfil cuando el usuario cierra sesión
        setPerfil(null);
        setEmail('');
        setError(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  const actualizarPerfil = useCallback(
    async (payload: { nombre: string; apellido: string; telefono: string }) => {
      if (!perfil) return { ok: false, error: 'No hay perfil cargado.' };

      try {
        setLoading(true);
        setError(null);

        console.log('📝 Actualizando perfil con:', {
          payload,
          id_usuario: perfil.id_usuario,
          id_propietario: perfil.id_propietario,
        });

        const { error: updateError } = await supabase
          .from('usuario')
          .update({
            nombre: payload.nombre.trim(),
            apellido: payload.apellido.trim(),
            telefono: payload.telefono.trim(),
          })
          // usamos id_usuario como clave primaria para la actualización
          .eq('id_usuario', perfil.id_usuario);

        if (updateError) {
          console.error('Error actualizando perfil:', updateError);
          const msg =
            updateError.message ||
            'No se pudo actualizar tu perfil. Intenta nuevamente.';
          setError(msg);
          setLoading(false);
          return { ok: false, error: msg };
        }

        const nuevoPerfil: UsuarioPerfil = {
          ...perfil,
          nombre: payload.nombre.trim(),
          apellido: payload.apellido.trim(),
          telefono: payload.telefono.trim(),
        };
        console.log('✅ Perfil actualizado en BD (local):', nuevoPerfil);
        setPerfil(nuevoPerfil);
        setLoading(false);
        return { ok: true, error: null };
      } catch (err: any) {
        console.error('Error al guardar perfil:', err);
        const msg =
          err?.message || 'Ocurrió un error inesperado al guardar tu perfil.';
        setError(msg);
        setLoading(false);
        return { ok: false, error: msg };
      }
    },
    [perfil],
  );

  return {
    perfil,
    email,
    loading,
    error,
    setError,
    refetch: cargarPerfil,
    actualizarPerfil,
  };
}


