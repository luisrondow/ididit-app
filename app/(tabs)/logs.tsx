// Logs screen - View all log entries grouped by date

import { View, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useLogsStore } from '@/lib/store/logs-store';
import { Trash2, Clock, FileText } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { SkeletonCard } from '@/components/ui/skeleton';
import { FadeInView } from '@/components/ui/animated-view';
import { FloatingActionButton } from '@/components/floating-action-button';
import { useToast } from '@/lib/context/toast-context';
import { haptics } from '@/lib/utils/haptics';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import type { LogEntryWithGoal } from '@/lib/repositories/log-repository';
import { deleteLogEntry } from '@/lib/repositories/log-repository';
import { useFocusEffect } from 'expo-router';

// Group logs by date
function groupLogsByDate(logs: LogEntryWithGoal[]): Map<string, LogEntryWithGoal[]> {
  const grouped = new Map<string, LogEntryWithGoal[]>();
  
  for (const log of logs) {
    const dateKey = format(parseISO(log.completedAt), 'yyyy-MM-dd');
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, log]);
  }
  
  return grouped;
}

// Format date for display
function formatDateHeader(dateString: string): string {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  return format(date, 'EEEE, MMMM d, yyyy');
}

export default function LogsScreen() {
  const toast = useToast();
  const { allLogs, loadAllLogs, isLoading } = useLogsStore();
  const [refreshing, setRefreshing] = useState(false);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAllLogs();
    }, [loadAllLogs])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllLogs();
    setRefreshing(false);
  }, [loadAllLogs]);

  const handleDeleteLog = useCallback((logId: string, goalName: string) => {
    haptics.warning();
    Alert.alert(
      'Delete Log',
      `Are you sure you want to delete this log for "${goalName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLogEntry(logId);
              haptics.success();
              toast.success('Log deleted');
              loadAllLogs();
            } catch (error) {
              haptics.error();
              toast.error('Failed to delete log');
              console.error('Error deleting log:', error);
            }
          },
        },
      ]
    );
  }, [loadAllLogs, toast]);

  const groupedLogs = groupLogsByDate(allLogs);
  const sortedDates = Array.from(groupedLogs.keys()).sort((a, b) => b.localeCompare(a));

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="Logs" subtitle="Your activity history" />
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-5">
          {isLoading && allLogs.length === 0 ? (
            <View className="gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : allLogs.length === 0 ? (
            <FadeInView delay={0}>
              <View className="items-center justify-center py-20">
                <Icon as={FileText} className="size-12 text-muted-foreground mb-4" />
                <Text variant="h2" className="text-foreground mb-3">
                  No logs yet
                </Text>
                <Text variant="body" className="text-muted-foreground text-center max-w-[280px]">
                  Tap the + button to log your first activity
                </Text>
              </View>
            </FadeInView>
          ) : (
            <View className="gap-6">
              {sortedDates.map((dateKey, dateIndex) => {
                const logsForDate = groupedLogs.get(dateKey) || [];
                return (
                  <FadeInView key={dateKey} delay={50 * dateIndex}>
                    <View className="gap-3">
                      {/* Date Header */}
                      <Text variant="h4" className="text-foreground">
                        {formatDateHeader(dateKey)}
                      </Text>
                      
                      {/* Logs for this date */}
                      <View className="gap-2">
                        {logsForDate.map((log) => (
                          <View
                            key={log.id}
                            className="bg-card border border-border rounded-lg p-4"
                          >
                            <View className="flex-row items-start justify-between">
                              <View className="flex-1 mr-3">
                                <Text variant="h4" className="text-foreground mb-1">
                                  {log.goalName}
                                </Text>
                                <View className="flex-row items-center gap-1">
                                  <Icon as={Clock} className="size-3 text-muted-foreground" />
                                  <Text variant="mono" className="text-muted-foreground">
                                    {format(parseISO(log.completedAt), 'h:mm a')}
                                  </Text>
                                </View>
                                {log.notes && (
                                  <Text
                                    variant="body"
                                    className="text-muted-foreground mt-2"
                                    numberOfLines={2}
                                  >
                                    {log.notes}
                                  </Text>
                                )}
                              </View>
                              
                              <Pressable
                                onPress={() => handleDeleteLog(log.id, log.goalName)}
                                className="p-2 active:opacity-70"
                                hitSlop={8}
                              >
                                <Icon as={Trash2} className="size-4 text-muted-foreground" />
                              </Pressable>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </FadeInView>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton />
    </SafeAreaView>
  );
}
