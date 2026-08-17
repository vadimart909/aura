import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import './ConditionModal.css';
import {
  CONDITION_CATEGORIES,
  CONDITION_PARAMETERS,
} from '../../data/mockConditions';

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

function RadioSelectedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#835DE1" />
      <circle cx="12" cy="12" r="6" fill="white" />
    </svg>
  );
}

function RadioUnselectedIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="11.25" stroke="#191919" strokeOpacity="0.25" strokeWidth="1.5" />
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

/**
 * ConditionModal — modal for selecting a condition (category + parameter).
 *
 * @param {Object}   props
 * @param {Function} props.onClose  — close without selecting
 * @param {Function} props.onSelect — callback({ id, title, category }) when user confirms
 */
export default function ConditionModal({ onClose, onSelect, initialCategory, initialParamId, initialBooleanValue, initialDateOperator, excludeParamIds = [] }) {
  /* ---- State ---- */
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [selectedParamId, setSelectedParamId] = useState(initialParamId || '');
  const [isParamOpen, setIsParamOpen] = useState(false);
  const [paramSearch, setParamSearch] = useState('');
  const [booleanValue, setBooleanValue] = useState(initialBooleanValue !== undefined ? initialBooleanValue : true);
  const [dateOperator, setDateOperator] = useState(initialDateOperator || 'equal');
  const [isDateOperatorOpen, setIsDateOperatorOpen] = useState(false);

  const categoryRef = useRef(null);
  const paramRef = useRef(null);
  const dateOperatorRef = useRef(null);
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
    },
    [isCategoryOpen, isParamOpen, isDateOperatorOpen],
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
    setDateOperator('equal');
    setIsDateOperatorOpen(false);
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
              }}
            />
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


function DateOperatorDropdown({
  dateOperatorRef,
  isDateOperatorOpen,
  setIsDateOperatorOpen,
  setIsCategoryOpen,
  setIsParamOpen,
  dateOperator,
  onSelect,
}) {
  const selectedLabel = DATE_OPERATORS.find((o) => o.value === dateOperator)?.label || 'Равно';

  return (
    <div className="condition-modal__dropdown" ref={dateOperatorRef}>
      <div
        className="condition-modal__dropdown-content"
        onClick={() => {
          setIsDateOperatorOpen((prev) => !prev);
          setIsCategoryOpen(false);
          setIsParamOpen(false);
        }}
      >
        <div className="condition-modal__dropdown-text">
          <span className="condition-modal__dropdown-label">Условие</span>
          <span className="condition-modal__dropdown-value">{selectedLabel}</span>
        </div>
        <div className="condition-modal__dropdown-arrow">
          {isDateOperatorOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </div>
      </div>

      {isDateOperatorOpen && (
        <div className="condition-modal__options">
          {DATE_OPERATORS.map((op) => (
            <button
              key={op.value}
              type="button"
              className={`condition-modal__option${
                dateOperator === op.value ? ' condition-modal__option--selected' : ''
              }`}
              onClick={() => onSelect(op.value)}
            >
              <div className="condition-modal__option-text">
                <span className="condition-modal__option-title">{op.label}</span>
              </div>
              {dateOperator === op.value && (
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

