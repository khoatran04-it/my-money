import * as React from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale'; // Hiển thị tiếng Việt
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Import CSS mặc định
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

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
      {label && <label className="text-sm font-medium text-content">{label}</label>}

      <Button
        type="button"
        variant="outline"
        className={cn(
          'w-full justify-start text-left font-normal bg-surface border-slate-200 text-content hover:bg-slate-50',
          !date && 'text-content-muted',
          error && 'border-negative focus:ring-negative'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày...</span>}
      </Button>

      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] left-0 z-50 rounded-lg border border-slate-100 bg-surface shadow-lg p-2 animate-in fade-in slide-in-from-top-2">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(d) => {
              onSelect?.(d);
              setIsOpen(false);
            }}
            locale={vi}
            modifiersStyles={{
              selected: { backgroundColor: 'var(--color-primary)', color: 'white' },
              today: { color: 'var(--color-primary)', fontWeight: 'bold' }
            }}
          />
        </div>
      )}

      {error && <span className="text-xs font-medium text-negative">{error}</span>}
    </div>
  );
}