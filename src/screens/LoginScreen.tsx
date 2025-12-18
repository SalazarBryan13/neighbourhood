import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabaseClient";



const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Limpiar errores previos
    setError(null);
    
    if (!email || !password) {
      const errorMsg = "Por favor llena todos los campos";
      setError(errorMsg);
      Alert.alert("Error", errorMsg);
      return;
    }

    setLoading(true);
    console.log("Intentando login con:", { email });

    try {
      // Llamar a Supabase para validar el login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      console.log("Respuesta login:", { data, error });

      if (error) {
        let errorMessage = error.message;
        
        // Mensaje más claro si el email no está confirmado
        if (error.message.includes("email") && (error.message.includes("confirm") || error.message.includes("verified"))) {
          errorMessage = "Tu email no ha sido confirmado. Por favor verifica tu correo electrónico o contacta al administrador.";
        } else if (error.message.includes("Invalid login")) {
          errorMessage = "Correo o contraseña incorrectos. Por favor verifica tus credenciales.";
        }
        
        setError(errorMessage);
        Alert.alert("Error al iniciar sesión", errorMessage);
        setLoading(false);
        return;
      }

      console.log("Usuario logueado:", data.user);
      setError(null);

      navigation.navigate("Tabs" as never); // Ir al inicio después del login
    } catch (err: any) {
      console.error("Error catch en login:", err);
      const errorMsg = `Error inesperado: ${err?.message || err?.toString() || "Ocurrió un error inesperado"}`;
      setError(errorMsg);
      Alert.alert("Error inesperado", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Entrar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
    width: "100%",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
});