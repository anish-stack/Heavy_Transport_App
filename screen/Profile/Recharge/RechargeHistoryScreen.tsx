import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { Recharge } from './recharge';
import { API_URL_WEB } from '../../../constant/Api';
import ErrorView from '../../../components/Error/ErrorView';
import { EmptyState } from './EmptyState';
import { TransactionCard } from './TransactionCard';
import TopHeadPart from '../../../components/Layout/TopHeadPart';
import { Button } from '../../../components/Button/Button';


export default function RechargeHistoryScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rechargeData, setRechargeData] = useState<Recharge[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchRechargeHistory = useCallback(async () => {
    if (!user?.Bh_Id) {
      throw new Error("User profile not found. Please try again later.");
    }

    const response = await axios.get<{ data: Recharge[] }>(
      `${API_URL_WEB}/api/v1/get-recharge?_id=${user.Bh_Id}`
    );
    return response.data?.data || [];
  }, [user?.Bh_Id]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchRechargeHistory();
      setRechargeData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recharge history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchRechargeHistory]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const sortedRechargeData = useMemo(() =>
    [...rechargeData].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    , [rechargeData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorView
          message={error}
          onRetry={loadData}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TopHeadPart title={'Recharge History'} />
      <Button style={{ marginVertical: 14 }} title='Make A Recharge' route='do_reacharge' />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF385C"]}
            tintColor="#FF385C"
          />
        }
      >
        {sortedRechargeData.length > 0 ? (
          sortedRechargeData.map((recharge) => (
            <TransactionCard
              key={recharge._id}
              recharge={recharge}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});