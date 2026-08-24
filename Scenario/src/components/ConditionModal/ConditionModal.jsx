import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import './ConditionModal.css';
import {
  CONDITION_CATEGORIES,
  CONDITION_PARAMETERS,
} from '../../data/mockConditions';
import { DatePicker } from '../DatePicker';

/* ---- Inline SVG icons ---- */

function CrossIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 6L7 14L3 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 2C16.5523 2 17 2.44772 17 3V4H19C20.6569 4 22 5.34315 22 7V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V7C2 5.34315 3.34315 4 5 4H7V3C7 2.44772 7.44772 2 8 2C8.55228 2 9 2.44772 9 3V4H15V3C15 2.44772 15.4477 2 16 2ZM4 19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V12H4V19ZM5 6C4.44772 6 4 6.44772 4 7V10H20V7C20 6.44772 19.5523 6 19 6H17V7C17 7.55228 16.5523 8 16 8C15.4477 8 15 7.55228 15 7V6H9V7C9 7.55228 8.55228 8 8 8C7.44772 8 7 7.55228 7 7V6H5Z" style={{ fill: 'var(--primitive-neutral-4)' }} />
    </svg>
  );
}

function RadioSelectedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" style={{ fill: 'var(--primitive-brand)' }} />
      <circle cx="12" cy="12" r="6" style={{ fill: 'var(--primitive-default)' }} />
    </svg>
  );
}

function RadioUnselectedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11.25" strokeOpacity="0.25" strokeWidth="1.5" style={{ stroke: 'var(--primitive-primary)' }} />
    </svg>
  );
}

/* ---- Date operator options ---- */
const DATE_OPERATORS = [
  { value: 'equal', label: 'Равно' },
  { value: 'not_equal', label: 'Не равно' },
  { value: 'after_or_equal', label: 'Позже или равно' },
  { value: 'before_or_equal', label: 'Раньше или равно' },
  { value: 'period', label: 'Период' },
];

/* ---- Number operator options ---- */
const NUMBER_OPERATORS = [
  { value: 'equal', label: 'Равно' },
  { value: 'not_equal', label: 'Не равно' },
  { value: 'greater', label: 'Больше' },
  { value: 'greater_or_equal', label: 'Больше или равно' },
  { value: 'less', label: 'Меньше' },
  { value: 'less_or_equal', label: 'Меньше или равно' },
  { value: 'range', label: 'Диапазон' },
];

/* ---- String operator options ---- */
const STRING_OPERATORS = [
  { value: 'equal', label: 'Равно' },
  { value: 'not_equal', label: 'Не равно' },
  { value: 'contains', label: 'Содержит' },
  { value: 'not_contains', label: 'Не содержит' },
  { value: 'filled', label: 'Заполнен' },
  { value: 'not_filled', label: 'Не заполнен' },
];

/** Check whether a string operator requires a value input */
function stringOperatorNeedsValue(op) {
  return op && op !== 'filled' && op !== 'not_filled';
}

/** Check whether a parameter type is numeric */
function isNumericType(type) {
  return type === 'integer' || type === 'number';
}

/**
 * ConditionModal — modal for selecting a condition (category + parameter).
 *
 * @param {Object}   props
 * @param {Function} props.onClose  — close without selecting
 * @param {Function} props.onSelect — callback({ id, title, category }) when user confirms
 */
export default function ConditionModal({ onClose, onSelect, initialCategory, initialParamId, initialBooleanValue, initialDateOperator, initialDateValue, initialDateFrom, initialDateTo, initialNumberOperator, initialNumberValue, initialNumberFrom, initialNumberTo, initialStringOperator, initialStringValue, excludeParamIds = [] }) {
  /* ---- State ---- */
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [selectedParamId, setSelectedParamId] = useState(initialParamId || '');
  const [isParamOpen, setIsParamOpen] = useState(false);
  const [paramSearch, setParamSearch] = useState('');
  const [booleanValue, setBooleanValue] = useState(initialBooleanValue !== undefined ? initialBooleanValue : true);
  const [dateOperator, setDateOperator] = useState(initialDateOperator || '');
  const [isDateOperatorOpen, setIsDateOperatorOpen] = useState(false);
  const [dateValue, setDateValue] = useState(initialDateValue || '');
  const [dateFrom, setDateFrom] = useState(initialDateFrom || '');
  const [dateTo, setDateTo] = useState(initialDateTo || '');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isDateFromPickerOpen, setIsDateFromPickerOpen] = useState(false);
  const [isDateToPickerOpen, setIsDateToPickerOpen] = useState(false);
  const [numberOperator, setNumberOperator] = useState(initialNumberOperator || '');
  const [isNumberOperatorOpen, setIsNumberOperatorOpen] = useState(false);
  const [numberValue, setNumberValue] = useState(initialNumberValue ?? '');
  const [numberFrom, setNumberFrom] = useState(initialNumberFrom ?? '');
  const [numberTo, setNumberTo] = useState(initialNumberTo ?? '');
  const [stringOperator, setStringOperator] = useState(initialStringOperator || '');
  const [isStringOperatorOpen, setIsStringOperatorOpen] = useState(false);
  const [stringValue, setStringValue] = useState(initialStringValue ?? '');

  const categoryRef = useRef(null);
  const paramRef = useRef(null);
  const dateOperatorRef = useRef(null);
  const numberOperatorRef = useRef(null);
  const stringOperatorRef = useRef(null);
  const searchInputRef = useRef(null);

  /* ---- Filtered parameters ---- */
  const filteredParams = useMemo(() => {
    let list = CONDITION_PARAMETERS;
    if (excludeParamIds.length > 0) {
      list = list.filter((p) => !excludeParamIds.includes(p.id));
    }
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (paramSearch.trim()) {
      const q = paramSearch.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    return list;
  }, [selectedCategory, paramSearch, excludeParamIds]);

  /* ---- Selected parameter object ---- */
  const selectedParam = useMemo(
    () => CONDITION_PARAMETERS.find((p) => p.id === selectedParamId) || null,
    [selectedParamId],
  );

  /* ---- Category label ---- */
  const categoryLabel = useMemo(
    () =>
      CONDITION_CATEGORIES.find((c) => c.value === selectedCategory)?.label ||
      'Все',
    [selectedCategory],
  );

  /* ---- Close dropdowns on outside click ---- */
  const handleOutsideClick = useCallback(
    (e) => {
      if (isCategoryOpen && categoryRef.current && !categoryRef.current.contains(e.target)) {
        setIsCategoryOpen(false);
      }
      if (isParamOpen && paramRef.current && !paramRef.current.contains(e.target)) {
        setIsParamOpen(false);
      }
      if (isDateOperatorOpen && dateOperatorRef.current && !dateOperatorRef.current.contains(e.target)) {
        setIsDateOperatorOpen(false);
      }
      if (isNumberOperatorOpen && numberOperatorRef.current && !numberOperatorRef.current.contains(e.target)) {
        setIsNumberOperatorOpen(false);
      }
      if (isStringOperatorOpen && stringOperatorRef.current && !stringOperatorRef.current.contains(e.target)) {
        setIsStringOperatorOpen(false);
      }
    },
    [isCategoryOpen, isParamOpen, isDateOperatorOpen, isNumberOperatorOpen, isStringOperatorOpen],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  /* ---- Focus search input when parameter dropdown opens ---- */
  useEffect(() => {
    if (isParamOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isParamOpen]);

  /* ---- Handlers ---- */
  const handleCategorySelect = (value) => {
    setSelectedCategory(value);
    setIsCategoryOpen(false);
    setSelectedParamId('');
    setParamSearch('');
  };

  const handleParamSelect = (id) => {
    setSelectedParamId(id);
    setIsParamOpen(false);
    setParamSearch('');
    setBooleanValue(true);
    setDateOperator('');
    setIsDateOperatorOpen(false);
    setDateValue('');
    setDateFrom('');
    setDateTo('');
    setIsDatePickerOpen(false);
    setIsDateFromPickerOpen(false);
    setIsDateToPickerOpen(false);
    setNumberOperator('');
    setIsNumberOperatorOpen(false);
    setNumberValue('');
    setNumberFrom('');
    setNumberTo('');
    setStringOperator('');
    setIsStringOperatorOpen(false);
    setStringValue('');
    const param = CONDITION_PARAMETERS.find((p) => p.id === id);
    if (param) {
      setSelectedCategory(param.category);
    }
  };

  const handleSubmit = () => {
    if (!selectedParam) return;
    const categoryObj = CONDITION_CATEGORIES.find((c) => c.value === selectedParam.category);
    const result = {
      id: selectedParam.id,
      title: selectedParam.title,
      description: selectedParam.description,
      category: selectedParam.category,
      categoryLabel: categoryObj?.label || selectedParam.category,
      type: selectedParam.type,
    };
    if (selectedParam.type === 'boolean') {
      result.booleanValue = booleanValue;
    }
    if (selectedParam.type === 'date') {
      result.dateOperator = dateOperator;
      result.dateOperatorLabel = DATE_OPERATORS.find((o) => o.value === dateOperator)?.label || dateOperator;
      if (dateOperator === 'period') {
        result.dateFrom = dateFrom;
        result.dateTo = dateTo;
      } else {
        result.dateValue = dateValue;
      }
    }
    if (isNumericType(selectedParam.type)) {
      result.numberOperator = numberOperator;
      result.numberOperatorLabel = NUMBER_OPERATORS.find((o) => o.value === numberOperator)?.label || numberOperator;
      if (numberOperator === 'range') {
        result.numberFrom = numberFrom;
        result.numberTo = numberTo;
      } else {
        result.numberValue = numberValue;
      }
    }
    if (selectedParam.type === 'string') {
      result.stringOperator = stringOperator;
      result.stringOperatorLabel = STRING_OPERATORS.find((o) => o.value === stringOperator)?.label || stringOperator;
      if (stringOperatorNeedsValue(stringOperator)) {
        result.stringValue = stringValue;
      }
    }
    onSelect(result);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  /* ---- Render ---- */
  return (
    <div className="condition-modal-overlay" onClick={handleOverlayClick}>
      <div className="condition-modal">
        {/* Header */}
        <div className="condition-modal__header">
          <span className="condition-modal__title">Условие</span>
          <button type="button" className="condition-modal__close-btn" onClick={onClose} aria-label="Закрыть">
            <CrossIcon />
          </button>
        </div>

        {/* Content */}
        <div className="condition-modal__content">
          {/* Category dropdown */}
          <CategoryDropdown
            categoryRef={categoryRef}
            isCategoryOpen={isCategoryOpen}
            setIsCategoryOpen={setIsCategoryOpen}
            setIsParamOpen={setIsParamOpen}
            categoryLabel={categoryLabel}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />

          {/* Parameter dropdown (searchable) */}
          <ParameterDropdown
            paramRef={paramRef}
            isParamOpen={isParamOpen}
            setIsParamOpen={setIsParamOpen}
            setIsCategoryOpen={setIsCategoryOpen}
            searchInputRef={searchInputRef}
            paramSearch={paramSearch}
            setParamSearch={setParamSearch}
            selectedParam={selectedParam}
            selectedParamId={selectedParamId}
            filteredParams={filteredParams}
            onSelect={handleParamSelect}
          />

          {/* Date operator dropdown */}
          {selectedParam?.type === 'date' && (
            <DateOperatorDropdown
              dateOperatorRef={dateOperatorRef}
              isDateOperatorOpen={isDateOperatorOpen}
              setIsDateOperatorOpen={setIsDateOperatorOpen}
              setIsCategoryOpen={setIsCategoryOpen}
              setIsParamOpen={setIsParamOpen}
              dateOperator={dateOperator}
              onSelect={(value) => {
                setDateOperator(value);
                setIsDateOperatorOpen(false);
                setDateValue('');
                setDateFrom('');
                setDateTo('');
                setIsDatePickerOpen(false);
                setIsDateFromPickerOpen(false);
                setIsDateToPickerOpen(false);
              }}
            />
          )}

          {/* Date input (single) — for all operators except period */}
          {selectedParam?.type === 'date' && dateOperator && dateOperator !== 'period' && (
            <div className="condition-modal__date-field-wrapper">
              <div
                className={`condition-modal__date-field${isDatePickerOpen ? ' condition-modal__date-field--focused' : ''}`}
                onMouseDown={(e) => {
                  if (!isDatePickerOpen) { setIsDatePickerOpen(true); }
                  e.preventDefault();
                }}
              >
                <div className="condition-modal__date-field-content">
                  <div className="condition-modal__date-field-text">
                    <span className="condition-modal__date-field-label">Дата</span>
                    <span className={`condition-modal__date-field-value${dateValue ? '' : ' condition-modal__date-field-value--placeholder'}`}>
                      {dateValue || 'дд.мм.гггг'}
                    </span>
                  </div>
                  <div className="condition-modal__date-field-icon">
                    <CalendarIcon />
                  </div>
                </div>
              </div>
              {isDatePickerOpen && (
                <DatePicker
                  value={dateValue}
                  onChange={(v) => setDateValue(v)}
                  onClose={() => setIsDatePickerOpen(false)}
                />
              )}
            </div>
          )}

          {/* Date input (period) — two fields side by side */}
          {selectedParam?.type === 'date' && dateOperator === 'period' && (
            <div className="condition-modal__date-field-wrapper condition-modal__date-field-wrapper--period">
              <div className={`condition-modal__date-field${isDateFromPickerOpen || isDateToPickerOpen ? ' condition-modal__date-field--focused' : ''}`}>
                <div className="condition-modal__date-period-content">
                  <span className="condition-modal__date-field-label">Период</span>
                  <div className="condition-modal__date-period-row">
                    <div
                      className={`condition-modal__date-period-input-wrapper${isDateFromPickerOpen ? ' condition-modal__date-period-input-wrapper--focused' : ''}`}
                      onMouseDown={(e) => { if (!isDateFromPickerOpen) { setIsDateFromPickerOpen(true); } setIsDateToPickerOpen(false); e.preventDefault(); }}
                    >
                      <span className={`condition-modal__date-field-value${dateFrom ? '' : ' condition-modal__date-field-value--placeholder'}`}>
                        {dateFrom || 'дд.мм.гггг'}
                      </span>
                      <div className="condition-modal__date-period-divider" />
                    </div>
                    <div
                      className={`condition-modal__date-period-input-wrapper${isDateToPickerOpen ? ' condition-modal__date-period-input-wrapper--focused' : ''}`}
                      onMouseDown={(e) => { if (!isDateToPickerOpen) { setIsDateToPickerOpen(true); } setIsDateFromPickerOpen(false); e.preventDefault(); }}
                    >
                      <span className={`condition-modal__date-field-value${dateTo ? '' : ' condition-modal__date-field-value--placeholder'}`}>
                        {dateTo || 'дд.мм.гггг'}
                      </span>
                      <div className="condition-modal__date-period-divider" />
                    </div>
                  </div>
                </div>
                <div className="condition-modal__date-period-description">
                  Указанные даты входят в период
                </div>
              </div>
              {isDateFromPickerOpen && (
                <DatePicker
                  value={dateFrom}
                  onChange={(v) => setDateFrom(v)}
                  onClose={() => setIsDateFromPickerOpen(false)}
                />
              )}
              {isDateToPickerOpen && (
                <DatePicker
                  value={dateTo}
                  onChange={(v) => setDateTo(v)}
                  onClose={() => setIsDateToPickerOpen(false)}
                />
              )}
            </div>
          )}

          {/* Number operator dropdown */}
          {selectedParam && isNumericType(selectedParam.type) && (
            <NumberOperatorDropdown
              numberOperatorRef={numberOperatorRef}
              isNumberOperatorOpen={isNumberOperatorOpen}
              setIsNumberOperatorOpen={setIsNumberOperatorOpen}
              setIsCategoryOpen={setIsCategoryOpen}
              setIsParamOpen={setIsParamOpen}
              numberOperator={numberOperator}
              onSelect={(value) => {
                setNumberOperator(value);
                setIsNumberOperatorOpen(false);
                setNumberValue('');
                setNumberFrom('');
                setNumberTo('');
              }}
            />
          )}

          {/* Number input (single) — for all operators except range */}
          {selectedParam && isNumericType(selectedParam.type) && numberOperator && numberOperator !== 'range' && (
            <div className="condition-modal__number-field">
              <div className="condition-modal__number-field-content">
                <span className="condition-modal__number-field-label">Значение</span>
                <input
                  type="number"
                  className="condition-modal__number-input"
                  placeholder="Введите число"
                  value={numberValue}
                  onChange={(e) => setNumberValue(e.target.value)}
                />
              </div>
              <div className="condition-modal__number-field-divider" />
            </div>
          )}

          {/* Number input (range) — two fields */}
          {selectedParam && isNumericType(selectedParam.type) && numberOperator === 'range' && (
            <div className="condition-modal__number-field condition-modal__number-field--range">
              <div className="condition-modal__number-range-content">
                <span className="condition-modal__number-field-label">Диапазон</span>
                <div className="condition-modal__number-range-row">
                  <input
                    type="number"
                    className="condition-modal__number-input"
                    placeholder="От"
                    value={numberFrom}
                    onChange={(e) => setNumberFrom(e.target.value)}
                  />
                  <input
                    type="number"
                    className="condition-modal__number-input"
                    placeholder="До"
                    value={numberTo}
                    onChange={(e) => setNumberTo(e.target.value)}
                  />
                </div>
              </div>
              <div className="condition-modal__number-range-description-block">
                <div className="condition-modal__number-range-dividers">
                  <div className="condition-modal__number-range-divider" />
                  <div className="condition-modal__number-range-divider" />
                </div>
                <span className="condition-modal__number-range-description">
                  Указанные значения входят в диапазон
                </span>
              </div>
            </div>
          )}

          {/* Boolean radio group */}
          {selectedParam?.type === 'boolean' && (
            <div className="condition-modal__radio-group">
              <button
                type="button"
                className="condition-modal__radio-cell condition-modal__radio-cell--top"
                onClick={() => setBooleanValue(true)}
              >
                <span className="condition-modal__radio-label">Да</span>
                <span className="condition-modal__radio-icon">
                  {booleanValue === true ? <RadioSelectedIcon /> : <RadioUnselectedIcon />}
                </span>
              </button>
              <button
                type="button"
                className="condition-modal__radio-cell condition-modal__radio-cell--bottom"
                onClick={() => setBooleanValue(false)}
              >
                <div className="condition-modal__radio-divider" />
                <div className="condition-modal__radio-cell-content">
                  <span className="condition-modal__radio-label">Нет</span>
                  <span className="condition-modal__radio-icon">
                    {booleanValue === false ? <RadioSelectedIcon /> : <RadioUnselectedIcon />}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* String operator dropdown (context-menu style) */}
          {selectedParam?.type === 'string' && (
            <div className="condition-modal__context-menu-wrapper" ref={stringOperatorRef}>
              <div
                className={`condition-modal__dropdown${isStringOperatorOpen ? ' condition-modal__dropdown--focused' : ''}`}
                onClick={() => {
                  setIsStringOperatorOpen((prev) => !prev);
                  setIsCategoryOpen(false);
                  setIsParamOpen(false);
                }}
              >
                <div className="condition-modal__dropdown-content">
                  <div className="condition-modal__dropdown-text">
                    <span className="condition-modal__dropdown-label">Условие</span>
                    {stringOperator ? (
                      <span className="condition-modal__dropdown-value">
                        {STRING_OPERATORS.find((o) => o.value === stringOperator)?.label}
                      </span>
                    ) : (
                      <span className="condition-modal__dropdown-value condition-modal__dropdown-value--placeholder">
                        Выбери из списка
                      </span>
                    )}
                  </div>
                  <div className="condition-modal__dropdown-arrow">
                    {isStringOperatorOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </div>
                </div>
              </div>

              {isStringOperatorOpen && (
                <div className="condition-modal__context-menu">
                  <div className="condition-modal__context-menu-list">
                    {STRING_OPERATORS.map((op) => (
                      <button
                        key={op.value}
                        type="button"
                        className={`condition-modal__context-menu-item${
                          stringOperator === op.value ? ' condition-modal__context-menu-item--selected' : ''
                        }`}
                        onClick={() => {
                          setStringOperator(op.value);
                          setIsStringOperatorOpen(false);
                          if (!stringOperatorNeedsValue(op.value)) {
                            setStringValue('');
                          }
                        }}
                      >
                        <span className="condition-modal__context-menu-item-label">{op.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* String value input — for operators that require a value */}
          {selectedParam?.type === 'string' && stringOperatorNeedsValue(stringOperator) && (
            <div className="condition-modal__string-field">
              <div className="condition-modal__string-field-content">
                <span className="condition-modal__string-field-label">Текст</span>
                <input
                  type="text"
                  className="condition-modal__string-input"
                  placeholder="Введите значение"
                  value={stringValue}
                  onChange={(e) => setStringValue(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="condition-modal__footer">
          <button type="button" className="condition-modal__submit-btn" onClick={handleSubmit}>
            Выбрать
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Sub-components
   ========================================================================== */

function CategoryDropdown({
  categoryRef,
  isCategoryOpen,
  setIsCategoryOpen,
  setIsParamOpen,
  categoryLabel,
  selectedCategory,
  onSelect,
}) {
  return (
    <div className="condition-modal__dropdown" ref={categoryRef}>
      <div
        className="condition-modal__dropdown-content"
        onClick={() => {
          setIsCategoryOpen((prev) => !prev);
          setIsParamOpen(false);
        }}
      >
        <div className="condition-modal__dropdown-text">
          <span className="condition-modal__dropdown-label">Категория</span>
          <span className="condition-modal__dropdown-value">{categoryLabel}</span>
          {(() => {
            const cat = CONDITION_CATEGORIES.find((c) => c.value === selectedCategory);
            return cat && cat.description && cat.description !== cat.label ? (
              <span className="condition-modal__dropdown-description">{cat.description}</span>
            ) : null;
          })()}
        </div>
        <div className="condition-modal__dropdown-arrow">
          {isCategoryOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>

      {isCategoryOpen && (
        <div className="condition-modal__options">
          {CONDITION_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`condition-modal__option${
                selectedCategory === cat.value ? ' condition-modal__option--selected' : ''
              }`}
              onClick={() => onSelect(cat.value)}
            >
              <div className="condition-modal__option-text">
                <span className="condition-modal__option-title">{cat.label}</span>
                {cat.description && cat.description !== cat.label && (
                  <span className="condition-modal__option-description">{cat.description}</span>
                )}
              </div>
              {selectedCategory === cat.value && (
                <span className="condition-modal__option-check">
                  <CheckmarkIcon />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ParameterDropdown({
  paramRef,
  isParamOpen,
  setIsParamOpen,
  setIsCategoryOpen,
  searchInputRef,
  paramSearch,
  setParamSearch,
  selectedParam,
  selectedParamId,
  filteredParams,
  onSelect,
}) {
  const placeholder = 'Начни вводить название или выбери из списка';

  return (
    <div className="condition-modal__dropdown" ref={paramRef}>
      <div
        className="condition-modal__dropdown-content"
        onClick={() => {
          setIsParamOpen((prev) => !prev);
          setIsCategoryOpen(false);
        }}
      >
        <div className="condition-modal__dropdown-text">
          <span className="condition-modal__dropdown-label">Параметр</span>
          {isParamOpen ? (
            <input
              ref={searchInputRef}
              type="text"
              className="condition-modal__search-input"
              placeholder={placeholder}
              value={paramSearch}
              onChange={(e) => setParamSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          ) : selectedParam ? (
            <>
              <span className="condition-modal__dropdown-value">{selectedParam.title}</span>
              {selectedParam.description && (
                <span className="condition-modal__dropdown-description">{selectedParam.description}</span>
              )}
            </>
          ) : (
            <span className="condition-modal__dropdown-value condition-modal__dropdown-value--placeholder">
              {placeholder}
            </span>
          )}
        </div>
        <div className="condition-modal__dropdown-arrow">
          {isParamOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>

      {isParamOpen && (
        <div className="condition-modal__options">
          {filteredParams.length > 0 ? (
            filteredParams.map((param) => (
              <button
                key={param.id}
                type="button"
                className={`condition-modal__option${
                  selectedParamId === param.id ? ' condition-modal__option--selected' : ''
                }`}
                onClick={() => onSelect(param.id)}
              >
                <div className="condition-modal__option-text">
                  <span className="condition-modal__option-title">{param.title}</span>
                  {param.description && param.description !== param.title && (
                    <span className="condition-modal__option-description">{param.description}</span>
                  )}
                </div>
                {selectedParamId === param.id && (
                  <span className="condition-modal__option-check">
                    <CheckmarkIcon />
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="condition-modal__options-empty">
              Параметры не найдены
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function OperatorDropdown({
  operatorRef,
  isOpen,
  setIsOpen,
  setIsCategoryOpen,
  setIsParamOpen,
  selectedValue,
  operators,
  onSelect,
}) {
  const selectedOp = operators.find((o) => o.value === selectedValue);

  return (
    <div className="condition-modal__dropdown" ref={operatorRef}>
      <div
        className="condition-modal__dropdown-content"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsCategoryOpen(false);
          setIsParamOpen(false);
        }}
      >
        <div className="condition-modal__dropdown-text">
          <span className="condition-modal__dropdown-label">Условие</span>
          {selectedOp ? (
            <span className="condition-modal__dropdown-value">{selectedOp.label}</span>
          ) : (
            <span className="condition-modal__dropdown-value condition-modal__dropdown-value--placeholder">
              Выбери из списка
            </span>
          )}
        </div>
        <div className="condition-modal__dropdown-arrow">
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>

      {isOpen && (
        <div className="condition-modal__options">
          {operators.map((op) => (
            <button
              key={op.value}
              type="button"
              className={`condition-modal__option${
                selectedValue === op.value ? ' condition-modal__option--selected' : ''
              }`}
              onClick={() => onSelect(op.value)}
            >
              <div className="condition-modal__option-text">
                <span className="condition-modal__option-title">{op.label}</span>
              </div>
              {selectedValue === op.value && (
                <span className="condition-modal__option-check">
                  <CheckmarkIcon />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DateOperatorDropdown({
  dateOperatorRef,
  isDateOperatorOpen,
  setIsDateOperatorOpen,
  setIsCategoryOpen,
  setIsParamOpen,
  dateOperator,
  onSelect,
}) {
  return (
    <OperatorDropdown
      operatorRef={dateOperatorRef}
      isOpen={isDateOperatorOpen}
      setIsOpen={setIsDateOperatorOpen}
      setIsCategoryOpen={setIsCategoryOpen}
      setIsParamOpen={setIsParamOpen}
      selectedValue={dateOperator}
      operators={DATE_OPERATORS}
      onSelect={onSelect}
    />
  );
}

function NumberOperatorDropdown({
  numberOperatorRef,
  isNumberOperatorOpen,
  setIsNumberOperatorOpen,
  setIsCategoryOpen,
  setIsParamOpen,
  numberOperator,
  onSelect,
}) {
  return (
    <OperatorDropdown
      operatorRef={numberOperatorRef}
      isOpen={isNumberOperatorOpen}
      setIsOpen={setIsNumberOperatorOpen}
      setIsCategoryOpen={setIsCategoryOpen}
      setIsParamOpen={setIsParamOpen}
      selectedValue={numberOperator}
      operators={NUMBER_OPERATORS}
      onSelect={onSelect}
    />
  );
}

