import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { DocumentUploadBlock } from './DocumentUploadBlock';
import { Document, DocumentType } from './documents';
import { useAuth } from '../../../context/AuthContext';
import { API_URL_APP_LOCAL } from '../../../constant/Api';
import Layout from '../../../components/Layout/Layout';

const DOCUMENT_TYPES: DocumentType[] = [
    'Registration',
    'Insurance',
    'Permit',
    'Pollution Certificate',
    'License',
    'Aadhar'
];

export function Upload_Docments() {
    const { user, token, getToken } = useAuth();
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (documentType: DocumentType) => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert('Permission Required', 'Please allow access to your media library');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
                allowsEditing: true,
            });

            if (result.canceled) return;

            setUploading(true);

            const formData = new FormData();
            formData.append('documentType', documentType);
            formData.append('image', {
                uri: result.assets[0].uri,
                type: 'image/jpeg',
                name: `${documentType.toLowerCase()}.jpg`,
            });

            await axios.post(
                // `http://localhost:7485/api/v1/vehicle-partners/${user.id}/upload-documents`,
                `${API_URL_APP_LOCAL}/heavy/heavy-vehicle-profile-document/${user._id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },

                }
            );
            getToken()
            Alert.alert('Success', 'Document uploaded successfully');
        } catch (error) {
            Alert.alert(
                'Upload Failed',
                'An error occurred while uploading the document. Please check your network connection and try again.',
            );
            console.error('Upload Error:', error);

        } finally {
            setUploading(false);
        }
    };


    const getDocumentByType = (type: DocumentType): Document | undefined => {
        return user.documents.find(doc => doc.documentType === type);
    };

    const isUploadDisabled = (type: DocumentType): boolean => {
        const doc = getDocumentByType(type);
        return doc?.document_status === 'Approved';
    };

    return (
        <Layout>
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    {DOCUMENT_TYPES.map((type) => (
                        <DocumentUploadBlock
                            key={type}
                            title={type}
                            document={getDocumentByType(type)}
                            onUpload={handleUpload}
                            disabled={isUploadDisabled(type) || uploading}
                        />
                    ))}
                </View>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        padding: 16,
    },
});