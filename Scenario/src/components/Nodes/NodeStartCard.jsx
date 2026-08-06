import './NodeStartCard.css';
import { Ports } from './Ports';
import iconTrigger from './icons/icon-trigger.svg';
import iconCalendar from './icons/icon-calendar.svg';
import iconWatch from './icons/icon-watch.svg';
import iconPerson from './icons/icon-person.svg';
import iconWarning from './icons/icon-warning.svg';

/**
 * NodeStartCard — карточка стартовой ноды (событие).
 *
 * @param {object}  props
 * @param {string}  [props.title='Старт']  — заголовок в шапке
 * @param {boolean} [props.showTrigger=true]  — строка «Триггер»
 * @param {boolean} [props.showSchedule=true] — строка «Расписание»
 * @param {boolean} [props.showTime=true]     — строка «Время»
 * @param {boolean} [props.showSegment=true]  — строка «Сегмент»
 * @param {boolean} [props.showError=true]    — строка «Ошибка»
 * @param {'default'|'hover'|'active'} [props.state='default']
 * @param {string}  [props.className]
 */
export default function NodeStartCard({
  title = 'Старт',
  showTrigger = true,
  showSchedule = true,
  showTime = true,
  showSegment = true,
  showError = true,
  state = 'default',
  className = '',
  onClick,
}) {
  const stateClass =
    state === 'hover'
      ? 'node-start--hover'
      : state === 'active'
        ? 'node-start--active'
        : '';

  return (
    <div className={`node-start ${stateClass} ${className}`.trim()} onClick={onClick}>
      {/* ---- Card ---- */}
      <div className="node-start__card">
        {/* Header */}
        <div className="node-start__header">
          <span className="node-start__header-title">{title}</span>
        </div>

        {/* Content wrapper — port centers relative to this */}
        <div className="node-start__content-wrapper">
          <div className="node-start__content">
            {showTrigger && (
              <InfoRow icon={iconTrigger} label="Триггер" filled />
            )}
            {showSchedule && (
              <InfoRow icon={iconCalendar} label="Расписание" filled />
            )}
            {showTime && (
              <InfoRow icon={iconWatch} label="Время" filled />
            )}
            {showSegment && (
              <InfoRow icon={iconPerson} label="Сегмент" filled />
            )}
            {showError && (
              <div className="node-start__row node-start__row--error">
                <span className="node-start__row-text">Ошибка</span>
              </div>
            )}
          </div>

          {/* ---- Port ---- */}
          <Ports count={1} side="right" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Internal sub-component ---------- */

function InfoRow({ icon, label, filled = false }) {
  return (
    <div className="node-start__row">
      <span
        className={`node-start__row-avatar ${filled ? 'node-start__row-avatar--filled' : 'node-start__row-avatar--plain'}`}
      >
        <img src={icon} alt="" width={filled ? 10 : 16} height={filled ? 10 : 16} />
      </span>
      <span className="node-start__row-text">{label}</span>
    </div>
  );
}
