import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import CategoryChip from '../components/CategoryChip';
import { useWishlistStore } from '../store/wishlistStore';

export default function CatalogScreen({ route, navigation }: any) {
  const initialCategory = route.params?.categoryId || null;
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategory);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sort, page]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page, sort, limit: 20 };
      if (selectedCategory) params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();
      const { data } = await api.get('/products', { params });
      if (page === 1) {
        setProducts(data.products);
      } else {
        setProducts((prev) => [...prev, ...data.products]);
      }
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadProducts();
  };

  const toggleWishlist = async (productId: number) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const sortOptions = [
    { key: 'newest', label: 'Newest' },
    { key: 'price_asc', label: 'Price: Low' },
    { key: 'price_desc', label: 'Price: High' },
    { key: 'rating', label: 'Top Rated' },
  ];

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor="#aaa"
          />
        </View>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        <CategoryChip
          label="All"
          selected={!selectedCategory}
          onPress={() => { setSelectedCategory(null); setPage(1); }}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            label={cat.name}
            selected={selectedCategory === cat.id}
            onPress={() => { setSelectedCategory(cat.id); setPage(1); }}
          />
        ))}
      </ScrollView>

      {/* Sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
        {sortOptions.map((opt) => (
          <CategoryChip
            key={opt.key}
            label={opt.label}
            selected={sort === opt.key}
            onPress={() => { setSort(opt.key); setPage(1); }}
          />
        ))}
      </ScrollView>

      {/* Products Grid */}
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#1a1a1a" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('Product', { productId: item.id })}
              onWishlist={() => toggleWishlist(item.id)}
              isWishlisted={isInWishlist(item.id)}
            />
          )}
          onEndReached={() => {
            if (page < totalPages) setPage((p) => p + 1);
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.empty}>No products found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  searchRow: { paddingHorizontal: 16, paddingTop: 8 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0',
    borderRadius: 12, paddingHorizontal: 12, height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#333' },
  chipRow: { paddingHorizontal: 16, marginTop: 12, maxHeight: 40 },
  sortRow: { paddingHorizontal: 16, marginTop: 8, marginBottom: 4, maxHeight: 40 },
  grid: { paddingHorizontal: 16, paddingTop: 12 },
  row: { justifyContent: 'space-between' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
