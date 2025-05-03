import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

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
interface MenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    route?: string;
}

const menuItems: MenuItem[] = [
    { icon: 'home', label: 'Home', route: 'Home' },
    { icon: 'calendar', label: 'Profile', route: 'Profile' },
    { icon: 'car', label: 'Recharge', route: 'Recharge' },
    { icon: 'person', label: 'Refferal', route: 'Refferal' },
    { icon: 'settings', label: 'Call Request', route: 'request-for-you' },
    { icon: 'settings', label: 'Withdraw', route: 'Withdraw' },
    { icon: 'help-circle', label: 'Help', route: 'Help' },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose, name, email, imagesUIser }: SidebarProps) {
    const navigation = useNavigation();
    const { deleteToken } = useAuth()
    const translateX = useRef(new Animated.Value(-300)).current;
    const overlayOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(translateX, {
                toValue: isOpen ? 0 : -300,
                useNativeDriver: true,
                damping: 20,
                stiffness: 90,
            }),
            Animated.timing(overlayOpacity, {
                toValue: isOpen ? 0.5 : 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isOpen]);

    const handleNavigation = (route?: string) => {
        if (route) {
            navigation.navigate(route as never);
            onClose();
        }
    };

    const handleLogout = async () => {
        await deleteToken()
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'login' },
                ],
            })
        );
    }

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <Animated.View
                style={[
                    styles.overlay,
                    { opacity: overlayOpacity }
                ]}>
                <TouchableOpacity
                    style={styles.overlayTouch}
                    onPress={onClose}
                    activeOpacity={1}
                />
            </Animated.View>

            <Animated.View
                style={[
                    styles.sidebar,
                    { transform: [{ translateX }] }
                ]}>
                <View style={styles.header}>
                    <Image
                        source={{ uri: imagesUIser ? imagesUIser : 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400' }}
                        style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{name}</Text>
                        <Text style={styles.userEmail}>{email}</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={() => handleNavigation(item.route)}>
                            <Ionicons name={item.icon} size={24} color={colors.gray} />
                            <Text style={styles.menuText}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity onPress={() => handleLogout()} style={styles.logoutButton}>
                    <Ionicons name="log-out" size={24} color={colors.error} />
                    <Text style={[styles.menuText, { color: colors.error }]}>Logout</Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.black,
        zIndex: 1,
    },
    overlayTouch: {
        flex: 1,
    },
    sidebar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 300,
        backgroundColor: colors.white,
        zIndex: 2,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: colors.black,
        shadowOffset: {
            width: 2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.black,
    },
    userEmail: {
        fontSize: 14,
        color: colors.gray,
        marginTop: 2,
    },
    menuContainer: {
        flex: 1,
        paddingTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingLeft: 20,
    },
    menuText: {
        fontSize: 16,
        marginLeft: 15,
        color: colors.gray,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});