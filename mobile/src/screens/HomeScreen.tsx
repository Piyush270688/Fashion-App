import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import CategoryChip from '../components/CategoryChip';
import { useWishlistStore } from '../store/wishlistStore';

export default function HomeScreen({ navigation }: any) {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { items: wishlist, isInWishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [featuredRes, catRes] = await Promise.all([
        api.get('/products/featured'),
        api.get('/categories'),
      ]);
      setFeatured(featuredRes.data);
      setCategories(catRes.data);
      await fetchWishlist();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: number) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Discover</Text>
          <Text style={styles.title}>Fashion Collection</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="bag-outline" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            label={cat.name}
            selected={false}
            onPress={() => navigation.navigate('Catalog', { categoryId: cat.id, categoryName: cat.name })}
          />
        ))}
      </ScrollView>

      {/* Featured */}
      <Text style={styles.sectionTitle}>Featured</Text>
      <View style={styles.grid}>
        {featured.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() => navigation.navigate('Product', { productId: product.id })}
            onWishlist={() => toggleWishlist(product.id)}
            isWishlisted={isInWishlist(product.id)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.viewAllBtn}
        onPress={() => navigation.navigate('Catalog', {})}
      >
        <Text style={styles.viewAllText}>View All Products</Text>
        <Ionicons name="arrow-forward" size={16} color="#1a1a1a" />
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
  },
  greeting: { fontSize: 14, color: '#999' },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginTop: 2 },
  sectionTitle: {
    fontSize: 18, fontWeight: '700', color: '#1a1a1a',
    paddingHorizontal: 16, marginTop: 20, marginBottom: 12,
  },
  chipRow: { paddingHorizontal: 16 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16,
  },
  viewAllBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 14, marginHorizontal: 16, marginTop: 8,
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    gap: 6,
  },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
});
