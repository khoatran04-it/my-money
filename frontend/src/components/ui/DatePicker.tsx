import * as React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  label?: string;
  error?: string;
  className?: string;
}

export function DatePicker({ date, onSelect, label, error, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Đóng lịch khi click ra ngoài
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full relative', className)} ref={containerRef}>
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">{label}</label>}

      <button
        type="button"
        className={cn(
          'flex h-10 w-full items-center justify-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-all hover:bg-slate-100/70 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20',
          !date && 'text-slate-400',
          error && 'border-red-400 focus:ring-red-400/20'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2.5 h-4 w-4 text-slate-400 shrink-0" />
        {date ? format(date, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày...</span>}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 rounded-2xl border border-slate-200/90 bg-white shadow-xl p-3 animate-in fade-in slide-in-from-top-1.5">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(d) => {
              onSelect?.(d);
              setIsOpen(false);
            }}
            locale={vi}
            className="custom-day-picker m-0"
          />
        </div>
      )}

      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  );
}