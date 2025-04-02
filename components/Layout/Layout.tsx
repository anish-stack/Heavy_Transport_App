import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBar from './BottomBar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { scale, moderateScale } from 'react-native-size-matters';

export default function Layout({ children, onRefresh ,isHeaderShow=true,isBottomBarShow=true }) {
    const { user,getToken } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Handle refresh action
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        
        try {
      
            // Call the onRefresh prop if provided
            if (typeof onRefresh === 'function') {
                await onRefresh();
               
            }
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            // End refreshing state after a slight delay for better UX
            setTimeout(() => {
                setRefreshing(false);
            }, 1000);
        }
    }, [onRefresh]);

    return (
        <SafeAreaView style={styles.container}>
            {isHeaderShow && (

            <Header
                name={user?.name || 'Guest'}
                onMenuPress={() => setIsSidebarOpen(true)}
            />
            )}
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                style={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#2563EB']} // Primary color for Android
                        tintColor={'#2563EB'} // For iOS
                        title={'Pull to refresh...'} // Only on iOS
                        progressBackgroundColor={'#F3F4F6'} // Only on Android
                    />
                }
            >
                {children}
            </ScrollView>
            {isBottomBarShow && (
            <BottomBar />
            )}
            <Sidebar
                name={user?.name || 'Guest'}
                email={user?.email || 'email@gmail.com'}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    contentContainer: {
        flex: 1,
        // padding: moderateScale(10),
    },
});