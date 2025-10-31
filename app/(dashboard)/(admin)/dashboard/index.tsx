import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from "react-native-toast-notifications";
import { getFilteredRequests, updateRequestStatus, ApiError, getErrorMessage } from '@/hooks/requestInstance';

interface ServiceRequest {
    id: string;
    patientName: string;
    service: string;
    date: string;
    time: string;
    status: 'pending' | 'accepted' | 'completed';
    address: string;
}

export default function AdminDashboard() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const toast = useToast();

    // Load all requests on component mount
    useEffect(() => {
        loadAllRequests();
    }, []);

    const loadAllRequests = async () => {
        try {
            setRefreshing(true);
            
            // Get all requests without filters to show everything to admin
            const response = await getFilteredRequests({});
            
            // Transform API response to match your UI structure
            const transformedRequests: ServiceRequest[] = response.data?.requests?.map((item: any) => ({
                id: item._id,
                patientName: item.name || 'Unknown Patient',
                service: mapServiceType(item.serviceType),
                date: item.time ? new Date(item.time).toISOString().split('T')[0] : 'N/A',
                time: item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                status: item.status || 'pending',
                address: item.location || 'No address provided'
            })) || [];
            
            setRequests(transformedRequests);
            
        } catch (error) {
            console.error('Error loading requests:', error);
            const errorMessage = getErrorMessage(error);
            toast.show(errorMessage, {
                type: 'error',
                placement: 'top'
            });
        } finally {
            setRefreshing(false);
        }
    };

    const mapServiceType = (serviceType: string): string => {
        const serviceMap: Record<string, string> = {
            'medical': 'Medical Transport',
            'appointment': 'Doctor Appointment',
            'checkup': 'Home Check-up'
        };
        return serviceMap[serviceType] || serviceType;
    };

    const handleAccept = async (requestId: string) => {
        try {
            setUpdatingStatus(requestId);
            
            await updateRequestStatus(requestId, 'accept');
            
            // Update local state
            setRequests(requests.map(request => 
                request.id === requestId 
                    ? { ...request, status: 'accepted' }
                    : request
            ));
            
            toast.show('Request accepted successfully!', {
                type: 'success',
                placement: 'top'
            });
            
        } catch (error) {
            console.error('Error accepting request:', error);
            const errorMessage = getErrorMessage(error);
            toast.show(errorMessage, {
                type: 'error',
                placement: 'top'
            });
        } finally {
            setUpdatingStatus(null);
        }
    };

    const handleComplete = async (requestId: string) => {
        try {
            setUpdatingStatus(requestId);
            
            await updateRequestStatus(requestId, 'completed');
            
            // Update local state
            setRequests(requests.map(request => 
                request.id === requestId 
                    ? { ...request, status: 'completed' }
                    : request
            ));
            
            toast.show('Request marked as completed!', {
                type: 'success',
                placement: 'top'
            });
            
        } catch (error) {
            console.error('Error completing request:', error);
            const errorMessage = getErrorMessage(error);
            toast.show(errorMessage, {
                type: 'error',
                placement: 'top'
            });
        } finally {
            setUpdatingStatus(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#FF9500';
            case 'accepted': return '#007AFF';
            case 'completed': return '#34C759';
            default: return '#8E8E93';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return 'time';
            case 'accepted': return 'checkmark-circle';
            case 'completed': return 'checkmark-done';
            default: return 'help';
        }
    };

    const RequestCard = ({ request }: { request: ServiceRequest }) => (
        <View style={styles.requestCard}>
            <View style={styles.cardHeader}>
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{request.patientName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                        <Ionicons name={getStatusIcon(request.status)} size={12} color="white" />
                        <Text style={styles.statusText}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Text>
                    </View>
                </View>
                <Text style={styles.serviceType}>{request.service}</Text>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.date}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.time}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.address}</Text>
                </View>
            </View>

            {request.status === 'pending' && (
                <TouchableOpacity 
                    style={[
                        styles.acceptButton,
                        updatingStatus === request.id && styles.buttonDisabled
                    ]}
                    onPress={() => handleAccept(request.id)}
                    disabled={updatingStatus === request.id}
                >
                    <Ionicons name="checkmark" size={18} color="white" />
                    <Text style={styles.buttonText}>
                        {updatingStatus === request.id ? 'Accepting...' : 'Accept Request'}
                    </Text>
                </TouchableOpacity>
            )}

            {request.status === 'accepted' && (
                <TouchableOpacity 
                    style={[
                        styles.completeButton,
                        updatingStatus === request.id && styles.buttonDisabled
                    ]}
                    onPress={() => handleComplete(request.id)}
                    disabled={updatingStatus === request.id}
                >
                    <Ionicons name="checkmark-done" size={18} color="white" />
                    <Text style={styles.buttonText}>
                        {updatingStatus === request.id ? 'Completing...' : 'Mark Complete'}
                    </Text>
                </TouchableOpacity>
            )}

            {request.status === 'completed' && (
                <View style={styles.completedBadge}>
                    <Ionicons name="checkmark-done" size={18} color="#34C759" />
                    <Text style={styles.completedText}>Completed</Text>
                </View>
            )}
        </View>
    );

    const StatsCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
        <View style={[styles.statsCard, { borderLeftColor: color }]}>
            <Text style={styles.statsValue}>{value}</Text>
            <Text style={styles.statsTitle}>{title}</Text>
        </View>
    );

    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const acceptedCount = requests.filter(r => r.status === 'accepted').length;
    const completedCount = requests.filter(r => r.status === 'completed').length;

    const handleRefresh = () => {
        loadAllRequests();
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Manage service requests</Text>
                </View>
                <View style={styles.statsRow}>
                    <StatsCard title="Pending" value={pendingCount} color="#FF9500" />
                    <StatsCard title="Accepted" value={acceptedCount} color="#007AFF" />
                    <StatsCard title="Completed" value={completedCount} color="#34C759" />
                </View>
            </View>

            {/* Requests List */}
            <ScrollView 
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#007AFF']}
                        tintColor={'#007AFF'}
                    />
                }
            >
                <Text style={styles.sectionTitle}>All Requests ({requests.length})</Text>
                
                {requests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text" size={64} color="#BDC3C7" />
                        <Text style={styles.emptyStateText}>No requests found</Text>
                        <Text style={styles.emptyStateSubtext}>
                            {refreshing ? 'Loading requests...' : 'No service requests available'}
                        </Text>
                        <TouchableOpacity 
                            style={styles.refreshButton}
                            onPress={loadAllRequests}
                            disabled={refreshing}
                        >
                            <Text style={styles.refreshButtonText}>
                                {refreshing ? 'Loading...' : 'Refresh'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    requests.map(request => (
                        <RequestCard key={request.id} request={request} />
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statsCard: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statsValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    statsTitle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 16,
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
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
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
        color: '#007AFF',
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    details: {
        gap: 8,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
    },
    acceptButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
    },
    completeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#34C759',
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    completedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#e8f5e8',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#34C759',
    },
    completedText: {
        color: '#34C759',
        fontSize: 14,
        fontWeight: '600',
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
    refreshButton: {
        backgroundColor: '#007AFF',
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