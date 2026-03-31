import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selected: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  label: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  selectedLabel: {
    color: '#fff',
  },
});
