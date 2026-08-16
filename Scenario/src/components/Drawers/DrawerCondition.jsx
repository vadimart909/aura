import { useState } from 'react';
import './DrawerCondition.css';
import { ConditionModal } from '../ConditionModal';

/* ---- Inline SVG icons ---- */

function CrossIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function CheckmarkCircleIconSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 10L9.16667 11.6667L12.5 8.33337" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.8784 2.70645C15.0499 1.53538 16.9501 1.53532 18.1215 2.70645L21.2934 5.87735C22.4647 7.04879 22.4645 8.94894 21.2934 10.1205L11.7075 19.7065C11.5794 19.8345 11.4183 19.9252 11.2426 19.9692L3.24263 21.9692C2.90211 22.0542 2.54174 21.9545 2.29341 21.7065C2.04526 21.4581 1.94459 21.0969 2.02974 20.7563L4.02974 12.7563C4.07376 12.5807 4.16545 12.4194 4.29341 12.2914L13.8784 2.70645ZM5.90279 13.5102L4.37447 19.6244L10.4887 18.0961L16.5864 11.9984L12.0004 7.41349L5.90279 13.5102ZM16.7075 4.12052C16.3171 3.73045 15.6839 3.73053 15.2934 4.12052L13.4145 5.99845L18.0004 10.5844L19.8784 8.70645C20.2685 8.3159 20.2688 7.68181 19.8784 7.29142L16.7075 4.12052Z" fill="currentColor" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2C15.6569 2 17 3.34315 17 5V6H21C21.5523 6 22 6.44772 22 7C22 7.55228 21.5523 8 21 8H20V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V8H3C2.44772 8 2 7.55228 2 7C2 6.44772 2.44772 6 3 6H7V5C7 3.34315 8.34315 2 10 2H14ZM6 19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V8H6V19ZM10 10C10.5523 10 11 10.4477 11 11V17C11 17.5523 10.5523 18 10 18C9.44772 18 9 17.5523 9 17V11C9 10.4477 9.44772 10 10 10ZM14 10C14.5523 10 15 10.4477 15 11V17C15 17.5523 14.5523 18 14 18C13.4477 18 13 17.5523 13 17V11C13 10.4477 13.4477 10 14 10ZM10 4C9.44772 4 9 4.44772 9 5V6H15V5C15 4.44772 14.5523 4 14 4H10Z" fill="currentColor" />
    </svg>
  );
}

/**
 * DrawerCondition — right-side drawer for configuring the «Условие» node.
 *
 * @param {Object}   props
 * @param {Function} props.onClose             — close without saving
 * @param {Function} props.onSave              — save handler, receives conditions array
 * @param {Array}    [props.initialConditions]  — previously saved conditions (segment objects)
 */
export default function DrawerCondition({ onClose, onSave, initialConditions = [] }) {
  const [conditions, setConditions] = useState(initialConditions);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);

  const handleAdd = () => {
    setEditingCondition(null);
    setShowConditionModal(true);
  };

  const handleEdit = (condition) => {
    setEditingCondition(condition);
    setShowConditionModal(true);
  };

  const handleConditionSelect = (condition) => {
    if (editingCondition) {
      /* Replace existing condition */
      setConditions((prev) =>
        prev.map((c) => (c.id === editingCondition.id ? condition : c)),
      );
    } else {
      /* Prevent duplicates */
      setConditions((prev) => {
        if (prev.some((c) => c.id === condition.id)) return prev;
        return [...prev, condition];
      });
    }
    setShowConditionModal(false);
    setEditingCondition(null);
  };

  const handleModalClose = () => {
    setShowConditionModal(false);
    setEditingCondition(null);
  };

  const handleRemoveCondition = (conditionId) => {
    setConditions((prev) => prev.filter((c) => c.id !== conditionId));
  };

  const handleSave = () => {
    onSave(conditions);
  };

  return (
    <div className="drawer-condition-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-condition" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="drawer-condition__header">
          <span className="drawer-condition__title">Условие</span>
          <button
            type="button"
            className="drawer-condition__close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CrossIcon />
          </button>
        </div>

        {/* ---- Content ---- */}
        <div className="drawer-condition__content">
          {/* "Добавить" action cell */}
          <button
            type="button"
            className="drawer-condition__action-cell"
            onClick={handleAdd}
          >
            <span className="drawer-condition__action-cell-icon">
              <PlusCircleIcon />
            </span>
            <span className="drawer-condition__action-cell-label">Добавить</span>
          </button>

          {/* Selected condition cards */}
          {conditions.length > 0 && (
            <div className="drawer-condition__conditions-list">
              {conditions.map((condition) => (
                <div key={condition.id} className="drawer-condition__condition-card">
                  <div className="drawer-condition__condition-info">
                    {condition.categoryLabel && (
                      <span className="drawer-condition__condition-overline">
                        {condition.categoryLabel}
                      </span>
                    )}
                    <span className="drawer-condition__condition-title">
                      {condition.title}
                    </span>
                  </div>
                  <div className="drawer-condition__condition-actions">
                    <button
                      type="button"
                      className="drawer-condition__condition-action-btn"
                      onClick={() => handleEdit(condition)}
                      aria-label={`Редактировать условие ${condition.title}`}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className="drawer-condition__condition-action-btn drawer-condition__condition-action-btn--delete"
                      onClick={() => handleRemoveCondition(condition.id)}
                      aria-label={`Удалить условие ${condition.title}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- Footer ---- */}
        <div className="drawer-condition__footer">
          <button
            type="button"
            className="drawer-condition__save-btn"
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* ---- Condition selection modal ---- */}
      {showConditionModal && (
        <ConditionModal
          onClose={handleModalClose}
          onSelect={handleConditionSelect}
          initialCategory={editingCondition?.category}
          initialParamId={editingCondition?.id}
          excludeParamIds={conditions
            .filter((c) => c.id !== editingCondition?.id)
            .map((c) => c.id)
          }
        />
      )}
    </div>
  );
}
