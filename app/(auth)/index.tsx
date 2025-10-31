import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated,
  Easing,
  Dimensions,
  ScrollView
} from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Floating animation for background elements
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      })
    ]).start();

    // Pulse animation for CTA
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating background animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          delay: 1000,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          delay: 500,
        }),
        Animated.timing(floatAnim3, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const float1Interpolate = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const float2Interpolate = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const float3Interpolate = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const FeatureCard = ({ icon, title, description, delay }: any) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }).start();
    }, []);

    const cardTranslateY = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [60, 0],
    });

    const cardOpacity = cardAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View 
        style={[
          styles.featureCard,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
          style={styles.featureGradient}
        >
          <Text style={styles.featureIcon}>{icon}</Text>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Background Elements */}
      <Animated.View 
        style={[
          styles.backgroundCircle1,
          {
            transform: [
              { translateY: float1Interpolate },
              { translateX: float2Interpolate }
            ],
          },
        ]}
      />
      <Animated.View 
        style={[
          styles.backgroundCircle2,
          {
            transform: [
              { translateY: float3Interpolate },
              { translateX: float1Interpolate }
            ],
          },
        ]}
      />
      <Animated.View 
        style={[
          styles.backgroundCircle3,
          {
            transform: [
              { translateY: float2Interpolate },
              { translateX: float3Interpolate }
            ],
          },
        ]}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
            },
          ]}
        >
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>⚕️</Text>
            </LinearGradient>
          </Animated.View>
          
          <Text style={styles.title}>MediCare Pro</Text>
          <Text style={styles.subtitle}>Premium Healthcare at Your Fingertips</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Text style={styles.description}>
            Experience the future of healthcare with our seamless platform connecting you to medical professionals instantly.
          </Text>

          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="👨‍⚕️"
              title="Expert Doctors"
              description="Connect with certified healthcare professionals"
              delay={200}
            />
            <FeatureCard
              icon="🚑"
              title="Emergency Care"
              description="Immediate medical assistance when you need it most"
              delay={400}
            />
            <FeatureCard
              icon="📱"
              title="Digital Prescriptions"
              description="Get your medications delivered to your doorstep"
              delay={600}
            />
            <FeatureCard
              icon="📊"
              title="Health Tracking"
              description="Monitor your health metrics in real-time"
              delay={800}
            />
          </View>

          <Animated.View 
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Link>
            
            <Link href="/register" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            </Link>
            
          </Animated.View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Doctors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backgroundCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    top: -100,
    left: -100,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(118, 75, 162, 0.1)',
    top: height * 0.6,
    right: -50,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    bottom: -50,
    left: width * 0.3,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    fontFamily: 'System',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  featureGradient: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  primaryButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonGradient: {
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },
});