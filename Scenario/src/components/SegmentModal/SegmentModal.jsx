import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import './SegmentModal.css';
import { MY_SEGMENTS, SYSTEM_SEGMENTS } from '../../data/mockSegments';

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

function CheckmarkIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 6L7 14L3 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRotationRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 2V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12C3 7.02944 7.02944 3 12 3C15.3652 3 18.2893 4.94652 19.7083 7.76393L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 22V16H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12C21 16.9706 16.9706 21 12 21C8.63476 21 5.71066 19.0535 4.29168 16.2361L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotsThreeHorizontalIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* ---- Owner filter options ---- */
const OWNER_OPTIONS = [
  { value: 'mine', label: 'Мои' },
  { value: 'all', label: 'Системные' },
];

/**
 * SegmentModal — modal for selecting a segment.
 *
 * @param {Object}   props
 * @param {Function} props.onClose  — close without selecting
 * @param {Function} props.onSelect — callback(segment) when user confirms selection
 * @param {string}   [props.selectedSegmentId] — currently selected segment id
 */
export default function SegmentModal({ onClose, onSelect, selectedSegmentId }) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(selectedSegmentId || '');
  const [showError, setShowError] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState('mine');
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
  const ownerChipRef = useRef(null);
  const ownerDropdownRef = useRef(null);

  /* Close dropdown on outside click */
  const handleClickOutside = useCallback((e) => {
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
    if (isOwnerDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOwnerDropdownOpen, handleClickOutside]);

  const baseSegments = ownerFilter === 'all' ? SYSTEM_SEGMENTS : MY_SEGMENTS;

  const filteredSegments = useMemo(() => {
    if (!search.trim()) return baseSegments;
    const q = search.trim().toLowerCase();
    return baseSegments.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q),
    );
  }, [search, baseSegments]);

  const handleToggleOwnerDropdown = () => {
    setIsOwnerDropdownOpen((prev) => !prev);
  };

  const handleSelectOwner = (value) => {
    if (value !== ownerFilter) {
      setOwnerFilter(value);
      setSelectedId('');
    }
    setIsOwnerDropdownOpen(false);
  };

  const handleSelectSegment = (id) => {
    setSelectedId(id);
    setShowError(false);
  };

  const handleSubmit = () => {
    if (!selectedId) {
      setShowError(true);
      return;
    }
    const segment = [...MY_SEGMENTS, ...SYSTEM_SEGMENTS].find((s) => s.id === selectedId);
    if (segment) {
      onSelect(segment);
    }
  };

  return (
    <div className="segment-modal-overlay" onClick={onClose}>
      <div className="segment-modal" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="segment-modal__header">
          <span className="segment-modal__title">Выбор сегмента</span>
          <button
            type="button"
            className="segment-modal__close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CrossIcon />
          </button>
        </div>

        {/* ---- Error alert ---- */}
        {showError && (
          <div className="segment-modal__error-alert">
            Выбери сегмент
          </div>
        )}

        {/* ---- Content ---- */}
        <div className="segment-modal__content">
          {/* Filter row: Owner chip + Search */}
          <div className="segment-modal__filter-row">
            {/* Owner chip */}
            <div className="segment-modal__chip-wrapper">
              <button
                ref={ownerChipRef}
                type="button"
                className={`segment-modal__chip${isOwnerDropdownOpen ? ' segment-modal__chip--pressed' : ''}`}
                onClick={handleToggleOwnerDropdown}
              >
                {OWNER_OPTIONS.find((o) => o.value === ownerFilter)?.label}
                <span className="segment-modal__chip-chevron">
                  {isOwnerDropdownOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </span>
              </button>
              {isOwnerDropdownOpen && (
                <div ref={ownerDropdownRef} className="segment-modal__dropdown">
                  <div className="segment-modal__dropdown-content">
                    {OWNER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`segment-modal__dropdown-item${ownerFilter === opt.value ? ' segment-modal__dropdown-item--selected' : ''}`}
                        onClick={() => handleSelectOwner(opt.value)}
                      >
                        <span className="segment-modal__dropdown-item-label">{opt.label}</span>
                        {ownerFilter === opt.value && (
                          <span className="segment-modal__dropdown-item-check">
                            <CheckmarkIcon />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="segment-modal__search-bar">
              <span className="segment-modal__search-icon">
                <MagnifierIcon />
              </span>
              <input
                type="text"
                className="segment-modal__search-input"
                placeholder="Название или описание"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {filteredSegments.length > 0 ? (
            <div className="segment-modal__table">
              {/* Table header */}
              <div className="segment-modal__table-header">
                <div className="segment-modal__col-radio" />
                <div className="segment-modal__col-segment segment-modal__col-title-text">
                  Сегмент
                </div>
                <div className="segment-modal__col-clients segment-modal__col-title-text">
                  Клиенты
                </div>
                <div className="segment-modal__col-action" />
              </div>

              {/* Table rows */}
              <div className="segment-modal__table-body">
                {filteredSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="segment-modal__row"
                    onClick={() => handleSelectSegment(segment.id)}
                  >
                    {/* Radio */}
                    <div className="segment-modal__col-radio">
                      <div
                        className={`segment-modal__radio-circle${
                          selectedId === segment.id
                            ? ' segment-modal__radio-circle--selected'
                            : ''
                        }`}
                      >
                        {selectedId === segment.id && (
                          <div className="segment-modal__radio-dot" />
                        )}
                      </div>
                    </div>

                    {/* Segment info */}
                    <div className="segment-modal__col-segment">
                      <div className="segment-modal__segment-info">
                        <span className="segment-modal__segment-title">
                          {segment.title}
                        </span>
                        {segment.description && (
                          <span className="segment-modal__segment-description">
                            {segment.description}
                          </span>
                        )}
                        {segment.badge && (
                          <span className="segment-modal__segment-badge">
                            {segment.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Clients */}
                    <div className="segment-modal__col-clients">
                      {segment.author ? (
                        <div className="segment-modal__author">
                          <div className="segment-modal__author-avatar">
                            {segment.author.charAt(0)}
                          </div>
                          <span className="segment-modal__author-name">
                            {segment.author}
                          </span>
                        </div>
                      ) : (
                        <div className="segment-modal__clients-info">
                          {segment.clients && (
                            <span className="segment-modal__clients-count">
                              {segment.clients}
                            </span>
                          )}
                          {segment.clientsDate && (
                            <span className="segment-modal__clients-date">
                              {segment.clientsDate}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    <div className="segment-modal__col-action">
                      <button
                        type="button"
                        className="segment-modal__action-btn"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Действия"
                      >
                        {segment.author ? (
                          <DotsThreeHorizontalIcon />
                        ) : (
                          <ArrowRotationRightIcon />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="segment-modal__empty">
              Сегменты не найдены
            </div>
          )}
        </div>

        {/* ---- Footer ---- */}
        <div className="segment-modal__footer">
          <button
            type="button"
            className="segment-modal__submit-btn"
            onClick={handleSubmit}
          >
            Выбрать
          </button>
        </div>
      </div>
    </div>
  );
}
