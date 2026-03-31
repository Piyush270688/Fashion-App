import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';

export default function WishlistScreen({ navigation }: any) {
  const { items, loading, fetchWishlist, removeFromWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleMoveToCart = async (item: any) => {
    await addToCart(item.product_id, 'M');
    await removeFromWishlist(item.product_id);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={64} color="#ddd" />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptyText}>Save items you love for later</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={items}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() => navigation.navigate('Product', { productId: item.product_id })}
          >
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.category}>{item.category_name}</Text>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.price}>Rs. {item.price.toLocaleString()}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#f1c40f" />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.moveBtn} onPress={() => handleMoveToCart(item)}>
              <Ionicons name="bag-add-outline" size={16} color="#fff" />
              <Text style={styles.moveBtnText}>Move to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeFromWishlist(item.product_id)}
            >
              <Ionicons name="close" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#999', marginTop: 4 },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardContent: { flexDirection: 'row', padding: 12 },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  category: { fontSize: 10, color: '#999', textTransform: 'uppercase' },
  name: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
  rating: { fontSize: 11, color: '#666' },
  actions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    paddingHorizontal: 12, paddingVertical: 8, gap: 8,
  },
  moveBtn: {
    flex: 1, flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 8,
    paddingVertical: 8, justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  moveBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  removeBtn: {
    width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center',
  },
});
