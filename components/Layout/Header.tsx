import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useNavigation } from '@react-navigation/native';
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
interface HeaderProps {
    name: string;
    onMenuPress: () => void;
}

export default function Header({ name, onMenuPress }: HeaderProps) {

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={onMenuPress}
                style={styles.menuButton}>
                <Ionicons name="menu" size={24} color={colors.black} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
                <Text >Welcome </Text>
                <Text style={styles.name}>{name}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
                <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>3</Text>
                </View>
                <Ionicons name="notifications" size={24} color={colors.black} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuButton: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        marginLeft: 16,
    },
    welcome: {
        fontSize: 14,
        color: colors.gray,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.black,
    },
    notificationButton: {
        padding: 8,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        right: 4,
        top: 4,
        backgroundColor: colors.error,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    badgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: '600',
    },
});