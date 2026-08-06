import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenariosContext } from '../../context/ScenariosContext';
import './CreateScenario.css';

const MAX_DESCRIPTION_LENGTH = 500;

function CheckmarkIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.25 15.625L11.875 21.25L23.75 9.375"
        stroke="#191919"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ContinueIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.5 15H22.5M22.5 15L16.25 8.75M22.5 15L16.25 21.25"
        stroke="#835DE1"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CreateScenario() {
  const navigate = useNavigate();
  const { addScenario } = useScenariosContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);

  const descriptionCount = description.length;
  const isDescriptionError = descriptionCount >= MAX_DESCRIPTION_LENGTH;
  const counterText = `${String(descriptionCount).padStart(2, '0')} / ${MAX_DESCRIPTION_LENGTH}`;

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }

  function handleNameChange(e) {
    setName(e.target.value);
    if (nameError) {
      setNameError(false);
    }
  }

  function handleSaveDraft() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    addScenario({
      id: Date.now(),
      name: name.trim(),
      description: description.trim(),
      status: 'draft',
      statusLabel: 'Черновик',
      author: 'Вадим Артёменко',
      authorInitials: 'ВА',
      authorColor: '#82C9A1',
      date: `${dd}.${mm}.${yyyy}`,
    });

    setShowDraftModal(true);
  }

  function handleModalContinue() {
    setShowDraftModal(false);
  }

  function handleModalDone() {
    setShowDraftModal(false);
    navigate('/');
  }

  return (
    <div className="flow-scenario">
      {/* ---- Sidebar ---- */}
      <aside className="flow-scenario__sidebar">
        <button
          type="button"
          className="flow-scenario__back-btn"
          onClick={() => navigate(-1)}
          aria-label="Назад"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 6L9 12L15 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1 className="flow-scenario__sidebar-title">Создание сценария</h1>
      </aside>

      {/* ---- Main content ---- */}
      <div className="flow-scenario__main">
        <div className="flow-scenario__form">
          {/* Поле «Название» */}
          <div className={`flow-scenario__field${nameError ? ' flow-scenario__field--error' : ''}`}>
            <div className="flow-scenario__field-content">
              <div className="flow-scenario__field-header">
                <div className="flow-scenario__field-title-row">
                  <span className="flow-scenario__field-label">Название</span>
                  <span className="flow-scenario__field-required">*</span>
                </div>
              </div>
              <textarea
                className="flow-scenario__input"
                placeholder="Введи название сценария"
                value={name}
                onChange={handleNameChange}
                rows={1}
              />
            </div>
            {nameError && (
              <div className="flow-scenario__error">
                <div className="flow-scenario__error-divider" />
                <span className="flow-scenario__error-text">Укажи название</span>
              </div>
            )}
          </div>

          {/* Поле «Описание» */}
          <div className={`flow-scenario__field${isDescriptionError ? ' flow-scenario__field--error' : ''}`}>
            <div className="flow-scenario__field-content">
              <div className="flow-scenario__field-header">
                <div className="flow-scenario__field-title-row">
                  <span className="flow-scenario__field-label">Описание</span>
                </div>
                <span className={`flow-scenario__field-counter${isDescriptionError ? ' flow-scenario__field-counter--error' : ''}`}>
                  {counterText}
                </span>
              </div>
              <textarea
                className="flow-scenario__textarea"
                placeholder="Опиши суть сценария"
                value={description}
                onChange={handleDescriptionChange}
                rows={1}
              />
            </div>
            {isDescriptionError && (
              <div className="flow-scenario__error">
                <div className="flow-scenario__error-divider" />
                <span className="flow-scenario__error-text">
                  Сократи описание до {MAX_DESCRIPTION_LENGTH} символов
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Footer ---- */}
      <footer className="flow-scenario__footer">
        <div className="flow-scenario__footer-content">
          <button
            type="button"
            className="flow-scenario__btn flow-scenario__btn--neutral"
            onClick={handleSaveDraft}
          >
            Сохранить как черновик
          </button>
          <button type="button" className="flow-scenario__btn flow-scenario__btn--brand">
            Продолжить
          </button>
        </div>
      </footer>

      {/* ---- Draft Saved Modal ---- */}
      {showDraftModal && (
        <div className="draft-modal-overlay" onClick={handleModalDone}>
          <div className="draft-modal" onClick={(e) => e.stopPropagation()}>
            <div className="draft-modal__header" />

            <div className="draft-modal__body">
              <div className="draft-modal__avatar">
                <CheckmarkIcon />
              </div>

              <div className="draft-modal__content">
                <div className="draft-modal__title-block">
                  <h2 className="draft-modal__title">Черновик сохранён</h2>
                </div>
                <p className="draft-modal__text">
                  Можешь продолжить заполнять сценарий сейчас или вернуться позже
                </p>
                <button
                  type="button"
                  className="draft-modal__link-btn"
                  onClick={handleModalContinue}
                >
                  <span className="draft-modal__link-icon">
                    <ContinueIcon />
                  </span>
                  <span className="draft-modal__link-text">Продолжить заполнение</span>
                </button>
              </div>
            </div>

            <div className="draft-modal__footer">
              <button
                type="button"
                className="draft-modal__done-btn"
                onClick={handleModalDone}
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
