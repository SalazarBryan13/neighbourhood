import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../lib/supabaseClient";

interface RouteParams {
  role: "vecino" | "tiendero";
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { role } = (route.params as RouteParams) || { role: "vecino" };

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    console.log("Validando formulario...", { nombre, apellido, telefono, correo, contraseña: contraseña ? "***" : "" });
    
    if (!nombre.trim()) {
      console.log("Error: nombre vacío");
      Alert.alert("Error", "Por favor ingresa tu nombre");
      return false;
    }
    if (!apellido.trim()) {
      console.log("Error: apellido vacío");
      Alert.alert("Error", "Por favor ingresa tu apellido");
      return false;
    }
    if (!telefono.trim()) {
      console.log("Error: teléfono vacío");
      Alert.alert("Error", "Por favor ingresa tu teléfono");
      return false;
    }
    if (!correo.trim()) {
      console.log("Error: correo vacío");
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return false;
    }
    if (!correo.includes("@")) {
      console.log("Error: correo inválido");
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido");
      return false;
    }
    if (!contraseña || contraseña.length < 6) {
      console.log("Error: contraseña inválida");
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 6 caracteres"
      );
      return false;
    }
    console.log("Validación exitosa");
    return true;
  };

  const handleRegister = async () => {
    console.log("=== handleRegister INICIADO ===");
    console.log("Estado actual:", { nombre, apellido, telefono, correo, role, loading });
    
    // Limpiar errores previos
    setError(null);
    
    if (!validateForm()) {
      console.log("Validación falló");
      return;
    }

    console.log("Iniciando registro...", { correo, role });
    setLoading(true);

    try {
      // 1. Crear usuario en Supabase Auth
      console.log("Creando usuario en auth...");
      console.log("URL Supabase:", process.env.EXPO_PUBLIC_SUPABASE_URL ? "Configurado" : "NO CONFIGURADO");
      
      // Pasar los datos del formulario en metadata para que el trigger pueda usarlos
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: correo,
          password: contraseña,
          options: {
            data: {
              nombre: nombre.trim(),
              apellido: apellido.trim(),
              telefono: telefono.trim(),
              rol: role,
            }
          }
        });

      console.log("Respuesta auth completa:", JSON.stringify({ authData, authError }, null, 2));

      if (authError) {
        console.error("Error en auth:", authError);
        const errorMsg = `Error al registrar: ${authError.message}`;
        setError(errorMsg);
        Alert.alert("Error al registrar", authError.message);
        setLoading(false);
        return;
      }

      // Verificar si se requiere confirmación de email
      if (authData.user && !authData.session) {
        console.log("Usuario creado pero requiere confirmación de email");
        console.log("Esperando confirmación automática del email...");
        // Esperar un momento para que el trigger confirme el email
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Intentar hacer login automáticamente después de la confirmación
        console.log("Intentando login automático después de confirmación...");
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: correo,
          password: contraseña,
        });
        
        if (loginError) {
          console.log("Login automático falló, el usuario deberá hacer login manualmente:", loginError.message);
        } else {
          console.log("Login automático exitoso!");
        }
      }

      if (!authData.user) {
        console.error("No se recibió user de auth");
        const errorMsg = "No se pudo crear el usuario. Verifica tu conexión a internet y las credenciales de Supabase.";
        setError(errorMsg);
        Alert.alert("Error", errorMsg);
        setLoading(false);
        return;
      }

      console.log("Usuario creado en auth, ID:", authData.user.id);

      // 2. Crear registro en la tabla usuario
      console.log("Creando registro en tabla usuario...");
      const usuarioData = {
        id: authData.user.id, // UUID de auth.users (FK)
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        rol: role, // "vecino" o "tiendero"
      };
      
      console.log("Datos a insertar:", usuarioData);
      
      const { data: usuarioInsertData, error: usuarioError } = await supabase
        .from("usuario")
        .insert(usuarioData)
        .select();

      console.log("Respuesta insert usuario:", { usuarioInsertData, usuarioError });

      if (usuarioError) {
        console.error("Error al insertar en usuario:", usuarioError);
        const errorMsg = `Error al crear perfil: ${usuarioError.message || JSON.stringify(usuarioError)}`;
        setError(errorMsg);
        Alert.alert(
          "Error al crear perfil",
          usuarioError.message || "No se pudo crear el perfil de usuario. Detalles: " + JSON.stringify(usuarioError)
        );
        setLoading(false);
        return;
      }

      console.log("Registro exitoso!");
      
      // Redirigir automáticamente a Login después del registro exitoso
      Alert.alert(
        "Registro exitoso",
        "Tu cuenta ha sido creada correctamente. Redirigiendo al login...",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Login" as never);
            },
          },
        ]
      );
      
      // Redirigir automáticamente después de 1.5 segundos
      setTimeout(() => {
        navigation.navigate("Login" as never);
      }, 1500);
    } catch (error: any) {
      console.error("Error catch:", error);
      const errorMsg = `Error inesperado: ${error?.message || error?.toString() || "Ocurrió un error inesperado"}`;
      setError(errorMsg);
      Alert.alert(
        "Error inesperado", 
        error?.message || error?.toString() || "Ocurrió un error inesperado. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Completa el formulario para registrarte como {role === "vecino" ? "Vecino" : "Tiendero"}
          </Text>

          <View style={styles.form}>
            <TextInput
              placeholder="Nombre"
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
              autoCapitalize="words"
            />

            <TextInput
              placeholder="Apellido"
              value={apellido}
              onChangeText={setApellido}
              style={styles.input}
              autoCapitalize="words"
            />

            <TextInput
              placeholder="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              style={styles.input}
              keyboardType="phone-pad"
            />

            <TextInput
              placeholder="Correo electrónico"
              value={correo}
              onChangeText={setCorreo}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Contraseña"
              value={contraseña}
              onChangeText={setContraseña}
              style={styles.input}
              secureTextEntry
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Registrarse</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate("Login" as never)}
            >
              <Text style={styles.loginLinkText}>
                ¿Ya tienes cuenta? Inicia sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 32,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#000000",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 24,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#4CAF50",
    textDecorationLine: "underline",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
});

