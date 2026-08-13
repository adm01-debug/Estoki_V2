import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  color?: string;
}

interface CalendarFullProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export function CalendarFull({
  events = [],
  onDateClick,
  onEventClick,
  className,
}: CalendarFullProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < startPadding; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold">
          {monthNames[month]} {year}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div key={d} className="py-2 text-center text-sm font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isToday =
            day &&
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;
          return (
            <div
              key={i}
              onClick={() => day && onDateClick?.(new Date(year, month, day))}
              className={cn(
                "min-h-[80px] cursor-pointer rounded border p-1 hover:bg-muted/50",
                !day && "bg-muted/20",
                isToday && "border-primary"
              )}
            >
              {day && (
                <>
                  <div className={cn("text-sm", isToday && "font-bold text-primary")}>{day}</div>
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onEventClick?.(e);
                      }}
                      className="mt-1 truncate rounded px-1 text-xs"
                      style={{ backgroundColor: e.color || "#3b82f6", color: "#fff" }}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{dayEvents.length - 3}</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
