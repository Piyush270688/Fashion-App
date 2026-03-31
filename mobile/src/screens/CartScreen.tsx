import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CartItemComponent from '../components/CartItem';
import { useCartStore } from '../store/cartStore';

export default function CartScreen({ navigation }: any) {
  const { items, total, loading, fetchCart, updateQuantity, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="bag-outline" size={64} color="#ddd" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add items to get started</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('CatalogTab')}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CartItemComponent
            item={item}
            onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
            onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
            onRemove={() => removeItem(item.id)}
          />
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>Rs. {total.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={[styles.summaryValue, { color: '#27ae60' }]}>FREE</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 4 },
  shopBtn: {
    marginTop: 20, backgroundColor: '#1a1a1a', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12,
  },
  shopBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  list: { padding: 16 },
  summary: {
    backgroundColor: '#fff', padding: 20, paddingBottom: 34,
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#999' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#1a1a1a' },
  checkoutBtn: {
    flexDirection: 'row', backgroundColor: '#1a1a1a', height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 8,
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
