import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const colors = {
    primary: '#2563EB',
    secondary: '#3B82F6',
    background: '#F3F4F6',
    white: '#FFFFFF',
    black: '#1F2937',
    gray: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
};
interface StatCardProps {
    title: string;
    value: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

export default function StatCard({ title, value, icon, color }: StatCardProps) {
    return (
        <View style={[styles.container, { borderLeftColor: color }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        width: '50%',
        borderLeftWidth: 4,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.black,
        marginBottom: 4,
    },
    title: {
        fontSize: 12,
        color: colors.gray,
    },
});