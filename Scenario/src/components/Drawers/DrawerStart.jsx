import { useState, useRef, useEffect } from 'react';
import './DrawerStart.css';
import { TriggerModal } from '../TriggerModal';
import { SegmentModal } from '../SegmentModal';

/* ---- Inline SVG icons ---- */

function CrossIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TriggerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 15H10C11.3807 15 12.5 13.8807 12.5 12.5V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 8L12.5 5L15.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TriggerIconSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 15H10C11.3807 15 12.5 13.8807 12.5 12.5V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 8L12.5 5L15.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="3.33337" width="15" height="14.1667" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.334 1.66663V4.99996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66602 1.66663V4.99996" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 7.5H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 1L21 5L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 23L3 19L7 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SegmentIconSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.1667 2.5H5.83333C4.45262 2.5 3.33333 3.61929 3.33333 5V15C3.33333 16.3807 4.45262 17.5 5.83333 17.5H14.1667C15.5474 17.5 16.6667 16.3807 16.6667 15V5C16.6667 3.61929 15.5474 2.5 14.1667 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 7.5H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10.8334H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 14.1666H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---- Chip types ---- */
const CONDITION_TRIGGER = 'trigger';
const CONDITION_SCHEDULE = 'schedule';

const FREQUENCY_DAILY = 'daily';
const FREQUENCY_SPECIFIC_DAYS = 'specificDays';

const REPEAT_OPTIONS = [
  { key: 'every_week', label: 'Каждую неделю' },
  { key: 'every_2_weeks', label: 'Каждые 2 недели' },
  { key: 'every_3_weeks', label: 'Каждые 3 недели' },
  { key: 'every_4_weeks', label: 'Каждые 4 недели' },
  { key: 'every_5_weeks', label: 'Каждые 5 недель' },
  { key: 'every_6_weeks', label: 'Каждые 6 недель' },
];

/**
 * DrawerStart — right-side drawer for configuring the «Старт» node.
 *
 * @param {Object}   props
 * @param {Function} props.onClose — close without saving
 * @param {Function} props.onSave  — save handler
 */
export default function DrawerStart({ onClose, onSave, initialTrigger = null, initialSegment = null, initialConditionType = CONDITION_TRIGGER, initialSchedule = null }) {
  const [conditionType, setConditionType] = useState(initialConditionType);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState(initialTrigger);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(initialSegment);

  /* Schedule state */
  const [frequencyType, setFrequencyType] = useState(initialSchedule?.frequency || FREQUENCY_DAILY);
  const [selectedTime, setSelectedTime] = useState(initialSchedule?.time || null);
  const [timeInputValue, setTimeInputValue] = useState(initialSchedule?.time || '');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeComboRef = useRef(null);
  const timeInputRef = useRef(null);
  const timeDropdownRef = useRef(null);

  /* Specific days state */
  const [selectedDays, setSelectedDays] = useState(initialSchedule?.days || []);
  const [selectedRepeat, setSelectedRepeat] = useState(
    initialSchedule?.repeat
      ? REPEAT_OPTIONS.find((o) => o.key === initialSchedule.repeat) || null
      : null
  );
  const [showRepeatDropdown, setShowRepeatDropdown] = useState(false);
  const repeatComboRef = useRef(null);

  const DAYS_OF_WEEK = [
    { key: 'mon', label: 'Пн' },
    { key: 'tue', label: 'Вт' },
    { key: 'wed', label: 'Ср' },
    { key: 'thu', label: 'Чт' },
    { key: 'fri', label: 'Пт' },
    { key: 'sat', label: 'Сб' },
    { key: 'sun', label: 'Вс' },
  ];


  /* Time options for the dropdown (15-minute intervals) */
  const timeOptions = Array.from({ length: 96 }, (_, i) => {
    const h = String(Math.floor(i / 4));
    const m = String((i % 4) * 15).padStart(2, '0');
    return `${h}:${m}`;
  });

  /* Filtered time options based on input */
  const filteredTimeOptions = timeInputValue
    ? timeOptions.filter((t) => t.startsWith(timeInputValue))
    : timeOptions;

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (timeComboRef.current && !timeComboRef.current.contains(e.target)) {
        setShowTimeDropdown(false);
        /* If input was cleared, allow clearing the selected time */
        if (timeInputValue.trim() === '') {
          setSelectedTime(null);
          setTimeInputValue('');
        } else {
          setTimeInputValue(selectedTime || '');
        }
      }
      if (repeatComboRef.current && !repeatComboRef.current.contains(e.target)) {
        setShowRepeatDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedTime, timeInputValue]);

  /* Auto-scroll to selected time when dropdown opens */
  useEffect(() => {
    if (showTimeDropdown && selectedTime && timeDropdownRef.current) {
      requestAnimationFrame(() => {
        const selectedEl = timeDropdownRef.current?.querySelector(
          '.drawer-start__dropdown-option--selected'
        );
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: 'center' });
        }
      });
    }
  }, [showTimeDropdown, selectedTime]);

  const handleDayToggle = (dayKey) => {
    setSelectedDays((prev) =>
      prev.includes(dayKey) ? prev.filter((d) => d !== dayKey) : [...prev, dayKey]
    );
  };

  const handleRepeatSelect = (option) => {
    setSelectedRepeat(option);
    setShowRepeatDropdown(false);
  };

  const handleTriggerSelect = (trigger) => {
    setSelectedTrigger(trigger);
    setShowTriggerModal(false);
  };

  const handleDeleteTrigger = () => {
    setSelectedTrigger(null);
  };

  const handleSegmentSelect = (segment) => {
    setSelectedSegment(segment);
    setShowSegmentModal(false);
  };

  const handleDeleteSegment = () => {
    setSelectedSegment(null);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setTimeInputValue(time);
    setShowTimeDropdown(false);
  };

  const handleTimeInputChange = (e) => {
    setTimeInputValue(e.target.value);
    setShowTimeDropdown(true);
  };

  const handleTimeInputFocus = () => {
    setTimeInputValue('');
    setShowTimeDropdown(true);
  };

  const handleTimeInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (filteredTimeOptions.length === 1) {
        handleTimeSelect(filteredTimeOptions[0]);
        timeInputRef.current?.blur();
      } else {
        const exact = timeOptions.find((t) => t === timeInputValue);
        if (exact) {
          handleTimeSelect(exact);
          timeInputRef.current?.blur();
        }
      }
    }
    if (e.key === 'Escape') {
      setShowTimeDropdown(false);
      setTimeInputValue(selectedTime || '');
      timeInputRef.current?.blur();
    }
  };

  return (
    <div className="drawer-start-overlay" onClick={onClose}>
      <div className="drawer-start" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="drawer-start__header">
          <span className="drawer-start__title">Старт</span>
          <button
            type="button"
            className="drawer-start__close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CrossIcon />
          </button>
        </div>

        {/* ---- Content ---- */}
        <div className="drawer-start__content">
          {/* Section: Условия запуска */}
          <div className="drawer-start__section">
            <span className="drawer-start__section-title">Условия запуска</span>
            <div className="drawer-start__chips">
              <button
                type="button"
                className={`drawer-start__chip ${
                  conditionType === CONDITION_TRIGGER
                    ? 'drawer-start__chip--active'
                    : 'drawer-start__chip--inactive'
                }`}
                onClick={() => setConditionType(CONDITION_TRIGGER)}
              >
                <span className="drawer-start__chip-icon">
                  <TriggerIcon />
                </span>
                Триггер
              </button>
              <button
                type="button"
                className={`drawer-start__chip ${
                  conditionType === CONDITION_SCHEDULE
                    ? 'drawer-start__chip--active'
                    : 'drawer-start__chip--inactive'
                }`}
                onClick={() => setConditionType(CONDITION_SCHEDULE)}
              >
                <span className="drawer-start__chip-icon">
                  <CalendarIcon />
                </span>
                Расписание
              </button>
            </div>
          </div>

          {/* Section: Триггер */}
          {conditionType === CONDITION_TRIGGER && (
            <div className="drawer-start__section">
              <span className="drawer-start__section-title">Триггер</span>

              {selectedTrigger ? (
                <>
                  {/* Change trigger button */}
                  <button
                    type="button"
                    className="drawer-start__action-cell"
                    onClick={() => setShowTriggerModal(true)}
                  >
                    <span className="drawer-start__action-cell-icon">
                      <RepeatIcon />
                    </span>
                    <span className="drawer-start__action-cell-label">
                      Сменить
                    </span>
                  </button>

                  {/* Selected trigger card */}
                  <div className="drawer-start__trigger-card">
                    <div className="drawer-start__trigger-avatar">
                      <TriggerIconSmall />
                    </div>
                    <div className="drawer-start__trigger-info">
                      {selectedTrigger.subtitle && (
                        <span className="drawer-start__trigger-overline">
                          {selectedTrigger.subtitle}
                        </span>
                      )}
                      <span className="drawer-start__trigger-title">
                        {selectedTrigger.title}
                      </span>
                      {selectedTrigger.description && (
                        <span className="drawer-start__trigger-description">
                          {selectedTrigger.description}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="drawer-start__trigger-delete"
                      onClick={handleDeleteTrigger}
                      aria-label="Удалить триггер"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  className="drawer-start__action-cell"
                  onClick={() => setShowTriggerModal(true)}
                >
                  <span className="drawer-start__action-cell-icon">
                    <PlusCircleIcon />
                  </span>
                  <span className="drawer-start__action-cell-label">Добавить</span>
                </button>
              )}
            </div>
          )}

          {/* Section: Частота (Schedule) */}
          {conditionType === CONDITION_SCHEDULE && (
            <>
              <div className="drawer-start__section">
                <span className="drawer-start__section-title">Частота</span>
                <div className="drawer-start__chips">
                  <button
                    type="button"
                    className={`drawer-start__chip ${
                      frequencyType === FREQUENCY_DAILY
                        ? 'drawer-start__chip--active'
                        : 'drawer-start__chip--inactive'
                    }`}
                    onClick={() => setFrequencyType(FREQUENCY_DAILY)}
                  >
                    Ежедневно
                  </button>
                  <button
                    type="button"
                    className={`drawer-start__chip ${
                      frequencyType === FREQUENCY_SPECIFIC_DAYS
                        ? 'drawer-start__chip--active'
                        : 'drawer-start__chip--inactive'
                    }`}
                    onClick={() => setFrequencyType(FREQUENCY_SPECIFIC_DAYS)}
                  >
                    В конкретные дни
                  </button>
                </div>
              </div>

              {/* Section: Дни + Повтор (only for specific days) */}
              {frequencyType === FREQUENCY_SPECIFIC_DAYS && (
                <div className="drawer-start__section">
                  <span className="drawer-start__section-title">Дни</span>
                  <div className="drawer-start__days">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        className={`drawer-start__day-chip ${
                          selectedDays.includes(day.key)
                            ? 'drawer-start__day-chip--active'
                            : 'drawer-start__day-chip--inactive'
                        }`}
                        onClick={() => handleDayToggle(day.key)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>

                  {/* Dropdown: Повтор */}
                  <div className="drawer-start__dropdown-wrapper" ref={repeatComboRef}>
                    <div
                      className={`drawer-start__dropdown ${showRepeatDropdown ? 'drawer-start__dropdown--open' : ''}`}
                      onClick={() => setShowRepeatDropdown((prev) => !prev)}
                    >
                      <div className="drawer-start__dropdown-content">
                        <div className="drawer-start__dropdown-text">
                          <span className="drawer-start__dropdown-title">Повтор</span>
                          <span
                            className={`drawer-start__dropdown-value ${
                              selectedRepeat ? 'drawer-start__dropdown-value--selected' : ''
                            }`}
                          >
                            {selectedRepeat ? selectedRepeat.label : 'Выбери из списка'}
                          </span>
                        </div>
                        <div className="drawer-start__dropdown-arrow">
                          <ChevronDownIcon />
                        </div>
                      </div>
                    </div>

                    {showRepeatDropdown && (
                      <div className="drawer-start__dropdown-options">
                        {REPEAT_OPTIONS.map((option) => (
                          <button
                            key={option.key}
                            type="button"
                            className={`drawer-start__dropdown-option ${
                              selectedRepeat?.key === option.key
                                ? 'drawer-start__dropdown-option--selected'
                                : ''
                            }`}
                            onClick={() => handleRepeatSelect(option)}
                          >
                            <span className="drawer-start__dropdown-option-label">{option.label}</span>
                            {selectedRepeat?.key === option.key && (
                              <span className="drawer-start__dropdown-option-check">
                                <CheckmarkIcon />
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Время */}
              <div className="drawer-start__section">
                <span className="drawer-start__section-title">Время</span>
                <div className="drawer-start__dropdown-wrapper" ref={timeComboRef}>
                  <div
                    className={`drawer-start__dropdown ${showTimeDropdown ? 'drawer-start__dropdown--open' : ''}`}
                    onClick={() => {
                      timeInputRef.current?.focus();
                      setShowTimeDropdown(true);
                    }}
                  >
                    <div className="drawer-start__dropdown-content">
                      <div className="drawer-start__dropdown-text">
                        <span className="drawer-start__dropdown-title">Время</span>
                        <input
                          ref={timeInputRef}
                          type="text"
                          className={`drawer-start__dropdown-input ${
                            timeInputValue ? 'drawer-start__dropdown-input--has-value' : ''
                          }`}
                          value={timeInputValue}
                          onChange={handleTimeInputChange}
                          onFocus={handleTimeInputFocus}
                          onKeyDown={handleTimeInputKeyDown}
                          placeholder="Выбери из списка или введи вручную"
                        />
                      </div>
                      <div className="drawer-start__dropdown-arrow">
                        <ChevronDownIcon />
                      </div>
                    </div>
                    <div className="drawer-start__dropdown-description">
                      <div className="drawer-start__dropdown-divider" />
                      <span className="drawer-start__dropdown-hint">
                        Москва (UTC+3)
                      </span>
                    </div>
                  </div>

                  {/* Time dropdown options */}
                  {showTimeDropdown && (
                    <div className="drawer-start__dropdown-options" ref={timeDropdownRef}>
                      {filteredTimeOptions.length > 0 ? (
                        filteredTimeOptions.map((time) => (
                          <button
                            key={time}
                            type="button"
                            className={`drawer-start__dropdown-option ${
                              selectedTime === time ? 'drawer-start__dropdown-option--selected' : ''
                            }`}
                            onClick={() => handleTimeSelect(time)}
                          >
                            <span className="drawer-start__dropdown-option-label">{time}</span>
                            {selectedTime === time && (
                              <span className="drawer-start__dropdown-option-check">
                                <CheckmarkIcon />
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="drawer-start__dropdown-no-results">
                          Нет совпадений
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Section: Сегмент */}
          <div className="drawer-start__section">
            <span className="drawer-start__section-title">Сегмент</span>

            {selectedSegment ? (
              <>
                {/* Change segment button */}
                <button
                  type="button"
                  className="drawer-start__action-cell"
                  onClick={() => setShowSegmentModal(true)}
                >
                  <span className="drawer-start__action-cell-icon">
                    <RepeatIcon />
                  </span>
                  <span className="drawer-start__action-cell-label">
                    Сменить
                  </span>
                </button>

                {/* Selected segment card */}
                <div className="drawer-start__trigger-card">
                  <div className="drawer-start__trigger-avatar">
                    <SegmentIconSmall />
                  </div>
                  <div className="drawer-start__trigger-info">
                    <span className="drawer-start__trigger-title">
                      {selectedSegment.title}
                    </span>
                    {selectedSegment.description && (
                      <span className="drawer-start__trigger-description">
                        {selectedSegment.description}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="drawer-start__trigger-delete"
                    onClick={handleDeleteSegment}
                    aria-label="Удалить сегмент"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="drawer-start__action-cell"
                onClick={() => setShowSegmentModal(true)}
              >
                <span className="drawer-start__action-cell-icon">
                  <PlusCircleIcon />
                </span>
                <span className="drawer-start__action-cell-label">Добавить</span>
              </button>
            )}
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="drawer-start__footer">
          <button
            type="button"
            className="drawer-start__save-btn"
            onClick={() =>
              onSave({
                conditionType,
                trigger: conditionType === CONDITION_TRIGGER ? selectedTrigger : null,
                schedule:
                  conditionType === CONDITION_SCHEDULE
                    ? {
                        frequency: frequencyType,
                        time: selectedTime,
                        ...(frequencyType === FREQUENCY_SPECIFIC_DAYS && {
                          days: selectedDays,
                          repeat: selectedRepeat?.key || null,
                        }),
                      }
                    : null,
                segment: selectedSegment,
              })
            }
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* ---- Trigger selection modal ---- */}
      {showTriggerModal && (
        <TriggerModal
          onClose={() => setShowTriggerModal(false)}
          onSelect={handleTriggerSelect}
          selectedTriggerId={selectedTrigger?.id}
        />
      )}

      {/* ---- Segment selection modal ---- */}
      {showSegmentModal && (
        <SegmentModal
          onClose={() => setShowSegmentModal(false)}
          onSelect={handleSegmentSelect}
          selectedSegmentId={selectedSegment?.id}
        />
      )}
    </div>
  );
}
