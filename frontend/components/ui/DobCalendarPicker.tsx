"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DobCalendarPickerProps {
  name: string;
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  onBlur?: (dob?: string) => void;
  hasError?: boolean;
  maxDate?: string; // "YYYY-MM-DD", defaults to today
  disabled?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function DobCalendarPicker({
  name,
  value,
  onChange,
  onBlur,
  hasError = false,
  maxDate,
  disabled = false,
}: DobCalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const adultDefaultYear = todayYear - 18; // Default adult year (e.g. 2008)

  // Parse initial value or default
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split("-");
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    return isNaN(date.getTime()) ? null : { year: y, month: m, day: d };
  }, [value]);

  // Calendar navigation state
  const [navYear, setNavYear] = useState<number>(() => {
    return parsedDate ? parsedDate.year : adultDefaultYear;
  });

  const [navMonth, setNavMonth] = useState<number>(() => {
    return parsedDate ? parsedDate.month : today.getMonth();
  });

  // Keep nav in sync when value changes externally
  useEffect(() => {
    if (parsedDate) {
      setNavYear(parsedDate.year);
      setNavMonth(parsedDate.month);
    }
  }, [parsedDate]);

  // Close calendar on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          onBlur?.();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onBlur]);

  // Year options: from 1920 up to todayYear
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = todayYear; y >= 1920; y--) {
      years.push(y);
    }
    return years;
  }, [todayYear]);

  // Calculate days in the current month
  const daysInMonth = useMemo(() => {
    return new Date(navYear, navMonth + 1, 0).getDate();
  }, [navYear, navMonth]);

  // Calculate starting day of week (Monday = 0, Sunday = 6)
  const firstDayOfWeek = useMemo(() => {
    const day = new Date(navYear, navMonth, 1).getDay();
    return (day + 6) % 7;
  }, [navYear, navMonth]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear((prev) => Math.max(1920, prev - 1));
    } else {
      setNavMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navMonth === 11) {
      if (navYear < todayYear) {
        setNavMonth(0);
        setNavYear((prev) => prev + 1);
      }
    } else {
      setNavMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const yyyy = navYear.toString();
    const mm = String(navMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    onChange(dateStr);
    onBlur?.(dateStr);
    setIsOpen(false);
  };

  // Formatted display text for trigger button
  const formattedDisplay = useMemo(() => {
    if (!parsedDate) return "";
    const { year, month, day } = parsedDate;
    const monthStr = MONTH_NAMES[month]?.substring(0, 3);
    return `${day} ${monthStr} ${year}`;
  }, [parsedDate]);

  // Check if a specific day is in the future
  const isFutureDay = (day: number) => {
    const testDate = new Date(navYear, navMonth, day);
    const max = maxDate ? new Date(maxDate) : today;
    testDate.setHours(0, 0, 0, 0);
    max.setHours(23, 59, 59, 999);
    return testDate > max;
  };

  const isSelectedDay = (day: number) => {
    return (
      parsedDate?.year === navYear &&
      parsedDate?.month === navMonth &&
      parsedDate?.day === day
    );
  };

  const isToday = (day: number) => {
    return (
      today.getFullYear() === navYear &&
      today.getMonth() === navMonth &&
      today.getDate() === day
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Hidden native input so standard form behaviors and name attribute remain compatible */}
      <input
        ref={nativeInputRef}
        type="date"
        name={name}
        value={value || ""}
        onChange={(e) => {
          onChange(e.target.value);
          onBlur?.(e.target.value);
        }}
        max={maxDate || today.toISOString().split("T")[0]}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Main Clickable Trigger Input */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full h-11 px-3.5 rounded-xl border bg-elevated flex items-center justify-between text-xs font-sans transition-all cursor-pointer select-none focus:outline-none focus:border-primary ${
          hasError
            ? "border-red-500 bg-red-50/20 text-text-primary"
            : isOpen
            ? "border-primary ring-2 ring-primary/20 text-text-primary"
            : "border-border-medium hover:border-primary/50 text-text-primary"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-accent-bg border border-primary/20 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-text-brand" />
          </div>
          {formattedDisplay ? (
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-text-primary">
                {formattedDisplay}
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                ({value})
              </span>
            </div>
          ) : (
            <span className="text-text-muted font-normal text-xs">
              Select Date of Birth from calendar...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                onBlur?.("");
              }}
              className="p-1 hover:bg-surface rounded-full text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="px-2 py-0.5 rounded-md bg-accent-bg border border-primary/20 text-text-brand font-heading font-bold text-[10px] uppercase tracking-wider">
            Calendar
          </span>
        </div>
      </div>

      {/* Calendar Popover Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[320px] bg-surface border border-border rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header: Month & Year Selectors with Prev/Next buttons */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg border border-border hover:bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {/* Month Select */}
              <select
                value={navMonth}
                onChange={(e) => setNavMonth(parseInt(e.target.value, 10))}
                className="bg-elevated border border-border-medium rounded-lg px-2 py-1 text-xs font-heading font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Select */}
              <select
                value={navYear}
                onChange={(e) => setNavYear(parseInt(e.target.value, 10))}
                className="bg-elevated border border-border-medium rounded-lg px-2 py-1 text-xs font-heading font-bold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={navYear >= todayYear && navMonth >= today.getMonth()}
              className="w-8 h-8 rounded-lg border border-border hover:bg-elevated flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="font-heading font-bold text-[10px] text-text-muted uppercase py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank leading cells */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabledDay = isFutureDay(day);
              const selected = isSelectedDay(day);
              const todayCell = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabledDay}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDay(day);
                  }}
                  className={`h-8 w-8 rounded-lg text-xs font-sans transition-all flex items-center justify-center cursor-pointer relative ${
                    selected
                      ? "bg-primary text-white font-bold shadow-sm ring-2 ring-primary/30"
                      : disabledDay
                      ? "text-text-muted/30 cursor-not-allowed"
                      : todayCell
                      ? "border border-primary/60 font-bold text-primary hover:bg-elevated"
                      : "text-text-primary hover:bg-elevated hover:text-primary"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Preset Footer */}
          <div className="mt-3 pt-2.5 border-t border-divider flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setNavYear(adultDefaultYear);
                  setNavMonth(today.getMonth());
                }}
                className="px-2 py-1 rounded bg-elevated hover:bg-accent-bg hover:text-text-brand border border-border-medium font-sans font-bold text-text-muted transition-colors cursor-pointer"
                title={`Jump to ${adultDefaultYear} (18+ Adult Year)`}
              >
                18+ Preset ({adultDefaultYear})
              </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onBlur?.();
              }}
              className="px-2.5 py-1 rounded bg-surface hover:bg-elevated border border-border font-heading font-bold text-text-primary uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
