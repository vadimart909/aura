import { useState, useMemo } from 'react';
import './TemplateModal.css';
import { MOCK_TEMPLATES } from '../../data/mockTemplates';

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

/**
 * TemplateModal — modal for selecting a communication template.
 *
 * @param {Object}   props
 * @param {Function} props.onClose              — close without selecting
 * @param {Function} props.onSelect             — callback(template) when user confirms selection
 * @param {string}   [props.selectedTemplateId]  — previously selected template id (or null)
 */
export default function TemplateModal({ onClose, onSelect, selectedTemplateId = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(selectedTemplateId);

  /* ---- Filter templates by search ---- */
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_TEMPLATES;
    return MOCK_TEMPLATES.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  /* ---- Handlers ---- */
  const handleSelectTemplate = (id) => {
    setSelectedId(id);
  };

  const handleSubmit = () => {
    if (!selectedId) return;
    const template = MOCK_TEMPLATES.find((t) => t.id === selectedId);
    if (template) {
      onSelect(template);
    }
  };

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="template-modal__header">
          <span className="template-modal__title">Шаблон</span>
          <button
            type="button"
            className="template-modal__close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CrossIcon />
          </button>
        </div>

        {/* ---- Content ---- */}
        <div className="template-modal__content">
          {/* Search */}
          <div className="template-modal__search">
            <div className="template-modal__search-bar">
              <span className="template-modal__search-icon">
                <MagnifierIcon />
              </span>
              <input
                type="text"
                className="template-modal__search-input"
                placeholder="Поиск"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          {filteredTemplates.length > 0 ? (
            <div className="template-modal__list">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className="template-modal__item"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  <div className="template-modal__item-text">
                    <span className="template-modal__item-title">
                      {template.title}
                    </span>
                    {template.description && (
                      <span className="template-modal__item-description">
                        {template.description}
                      </span>
                    )}
                  </div>
                  <div className="template-modal__radio">
                    <div
                      className={`template-modal__radio-circle${
                        selectedId === template.id
                          ? ' template-modal__radio-circle--selected'
                          : ''
                      }`}
                    >
                      {selectedId === template.id && (
                        <div className="template-modal__radio-dot" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="template-modal__empty">
              Шаблоны не найдены
            </div>
          )}
        </div>

        {/* ---- Footer ---- */}
        <div className="template-modal__footer">
          <button
            type="button"
            className="template-modal__submit-btn"
            onClick={handleSubmit}
          >
            Выбрать
          </button>
        </div>
      </div>
    </div>
  );
}
