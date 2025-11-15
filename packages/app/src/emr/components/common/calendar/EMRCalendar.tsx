// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mantine/core';
import { useState, useEffect } from 'react';
import { CalendarProps, CalendarView } from './calendar.types';
import { CalendarHeader } from './CalendarHeader';
import { DayGrid } from './DayGrid';
import { MonthGrid } from './MonthGrid';
import { YearGrid } from './YearGrid';
import { getCalendarDays, getMonthsGrid, getYearsGrid } from './calendar.utils';

/**
 * Production-Ready EMR Calendar Component
 *
 * Features:
 * - Apple-inspired minimal design
 * - Multi-level navigation (Day → Month → Year)
 * - Date range selection
 * - Smooth animations
 * - Full year range (1900-2035+)
 */
export function EMRCalendar({
  value,
  onChange,
  minDate = new Date(1900, 0, 1),
  maxDate = new Date(new Date().getFullYear() + 10, 11, 31),
  rangeMode = false,
  rangeStart,
  rangeEnd,
  onRangeChange,
  defaultView = 'day',
}: CalendarProps) {
  const [view, setView] = useState<CalendarView>(defaultView);
  const [displayDate, setDisplayDate] = useState<Date>(value || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value || null);
  const [tempRangeStart, setTempRangeStart] = useState<Date | null>(rangeStart || null);
  const [tempRangeEnd, setTempRangeEnd] = useState<Date | null>(rangeEnd || null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Update display date when value changes
  useEffect(() => {
    if (value) {
      setDisplayDate(value);
      setSelectedDate(value);
    }
  }, [value]);

  // Navigation handlers
  const handlePrevious = () => {
    setIsAnimating(true);
    const newDate = new Date(displayDate);

    if (view === 'day') {
      newDate.setMonth(displayDate.getMonth() - 1);
    } else if (view === 'month') {
      newDate.setFullYear(displayDate.getFullYear() - 1);
    } else if (view === 'year') {
      newDate.setFullYear(displayDate.getFullYear() - 12);
    }

    setDisplayDate(newDate);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleNext = () => {
    setIsAnimating(true);
    const newDate = new Date(displayDate);

    if (view === 'day') {
      newDate.setMonth(displayDate.getMonth() + 1);
    } else if (view === 'month') {
      newDate.setFullYear(displayDate.getFullYear() + 1);
    } else if (view === 'year') {
      newDate.setFullYear(displayDate.getFullYear() + 12);
    }

    setDisplayDate(newDate);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleHeaderClick = () => {
    if (view === 'day') {
      setView('month');
    } else if (view === 'month') {
      setView('year');
    }
  };

  // Day click handler
  const handleDayClick = (date: Date) => {
    if (rangeMode) {
      // Range selection logic
      if (!tempRangeStart || (tempRangeStart && tempRangeEnd)) {
        // Start new range
        setTempRangeStart(date);
        setTempRangeEnd(null);
        onRangeChange?.(date, null);
      } else {
        // Complete range
        if (date < tempRangeStart) {
          setTempRangeStart(date);
          setTempRangeEnd(tempRangeStart);
          onRangeChange?.(date, tempRangeStart);
        } else {
          setTempRangeEnd(date);
          onRangeChange?.(tempRangeStart, date);
        }
      }
    } else {
      // Single date selection
      setSelectedDate(date);
      onChange?.(date);
    }
  };

  // Month click handler
  const handleMonthClick = (month: number) => {
    const newDate = new Date(displayDate.getFullYear(), month, 1);
    setDisplayDate(newDate);
    setView('day');
  };

  // Year click handler
  const handleYearClick = (year: number) => {
    const newDate = new Date(year, displayDate.getMonth(), 1);
    setDisplayDate(newDate);
    setView('month');
  };

  // Get data for current view
  const days = getCalendarDays(
    displayDate,
    selectedDate,
    rangeMode ? tempRangeStart : null,
    rangeMode ? tempRangeEnd : null,
    minDate,
    maxDate
  );
  const months = getMonthsGrid(displayDate.getFullYear(), selectedDate, minDate, maxDate);
  const years = getYearsGrid(displayDate.getFullYear(), selectedDate, minDate, maxDate);

  return (
    <Box
      style={{
        padding: '16px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        minWidth: '320px',
        transition: 'opacity 0.3s ease',
        opacity: isAnimating ? 0.7 : 1,
      }}
    >
      <CalendarHeader
        view={view}
        displayDate={displayDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onHeaderClick={handleHeaderClick}
      />

      <Box
        style={{
          transition: 'all 0.3s ease',
          opacity: isAnimating ? 0 : 1,
          transform: isAnimating ? 'translateY(8px)' : 'translateY(0)',
        }}
      >
        {view === 'day' && <DayGrid days={days} onDayClick={handleDayClick} />}
        {view === 'month' && <MonthGrid months={months} onMonthClick={handleMonthClick} />}
        {view === 'year' && <YearGrid years={years} onYearClick={handleYearClick} />}
      </Box>
    </Box>
  );
}
