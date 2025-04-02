import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, Sizes } from '../../constant/Colors';

export default function BottomBar() {
    return (
        <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.bottomBarItem}>
                <Icon name="home" size={Sizes.iconSizeMedium} color={COLORS.white} />
                <Text style={styles.bottomBarText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBarItem}>
                <Icon name="search" size={Sizes.iconSizeMedium} color={COLORS.white} />
                <Text style={styles.bottomBarText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBarItem}>
                <Icon name="add" size={Sizes.iconSizeMedium} color={COLORS.white} />
                <Text style={styles.bottomBarText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomBarItem}>
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
