
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { usePerfilUsuario } from '../hooks/usePerfilUsuario';
import { supabase } from '../lib/supabaseClient';

const PerfilScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    perfil,
    email,
    loading,
    error,
    setError,
    actualizarPerfil,
  } = usePerfilUsuario();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (perfil) {
      setNombre(perfil.nombre || '');
      setApellido(perfil.apellido || '');
      setTelefono(perfil.telefono || '');
      setRol(perfil.rol || '');
    }
  }, [perfil]);

  const handleGuardar = async () => {
    if (!perfil) return;

    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Datos incompletos', 'Nombre y apellido son obligatorios.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    const { ok, error: updateError } = await actualizarPerfil({
      nombre,
      apellido,
      telefono,
    });

    if (ok) {
      setSuccess('Perfil actualizado correctamente.');
    } else if (updateError) {
      setError(updateError);
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      (navigation as any).reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      Alert.alert('Error', 'No se pudo cerrar la sesión. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.nombreCompleto}>
              {nombre || apellido ? `${nombre} ${apellido}` : 'Tu perfil'}
            </Text>
            {email ? <Text style={styles.email}>{email}</Text> : null}
            {rol ? (
              <View style={styles.rolBadge}>
                <Text style={styles.rolText}>{rol}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información personal</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            value={apellido}
            onChangeText={setApellido}
            placeholder="Apellido"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Teléfono"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledText}>
              {email || 'Sin correo configurado'}
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.messageError}>
            <MaterialIcons name="error-outline" size={18} color="#D32F2F" />
            <Text style={styles.messageErrorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.messageSuccess}>
            <MaterialIcons name="check-circle" size={18} color="#2E7D32" />
            <Text style={styles.messageSuccessText}>{success}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleGuardar}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#757575',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  nombreCompleto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  rolBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rolText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#616161',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
    color: '#000000',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
  },
  disabledText: {
    fontSize: 15,
    color: '#757575',
  },
  messageError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  messageErrorText: {
    fontSize: 13,
    color: '#D32F2F',
    flex: 1,
  },
  messageSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  messageSuccessText: {
    fontSize: 13,
    color: '#2E7D32',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 10,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
});

export default PerfilScreen;
