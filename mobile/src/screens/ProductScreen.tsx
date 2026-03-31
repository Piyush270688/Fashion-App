import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

const { width } = Dimensions.get('window');

export default function ProductScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const [product, setProduct] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const addToCart = useCartStore((s) => s.addToCart);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products/${productId}`);
      setProduct(data);
      const sizes = JSON.parse(data.sizes);
      setSelectedSize(sizes[0] || 'M');

      const recRes = await api.get('/products/recommendations', {
        params: { category_id: data.category_id, exclude_id: data.id },
      });
      setRecommendations(recRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, selectedSize);
      Alert.alert('Added to Cart', `${product.name} (${selectedSize}) added to your cart`);
    } catch {
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const toggleWishlist = async () => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  if (loading || !product) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1a1a1a" /></View>;
  }

  const sizes = JSON.parse(product.sizes);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.image_url }} style={styles.image} />

        <View style={styles.details}>
          <Text style={styles.category}>{product.category_name}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs. {product.price.toLocaleString()}</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#f1c40f" />
              <Text style={styles.rating}>{product.rating}</Text>
            </View>
          </View>

          <Text style={styles.desc}>{product.description}</Text>

          {/* Color */}
          <Text style={styles.label}>Color: <Text style={styles.colorValue}>{product.color}</Text></Text>

          {/* Size selector */}
          <Text style={styles.label}>Select Size</Text>
          <View style={styles.sizeRow}>
            {sizes.map((size: string) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeBtn, selectedSize === size && styles.sizeSelected]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextSelected]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.recSection}>
            <Text style={styles.recTitle}>You Might Also Like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendations.map((rec) => (
                <TouchableOpacity
                  key={rec.id}
                  style={styles.recCard}
                  onPress={() => navigation.push('Product', { productId: rec.id })}
                >
                  <Image source={{ uri: rec.image_url }} style={styles.recImage} />
                  <Text style={styles.recName} numberOfLines={1}>{rec.name}</Text>
                  <Text style={styles.recPrice}>Rs. {rec.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.wishlistBtn} onPress={toggleWishlist}>
          <Ionicons
            name={isInWishlist(product.id) ? 'heart' : 'heart-outline'}
            size={24}
            color={isInWishlist(product.id) ? '#e74c3c' : '#333'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Ionicons name="bag-add-outline" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width, height: width * 1.1, backgroundColor: '#f0f0f0' },
  details: { padding: 20 },
  category: { fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginTop: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  price: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fef9e7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  rating: { fontSize: 14, fontWeight: '600', color: '#333' },
  desc: { fontSize: 14, color: '#666', lineHeight: 22, marginTop: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 20 },
  colorValue: { fontWeight: '400', color: '#666' },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  sizeBtn: {
    minWidth: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12,
  },
  sizeSelected: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  sizeText: { fontSize: 13, color: '#333', fontWeight: '500' },
  sizeTextSelected: { color: '#fff' },
  recSection: { paddingLeft: 20, marginTop: 24 },
  recTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  recCard: { width: 140, marginRight: 12 },
  recImage: { width: 140, height: 170, borderRadius: 10, backgroundColor: '#f0f0f0' },
  recName: { fontSize: 12, color: '#333', marginTop: 6 },
  recPrice: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginTop: 2 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', padding: 16, paddingBottom: 32,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0',
    gap: 12,
  },
  wishlistBtn: {
    width: 52, height: 52, borderRadius: 14, borderWidth: 1, borderColor: '#e0e0e0',
    justifyContent: 'center', alignItems: 'center',
  },
  addBtn: {
    flex: 1, height: 52, backgroundColor: '#1a1a1a', borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
