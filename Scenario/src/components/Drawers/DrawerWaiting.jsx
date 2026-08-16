import { useState, useRef, useEffect } from 'react';
import './DrawerWaiting.css';

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
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---- Constants ---- */

const UNIT_OPTIONS = [
  { key: 'days', label: 'Дни' },
  { key: 'hours', label: 'Часы' },
];

/**
 * DrawerWaiting — right-side drawer for configuring the «Ожидание» node.
 *
 * @param {Object}   props
 * @param {Function} props.onClose       — close without saving
 * @param {Function} props.onSave        — save handler, receives { unit, amount }
 * @param {string|null}  [props.initialUnit]   — 'days' | 'hours' | null
 * @param {string}       [props.initialAmount] — e.g. '3'
 */
export default function DrawerWaiting({
  onClose,
  onSave,
  initialUnit = null,
  initialAmount = '',
}) {
  const [selectedUnit, setSelectedUnit] = useState(initialUnit);
  const [amount, setAmount] = useState(initialAmount);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!showDropdown) return;
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showDropdown]);

  const handleSelectUnit = (unitKey) => {
    setSelectedUnit(unitKey);
    setShowDropdown(false);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSave = () => {
    onSave({ unit: selectedUnit, amount });
  };

  const selectedUnitLabel =
    UNIT_OPTIONS.find((o) => o.key === selectedUnit)?.label || null;

  const amountPlaceholder =
    selectedUnit === 'days'
      ? 'Укажи количество дней'
      : selectedUnit === 'hours'
        ? 'Укажи количество часов'
        : 'Укажи количество дней или часов';

  return (
    <div className="drawer-waiting-overlay" onClick={onClose}>
      <div className="drawer-waiting" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="drawer-waiting__header">
          <span className="drawer-waiting__title">Ожидание</span>
          <button
            type="button"
            className="drawer-waiting__close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CrossIcon />
          </button>
        </div>

        {/* ---- Content ---- */}
        <div className="drawer-waiting__content">
          <div className="drawer-waiting__fields">
            {/* Field: Дни или часы (dropdown) */}
            <div className="drawer-waiting__field-wrapper" ref={dropdownRef}>
              <div
                className={
                  'drawer-waiting__field drawer-waiting__field--dropdown' +
                  (showDropdown ? ' drawer-waiting__field--focused' : '')
                }
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <div className="drawer-waiting__field-content">
                  <span className="drawer-waiting__field-title">Дни или часы</span>
                  {selectedUnitLabel ? (
                    <span className="drawer-waiting__field-value">
                      {selectedUnitLabel}
                    </span>
                  ) : (
                    <span className="drawer-waiting__field-placeholder">
                      Выбери из списка
                    </span>
                  )}
                </div>
                <div className="drawer-waiting__field-accessory">
                  <ChevronDownIcon />
                </div>
              </div>

              {/* Dropdown options */}
              {showDropdown && (
                <div className="drawer-waiting__dropdown-options">
                  {UNIT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={
                        'drawer-waiting__dropdown-option' +
                        (selectedUnit === option.key
                          ? ' drawer-waiting__dropdown-option--selected'
                          : '')
                      }
                      onClick={() => handleSelectUnit(option.key)}
                    >
                      <span className="drawer-waiting__dropdown-option-label">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Field: Количество (input) */}
            <div className="drawer-waiting__field drawer-waiting__field--input">
              <div className="drawer-waiting__field-content">
                <span className="drawer-waiting__field-title">Количество</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="drawer-waiting__input"
                  placeholder={amountPlaceholder}
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="drawer-waiting__footer">
          <button
            type="button"
            className="drawer-waiting__save-btn"
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
