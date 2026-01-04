// Error Boundary component to catch and handle React errors gracefully

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console (or send to error reporting service)
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView className="flex-1 bg-background">
          <ScrollView className="flex-1 p-6">
            <View className="items-center justify-center mt-12">
              <View className="bg-destructive/10 p-6 rounded-full mb-6">
                <Icon as={AlertCircle} className="text-destructive" size={48} />
              </View>

              <Text className="text-2xl font-bold text-foreground mb-2">
                Oops! Something went wrong
              </Text>

              <Text className="text-center text-muted-foreground mb-8 px-4">
                We're sorry, but the app encountered an unexpected error. Don't worry, your data is safe.
              </Text>

              <Button onPress={this.handleReset} className="mb-4">
                <Text>Try Again</Text>
              </Button>

              {__DEV__ && this.state.error && (
                <View className="mt-8 w-full bg-card border border-border rounded-lg p-4">
                  <Text className="text-sm font-semibold text-destructive mb-2">
                    Error Details (Development Only):
                  </Text>
                  <Text className="text-xs text-muted-foreground font-mono mb-2">
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <Text className="text-xs text-muted-foreground font-mono">
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
