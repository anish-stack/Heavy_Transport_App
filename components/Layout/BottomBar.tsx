import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, Sizes } from '../../constant/Colors';
import { useNavigation } from '@react-navigation/native';

export default function BottomBar() {
    const navigation = useNavigation()
    return (
        <View style={styles.bottomBar}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.bottomBarItem}>
                <Icon name="home" size={Sizes.iconSizeMedium} color={COLORS.white} />
                <Text style={styles.bottomBarText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Recharge')} style={styles.bottomBarItem}>
                <Icon name="card-outline" size={Sizes.iconSizeMedium} color={COLORS.white} />
                <Text style={styles.bottomBarText}>Recharge</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('unlock-coupons')} style={styles.bottomBarItem}>
                <Icon name="gift" size={Sizes.iconSizeMedium} color={COLORS.white} />
                <Text style={styles.bottomBarText}>Unlock Coupons</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('request-for-you')} style={styles.bottomBarItem}>
                <Icon name="call" size={Sizes.iconSizeMedium} color={COLORS.white} />
                <Text style={styles.bottomBarText}>Calls</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.bottomBarItem}>
                <Icon name="person" size={Sizes.iconSizeMedium} color={COLORS.white} />
                <Text style={styles.bottomBarText}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: COLORS.darkSecondary,
        paddingVertical: Sizes.spacingMedium,
    },
    bottomBarItem: {
        alignItems: 'center',
    },
    bottomBarText: {
        fontSize: Sizes.sm,
        color: COLORS.white,
    },
});
