import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DetailRowProps {
  icon: string;
  text: string;
  color?: string;
}

export const DetailRow = memo(({ 
  icon, 
  text, 
  color = "#666" 
}: DetailRowProps) => (
  <View style={styles.detailRow}>
    <MaterialCommunityIcons name={icon} size={18} color={color} />
    <Text style={[styles.detailText, { color }]}>{text}</Text>
  </View>
));

DetailRow.displayName = 'DetailRow';

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
});