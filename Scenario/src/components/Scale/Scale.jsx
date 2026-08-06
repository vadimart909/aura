import './Scale.css';

/* ---- Icons ---- */
function FitViewIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5V2H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 5V2H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 11V14H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11V14H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 4V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ---- Component ---- */
export default function Scale({ onFitView, onZoomOut, onZoomIn, className = '' }) {
  return (
    <div className={`scale${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="scale__btn"
        aria-label="Увеличить"
        onClick={onZoomIn}
      >
        <PlusIcon />
      </button>
      <button
        type="button"
        className="scale__btn"
        aria-label="Уменьшить"
        onClick={onZoomOut}
      >
        <MinusIcon />
      </button>
      <button
        type="button"
        className="scale__btn"
        aria-label="Вписать в экран"
        onClick={onFitView}
      >
        <FitViewIcon />
      </button>
    </div>
  );
}
