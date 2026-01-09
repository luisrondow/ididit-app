// Milestone completion celebration dialog with confetti and share feature

import { View, Share, Dimensions, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/icon';
import { Share2, Check } from 'lucide-react-native';
import { haptics } from '@/lib/utils/haptics';
import { memo, useCallback, useEffect, useState, useRef } from 'react';
import type { Goal } from '@/types/models';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface MilestoneCompletedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

export const MilestoneCompletedDialog = memo(function MilestoneCompletedDialog({
  open,
  onOpenChange,
  goal,
}: MilestoneCompletedDialogProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = Dimensions.get('window');
  const goalRef = useRef<Goal | null>(null);

  // Keep a ref to the goal for sharing after dialog closes
  useEffect(() => {
    if (goal) {
      goalRef.current = goal;
    }
  }, [goal]);

  // Animation values
  const iconScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  // Trigger animations when dialog opens
  useEffect(() => {
    if (open && goal) {
      iconScale.value = 0;
      contentOpacity.value = 0;

      const timer = setTimeout(() => {
        setShowConfetti(true);
        haptics.success();

        // Animate icon entrance
        iconScale.value = withSpring(1, { damping: 12, stiffness: 120 });

        // Fade in content
        contentOpacity.value = withDelay(150, withTiming(1, { duration: 250 }));

        setTimeout(() => haptics.light(), 300);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [open, goal]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const handleShare = useCallback(async () => {
    const goalToShare = goalRef.current;
    if (!goalToShare) return;

    haptics.medium();

    // Close the dialog first so share sheet appears on top
    onOpenChange(false);

    // Small delay to let dialog close animation complete
    setTimeout(async () => {
      const shareMessage = generateShareMessage(goalToShare);

      try {
        await Share.share({
          message: shareMessage,
          title: `I completed my "${goalToShare.name}" milestone!`,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }, 300);
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    haptics.light();
    onOpenChange(false);
  }, [onOpenChange]);

  if (!goal) return null;

  return (
    <>
      {/* Confetti - subtle colors */}
      {showConfetti && open && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <ConfettiCannon
            count={60}
            origin={{ x: width / 2, y: -20 }}
            autoStart={true}
            fadeOut={true}
            fallSpeed={3000}
            explosionSpeed={300}
            colors={['#22c55e', '#16a34a', '#4ade80', '#86efac', '#bbf7d0']}
          />
        </View>
      )}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[300px] rounded-2xl border-border bg-card">
          <View className="items-center">
            {/* Success icon */}
            <Animated.View style={iconAnimatedStyle}>
              <View className="mb-5 h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <Icon as={Check} className="size-8 text-success" strokeWidth={3} />
              </View>
            </Animated.View>

            {/* Content */}
            <Animated.View style={contentAnimatedStyle} className="w-full items-center">
              <Text className="mb-2 text-center font-sans-semibold text-lg text-foreground">
                Milestone Complete
              </Text>

              <Text className="mb-5 text-center text-sm text-muted-foreground">
                You've achieved your goal
              </Text>

              {/* Goal info */}
              <View className="mb-6 w-full rounded-xl bg-muted/50 px-4 py-3">
                <Text className="text-center font-sans-semibold text-base text-foreground">
                  {goal.name}
                </Text>
                <Text className="mt-1 text-center text-xs text-muted-foreground">
                  {goal.targetCount} {goal.targetCount === 1 ? 'completion' : 'completions'}
                </Text>
              </View>

              {/* Buttons */}
              <View className="w-full gap-2">
                <Pressable
                  onPress={handleClose}
                  className="w-full items-center justify-center rounded-xl bg-success py-3.5 active:opacity-80"
                >
                  <Text className="font-sans-semibold text-base text-white">Done</Text>
                </Pressable>

                <Pressable
                  onPress={handleShare}
                  className="w-full flex-row items-center justify-center gap-2 rounded-xl border border-border py-3.5 active:bg-muted"
                >
                  <Icon as={Share2} className="size-4 text-muted-foreground" />
                  <Text className="font-sans-medium text-sm text-muted-foreground">
                    Share Achievement
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
});

/**
 * Generate a shareable message for the completed milestone
 */
function generateShareMessage(goal: Goal): string {
  const messages = [
    `✓ Completed: "${goal.name}"\n\n${goal.targetCount} ${goal.targetCount === 1 ? 'completion' : 'completions'} achieved.\n\n#IDidIt`,
    `Goal achieved: "${goal.name}" — ${goal.targetCount}/${goal.targetCount} complete.\n\n#IDidIt`,
    `"${goal.name}" ✓\n\nFinished all ${goal.targetCount} ${goal.targetCount === 1 ? 'completion' : 'completions'}.\n\n#IDidIt`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
