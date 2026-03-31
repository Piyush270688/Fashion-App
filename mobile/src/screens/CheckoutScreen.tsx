import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { useCartStore } from '../store/cartStore';

export default function CheckoutScreen({ navigation }: any) {
  const { items, total } = useCartStore();
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const handlePlaceOrder = async () => {
    if (!address.trim() || !city.trim() || !pincode.trim() || !phone.trim()) {
      Alert.alert('Error', 'Please fill in all address fields');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = `${address}, ${city} - ${pincode}\nPhone: ${phone}`;
      const { data } = await api.post('/orders', { shipping_address: shippingAddress });
      setOrderId(data.orderId);
      setOrderPlaced(true);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#27ae60" />
        </View>
        <Text style={styles.successTitle}>Order Confirmed!</Text>
        <Text style={styles.successText}>Order #{orderId} has been placed successfully.</Text>
        <Text style={styles.successSubtext}>You will receive a confirmation shortly.</Text>

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Street Address"
          value={address}
          onChangeText={setAddress}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
          placeholderTextColor="#aaa"
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="numeric"
            placeholderTextColor="#aaa"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#aaa"
          />
        </View>

        <Text style={styles.sectionTitle}>Order Summary</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.name} ({item.size}) x{item.quantity}
            </Text>
            <Text style={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</Text>
          </View>
        ))}

        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder} disabled={loading}>
          <Text style={styles.placeBtnText}>{loading ? 'Placing Order...' : 'Place Order'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  scroll: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, marginTop: 8 },
  input: {
    height: 50, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    paddingHorizontal: 16, fontSize: 15, marginBottom: 12, backgroundColor: '#fff', color: '#333',
  },
  row: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: { flex: 1, fontSize: 14, color: '#666', marginRight: 8 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#1a1a1a' },
  bottomBar: {
    padding: 16, paddingBottom: 34, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  placeBtn: {
    height: 52, backgroundColor: '#1a1a1a', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  placeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 32 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  successText: { fontSize: 16, color: '#666', marginTop: 8 },
  successSubtext: { fontSize: 14, color: '#999', marginTop: 4 },
  continueBtn: {
    marginTop: 32, backgroundColor: '#1a1a1a', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12,
  },
  continueBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
