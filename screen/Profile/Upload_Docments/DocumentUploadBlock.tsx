import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Document, DocumentType } from './documents';

interface Props {
  title: DocumentType;
  document?: Document;
  onUpload: (type: DocumentType) => void;
  disabled?: boolean;
}

export function DocumentUploadBlock({ title, document, onUpload, disabled }: Props) {
  const getStatusColor = () => {
    switch (document?.document_status) {
      case 'Approved':
        return '#22c55e';
      case 'Rejected':
        return '#ef4444';
      case 'Pending':
        return '#f59e0b';
      default:
        return '#94a3b8';
    }
  };

  const getStatusIcon = () => {
    switch (document?.document_status) {
      case 'Approved':
        return <Feather name='check-circle' size={24} color="#22c55e" />;
      case 'Rejected':
        return <Feather name='x' size={24} color="#ef4444" />;
      case 'Pending':
        return <Feather name='clock' size={24} color="#f59e0b" />;
      default:
        return <Feather name='upload' size={24} color="#94a3b8" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {document && (
          <View style={[styles.status, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {document.document_status}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={[
          styles.uploadArea,
          disabled && styles.disabled
        ]}
        onPress={() => !disabled && onUpload(title)}
        disabled={disabled}
      >
        {document?.documentFile ? (
          <Image 
            source={{ uri: document.documentFile }}
            style={styles.preview}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholder}>
            {getStatusIcon()}
            <Text style={styles.uploadText}>
              {disabled ? 'Document Verified' : 'Upload Document'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {document?.reject_reason && (
        <Text style={styles.errorText}>{document.reject_reason}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  uploadArea: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#ef4444',
  },
});