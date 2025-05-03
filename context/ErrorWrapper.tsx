import React, { Component, ReactNode, ErrorInfo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Easing,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<FallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorLocation: string | null;
}

export interface FallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorLocation: string | null;
  resetError: () => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private bounceAnimation: Animated.Value;
  private fadeAnimation: Animated.Value;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorLocation: null,
    };

    this.bounceAnimation = new Animated.Value(0);
    this.fadeAnimation = new Animated.Value(0);
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Extract error location if possible
    const errorLocation = this.extractErrorLocation(errorInfo);

    this.setState({
      errorInfo,
      errorLocation,
    });

    // Start animations when error occurs
    this.startAnimations();
  }

  startAnimations = (): void => {
    Animated.parallel([
      Animated.timing(this.bounceAnimation, {
        toValue: 1,
        duration: 800,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(this.fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  extractErrorLocation(errorInfo: ErrorInfo): string {
    if (errorInfo && errorInfo.componentStack) {
      // Extract first line of component stack which typically contains file and line number
      const locationMatch = errorInfo.componentStack.match(/in\s+([^\n]+)/);
      return locationMatch ? locationMatch[1] : 'Unknown component';
    }
    return 'Unknown location';
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorLocation: null,
    });

    // Reset animations
    this.bounceAnimation.setValue(0);
    this.fadeAnimation.setValue(0);
  };

  render(): React.ReactNode {
    const { hasError, error, errorInfo, errorLocation } = this.state;

    if (hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackComponent) {
        const FallbackComponent = this.props.fallbackComponent;
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            errorLocation={errorLocation}
            resetError={this.handleRetry}
          />
        );
      }

      // Default error UI
      const translateY = this.bounceAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 0],
      });

      const opacity = this.fadeAnimation;

      return (
        <View style={styles.container}>
          <LinearGradient
            colors={['#f7f9fc', '#e3e8f0']}
            style={styles.gradient}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                style={[
                  styles.errorCard,
                  { transform: [{ translateY }], opacity }
                ]}
              >
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="alert-octagon"
                    size={70}
                    color="#FFF"
                  />
                </View>

                <Text style={styles.errorTitle}>
                  Oops! Something Went Wrong
                </Text>

                <View style={styles.divider} />

                <Text style={styles.errorMessage}>
                  We encountered an unexpected error in <Text style={styles.highlight}>{errorLocation}</Text>.
                </Text>

                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsLabel}>ERROR DETAILS:</Text>
                  <Text style={styles.errorDetails}>
                    {error?.toString()}
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={this.handleRetry}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#6C63FF', '#5A54D1']}
                      style={styles.buttonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <MaterialCommunityIcons
                        name="refresh"
                        size={20}
                        color="white"
                      />
                      <Text style={styles.retryButtonText}>
                        Try Again
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.reportButton}
                    onPress={() => Linking.openURL('tel:01141236789')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="bug"
                      size={20}
                      color="#6C63FF"
                    />
                    <Text style={styles.reportButtonText}>
                      Report Bug
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
          </LinearGradient>
        </View>
      );
    }

    return this.props.children;
  }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    width: width * 0.9,
    maxWidth: 450,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 15,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: '700',
    color: '#6C63FF',
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  detailsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718096',
    marginBottom: 5,
  },
  errorDetails: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  retryButton: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  reportButtonText: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

// Wrapper with proper TypeScript type checking
export default function ErrorBoundaryWrapper({ children, fallbackComponent }: ErrorBoundaryProps): JSX.Element {
  return (
    <ErrorBoundary fallbackComponent={fallbackComponent}>
      {children}
    </ErrorBoundary>
  );
}