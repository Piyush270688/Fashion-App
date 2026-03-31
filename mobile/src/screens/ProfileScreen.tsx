import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import OrderCard from '../components/OrderCard';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Wishlist')}>
          <Ionicons name="heart-outline" size={22} color="#e74c3c" />
          <Text style={styles.actionLabel}>Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="bag-outline" size={22} color="#3498db" />
          <Text style={styles.actionLabel}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#666" />
          <Text style={styles.actionLabel}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Orders */}
      <Text style={styles.sectionTitle}>Order History</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1a1a1a" style={{ marginTop: 20 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyOrders}>
          <Ionicons name="receipt-outline" size={40} color="#ddd" />
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, backgroundColor: '#fff' },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#1a1a1a',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginTop: 12 },
  email: { fontSize: 14, color: '#999', marginTop: 2 },
  actionsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  actionCard: { alignItems: 'center', gap: 4 },
  actionLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: '#1a1a1a',
    paddingHorizontal: 16, marginTop: 24, marginBottom: 12,
  },
  emptyOrders: { alignItems: 'center', paddingTop: 32 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 8 },
});
