import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Modal,
    ActivityIndicator
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loginCustomer, loginAdmin } from '../../hooks/requestInstance';
import * as SecureStore from 'expo-secure-store';
import { useToast } from "react-native-toast-notifications";

const { width, height } = Dimensions.get('window');

const InputField = ({ 
    placeholder, 
    value, 
    onChangeText, 
    secureTextEntry = false, 
    keyboardType = 'default',
    autoCapitalize = 'none',
    icon,
    inputRef,
    returnKeyType = 'next',
    onSubmitEditing,
    showPassword,
    setShowPassword
}: any) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused
        ]}>
            <Ionicons
                name={icon}
                size={20}
                color={isFocused ? '#667eea' : '#a0aec0'}
                style={styles.inputIcon}
            />

            <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry && !showPassword}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor="#a0aec0"
                returnKeyType={returnKeyType}
                onSubmitEditing={onSubmitEditing}
                blurOnSubmit={false}
            />
            {secureTextEntry && (
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                >
                    <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#a0aec0"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

// Simple Loading Screen Component
const LoadingScreen = ({ visible, userType }: { visible: boolean; userType: 'user' | 'admin' }) => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        statusBarTranslucent={true}
      >
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            {/* Activity Indicator */}
            <ActivityIndicator 
              size="large" 
              color={userType === 'user' ? '#667eea' : '#f56565'} 
              style={styles.spinner}
            />
  
            {/* Loading Text */}
            <Text style={styles.loadingTitle}>
              {userType === 'user' ? 'Signing In...' : 'Accessing Admin...'}
            </Text>
            <Text style={styles.loadingSubtitle}>
              Please wait...
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

export default function LoginPage() {
    const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);


    const toast = useToast();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUpAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const tabSlideAnim = useRef(new Animated.Value(0)).current;

    // Refs for text inputs
    const emailRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideUpAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    useEffect(() => {
        // Animate tab indicator
        Animated.spring(tabSlideAnim, {
            toValue: activeTab === 'user' ? 0 : 1,
            useNativeDriver: true,
        }).start();
    }, [activeTab]);

    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
        toast.show(message, {
            type,
            placement: 'top',
            duration: 4000,
            animationType: 'slide-in',
        });
    };

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showToast('Please fill in all fields');
            shake();
            return;
        }

        if (!email.includes('@')) {
            showToast('Please enter a valid email address');
            shake();
            return;
        }

        setLoading(true);
        setShowLoadingScreen(true);


        try {
            const loginData = {
                email,
                password
            };

           

            let response;
            
            if (activeTab === 'user') {
                response = await loginCustomer(loginData);
            } else {
                response = await loginAdmin(loginData);
            }

            

            // Store authentication data
            await SecureStore.setItemAsync('auth_token', response.tokens.access.token);
            await SecureStore.setItemAsync('last_login', new Date().toISOString());
            await SecureStore.setItemAsync('user_type', activeTab === 'user' ? 'customer' : 'admin');
            await SecureStore.setItemAsync('user', JSON.stringify(response.user));

            setLoading(false);
            setShowLoadingScreen(false);


            showToast(
                `Welcome back! Successfully signed in as ${activeTab === 'user' ? 'patient' : 'admin'}.`,
                'success'
            );

            // Navigate after success
            setTimeout(() => {
                if (activeTab === 'user') {
                    router.replace('/(dashboard)/(user)/appointment');
                } else {
                    router.replace('/(dashboard)/(admin)/dashboard');
                }
            }, 1500);

        } catch (error: any) {
            setLoading(false);
            setShowLoadingScreen(false)
            
            

            // Handle specific error cases
            if (error.code === 400 || error.code === 401) {
                showToast('Invalid email or password. Please try again.');
            } else if (error.code === 404) {
                showToast('No account found with this email. Please check your email or register.');
            } else if (error.message?.includes('Network')) {
                showToast('Network error. Please check your connection and try again.');
            } else {
                showToast(error.message || 'Something went wrong. Please try again.');
            }
            
            shake();
        }
    };

    const tabIndicatorPosition = tabSlideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '50%']
    });

    const isFormValid = email && password && email.includes('@');

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#f8fafc', '#f1f5f9']}
                style={styles.background}
            >
                <LoadingScreen visible={showLoadingScreen} userType={activeTab} />

                {/* Animated Background Elements */}
                <Animated.View
                    style={[
                        styles.backgroundCircle1,
                        {
                            opacity: fadeAnim,
                        }
                    ]}
                />
                <Animated.View
                    style={[
                        styles.backgroundCircle2,
                        {
                            opacity: fadeAnim,
                        }
                    ]}
                />

                <KeyboardAvoidingView 
                    style={styles.keyboardAvoid}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Animated.View
                            style={[
                                styles.header,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        { translateY: slideUpAnim },
                                        { scale: scaleAnim }
                                    ],
                                }
                            ]}
                        >
                           

                            <LinearGradient
                                colors={activeTab === 'user' ? ['#667eea', '#764ba2'] : ['#f56565', '#ed8936']}
                                style={styles.logo}
                            >
                                <Ionicons 
                                    name={activeTab === 'user' ? 'medical' : 'shield-checkmark'} 
                                    size={32} 
                                    color="white" 
                                />
                            </LinearGradient>

                            <Text style={styles.title}>
                                {activeTab === 'user' ? 'Welcome Back' : 'Admin Access'}
                            </Text>
                            <Text style={styles.subtitle}>
                                {activeTab === 'user' 
                                    ? 'Sign in to continue your healthcare journey'
                                    : 'Access the admin dashboard to manage appointments'
                                }
                            </Text>
                        </Animated.View>

                        {/* Tab Selector */}
                        <View style={styles.tabContainer}>
                            <View style={styles.tabBackground}>
                                <Animated.View 
                                    style={[
                                        styles.tabIndicator,
                                        {
                                            transform: [{ translateX: tabIndicatorPosition }]
                                        }
                                    ]} 
                                />
                                <TouchableOpacity
                                    style={styles.tab}
                                    onPress={() => setActiveTab('user')}
                                >
                                    <Ionicons 
                                        name="person" 
                                        size={20} 
                                        color={activeTab === 'user' ? '#667eea' : '#a0aec0'} 
                                    />
                                    <Text style={[
                                        styles.tabText,
                                        activeTab === 'user' && styles.tabTextActive
                                    ]}>
                                        Patient
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.tab}
                                    onPress={() => setActiveTab('admin')}
                                >
                                    <Ionicons 
                                        name="shield" 
                                        size={20} 
                                        color={activeTab === 'admin' ? '#f56565' : '#a0aec0'} 
                                    />
                                    <Text style={[
                                        styles.tabText,
                                        activeTab === 'admin' && styles.tabTextActive
                                    ]}>
                                        Admin
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Animated.View
                            style={[
                                styles.form,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        { translateY: slideUpAnim },
                                        { translateX: shakeAnim }
                                    ],
                                }
                            ]}
                        >
                            <InputField
                                placeholder="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                icon="mail-outline"
                                inputRef={emailRef}
                                returnKeyType="next"
                                onSubmitEditing={() => passwordRef.current?.focus()}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />

                            <InputField
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={true}
                                icon="lock-closed-outline"
                                inputRef={passwordRef}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    loading && styles.buttonDisabled,
                                    !isFormValid && styles.buttonIncomplete
                                ]}
                                onPress={handleLogin}
                                disabled={loading || !isFormValid}
                            >
                                <LinearGradient
                                    colors={activeTab === 'user' ? ['#667eea', '#764ba2'] : ['#f56565', '#ed8936']}
                                    style={styles.buttonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    {loading ? (
                                        <View style={styles.loadingContainer}>
                                            <Ionicons name="refresh" size={20} color="white" />
                                            <Text style={styles.buttonText}>
                                                {activeTab === 'user' ? 'Signing In...' : 'Accessing Admin...'}
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={styles.buttonText}>
                                            {activeTab === 'user' ? 'Sign In' : 'Access Admin Panel'}
                                        </Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            
                        </Animated.View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                {activeTab === 'user' ? "Don't have an account? " : "Need admin account? "}
                            </Text>
                            <Link href="/register" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.link}>
                                        {activeTab === 'user' ? 'Sign up' : 'Register admin'}
                                    </Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
    },
    backgroundCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        top: -50,
        right: -50,
    },
    backgroundCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(118, 75, 162, 0.05)',
        bottom: -30,
        left: -30,
    },
    header: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 30,
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: 0,
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      loadingContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        margin: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
      },
      spinner: {
        marginBottom: 16,
      },
      loadingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3748',
        textAlign: 'center',
        marginBottom: 8,
      },
      loadingSubtitle: {
        fontSize: 14,
        color: '#718096',
        textAlign: 'center',
      },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2d3748',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 22,
    },
    tabContainer: {
        marginBottom: 30,
    },
    tabBackground: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        backgroundColor: '#f7fafc',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#a0aec0',
    },
    tabTextActive: {
        color: '#2d3748',
    },
    form: {
        gap: 20,
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 3,
    },
    inputContainerFocused: {
        borderColor: '#667eea',
        shadowOpacity: 0.2,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 18,
        fontSize: 16,
        color: '#2d3748',
    },
    eyeIcon: {
        padding: 4,
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
        marginTop: 8,
    },
    buttonGradient: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonIncomplete: {
        opacity: 0.5,
    },
    loadingContainer1: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    adminNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(245, 101, 101, 0.05)',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    adminNoteText: {
        flex: 1,
        fontSize: 12,
        color: '#f56565',
        lineHeight: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        paddingVertical: 20,
    },
    footerText: {
        color: '#718096',
        fontSize: 16,
    },
    link: {
        color: '#667eea',
        fontSize: 16,
        fontWeight: 'bold',
    },
});