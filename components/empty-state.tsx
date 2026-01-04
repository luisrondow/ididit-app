// Reusable empty state component with minimalist design

import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { FadeInView } from '@/components/ui/animated-view';
import type { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon: IconComponent,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <FadeInView delay={0}>
      <View className="items-center justify-center py-20 px-6">
        {IconComponent && (
          <View className="mb-6">
            <Icon as={IconComponent} className="size-12 text-muted-foreground" />
          </View>
        )}
        <Text variant="h2" className="text-foreground mb-3 text-center">
          {title}
        </Text>
        <Text variant="body" className="text-muted-foreground text-center mb-8 max-w-[280px]">
          {description}
        </Text>
        {actionLabel && onAction && (
          <Button onPress={onAction}>
            <Text className="text-primary-foreground font-sans-medium">{actionLabel}</Text>
          </Button>
        )}
      </View>
    </FadeInView>
  );
}

