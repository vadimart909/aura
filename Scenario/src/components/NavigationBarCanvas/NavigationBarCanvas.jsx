import './NavigationBarCanvas.css';

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

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4L20 12L6 20V4Z"
        fill="currentColor"
      />
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
 * @param {string}   props.title       — scenario name
 * @param {string}   props.status      — status key (draft | published | started | stopped | finishing)
 * @param {string}   props.statusLabel — human-readable status text (e.g. "Черновик")
 * @param {Function} [props.onBack]    — callback for back button
 * @param {Function} [props.onInfo]    — callback for info button
 * @param {Function} [props.onMore]    — callback for dots/more button
 * @param {Function} [props.onAction]  — callback for the primary action button
 * @param {string}   [props.actionLabel] — label for the action button (default: none, icon-only)
 */
export default function NavigationBarCanvas({
  title = '',
  status = 'draft',
  statusLabel = 'Черновик',
  onBack,
  onInfo,
  onMore,
  onAction,
  actionLabel,
}) {
  const badgeClass = badgeClassMap[status] || badgeClassMap.draft;

  return (
    <nav className="nav-bar-canvas">
      {/* Back button */}
      <button
        type="button"
        className="nav-bar-canvas__back-btn"
        onClick={onBack}
        aria-label="Назад"
      >
        <ArrowLeftIcon />
      </button>

      {/* Title + status */}
      <div className="nav-bar-canvas__title-block">
        {title && <h2 className="nav-bar-canvas__title">{title}</h2>}
        <span className={`nav-bar-canvas__badge ${badgeClass}`}>{statusLabel}</span>
      </div>

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
