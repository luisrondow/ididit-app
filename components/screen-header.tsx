// Common screen header component

import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { MoonStarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonStarIcon,
};

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  showThemeToggle?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  rightAction,
  showThemeToggle = true,
}: ScreenHeaderProps) {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
      <View className="flex-1">
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        {subtitle && <Text className="text-sm text-muted-foreground mt-1">{subtitle}</Text>}
      </View>
      <View className="flex-row items-center gap-2">
        {rightAction}
        {showThemeToggle && (
          <Button
            onPress={toggleColorScheme}
            size="icon"
            variant="ghost"
            className="rounded-full">
            <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
          </Button>
        )}
      </View>
    </View>
  );
}
