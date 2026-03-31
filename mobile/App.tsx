import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FASHION</Text>
      <Text style={styles.subtitle}>App is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: 6 },
  subtitle: { fontSize: 16, color: '#999', marginTop: 8 },
});
