import { useState, useRef, useEffect } from 'react';
import './DrawerCommunication.css';
import { TemplateModal } from '../TemplateModal';
import ConfirmDialog from '../ConfirmDialog';
import {
  ArrowsRotationRight,
  ConnectionArrowsRepeatLeft,
  DocumentListBulleted,
  DocumentReport,
  Pencil,
} from '@ds/icons';

/* ---- Inline SVG icons ---- */

function CrossIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossSmallIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

function PlusCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentListIconSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.6667 1.66663H5.00004C4.55801 1.66663 4.13409 1.84222 3.82153 2.15478C3.50897 2.46734 3.33337 2.89127 3.33337 3.33329V16.6666C3.33337 17.1087 3.50897 17.5326 3.82153 17.8451C4.13409 18.1577 4.55801 18.3333 5.00004 18.3333H15C15.4421 18.3333 15.866 18.1577 16.1786 17.8451C16.4911 17.5326 16.6667 17.1087 16.6667 16.6666V6.66663L11.6667 1.66663Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.6666 1.66663V6.66663H16.6666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.3334 10.8334H6.66671" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.3334 14.1666H6.66671" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.33337 7.5H6.66671" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

function CheckmarkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


/* ---- Communication types ---- */
const TYPE_TEMPLATE = 'template';
const TYPE_BANNER = 'banner';

/** Редактора баннеров нет — «Создать» прикрепляет ту запись, что стоит в макете. */
const PLACEHOLDER_BANNER = { id: 'Test scenario_ID', title: 'Заголовок. Подзаголовок' };

/* ---- Helpers ---- */

/**
 * Capitalize first letter of a string.
 */
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Parse comma-separated channels string into an array of capitalized names.
 * E.g. "Email, пуш, чат" → ["Email", "Пуш", "Чат"]
 */
function parseChannels(subtitle) {
  if (!subtitle) return [];
  return subtitle
    .split(',')
    .map((ch) => capitalize(ch.trim()))
    .filter(Boolean);
}

/**
 * DrawerCommunication — right-side drawer for configuring the «Коммуникация» node.
 *
 * @param {Object}   props
 * @param {Function} props.onClose           — close without saving
 * @param {Function} props.onSave            — save handler, receives { type, template, channels, banner }
 * @param {Object}   [props.initialTemplate] — previously selected template (or null)
 * @param {'template'|'banner'} [props.initialType] — previously chosen communication type
 * @param {Object}   [props.initialBanner]   — previously attached banner (or null)
 */
export default function DrawerCommunication({
  onClose,
  onSave,
  initialTemplate = null,
  initialType = TYPE_TEMPLATE,
  initialBanner = null,
}) {
  const [type, setType] = useState(initialType);
  const [banner, setBanner] = useState(initialBanner);
  // Тип, на который хотят уйти, пока пользователь отвечает на модалку.
  const [pendingType, setPendingType] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate);
  const [allChannels, setAllChannels] = useState(() => parseChannels(initialTemplate?.subtitle));
  const [channels, setChannels] = useState(() => parseChannels(initialTemplate?.subtitle));
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showChannelsDropdown, setShowChannelsDropdown] = useState(false);
  const channelsRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!showChannelsDropdown) return;
    const handleOutsideClick = (e) => {
      if (channelsRef.current && !channelsRef.current.contains(e.target)) {
        setShowChannelsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showChannelsDropdown]);

  const handleAddTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleChangeTemplate = () => {
    setShowTemplateModal(true);
  };

  /** Сброс вкладки «Шаблон» — общий для корзины и для переключения типа. */
  const clearTemplate = () => {
    setSelectedTemplate(null);
    setAllChannels([]);
    setChannels([]);
    setShowChannelsDropdown(false);
  };

  const handleDeleteTemplate = clearTemplate;

  /* ---- Переключение типа ------------------------------------------------
     Уходить с заполненного чипа молча нельзя: содержимое не сохранится, —
     поэтому сначала спрашиваем. */
  const hasContent = type === TYPE_TEMPLATE ? selectedTemplate !== null : banner !== null;

  const handleTypeClick = (next) => {
    if (next === type) return;
    if (hasContent) {
      setPendingType(next);
      return;
    }
    setType(next);
  };

  const handleConfirmSwitch = () => {
    // «Переключиться» — содержимое покидаемого чипа удаляется.
    if (type === TYPE_TEMPLATE) clearTemplate();
    else setBanner(null);
    setType(pendingType);
    setPendingType(null);
  };

  const handleTemplateSelect = (template) => {
    const parsed = parseChannels(template.subtitle);
    setSelectedTemplate(template);
    setAllChannels(parsed);
    setChannels(parsed);
    setShowChannelsDropdown(false);
    setShowTemplateModal(false);
  };

  const handleRemoveChannel = (channelToRemove) => {
    setChannels((prev) => prev.filter((ch) => ch !== channelToRemove));
  };

  const handleToggleChannelsDropdown = () => {
    setShowChannelsDropdown((prev) => !prev);
  };

  const handleToggleChannel = (channel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((ch) => ch !== channel)
        : [...prev, channel],
    );
  };

  /* Validation: channels must not be empty when a template is selected. Scoped
     to the template tab — a leftover template with emptied channels must not
     block saving a banner communication. */
  const hasChannelsError =
    type === TYPE_TEMPLATE && selectedTemplate !== null && channels.length === 0;

  const handleSave = () => {
    if (hasChannelsError) return;
    onSave({ type, template: selectedTemplate, channels, banner });
  };

  return (
    <>
    <div className="drawer-communication-overlay" onClick={onClose}>
      <div className="drawer-communication" onClick={(e) => e.stopPropagation()}>
        {/* ---- Header ---- */}
        <div className="drawer-communication__header">
          <span className="drawer-communication__title">Коммуникация</span>
          <button
            type="button"
            className="drawer-communication__close-btn"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <CrossIcon />
          </button>
        </div>

        {/* ---- Content ---- */}
        <div className="drawer-communication__content">
          {/* Section: Тип коммуникации */}
          <div className="drawer-communication__section">
            <span className="drawer-communication__section-title">Тип коммуникации</span>
            <div className="drawer-communication__chips">
              <button
                type="button"
                className={`drawer-communication__chip ${
                  type === TYPE_TEMPLATE
                    ? 'drawer-communication__chip--active'
                    : 'drawer-communication__chip--inactive'
                }`}
                onClick={() => handleTypeClick(TYPE_TEMPLATE)}
              >
                <span className="drawer-communication__chip-icon ds-icon ds-icon--20">
                  <DocumentListBulleted />
                </span>
                Шаблон
              </button>
              <button
                type="button"
                className={`drawer-communication__chip ${
                  type === TYPE_BANNER
                    ? 'drawer-communication__chip--active'
                    : 'drawer-communication__chip--inactive'
                }`}
                onClick={() => handleTypeClick(TYPE_BANNER)}
              >
                <span className="drawer-communication__chip-icon ds-icon ds-icon--20">
                  <DocumentReport />
                </span>
                Баннер
              </button>
            </div>
          </div>

          {/* Section: Баннер */}
          {type === TYPE_BANNER && (
            <div className="drawer-communication__section">
              <span className="drawer-communication__section-title">Баннер</span>

              {banner ? (
                <div className="drawer-communication__template-card">
                  <div className="drawer-communication__template-avatar">
                    {/* .ds-icon даёт и размер, и fill: currentColor. Без обёртки
                        DS-иконка растянулась бы на всю аватарку, а правило `fill`
                        на самой аватарке залило бы глиф шаблона — тот рисуется
                        stroke'ом поверх fill="none". */}
                    <span className="ds-icon ds-icon--18">
                      <DocumentReport />
                    </span>
                  </div>
                  <div className="drawer-communication__template-info">
                    <span className="drawer-communication__template-overline">{banner.id}</span>
                    <span className="drawer-communication__template-title">{banner.title}</span>
                  </div>
                  {/* Не кнопка: редактора баннеров нет, обработчика намеренно тоже. */}
                  <span className="drawer-communication__banner-edit">
                    <span className="ds-icon ds-icon--m">
                      <Pencil />
                    </span>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className="drawer-communication__action-cell"
                  onClick={() => setBanner(PLACEHOLDER_BANNER)}
                >
                  <span className="drawer-communication__action-cell-icon">
                    <PlusCircleIcon />
                  </span>
                  <span className="drawer-communication__action-cell-label">Создать</span>
                </button>
              )}
            </div>
          )}

          {/* Section: Шаблон */}
          {type === TYPE_TEMPLATE && (
          <div className="drawer-communication__section">
            <span className="drawer-communication__section-title">Шаблон</span>

            {selectedTemplate ? (
              <>
                {/* Change template button */}
                <button
                  type="button"
                  className="drawer-communication__action-cell"
                  onClick={handleChangeTemplate}
                >
                  <span className="drawer-communication__action-cell-icon">
                    <span className="ds-icon ds-icon--24">
                      <ConnectionArrowsRepeatLeft />
                    </span>
                  </span>
                  <span className="drawer-communication__action-cell-label">
                    Сменить
                  </span>
                </button>

                {/* Selected template card */}
                <div className="drawer-communication__template-card">
                  <div className="drawer-communication__template-avatar">
                    <DocumentListIconSmall />
                  </div>
                  <div className="drawer-communication__template-info">
                    <span className="drawer-communication__template-title">
                      {selectedTemplate.title}
                    </span>
                    {selectedTemplate.subtitle && (
                      <span className="drawer-communication__template-description">
                        {selectedTemplate.subtitle}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="drawer-communication__template-delete"
                    onClick={handleDeleteTemplate}
                    aria-label="Удалить шаблон"
                  >
                    <TrashIcon />
                  </button>
                </div>

              </>
            ) : (
              <button
                type="button"
                className="drawer-communication__action-cell"
                onClick={handleAddTemplate}
              >
                <span className="drawer-communication__action-cell-icon">
                  <PlusCircleIcon />
                </span>
                <span className="drawer-communication__action-cell-label">Добавить</span>
              </button>
            )}
          </div>
          )}

          {/* Channels multiselect — sibling of section, gap 16px from content */}
          {type === TYPE_TEMPLATE && selectedTemplate && allChannels.length > 0 && (
            <div className="drawer-communication__channels-wrapper" ref={channelsRef}>
              <div
                className={
                  'drawer-communication__channels' +
                  (showChannelsDropdown ? ' drawer-communication__channels--focused' : '') +
                  (hasChannelsError ? ' drawer-communication__channels--error' : '')
                }
                onClick={hasChannelsError ? handleToggleChannelsDropdown : undefined}
              >
                <div className="drawer-communication__channels-row">
                  <div className="drawer-communication__channels-content">
                    <span className="drawer-communication__channels-title">
                      Каналы рассылки
                    </span>
                    <div className="drawer-communication__channels-items">
                      {channels.length > 0 && channels.map((channel) => (
                        <div
                          key={channel}
                          className="drawer-communication__channel-chip"
                        >
                          <span className="drawer-communication__channel-chip-label">
                            {channel}
                          </span>
                          <button
                            type="button"
                            className="drawer-communication__channel-chip-remove"
                            onClick={() => handleRemoveChannel(channel)}
                            aria-label={`Удалить канал ${channel}`}
                          >
                            <CrossSmallIcon />
                          </button>
                        </div>
                      ))}
                      <span
                        className="drawer-communication__channels-placeholder"
                        onClick={handleToggleChannelsDropdown}
                      >
                        Выбери из списка
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="drawer-communication__channels-accessory"
                    onClick={handleToggleChannelsDropdown}
                    aria-label="Выбрать каналы"
                  >
                    <ChevronDownIcon />
                  </button>
                </div>

                {/* Error section */}
                {hasChannelsError && (
                  <div className="drawer-communication__channels-error">
                    <div className="drawer-communication__channels-error-divider" />
                    <span className="drawer-communication__channels-error-text">
                      Выбери каналы
                    </span>
                  </div>
                )}
              </div>

              {/* Dropdown with all channels (toggle checkmarks) */}
              {showChannelsDropdown && (
                <div className="drawer-communication__channels-dropdown">
                  <div className="drawer-communication__channels-dropdown-list">
                    {allChannels.map((channel) => (
                      <button
                        key={channel}
                        type="button"
                        className="drawer-communication__channels-dropdown-item"
                        onClick={() => handleToggleChannel(channel)}
                      >
                        <span className="drawer-communication__channels-dropdown-item-label">
                          {channel}
                        </span>
                        {channels.includes(channel) && (
                          <span className="drawer-communication__channels-dropdown-item-check">
                            <CheckmarkIcon />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ---- Footer ---- */}
        <div className="drawer-communication__footer">
          <button
            type="button"
            className="drawer-communication__save-btn"
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* ---- Template selection modal ---- */}
      {showTemplateModal && (
        <TemplateModal
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateSelect}
          selectedTemplateId={selectedTemplate?.id}
        />
      )}
    </div>

    {/* ---- Подтверждение смены типа ----
        Сиблингом оверлея, а не внутри: у оверлея onClick={onClose}, а DS Modal
        нигде не глушит всплытие — внутри любой клик по модалке закрывал бы весь
        дровер. Оба position: fixed с z-index 1000, дровер объявлен раньше — так
        модалка красится поверх. */}
    {pendingType && (
      <ConfirmDialog
        message="При переключении на другой тип коммуникации, прикреплённый шаблон или баннер не сохранятся. Переключиться?"
        confirmLabel="Переключиться"
        confirmIcon={<ArrowsRotationRight />}
        onConfirm={handleConfirmSwitch}
        onCancel={() => setPendingType(null)}
      />
    )}
    </>
  );
}

