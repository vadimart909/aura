import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import './TriggerModal.css';

/* ---- Inline SVG icons ---- */

function CrossIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MagnifierIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.75 15.75L12.4875 12.4875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 10L8 6L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmallCrossIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2L2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 2L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

/* ---- Mock trigger data ---- */
const MY_TRIGGERS = [
  {
    id: '1',
    title: 'Подключил Финлид',
    subtitle: 'Веб-аналитика',
    description: 'Описание',
  },
  {
    id: '2',
    title: 'Активировал Финлид',
    subtitle: 'Веб-аналитика',
    description: '',
  },
  {
    id: '3',
    title: 'Скачал выписку',
    subtitle: 'Шина',
    description: 'Описание триггера скачивания выписки по расчётному счёту клиента',
  },
  {
    id: '4',
    title: 'Добавил клиента',
    subtitle: 'Шина',
    description: 'Описание триггера добавления клиента',
  },
  {
    id: '5',
    title: 'Добавил пароль',
    subtitle: '',
    description: '',
  },
  {
    id: '6',
    title: 'Открыл ОРС',
    subtitle: '',
    description: '',
  },
];

const ALL_TRIGGERS = [
  ...MY_TRIGGERS,
  {
    id: '7',
    title: 'Оформил заявку на кредит',
    subtitle: 'Шина',
    description: 'Триггер срабатывает при подаче заявки на кредитный продукт',
  },
  {
    id: '8',
    title: 'Просмотрел страницу тарифов',
    subtitle: 'Веб-аналитика',
    description: 'Клиент открыл страницу с тарифами РКО',
  },
  {
    id: '9',
    title: 'Подписал договор ЭДО',
    subtitle: 'Шина',
    description: 'Подписание договора электронного документооборота',
  },
  {
    id: '10',
    title: 'Зарегистрировался в ЛК',
    subtitle: 'Веб-аналитика',
    description: '',
  },
  {
    id: '11',
    title: 'Отправил платёж',
    subtitle: 'Шина',
    description: 'Триггер отправки платёжного поручения',
  },
  {
    id: '12',
    title: 'Изменил реквизиты',
    subtitle: '',
    description: 'Обновление реквизитов организации в профиле',
  },
];

/* ---- Owner filter options ---- */
const OWNER_OPTIONS = [
  { value: 'mine', label: 'Мои триггеры' },
  { value: 'all', label: 'Все' },
];

/**
 * TriggerModal — modal for selecting a trigger.
 *
 * @param {Object}   props
 * @param {Function} props.onClose  — close without selecting
 * @param {Function} props.onSelect — callback(trigger) when user confirms selection
 * @param {string}   [props.selectedTriggerId] — currently selected trigger id
 */
export default function TriggerModal({ onClose, onSelect, selectedTriggerId }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(selectedTriggerId || '');
  const [showError, setShowError] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [ownerFilter, setOwnerFilter] = useState('mine');
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
  const typeChipRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const ownerChipRef = useRef(null);
  const ownerDropdownRef = useRef(null);

  /* Close dropdowns on outside click */
  const handleClickOutside = useCallback((e) => {
    if (
      typeDropdownRef.current &&
      !typeDropdownRef.current.contains(e.target) &&
      typeChipRef.current &&
      !typeChipRef.current.contains(e.target)
    ) {
      setIsTypeDropdownOpen(false);
    }
    if (
      ownerDropdownRef.current &&
      !ownerDropdownRef.current.contains(e.target) &&
      ownerChipRef.current &&
      !ownerChipRef.current.contains(e.target)
    ) {
      setIsOwnerDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isTypeDropdownOpen || isOwnerDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTypeDropdownOpen, isOwnerDropdownOpen, handleClickOutside]);

  const baseTriggers = ownerFilter === 'all' ? ALL_TRIGGERS : MY_TRIGGERS;
  const triggerTypes = useMemo(
    () => [...new Set(baseTriggers.map((t) => t.subtitle).filter(Boolean))],
    [baseTriggers],
  );

  const filteredTriggers = useMemo(() => {
    let result = baseTriggers;
    if (selectedType) {
      result = result.filter((t) => t.subtitle === selectedType);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    return result;
  }, [search, selectedType, baseTriggers]);

  const handleToggleTypeDropdown = () => {
    setIsTypeDropdownOpen((prev) => !prev);
  };

  const handleSelectType = (type) => {
    setSelectedType((prev) => (prev === type ? null : type));
    setIsTypeDropdownOpen(false);
  };

  const handleResetType = (e) => {
    e.stopPropagation();
    setSelectedType(null);
    setIsTypeDropdownOpen(false);
  };

  const handleToggleOwnerDropdown = () => {
    setIsOwnerDropdownOpen((prev) => !prev);
  };

  const handleSelectOwner = (value) => {
    if (value !== ownerFilter) {
      setOwnerFilter(value);
      /* Reset type filter when switching owner — selected type may not exist in the new list */
      setSelectedType(null);
      setSelectedId('');
    }
    setIsOwnerDropdownOpen(false);
  };

  const handleSubmit = () => {
    if (!selectedId) {
      setShowError(true);
      return;
    }
    const trigger = ALL_TRIGGERS.find((t) => t.id === selectedId);
    if (trigger) {
      onSelect(trigger);
    }
  };

  const handleSelectTrigger = (id) => {
    setSelectedId(id);
    setShowError(false);
  };

  return (
    <div className="trigger-modal-overlay" onClick={onClose}>
      <div className="trigger-modal" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="trigger-modal__header">
          <span className="trigger-modal__title">Триггер</span>
          <button
            type="button"
            className="trigger-modal__close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CrossIcon />
          </button>
        </div>

        {/* ---- Error alert ---- */}
        {showError && (
          <div className="trigger-modal__error-alert">
            Выбери триггер
          </div>
        )}

        {/* ---- Content ---- */}
        <div className="trigger-modal__content">
          {/* Search */}
          <div className="trigger-modal__search">
            <div className="trigger-modal__search-bar">
              <span className="trigger-modal__search-icon">
                <MagnifierIcon />
              </span>
              <input
                type="text"
                className="trigger-modal__search-input"
                placeholder="Название триггера"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Chips */}
          <div className="trigger-modal__chips">
            {/* Owner chip */}
            <div className="trigger-modal__type-chip-wrapper">
              <button
                ref={ownerChipRef}
                type="button"
                className={`trigger-modal__chip${isOwnerDropdownOpen ? ' trigger-modal__chip--pressed' : ''}`}
                onClick={handleToggleOwnerDropdown}
              >
                {OWNER_OPTIONS.find((o) => o.value === ownerFilter)?.label}
                <span className="trigger-modal__chip-chevron">
                  {isOwnerDropdownOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </span>
              </button>
              {isOwnerDropdownOpen && (
                <div ref={ownerDropdownRef} className="trigger-modal__type-dropdown">
                  <div className="trigger-modal__type-dropdown-content">
                    {OWNER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`trigger-modal__type-dropdown-item${ownerFilter === opt.value ? ' trigger-modal__type-dropdown-item--selected' : ''}`}
                        onClick={() => handleSelectOwner(opt.value)}
                      >
                        <span className="trigger-modal__type-dropdown-item-label">{opt.label}</span>
                        {ownerFilter === opt.value && (
                          <span className="trigger-modal__type-dropdown-item-check">
                            <CheckmarkIcon />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Type chip */}
            <div className="trigger-modal__type-chip-wrapper">
              {selectedType ? (
                <span
                  ref={typeChipRef}
                  className="trigger-modal__chip trigger-modal__chip--active"
                >
                  <span
                    className="trigger-modal__chip-label"
                    onClick={handleToggleTypeDropdown}
                  >
                    {selectedType}
                  </span>
                  <button
                    type="button"
                    className="trigger-modal__chip-reset"
                    onClick={handleResetType}
                    aria-label="Сбросить фильтр"
                  >
                    <SmallCrossIcon />
                  </button>
                </span>
              ) : (
                <button
                  ref={typeChipRef}
                  type="button"
                  className={`trigger-modal__chip${isTypeDropdownOpen ? ' trigger-modal__chip--pressed' : ''}`}
                  onClick={handleToggleTypeDropdown}
                >
                  Тип
                  <span className="trigger-modal__chip-chevron">
                    {isTypeDropdownOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  </span>
                </button>
              )}
              {isTypeDropdownOpen && (
                <div ref={typeDropdownRef} className="trigger-modal__type-dropdown">
                  <div className="trigger-modal__type-dropdown-content">
                    {triggerTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`trigger-modal__type-dropdown-item${selectedType === type ? ' trigger-modal__type-dropdown-item--selected' : ''}`}
                        onClick={() => handleSelectType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List */}
          {filteredTriggers.length > 0 ? (
            <div className="trigger-modal__list">
              {filteredTriggers.map((trigger) => (
                <button
                  key={trigger.id}
                  type="button"
                  className="trigger-modal__item"
                  onClick={() => handleSelectTrigger(trigger.id)}
                >
                  <div className="trigger-modal__item-text">
                    {trigger.subtitle && (
                      <span className="trigger-modal__item-subtitle">
                        {trigger.subtitle}
                      </span>
                    )}
                    <span className="trigger-modal__item-title">
                      {trigger.title}
                    </span>
                    {trigger.description && (
                      <span className="trigger-modal__item-description">
                        {trigger.description}
                      </span>
                    )}
                  </div>
                  <div className="trigger-modal__radio">
                    <div
                      className={`trigger-modal__radio-circle${
                        selectedId === trigger.id
                          ? ' trigger-modal__radio-circle--selected'
                          : ''
                      }`}
                    >
                      {selectedId === trigger.id && (
                        <div className="trigger-modal__radio-dot" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="trigger-modal__empty">
              Триггеры не найдены
            </div>
          )}
        </div>

        {/* ---- Footer ---- */}
        <div className="trigger-modal__footer">
          <button
            type="button"
            className="trigger-modal__submit-btn"
            onClick={handleSubmit}
          >
            Выбрать
          </button>
        </div>
      </div>
    </div>
  );
}
