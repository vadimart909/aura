import { useState, useRef, useEffect, useCallback } from 'react';
import { ATTRIBUTE_CATEGORIES, ATTRIBUTES } from '@shared/client-attributes/clientAttributes';
import './DrawerParameter.css';

/* ---- Category and parameter data ----
 *
 * Общий список атрибутов клиента: источник — shared/client-attributes/attributes.csv,
 * пересборка — node shared/client-attributes/generate.mjs. Тот же список показывает
 * дровер «Условие» в Scenario. Здесь только адаптация под форму дровера — { id, name,
 * description }; править данные надо в CSV, а не тут.
 */

const PARAMETERS_BY_CATEGORY = {};
for (const attribute of ATTRIBUTES) {
  const list = PARAMETERS_BY_CATEGORY[attribute.categoryId] ?? [];
  list.push({ id: attribute.id, name: attribute.title, description: attribute.description });
  PARAMETERS_BY_CATEGORY[attribute.categoryId] = list;
}

/** Get parameters for a given category. «Все» aggregates all categories. */
function getParametersForCategory(categoryId) {
  if (categoryId === 'all') {
    return Object.values(PARAMETERS_BY_CATEGORY)
      .flat()
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'ru'));
  }
  return PARAMETERS_BY_CATEGORY[categoryId] || [];
}

/* ---- Category list: «Все» + категории из общего списка ---- */

const CATEGORIES = [
  { id: 'all', name: 'Все', description: null },
  ...ATTRIBUTE_CATEGORIES.map((category) => ({
    id: category.id,
    name: category.label,
    description: category.description || null,
  })),
];

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

function CheckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * DrawerParameter — правый боковой drawer для добавления нового параметра.
 *
 * Props:
 *   onClose    — колбэк закрытия drawer
 *   onAdd      — колбэк добавления параметра ({ category, parameter })
 */
export default function DrawerParameter({ onClose, onAdd }) {
  /* ---- Category state ---- */
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const categoryRef = useRef(null);

  /* ---- Parameter state ---- */
  const [paramOpen, setParamOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState(null);
  const [paramSearch, setParamSearch] = useState('');
  const paramRef = useRef(null);
  const paramInputRef = useRef(null);

  const availableParams = getParametersForCategory(selectedCategory.id);
  const filteredParams = paramSearch
    ? availableParams.filter((p) => p.name.toLowerCase().includes(paramSearch.toLowerCase()))
    : availableParams;

  /* ---- Click-outside for both dropdowns ---- */
  const handleClickOutside = useCallback((e) => {
    if (categoryRef.current && !categoryRef.current.contains(e.target)) {
      setCategoryOpen(false);
    }
    if (paramRef.current && !paramRef.current.contains(e.target)) {
      setParamOpen(false);
      setParamSearch('');
    }
  }, []);

  useEffect(() => {
    if (categoryOpen || paramOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [categoryOpen, paramOpen, handleClickOutside]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCategoryOpen(false);
    /* Reset parameter when category changes */
    setSelectedParam(null);
    setParamSearch('');
    setParamOpen(false);
  };

  const handleParamSelect = (param) => {
    setSelectedParam(param);
    setParamSearch('');
    setParamOpen(false);
  };

  const handleAdd = () => {
    onAdd?.({ category: selectedCategory, parameter: selectedParam });
    onClose();
  };

  return (
    <div className="drawer-param-overlay" onClick={handleOverlayClick}>
      <div className="drawer-param">
        {/* ---- Header ---- */}
        <div className="drawer-param__header">
          <span className="drawer-param__title">Новый параметр</span>
          <button
            type="button"
            className="drawer-param__close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CrossIcon />
          </button>
        </div>

        {/* ---- Content ---- */}
        <div className="drawer-param__content">
          {/* Dropdown: Категория */}
          <div className="drawer-param__dropdown-wrap" ref={categoryRef}>
            <div
              className={`drawer-param__dropdown${categoryOpen ? ' drawer-param__dropdown--open' : ''}`}
              onClick={() => setCategoryOpen((prev) => !prev)}
            >
              <div className="drawer-param__dropdown-inner">
                <div className="drawer-param__dropdown-text">
                  <span className="drawer-param__dropdown-label">Категория</span>
                  <span className="drawer-param__dropdown-value">{selectedCategory.name}</span>
                </div>
                <div className="drawer-param__dropdown-accessory">
                  <ChevronDownIcon />
                </div>
              </div>
              {selectedCategory.description && (
                <div className="drawer-param__dropdown-description">
                  <div className="drawer-param__dropdown-divider" />
                  <span className="drawer-param__dropdown-hint">{selectedCategory.description}</span>
                </div>
              )}
            </div>

            {/* Context menu: category list */}
            {categoryOpen && (
              <div className="drawer-param__options">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`drawer-param__option${selectedCategory.id === cat.id ? ' drawer-param__option--selected' : ''}`}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <div className="drawer-param__option-content">
                      <span className="drawer-param__option-name">{cat.name}</span>
                      {cat.description && (
                        <span className="drawer-param__option-desc">{cat.description}</span>
                      )}
                    </div>
                    {selectedCategory.id === cat.id && (
                      <span className="drawer-param__option-check">
                        <CheckIcon />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown: Параметр (с поиском) */}
          <div className="drawer-param__dropdown-wrap" ref={paramRef}>
            <div
              className={`drawer-param__dropdown${paramOpen ? ' drawer-param__dropdown--open' : ''}`}
              onClick={() => {
                if (!paramOpen) {
                  setParamOpen(true);
                  setTimeout(() => paramInputRef.current?.focus(), 0);
                }
              }}
            >
              <div className="drawer-param__dropdown-inner">
                <div className="drawer-param__dropdown-text">
                  <span className="drawer-param__dropdown-label">Параметр</span>
                  {paramOpen ? (
                    <input
                      ref={paramInputRef}
                      className="drawer-param__dropdown-input"
                      type="text"
                      value={paramSearch}
                      onChange={(e) => setParamSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      placeholder="Введи название"
                      autoComplete="off"
                    />
                  ) : selectedParam ? (
                    <span className="drawer-param__dropdown-value">{selectedParam.name}</span>
                  ) : (
                    <span className="drawer-param__dropdown-value drawer-param__dropdown-value--placeholder">
                      Введи название или выбери из списка
                    </span>
                  )}
                </div>
                <div className="drawer-param__dropdown-accessory">
                  <ChevronDownIcon />
                </div>
              </div>
              {!paramOpen && selectedParam?.description && (
                <div className="drawer-param__dropdown-description">
                  <div className="drawer-param__dropdown-divider" />
                  <span className="drawer-param__dropdown-hint">{selectedParam.description}</span>
                </div>
              )}
            </div>

            {/* Context menu: parameter list */}
            {paramOpen && (
              <div className="drawer-param__options">
                {filteredParams.length === 0 ? (
                  <div className="drawer-param__option drawer-param__option--empty">
                    <span className="drawer-param__option-name">
                      {paramSearch ? 'Ничего не найдено' : 'Нет параметров для выбранной категории'}
                    </span>
                  </div>
                ) : (
                  filteredParams.map((param) => (
                    <button
                      key={param.id}
                      type="button"
                      className={`drawer-param__option${selectedParam?.id === param.id ? ' drawer-param__option--selected' : ''}`}
                      onClick={() => handleParamSelect(param)}
                    >
                      <div className="drawer-param__option-content">
                        <span className="drawer-param__option-name">{param.name}</span>
                        {param.description && (
                          <span className="drawer-param__option-desc">{param.description}</span>
                        )}
                      </div>
                      {selectedParam?.id === param.id && (
                        <span className="drawer-param__option-check">
                          <CheckIcon />
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- Footer ---- */}
        <div className="drawer-param__footer">
          <button
            type="button"
            className="drawer-param__add-btn"
            onClick={handleAdd}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}
