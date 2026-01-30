import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo profesional de tienda */}
        <View style={styles.logoContainer}>
          {/* Círculo exterior con gradiente simulado */}
          <View style={styles.logoOuterRing}>
            <View style={styles.logoOuterRingInner} />
          </View>
          
          {/* Círculo principal */}
          <View style={styles.logoMainCircle}>
            {/* Círculo interno con borde */}
            <View style={styles.logoInnerCircle}>
              {/* Ícono principal de tienda profesional */}
              <View style={styles.logoIconContainer}>
                <FontAwesome5 name="store" size={50} color="#FFFFFF" solid />
                {/* Detalle decorativo en el ícono */}
                <View style={styles.logoIconAccent}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                </View>
              </View>
            </View>
          </View>
          
          {/* Elementos decorativos alrededor */}
          <View style={[styles.logoDecorative, styles.logoDecorative1]}>
            <MaterialIcons name="shopping-bag" size={18} color="#4CAF50" />
          </View>
          <View style={[styles.logoDecorative, styles.logoDecorative2]}>
            <MaterialIcons name="location-on" size={18} color="#4CAF50" />
          </View>
          <View style={[styles.logoDecorative, styles.logoDecorative3]}>
            <MaterialIcons name="favorite" size={18} color="#4CAF50" />
          </View>
          <View style={[styles.logoDecorative, styles.logoDecorative4]}>
            <MaterialIcons name="local-shipping" size={18} color="#4CAF50" />
          </View>
        </View>

        {/* Título principal */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>NeighborHub</Text>
          <View style={styles.titleUnderline} />
        </View>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          Conecta con tu comunidad local
        </Text>
        <Text style={styles.description}>
          Descubre tiendas cercanas, productos locales y apoya a tu vecindario
        </Text>

        {/* Botones de acción */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("RoleSelection" as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Comenzar</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Login" as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  logoContainer: {
    position: "relative",
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    width: 220,
    height: 220,
  },
  logoOuterRing: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoOuterRingInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#F1F8E9",
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  logoMainCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
    position: "relative",
    overflow: "hidden",
  },
  logoInnerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoIconContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  logoIconAccent: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  logoDecorative: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2.5,
    borderColor: "#E8F5E9",
  },
  logoDecorative1: {
    top: 0,
    right: 10,
  },
  logoDecorative2: {
    bottom: 0,
    left: 10,
  },
  logoDecorative3: {
    top: 60,
    right: -8,
  },
  logoDecorative4: {
    bottom: 60,
    left: -8,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 20,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#666666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 48,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
});
