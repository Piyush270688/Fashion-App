import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    quantity: number;
    size: string;
  };
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export default function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.size}>Size: {item.size}</Text>
        <Text style={styles.price}>Rs. {item.price.toLocaleString()}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.qtyBtn} onPress={onDecrement}>
            <Ionicons name="remove" size={16} color="#333" />
          </TouchableOpacity>
          <Text style={styles.qty}>{item.quantity}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={onIncrement}>
            <Ionicons name="add" size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={18} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  size: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qty: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  removeBtn: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
});
