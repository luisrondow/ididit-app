// Multi-tone heatmap component for calendar view (all habits)

import { View, ScrollView } from 'react-native';
import { Text } from '@/components/ui/text';
import type { HeatmapData } from '@/types/models';
import { format, getDay } from 'date-fns';

interface CalendarHeatmapProps {
  data: HeatmapData[];
  showMonthLabels?: boolean;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CELL_SIZE = 12;
const CELL_GAP = 2;

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
        totalHabits: 0,
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
          totalHabits: 0,
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

    // Multi-tone based on intensity (0-4)
    switch (day.intensity) {
      case 0:
        return 'bg-muted';
      case 1:
        return 'bg-green-200 dark:bg-green-900/40';
      case 2:
        return 'bg-green-400 dark:bg-green-700/60';
      case 3:
        return 'bg-green-500 dark:bg-green-600/80';
      case 4:
        return 'bg-green-600 dark:bg-green-500';
      default:
        return 'bg-muted';
    }
  };

  return (
    <View className="bg-card border border-border rounded-lg p-4">
      <Text className="text-sm font-semibold text-foreground mb-3">Activity Overview</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Month labels */}
          {showMonthLabels && (
            <View className="flex-row mb-2" style={{ height: 14 }}>
              {monthLabels.map((month) => (
                <View
                  key={`${month.label}-${month.weekIndex}`}
                  style={{
                    position: 'absolute',
                    left: month.weekIndex * (CELL_SIZE + CELL_GAP),
                  }}>
                  <Text className="text-xs text-muted-foreground">{month.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Heatmap grid */}
          <View className="flex-row gap-0.5">
            {/* Day labels */}
            <View className="mr-2">
              {DAYS.map((day, index) => (
                <View
                  key={day}
                  style={{
                    height: CELL_SIZE,
                    marginBottom: CELL_GAP,
                    justifyContent: 'center',
                  }}>
                  {index % 2 === 1 && (
                    <Text className="text-xs text-muted-foreground" style={{ fontSize: 9 }}>
                      {day}
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
          <View className="flex-row items-center gap-2 mt-3">
            <Text className="text-xs text-muted-foreground">Less</Text>
            <View className="flex-row gap-1">
              <View className="bg-muted rounded-sm" style={{ width: 10, height: 10 }} />
              <View className="bg-green-200 dark:bg-green-900/40 rounded-sm" style={{ width: 10, height: 10 }} />
              <View className="bg-green-400 dark:bg-green-700/60 rounded-sm" style={{ width: 10, height: 10 }} />
              <View className="bg-green-500 dark:bg-green-600/80 rounded-sm" style={{ width: 10, height: 10 }} />
              <View className="bg-green-600 dark:bg-green-500 rounded-sm" style={{ width: 10, height: 10 }} />
            </View>
            <Text className="text-xs text-muted-foreground">More</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
