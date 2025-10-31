import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useToast } from "react-native-toast-notifications";
import { useAuth } from '../../../../hooks/useAuth';

export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const [logoutConfirmed, setLogoutConfirmed] = useState(false);
    const toast = useToast();
    const { user, userTypeSaved, logout } = useAuth();

    // Determine user role display text
    const getUserRoleDisplay = () => {
        const role =  userTypeSaved || '';
        
        if (role.toLowerCase() === 'admin') {
            return 'Doctor';
        } else if (role.toLowerCase() === 'customer' || role.toLowerCase() === 'user') {
            return 'Patient';
        } else {
            return role || 'Patient'; 
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            toast.show('Logged out successfully', {
                type: 'success',
                duration: 3000,
                placement: 'top',
            });
            router.replace('/(auth)/login');
        } catch (error) {
            toast.show('Failed to logout', {
                type: 'danger',
                duration: 3000,
                placement: 'top',
            });
        } finally {
            setLoading(false);
            setLogoutConfirmed(false); 
        }
    };

    const handleLogoutPress = () => {
        if (!logoutConfirmed) {
            // First press - show confirmation
            setLogoutConfirmed(true);
            toast.show('Press logout again to confirm', {
                type: 'warning',
                duration: 3000,
                placement: 'top',
            });
            
            // Reset confirmation after 3 seconds if user doesn't press again
            setTimeout(() => {
                setLogoutConfirmed(false);
            }, 3000);
        } else {
            // Second press - proceed with logout
            handleLogout();
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.fullName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.userName}>
                        {user?.fullName || user?.name}
                    </Text>
                    <Text style={styles.userEmail}>
                        {user?.email}
                    </Text>
                    <View style={styles.userTypeBadge}>
                        <Text style={styles.userTypeText}>
                            {getUserRoleDisplay()}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {/* Logout Button */}
                <TouchableOpacity
                    style={[
                        styles.logoutButton, 
                        loading && styles.logoutButtonDisabled,
                        logoutConfirmed && styles.logoutButtonConfirmed
                    ]}
                    onPress={handleLogoutPress}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Ionicons name="refresh" size={20} color="#ef4444" />
                            <Text style={styles.logoutText}>Logging out...</Text>
                        </View>
                    ) : (
                        <>
                            <Ionicons 
                                name={logoutConfirmed ? "checkmark-circle" : "log-out-outline"} 
                                size={20} 
                                color={logoutConfirmed ? "#34C759" : "#ef4444"} 
                            />
                            <Text style={[
                                styles.logoutText,
                                logoutConfirmed && styles.logoutTextConfirmed
                            ]}>
                                {logoutConfirmed ? 'Confirm Logout' : 'Logout'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>MediCare v1.0.0</Text>
                    <Text style={styles.copyrightText}>© 2025 MediCare. All rights reserved.</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
    },
    headerContent: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 12,
    },
    userTypeBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    userTypeText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'white',
    },
    content: {
        padding: 20,
        marginTop: -20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#fee2e2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    logoutButtonDisabled: {
        opacity: 0.6,
    },
    logoutButtonConfirmed: {
        borderColor: '#34C759',
        backgroundColor: '#f0f9f0',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoutText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ef4444',
        marginLeft: 8,
    },
    logoutTextConfirmed: {
        color: '#34C759',
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    versionText: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    copyrightText: {
        fontSize: 12,
        color: '#94a3b8',
    },
});