import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface NumberInputProps {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  allowZero?: boolean;
  disabled?: boolean;
  suffix?: string;
  helperText?: React.ReactNode;
  autoFocus?: boolean;
  id?: string;
}

/**
 * Định dạng chuỗi số với dấu phẩy phân cách hàng nghìn (VD: 1000000 -> 1,000,000; 1234.5 -> 1,234.5)
 */
export function formatWithCommas(val: string): string {
  if (!val) return '';
  // Chỉ giữ chữ số và dấu chấm thập phân
  let clean = val.replace(/,/g, '').replace(/[^\d.]/g, '');

  // Nếu có nhiều dấu chấm, chỉ giữ dấu chấm đầu tiên
  const firstDotIndex = clean.indexOf('.');
  if (firstDotIndex !== -1) {
    const beforeDot = clean.substring(0, firstDotIndex);
    const afterDot = clean.substring(firstDotIndex + 1).replace(/\./g, '');
    clean = `${beforeDot}.${afterDot}`;
  }

  const parts = clean.split('.');
  // Bỏ số 0 thừa ở đầu phần nguyên trừ khi chỉ có đúng số 0
  if (parts[0].length > 1 && parts[0].startsWith('0')) {
    parts[0] = parts[0].replace(/^0+(?=\d)/, '');
  }

  // Chèn dấu phẩy phân cách hàng nghìn
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

/**
 * Chuyển chuỗi đã định dạng về số float/decimal thực tế
 */
export function parseNumber(formatted: string): number | undefined {
  if (!formatted || formatted.trim() === '') return undefined;
  const clean = formatted.replace(/,/g, '');
  if (clean === '' || clean === '.') return undefined;
  const num = parseFloat(clean);
  return isNaN(num) ? undefined : num;
}

export function NumberInput({
  value,
  onValueChange,
  label,
  error,
  placeholder = '0',
  className,
  inputClassName,
  allowZero = false,
  disabled = false,
  suffix,
  helperText,
  autoFocus = false,
  id,
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Khởi tạo displayValue ban đầu
  const getInitialDisplay = useCallback(() => {
    if (value === undefined || value === null) return '';
    if (value === 0 && !allowZero) return '';
    return formatWithCommas(value.toString());
  }, [value, allowZero]);

  const [displayValue, setDisplayValue] = useState<string>(getInitialDisplay);

  // Đồng bộ displayValue khi prop value thay đổi từ bên ngoài (khi không đang gõ)
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(getInitialDisplay());
    }
  }, [value, isFocused, getInitialDisplay]);

  // Xử lý thay đổi khi người dùng nhập liệu
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawInput = input.value;
    const cursorPosition = input.selectionStart ?? rawInput.length;

    // Đếm số lượng ký tự không phải dấu phẩy trước vị trí con trỏ
    const nonCommasBefore = rawInput.slice(0, cursorPosition).replace(/,/g, '').length;

    // Định dạng chuỗi mới
    const formatted = formatWithCommas(rawInput);
    setDisplayValue(formatted);

    // Parse ra số thực để gửi về form/state
    const numericValue = parseNumber(formatted);
    onValueChange?.(numericValue);

    // Khôi phục vị trí con trỏ chính xác sau khi React re-render
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      let newPos = 0;
      let count = 0;
      while (newPos < formatted.length && count < nonCommasBefore) {
        if (formatted[newPos] !== ',') {
          count++;
        }
        newPos++;
      }
      inputRef.current.setSelectionRange(newPos, newPos);
    });
  };

  // Xử lý phím Backspace mượt mà khi xóa trúng dấu phẩy
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && inputRef.current) {
      const { selectionStart, selectionEnd } = inputRef.current;
      if (selectionStart === selectionEnd && selectionStart !== null && selectionStart > 0) {
        // Nếu ký tự ngay bên trái con trỏ là dấu phẩy
        if (displayValue[selectionStart - 1] === ',') {
          e.preventDefault();
          // Xóa chữ số đứng trước dấu phẩy
          const newRaw =
            displayValue.slice(0, selectionStart - 2) + displayValue.slice(selectionStart);
          const formatted = formatWithCommas(newRaw);
          setDisplayValue(formatted);
          const numValue = parseNumber(formatted);
          onValueChange?.(numValue);

          const newPos = Math.max(0, selectionStart - 2);
          requestAnimationFrame(() => {
            inputRef.current?.setSelectionRange(newPos, newPos);
          });
        }
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Khi blur, định dạng lại lần cuối để chuẩn hóa
    if (value !== undefined && value !== null) {
      if (value === 0 && !allowZero) {
        setDisplayValue('');
      } else {
        setDisplayValue(formatWithCommas(value.toString()));
      }
    } else {
      setDisplayValue('');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            {label}
          </label>
        </div>
      )}

      <div className="relative flex items-center w-full">
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 transition-colors',
            suffix && 'pr-14',
            error
              ? 'border-red-400 focus:ring-red-400/20'
              : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20',
            disabled && 'opacity-60 cursor-not-allowed bg-slate-100',
            inputClassName
          )}
        />
        {suffix && (
          <span className="absolute right-3.5 text-xs font-semibold text-slate-400 pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>

      {helperText && <div className="mt-0.5">{helperText}</div>}

      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}
