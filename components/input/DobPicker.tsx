import { useState, useRef, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';

type Props = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
};

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1920;
const years = Array.from({ length: CURRENT_YEAR - MIN_YEAR + 1 }, (_, i) => CURRENT_YEAR - i);

export default function DobPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(value ?? new Date());
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle() {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setOpenUpward(rect.bottom + 360 > window.innerHeight);
    }
    setOpen(prev => !prev);
  }

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>, currentMonth: Date) {
    setMonth(new Date(Number(e.target.value), currentMonth.getMonth(), 1));
  }

  function handleSelect(date: Date | undefined) {
    onChange(date);
    if (date) setOpen(false);
  }

  const MonthCaption = useCallback(({ calendarMonth }: { calendarMonth: { date: Date } }) => (
    <div className="flex items-center justify-center gap-1 py-1">
      <span className="font-bold text-sm">{format(calendarMonth.date, 'MMMM')}</span>
      <select
        value={calendarMonth.date.getFullYear()}
        onChange={(e) => handleYearChange(e, calendarMonth.date)}
        className="font-bold text-sm bg-transparent border-none focus:outline-none cursor-pointer"
      >
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  ), []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full border border-[var(--color-base-200)] rounded-m px-3 py-2 text-left bg-white text-[var(--color-base-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-base-500)]"
      >
        {value ? format(value, 'PPP') : 'Select date of birth'}
      </button>

      {open && (
        <div className={`absolute z-50 bg-white border border-[var(--color-base-200)] rounded-m shadow-lg p-3 ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            month={month}
            onMonthChange={setMonth}
            fromYear={MIN_YEAR}
            toYear={CURRENT_YEAR}
            showOutsideDays
            components={{ MonthCaption }}
            classNames={{
              selected: 'bg-[#043891] text-white rounded-full',
              today: 'font-bold text-[#c50014] ring-2 ring-[#c50014] rounded-full',
            }}
          />
        </div>
      )}
    </div>
  );
}
