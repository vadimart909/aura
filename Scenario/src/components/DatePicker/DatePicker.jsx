import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './DatePicker.css';

/* ---- Helpers ---- */

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Parse "дд.мм.гггг" → Date or null */
function parseDateStr(str) {
  if (!str || str.length !== 10) return null;
  const [dd, mm, yyyy] = str.split('.');
  const d = new Date(+yyyy, +mm - 1, +dd);
  return isNaN(d.getTime()) ? null : d;
}

/** Format Date → "дд.мм.гггг" */
function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${date.getFullYear()}`;
}

/** Monday-based day-of-week: Mon=0..Sun=6 */
function getFirstDayOfWeek(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/** Build rows for a month grid. Each cell: { day, isCurrentMonth, isHoliday, date } */
function buildMonthGrid(year, month) {
  const firstDay = getFirstDayOfWeek(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const prevDays = getDaysInMonth(year, month - 1);
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dow = dateObj.getDay();
    cells.push({ day: d, isCurrentMonth: true, isHoliday: dow === 0 || dow === 6, date: dateObj });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ day: i, isCurrentMonth: false });
    }
  }
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/* ---- Inline SVG icons ---- */

function ChevronLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


/* ---- MonthBlock ---- */

function MonthBlock({ year, month, selectedDate, onSelectDate, showHeader }) {
  const rows = useMemo(() => buildMonthGrid(year, month), [year, month]);

  return (
    <div className="datepicker__month-block">
      {showHeader && (
        <div className="datepicker__month-header">
          <span className="datepicker__month-title">
            {MONTH_NAMES[month]} {year}
          </span>
        </div>
      )}

      <div className="datepicker__day-names">
        {DAY_NAMES.map((name, i) => (
          <span
            key={name}
            className={`datepicker__day-name${i >= 5 ? ' datepicker__day-name--holiday' : ''}`}
          >
            {name}
          </span>
        ))}
      </div>

      {rows.map((row, ri) => (
        <div key={ri} className="datepicker__row">
          {row.map((cell, ci) => {
            if (!cell.isCurrentMonth) {
              return <span key={ci} className="datepicker__cell datepicker__cell--empty" />;
            }
            const isSelected =
              selectedDate &&
              cell.date &&
              cell.date.getFullYear() === selectedDate.getFullYear() &&
              cell.date.getMonth() === selectedDate.getMonth() &&
              cell.date.getDate() === selectedDate.getDate();

            let cls = 'datepicker__cell';
            if (isSelected) cls += ' datepicker__cell--selected';
            else if (cell.isHoliday) cls += ' datepicker__cell--holiday';

            return (
              <button key={ci} type="button" className={cls} onClick={() => onSelectDate(cell.date)}>
                {cell.day}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}


/* ---- DatePicker (exported) ---- */

/**
 * @param {string}   value    — current value "дд.мм.гггг"
 * @param {Function} onChange — callback(dateString)
 * @param {Function} onClose  — close popup
 */
export default function DatePicker({ value, onChange, onClose }) {
  const popupRef = useRef(null);
  const parsed = parseDateStr(value);
  const now = new Date();
  const [baseYear, setBaseYear] = useState(parsed ? parsed.getFullYear() : now.getFullYear());
  const [baseMonth, setBaseMonth] = useState(parsed ? parsed.getMonth() : now.getMonth());

  const secondMonth = baseMonth === 11 ? 0 : baseMonth + 1;
  const secondYear = baseMonth === 11 ? baseYear + 1 : baseYear;

  // Outside click — delay registration so the opening mousedown
  // doesn't immediately trigger onClose via propagation
  useEffect(() => {
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    }
    const raf = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleClick);
    });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  const goPrev = useCallback(() => {
    setBaseMonth((m) => {
      if (m === 0) { setBaseYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const goNext = useCallback(() => {
    setBaseMonth((m) => {
      if (m === 11) { setBaseYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const handleSelect = useCallback((date) => {
    onChange(formatDate(date));
    onClose();
  }, [onChange, onClose]);

  return (
    <div className="datepicker" ref={popupRef}>
      <div className="datepicker__nav">
        <button type="button" className="datepicker__nav-btn" onClick={goPrev} aria-label="Предыдущий месяц">
          <ChevronLeftIcon />
        </button>
        <span className="datepicker__nav-title">
          {MONTH_NAMES[baseMonth]} {baseYear}
          <ChevronDownSmallIcon />
        </span>
        <button type="button" className="datepicker__nav-btn" onClick={goNext} aria-label="Следующий месяц">
          <ChevronRightIcon />
        </button>
      </div>

      <div className="datepicker__scroll">
        <MonthBlock year={baseYear} month={baseMonth} selectedDate={parsed} onSelectDate={handleSelect} showHeader={false} />
        <MonthBlock year={secondYear} month={secondMonth} selectedDate={parsed} onSelectDate={handleSelect} showHeader={true} />
      </div>
    </div>
  );
}

