import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none';
}

const ROUNDED_CLASSES = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({ className, width, height, rounded = 'md' }: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.5, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const style: any = {};
  if (width !== undefined) {
    style.width = typeof width === 'number' ? width : width;
  }
  if (height !== undefined) {
    style.height = typeof height === 'number' ? height : height;
  }

  return (
    <Animated.View
      style={[style, animatedStyle]}
      className={cn(
        'bg-muted',
        ROUNDED_CLASSES[rounded],
        className
      )}
    />
  );
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <View className={cn('gap-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          className={index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <View className={cn('bg-card border border-border rounded-lg p-4 gap-3', className)}>
      <View className="flex-row items-center justify-between">
        <Skeleton width={120} height={20} />
        <Skeleton width={40} height={20} rounded="full" />
      </View>
      <SkeletonText lines={2} />
      <View className="flex-row gap-2 mt-2">
        <Skeleton width={60} height={24} rounded="full" />
        <Skeleton width={60} height={24} rounded="full" />
      </View>
    </View>
  );
}
