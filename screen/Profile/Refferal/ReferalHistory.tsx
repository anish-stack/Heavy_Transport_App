import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    RefreshControl,
    Linking,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Share, MessageSquare } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

// Types
interface UserData {
    [key: string]: ReferralData[];
}

interface ReferralData {
    name: string;
    myReferral: string;
    number: string;
    member_id?: {
        title: string;
    };
    category?: {
        title: string;
    };
    plan_status: boolean;
}

interface Props {
    user: {
        Bh_Id: string;
    };
}

const LEVELS = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5', 'Level6', 'Level7'] as const;
type Level = typeof LEVELS[number];

export default function ReferralHistory() {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [activeLevelTab, setActiveLevelTab] = useState<Level>('Level1');
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth()

    const fetchReferralData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post('https://www.webapi.olyox.com/api/v1/getProviderDetailsByBhId', {
                BhId: user?.Bh_Id
            });
            if (data.data) {
                console.log("I am", data.data)
                setUserData(data.data);
            }
        } catch (err) {
            setError('Failed to fetch referral data. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, [user]);

    const handleShareOnWhatsApp = async () => {

        const message = `Join using my referral code: ${user.Bh_Id}`;
        const whatsappUrl = Platform.select({
            ios: `whatsapp://send?text=${encodeURIComponent(message)}`,
            android: `whatsapp://send?text=${encodeURIComponent(message)}`,
            web: `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`
        });
        try {
            const canOpen = await Linking.canOpenURL(whatsappUrl!);
            if (canOpen) {
                await Linking.openURL(whatsappUrl!);
            } else {
                throw new Error('WhatsApp not installed');
            }
        } catch (err) {
            console.log(err)
            setError('Unable to open WhatsApp. Please make sure it is installed.');
        }
    };

    const ReferralCard = ({ item, index }: { item: ReferralData; index: number }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.badgeContainer}>
                    <Share size={18} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Referral #{index + 1}</Text>
            </View>

            <View style={styles.cardContent}>
                <InfoRow icon={<MessageSquare size={18} color="#007bff" />} label="Name" value={item.name} />
                <InfoRow icon={<Share size={18} color="#28a745" />} label="BHID" value={item.myReferral} />
                <InfoRow icon={<MessageSquare size={18} color="#ff5722" />} label="Phone" value={item.number} />
                <InfoRow
                    icon={<MessageSquare size={18} color="#3f51b5" />}
                    label="Plan"
                    value={item.member_id?.title || 'Recharge Not Done'}
                />
                <InfoRow
                    icon={<MessageSquare size={18} color="#3f51b5" />}
                    label="Category"
                    value={item.category?.title || 'N/A'}
                />
            </View>

            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, item.plan_status ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={styles.statusText}>
                        {item.plan_status ? 'Active' : 'Inactive'}
                    </Text>
                </View>
            </View>
        </View>
    );

    const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
        <View style={styles.cardRow}>
            {icon}
            <Text style={styles.cardLabel}>{label}:</Text>
            <Text style={styles.cardText}>{value || 'N/A'}</Text>
        </View>
    );

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop' }}
                style={styles.emptyImage}
            />
            <Text style={styles.emptyText}>No referrals found for {activeLevelTab}</Text>
            <TouchableOpacity style={styles.button} onPress={fetchReferralData}>
                <Share size={16} color="#fff" />
                <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Share size={24} color="#007bff" />
                <Text style={styles.heading}>Referral History</Text>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShareOnWhatsApp}
                >
                    <Share size={20} color="#fff" />
                    <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabScrollView}
                contentContainerStyle={styles.tabContainer}
            >
                {LEVELS.map((level) => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.tabButton, activeLevelTab === level && styles.activeTabButton]}
                        onPress={() => setActiveLevelTab(level)}
                    >
                        <Text style={[styles.tabText, activeLevelTab === level && styles.activeTabText]}>
                            {level}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loaderText}>Loading referrals...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={fetchReferralData}
                            colors={['#007bff']}
                        />
                    }
                >
                    {userData && userData[activeLevelTab]?.length > 0 ? (
                        userData[activeLevelTab].map((item, index) => (
                            <ReferralCard key={index} item={item} index={index} />
                        ))
                    ) : (
                        <EmptyState />
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    shareButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    tabScrollView: {
        maxHeight: 60,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
    },
    activeTabButton: {
        backgroundColor: '#007bff',
    },
    tabText: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        padding: 15,
        paddingBottom: 30,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#f9f9f9',
    },
    badgeContainer: {
        backgroundColor: '#007bff',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardContent: {
        padding: 15,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        marginLeft: 8,
        width: 70,
    },
    cardText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    cardFooter: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    activeBadge: {
        backgroundColor: '#28a745',
    },
    inactiveBadge: {
        backgroundColor: '#dc3545',
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    emptyImage: {
        width: 300,
        height: 300,
        resizeMode: 'cover',
        marginBottom: 20,
        borderRadius: 12,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
    },
});