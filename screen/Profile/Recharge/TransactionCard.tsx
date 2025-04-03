import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DetailRow } from './DetailRow';
import { Recharge } from './recharge';
import { formatDate ,formatCurrency } from '../../../utils/formatters';

interface TransactionCardProps {
  recharge: Recharge;
}

export const TransactionCard = memo(({ recharge }: TransactionCardProps) => {
  const statusColor = useMemo(() => 
    recharge.payment_approved ? "#4CAF50" : "#FF9800"
  , [recharge.payment_approved]);

  const statusIcon = useMemo(() => 
    recharge.payment_approved ? "check-circle" : "clock-outline"
  , [recharge.payment_approved]);

  return (
    <View style={styles.container}>
      <View style={[
        styles.statusBadge, 
        { backgroundColor: `${statusColor}20` }
      ]}>
        <MaterialCommunityIcons
          name={statusIcon}
          size={14}
          color={statusColor}
        />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {recharge.payment_approved ? "Approved" : "Pending"}
        </Text>
      </View>

      <View style={styles.cardHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>
            {recharge.member_id?.title || "Subscription Plan"}
          </Text>
          <Text style={styles.validity}>
            {recharge.member_id?.validityDays || "N/A"} {recharge.member_id?.whatIsThis || "days"}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatCurrency(recharge.amount)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <DetailRow 
          icon="calendar-range" 
          text={`Valid till: ${formatDate(recharge.end_date)}`} 
        />
        <DetailRow 
          icon="receipt" 
          text={`Transaction ID: ${recharge.trn_no || "N/A"}`} 
        />
        <DetailRow 
          icon="calendar-clock" 
          text={`Purchased: ${formatDate(recharge.createdAt)}`} 
        />
      </View>
    </View>
  );
});

TransactionCard.displayName = 'TransactionCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  validity: {
    fontSize: 14,
    color: "#666",
  },
  amountContainer: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF385C",
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 16,
  },
  detailsContainer: {
    gap: 12,
  },
});