"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  getDay,
  isToday
} from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "../lib/utils"; 
import { buttonVariants } from "./button";

interface CalendarProps {
  className?: string;
  selectedDate?: Date;               
  onDateSelect: (date: Date) => void; 
  eventDates?: Date[];               
}

function Calendar({ className, selectedDate, onDateSelect, eventDates = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const startingDayIndex = getDay(firstDayOfMonth); 
  const paddingDays = startingDayIndex === 0 ? 6 : startingDayIndex - 1; 

  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  const hasEvent = (day: Date) => {
    return eventDates.some(eventDate => isSameDay(eventDate, day));
  };

  return (
    // CAMBIO: Quitado 'mx-auto' para que no se centre forzosamente, solo w-full
    <div className={cn("relative w-full", className)}>
      {/* Marco decorativo neón */}
      <div className="absolute inset-0 border-2 border-[#ff0080]/20 rounded-xl pointer-events-none blur-sm" />

      <div className="p-6 bg-[#1a1a1a] rounded-xl border border-[#ff0080] shadow-2xl">
        
        {/* CABECERA */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-wider pl-2">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h2>
          
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 w-10 bg-transparent p-0 text-white hover:bg-[#ff0080] hover:text-white border-[#ff0080]/50")}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={nextMonth}
              className={cn(buttonVariants({ variant: "outline" }), "h-10 w-10 bg-transparent p-0 text-white hover:bg-[#ff0080] hover:text-white border-[#ff0080]/50")}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* DÍAS SEMANA */}
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="text-[#00d9ff] font-bold text-lg uppercase tracking-widest text-center">
              {day}
            </div>
          ))}
        </div>

        {/* CUADRÍCULA DÍAS */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="invisible" />
          ))}

          {daysInMonth.map((date) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);
            const dayHasEvent = hasEvent(date);

            return (
              <button
                key={date.toString()}
                onClick={() => onDateSelect(date)} 
                className={cn(
                  "h-20 w-full rounded-xl flex flex-col items-center justify-center text-xl font-medium transition-all relative group",
                  "text-gray-300 hover:bg-white/10 hover:text-white border border-transparent hover:border-[#ff0080]/30",
                  isSelected && "bg-[#ff0080] text-white shadow-[0_0_20px_#ff0080] font-bold z-10 scale-105 border-none",
                  !isSelected && isCurrentDay && "bg-white/5 text-[#00d9ff] font-bold border-[#00d9ff]/50"
                )}
              >
                <span>{format(date, "d")}</span>
                
                {/* Indicador de evento */}
                {dayHasEvent && (
                  <span className={cn(
                    "absolute bottom-2 w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-white animate-pulse" : "bg-[#ff0080]"
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { Calendar };