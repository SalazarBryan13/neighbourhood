import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const PedidosScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Pedidos</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 18,
    color: '#000000',
  },
});

export default PedidosScreen;

