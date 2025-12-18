import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

type RoleType = "vecino" | "tiendero" | null;

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedRole, setSelectedRole] = React.useState<RoleType>(null);

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }
    navigation.navigate("Register" as never, { role: selectedRole } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¿Cómo usarás la app?</Text>
        <Text style={styles.subtitle}>
          Tu selección personaliza la experiencia en NeighborHub.
        </Text>

        <View style={styles.cardsContainer}>
          {/* Card Vecino */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === "vecino" && styles.cardSelected,
            ]}
            onPress={() => setSelectedRole("vecino")}
          >
            <MaterialIcons
              name="home"
              size={32}
              color={selectedRole === "vecino" ? "#2E7D32" : "#4CAF50"}
              style={styles.cardIcon}
            />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Soy un Vecino</Text>
              <Text style={styles.cardDescription}>
                Para descubrir tiendas, ver catálogos y hacer pedidos.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card Tiendero */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedRole === "tiendero" && styles.cardSelected,
            ]}
            onPress={() => setSelectedRole("tiendero")}
          >
            <MaterialIcons
              name="storefront"
              size={32}
              color={selectedRole === "tiendero" ? "#2E7D32" : "#4CAF50"}
              style={styles.cardIcon}
            />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Soy una Tienda</Text>
              <Text style={styles.cardDescription}>
                Para gestionar mi catálogo, recibir pedidos y conectar con
                vecinos.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedRole && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole}
        >
          <Text style={styles.continueButtonText}>Continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.learnMoreLink}>
          <Text style={styles.learnMoreText}>
            ¿No estás seguro?{" "}
            <Text style={styles.learnMoreLinkText}>Aprende más</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#2E7D32",
    marginBottom: 32,
    textAlign: "center",
  },
  cardsContainer: {
    marginBottom: 32,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  cardSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#F1F8F4",
  },
  cardIcon: {
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#2E7D32",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  learnMoreLink: {
    alignItems: "center",
  },
  learnMoreText: {
    fontSize: 14,
    color: "#2E7D32",
  },
  learnMoreLinkText: {
    textDecorationLine: "underline",
  },
});

