import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ErrorViewProps {
    message: string;
    onRetry: () => void;
}

const ErrorView = memo(({ message, onRetry }: ErrorViewProps) => (
    <View style={styles.container}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#FF385C" />
        <Text style={styles.text}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={onRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
    </View>
));

ErrorView.displayName = 'ErrorView';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: 20,
    },
    text: {
        marginTop: 16,
        marginBottom: 24,
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        lineHeight: 24,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: "#FF385C",
        borderRadius: 8,
        elevation: 2,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ErrorView;