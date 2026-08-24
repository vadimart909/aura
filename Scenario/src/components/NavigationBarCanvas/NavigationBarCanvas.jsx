import './NavigationBarCanvas.css';

import PlayIcon from '../icons/PlayIcon';

import iconNetwork from '../Nodes/icons/icon-network.svg';
import iconWatch from '../Nodes/icons/icon-watch.svg';
import iconAirplanePaper from '../Nodes/icons/icon-airplane-paper.svg';

/* --------------------------------------------------------------------------
   Status → badge CSS-class mapping
   -------------------------------------------------------------------------- */
const badgeClassMap = {
  draft: 'nav-bar-canvas__badge--grey',
  published: 'nav-bar-canvas__badge--purple',
  started: 'nav-bar-canvas__badge--yellow',
  stopped: 'nav-bar-canvas__badge--red',
  finishing: 'nav-bar-canvas__badge--red',
};

/* --------------------------------------------------------------------------
   Toolbar items for Edit mode
   -------------------------------------------------------------------------- */
const toolbarItems = [
  { id: 'condition', icon: iconNetwork, label: 'Условие' },
  { id: 'waiting', icon: iconWatch, label: 'Ожидание' },
  { id: 'communication', icon: iconAirplanePaper, label: 'Коммуникация' },
];

/* --------------------------------------------------------------------------
   Inline SVG icons
   -------------------------------------------------------------------------- */

function ArrowLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

/* --------------------------------------------------------------------------
   NavigationBarCanvas component
   -------------------------------------------------------------------------- */

/**
 * Navigation bar for the scenario canvas (editor / viewer).
 *
 * @param {Object}   props
 * @param {'read'|'edit'} [props.mode='read'] — display mode
 * @param {string}   [props.title]      — scenario name (read mode)
 * @param {string}   [props.status]     — status key (read mode)
 * @param {string}   [props.statusLabel] — human-readable status text (read mode)
 * @param {Function} [props.onBack]     — callback for back button
 * @param {Function} [props.onInfo]     — callback for info button
 * @param {Function} [props.onMore]     — callback for dots/more button
 * @param {Function} [props.onAction]   — callback for the primary action button (read mode)
 * @param {string}   [props.actionLabel] — label for the action button (read mode)
 * @param {Function} [props.onToolbarItemClick] — callback when toolbar button is clicked (edit mode)
 */
export default function NavigationBarCanvas({
  mode = 'read',
  title = '',
  status = 'draft',
  statusLabel = 'Черновик',
  onBack,
  onInfo,
  onMore,
  onAction,
  actionLabel,
  onToolbarItemClick,
}) {
  const isEdit = mode === 'edit';
  const badgeClass = badgeClassMap[status] || badgeClassMap.draft;

  return (
    <nav className={`nav-bar-canvas ${isEdit ? 'nav-bar-canvas--edit' : ''}`}>
      {/* Back button */}
      <button
        type="button"
        className="nav-bar-canvas__back-btn"
        onClick={onBack}
        aria-label="Назад"
      >
        <ArrowLeftIcon />
      </button>

      {/* ---- Read mode: Title + status ---- */}
      {!isEdit && (
        <div className="nav-bar-canvas__title-block">
          {title && <h2 className="nav-bar-canvas__title">{title}</h2>}
          <span className={`nav-bar-canvas__badge ${badgeClass}`}>{statusLabel}</span>
        </div>
      )}

      {/* ---- Edit mode: Toolbar (hint + buttons) ---- */}
      {isEdit && (
        <div className="nav-bar-canvas__toolbar">
          <div className="nav-bar-canvas__toolbar-hint">
            Перетащи на рабочую область
          </div>
          <div className="nav-bar-canvas__toolbar-buttons">
            {toolbarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nav-bar-canvas__toolbar-btn"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData('application/reactflow', item.id);
                  event.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => onToolbarItemClick?.(item.id)}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="nav-bar-canvas__toolbar-btn-icon"
                  width={24}
                  height={24}
                />
                <span className="nav-bar-canvas__toolbar-btn-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Right controls */}
      <div className="nav-bar-canvas__right">
        {onInfo && (
          <button
            type="button"
            className="nav-bar-canvas__icon-btn"
            onClick={onInfo}
            aria-label="Информация"
          >
            <InfoIcon />
          </button>
        )}

        {onMore && (
          <button
            type="button"
            className="nav-bar-canvas__icon-btn"
            onClick={onMore}
            aria-label="Ещё"
          >
            <DotsIcon />
          </button>
        )}

        {onAction && (
          <button
            type="button"
            className="nav-bar-canvas__action-btn"
            onClick={onAction}
          >
            <PlayIcon />
            {actionLabel && <span>{actionLabel}</span>}
          </button>
        )}
      </div>
    </nav>
  );
}
