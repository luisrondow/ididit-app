// Multi-tone heatmap component for calendar view (all goals)

import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import type { HeatmapData } from '@/types/models';
import { format, getDay } from 'date-fns';

interface CalendarHeatmapProps {
  data: HeatmapData[];
  showMonthLabels?: boolean;
}

const CELL_SIZE = 14;
const CELL_GAP = 3;

export function CalendarHeatmap({ data, showMonthLabels = true }: CalendarHeatmapProps) {
  // Group data by week
  const weeks: HeatmapData[][] = [];
  let currentWeek: HeatmapData[] = [];

  // Add empty cells for the first week to align with day of week
  if (data.length > 0) {
    const firstDate = new Date(data[0].date);
    const firstDayOfWeek = getDay(firstDate);
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        completionCount: 0,
        totalGoals: 0,
        intensity: 0,
      });
    }
  }

  // Group data into weeks (Sunday to Saturday)
  data.forEach((day, index) => {
    currentWeek.push(day);
    const date = new Date(day.date);
    const dayOfWeek = getDay(date);

    // End of week or last item
    if (dayOfWeek === 6 || index === data.length - 1) {
      // Fill rest of week with empty cells if needed
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: '',
          completionCount: 0,
          totalGoals: 0,
          intensity: 0,
        });
      }
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  // Get month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDayInWeek = week.find((day) => day.date !== '');
    if (firstDayInWeek) {
      const date = new Date(firstDayInWeek.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({
          label: format(date, 'MMM'),
          weekIndex,
        });
        lastMonth = month;
      }
    }
  });

  const getCellColor = (day: HeatmapData) => {
    if (!day.date) return 'bg-transparent';

    // Multi-tone based on intensity (0-4) using heatmap colors
    switch (day.intensity) {
      case 0:
        return 'bg-heatmap-0';
      case 1:
        return 'bg-heatmap-1';
      case 2:
        return 'bg-heatmap-2';
      case 3:
        return 'bg-heatmap-3';
      case 4:
        return 'bg-heatmap-4';
      default:
        return 'bg-heatmap-0';
    }
  };

  // Calculate stats for display
  const daysWithActivity = data.filter((day) => day.completionCount > 0).length;
  const daysWithGoals = data.filter((day) => day.totalGoals > 0).length;

  if (data.length === 0) {
    return (
      <View className="rounded-lg border border-border bg-card p-5">
        <Text variant="h4" className="mb-4 text-foreground">
          Activity Overview
        </Text>
        <View className="items-center justify-center py-8">
          <Text variant="body" className="text-center text-muted-foreground">
            No activity data yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="rounded-lg border border-border bg-card p-5">
      <Text variant="h4" className="mb-4 text-foreground">
        Activity Overview
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Month labels */}
          {showMonthLabels && (
            <View className="mb-3 flex-row" style={{ height: 16 }}>
              {monthLabels.map((month) => (
                <View
                  key={`${month.label}-${month.weekIndex}`}
                  style={{
                    position: 'absolute',
                    left: 28 + month.weekIndex * (CELL_SIZE + CELL_GAP),
                  }}>
                  <Text variant="caption" className="font-mono text-muted-foreground">
                    {month.label}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Heatmap grid */}
          <View className="flex-row">
            {/* Day labels */}
            <View className="mr-3">
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <View
                  key={dayIndex}
                  style={{
                    height: CELL_SIZE,
                    marginBottom: CELL_GAP,
                    justifyContent: 'center',
                  }}>
                  {dayIndex === 1 && (
                    <Text variant="caption" className="font-mono text-muted-foreground">
                      Mon
                    </Text>
                  )}
                  {dayIndex === 3 && (
                    <Text variant="caption" className="font-mono text-muted-foreground">
                      Wed
                    </Text>
                  )}
                  {dayIndex === 5 && (
                    <Text variant="caption" className="font-mono text-muted-foreground">
                      Fri
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Weeks */}
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={{ marginRight: CELL_GAP }}>
                {week.map((day, dayIndex) => (
                  <View
                    key={`${weekIndex}-${dayIndex}`}
                    className={`rounded-sm ${getCellColor(day)}`}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      marginBottom: CELL_GAP,
                    }}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View className="mt-4 flex-row items-center gap-3">
            <Text variant="caption" className="text-muted-foreground">
              Less
            </Text>
            <View className="flex-row gap-1">
              <View className="rounded-sm bg-heatmap-0" style={{ width: 12, height: 12 }} />
              <View className="rounded-sm bg-heatmap-1" style={{ width: 12, height: 12 }} />
              <View className="rounded-sm bg-heatmap-2" style={{ width: 12, height: 12 }} />
              <View className="rounded-sm bg-heatmap-3" style={{ width: 12, height: 12 }} />
              <View className="rounded-sm bg-heatmap-4" style={{ width: 12, height: 12 }} />
            </View>
            <Text variant="caption" className="text-muted-foreground">
              More
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
