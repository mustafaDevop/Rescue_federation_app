import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Modal,
    SafeAreaView,
    Platform,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createRequest, getUserRequests, ApiError, getErrorMessage } from '@/hooks/requestInstance'; 
import { useToast } from "react-native-toast-notifications";

type ServiceType = 'Medical Transport' | 'Doctor Appointment' | 'Home Check-up';
type BackendServiceType = 'medical' | 'appointment' | 'checkup';

interface ServiceRequest {
    id: string;
    patientName: string;
    service: ServiceType;
    date: string;
    time: string;
    status: 'pending' | 'accepted' | 'completed';
    address: string;
}

interface BackendRequest {
    _id: string;
    name: string;
    serviceType: BackendServiceType;
    location: string;
    time: string;
    status: 'pending' | 'accepted' | 'completed';
    createdAt: string;
}

export default function PatientRequestScreen() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const toast = useToast();

    const [formData, setFormData] = useState({
        patientName: '',
        service: 'Medical Transport' as ServiceType,
        address: '',
        date: '',
        time: ''
    });

    const serviceOptions: ServiceType[] = [
        'Medical Transport',
        'Doctor Appointment',
        'Home Check-up'
    ];

    // Service type mappings
    const serviceTypeToBackend: Record<ServiceType, BackendServiceType> = {
        'Medical Transport': 'medical',
        'Doctor Appointment': 'appointment',
        'Home Check-up': 'checkup'
    };

    const backendToServiceType: Record<BackendServiceType, ServiceType> = {
        'medical': 'Medical Transport',
        'appointment': 'Doctor Appointment',
        'checkup': 'Home Check-up'
    };

    // Load requests on component mount
    useEffect(() => {
        loadUserRequests();
    }, []);

    const loadUserRequests = async () => {
        try {
            setRefreshing(true);
            
            const response = await getUserRequests();
            
            // Handle different response structures
            let requestsData = response.data?.requests || response.data || response;
            
            if (!Array.isArray(requestsData)) {
                requestsData = [];
            }
            
            // Transform API response to match your UI structure
            const transformedRequests: ServiceRequest[] = requestsData.map((item: BackendRequest) => ({
                id: item._id || Math.random().toString(),
                patientName: item.name || 'Unknown Patient',
                service: backendToServiceType[item.serviceType] || 'Medical Transport',
                date: item.time ? new Date(item.time).toISOString().split('T')[0] : 'N/A',
                time: item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                status: item.status || 'pending',
                address: item.location || 'No address provided'
            }));
            
            setRequests(transformedRequests);
            
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            toast.show(errorMessage, {
                type: 'error',
                placement: 'top'
            });
        } finally {
            setRefreshing(false);
        }
    };

    // Format date as YYYY-MM-DD
    const formatDate = (text: string) => {
        const numbers = text.replace(/\D/g, '');
        if (numbers.length <= 4) {
            return numbers;
        } else if (numbers.length <= 6) {
            return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
        } else {
            return `${numbers.slice(0, 4)}-${numbers.slice(4, 6)}-${numbers.slice(6, 8)}`;
        }
    };

    // Format time as HH:MM
    const formatTime = (text: string) => {
        const numbers = text.replace(/\D/g, '');
        if (numbers.length <= 2) {
            return numbers;
        } else {
            return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
        }
    };

    const handleDateChange = (text: string) => {
        const formatted = formatDate(text);
        setFormData(prev => ({ ...prev, date: formatted }));
    };

    const handleTimeChange = (text: string) => {
        const formatted = formatTime(text);
        setFormData(prev => ({ ...prev, time: formatted }));
    };

    const validateDateTime = (date: string, time: string): boolean => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            toast.show('Please enter date in YYYY-MM-DD format', {
                type: 'warning',
                placement: 'top'
            });
            return false;
        }

        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(time)) {
            toast.show('Please enter time in HH:MM format (24-hour)', {
                type: 'warning',
                placement: 'top'
            });
            return false;
        }

        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
            toast.show('Please enter a valid date', {
                type: 'warning',
                placement: 'top'
            });
            return false;
        }

        const [hours, minutes] = time.split(':').map(Number);
        if (hours > 23 || minutes > 59) {
            toast.show('Please enter a valid time (00:00 - 23:59)', {
                type: 'warning',
                placement: 'top'
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!formData.patientName || !formData.address || !formData.date || !formData.time) {
            toast.show('Please fill in all fields', {
                type: 'warning',
                placement: 'top'
            });
            return;
        }

        if (!validateDateTime(formData.date, formData.time)) {
            return;
        }

        try {
            setSubmitting(true);
            
            // Combine date and time for API
            const dateTimeString = `${formData.date}T${formData.time}:00`;
            const dateTime = new Date(dateTimeString);
            
            if (isNaN(dateTime.getTime())) {
                toast.show('Invalid date/time combination', {
                    type: 'error',
                    placement: 'top'
                });
                return;
            }

            // Map frontend service type to backend expected value
            const backendServiceType = serviceTypeToBackend[formData.service];

            // Map your form data to API expected format
            const apiData = {
                name: formData.patientName,
                serviceType: backendServiceType,
                location: formData.address,
                time: dateTime.toISOString()
            };

            await createRequest(apiData);

            // Reload requests after successful creation
            await loadUserRequests();
            
            // Reset form
            setFormData({
                patientName: '',
                service: 'Medical Transport',
                address: '',
                date: '',
                time: ''
            });
            setModalVisible(false);
            
            toast.show('Request submitted successfully!', {
                type: 'success',
                placement: 'top'
            });
            
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            toast.show(errorMessage, {
                type: 'error',
                placement: 'top'
            });
            
            if (error instanceof ApiError && error.code === 'NETWORK_ERROR') {
                toast.show('Network error. Please check your internet connection and try again.', {
                    type: 'error',
                    placement: 'top'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#FF6B35';
            case 'accepted': return '#4A90E2';
            case 'completed': return '#2ECC71';
            default: return '#95A5A6';
        }
    };

    const handleRefresh = () => {
        loadUserRequests();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Patient Portal</Text>
                <Text style={styles.headerSubtitle}>Manage your requests</Text>
            </View>

            {/* New Request Button */}
            <TouchableOpacity
                style={[styles.newRequestButton, (loading || submitting) && styles.buttonDisabled]}
                onPress={() => setModalVisible(true)}
                disabled={loading || submitting}
            >
                <Ionicons name="add" size={24} color="white" />
                <Text style={styles.newRequestButtonText}>
                    {loading ? 'Loading...' : 'New Service Request'}
                </Text>
            </TouchableOpacity>

            {/* Requests List */}
            <ScrollView 
                style={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#4A90E2']}
                        tintColor={'#4A90E2'}
                    />
                }
            >
                <Text style={styles.sectionTitle}>My Requests ({requests.length})</Text>

                {requests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text" size={64} color="#BDC3C7" />
                        <Text style={styles.emptyStateText}>No requests yet</Text>
                        <Text style={styles.emptyStateSubtext}>
                            Create your first service request to get started
                        </Text>
                        <TouchableOpacity 
                            style={styles.refreshButton}
                            onPress={loadUserRequests}
                        >
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    requests.map(request => (
                        <View key={request.id} style={styles.requestCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.patientName}>{request.patientName}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                                    <Text style={styles.statusText}>
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.serviceType}>{request.service}</Text>
                            <Text style={styles.detailText}>Date: {request.date} at {request.time}</Text>
                            <Text style={styles.detailText}>Address: {request.address}</Text>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Simple Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => !submitting && setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Service Request</Text>
                                <TouchableOpacity 
                                    onPress={() => !submitting && setModalVisible(false)}
                                    disabled={submitting}
                                >
                                    <Ionicons name="close" size={24} color="#666" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.form}>
                                {/* Name */}
                                <Text style={styles.label}>Full Name</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter your full name"
                                    value={formData.patientName}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, patientName: text }))}
                                    editable={!submitting}
                                />

                                {/* Service Type */}
                                <Text style={styles.label}>Service Type</Text>
                                {serviceOptions.map((service) => (
                                    <TouchableOpacity
                                        key={service}
                                        style={[
                                            styles.serviceButton,
                                            formData.service === service && styles.serviceButtonSelected
                                        ]}
                                        onPress={() => setFormData(prev => ({ ...prev, service }))}
                                        disabled={submitting}
                                    >
                                        <Text style={[
                                            styles.serviceButtonText,
                                            formData.service === service && styles.serviceButtonTextSelected
                                        ]}>
                                            {service}
                                        </Text>
                                    </TouchableOpacity>
                                ))}

                                {/* Address */}
                                <Text style={styles.label}>Address</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    placeholder="Enter your complete address"
                                    value={formData.address}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                                    multiline
                                    numberOfLines={3}
                                    returnKeyType="done"
                                    editable={!submitting}
                                />

                                {/* Date and Time */}
                                <View style={styles.row}>
                                    <View style={styles.flex1}>
                                        <Text style={styles.label}>Date</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="YYYY-MM-DD"
                                            value={formData.date}
                                            onChangeText={handleDateChange}
                                            keyboardType="numeric"
                                            maxLength={10}
                                            editable={!submitting}
                                        />
                                        <Text style={styles.formatHint}>Format: YYYY-MM-DD</Text>
                                    </View>
                                    <View style={styles.flex1}>
                                        <Text style={styles.label}>Time</Text>
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="HH:MM"
                                            value={formData.time}
                                            onChangeText={handleTimeChange}
                                            keyboardType="numeric"
                                            maxLength={5}
                                            editable={!submitting}
                                        />
                                        <Text style={styles.formatHint}>Format: HH:MM (24-hour)</Text>
                                    </View>
                                </View>

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        submitting && styles.submitButtonDisabled
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={submitting}
                                >
                                    <Text style={styles.submitButtonText}>
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#4A90E2',
        padding: 20,
        paddingTop: 60,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    newRequestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#4A90E2',
        margin: 20,
        padding: 16,
        borderRadius: 12,
    },
    newRequestButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
    requestCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    serviceType: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A90E2',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
        marginTop: 16,
    },
    textInput: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    serviceButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    serviceButtonSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    serviceButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
    },
    serviceButtonTextSelected: {
        color: 'white',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    flex1: {
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#4A90E2',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    formatHint: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginLeft: 4,
    },
    refreshButton: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});