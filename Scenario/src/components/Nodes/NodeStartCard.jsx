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
 * @param {boolean} [props.showSchedule=true] — строка «Расписание» (combined with time)
 * @param {boolean} [props.showSegment=true]  — строка «Сегмент»
 * @param {boolean} [props.showError=true]    — строка «Ошибка»
 * @param {'default'|'hover'|'active'} [props.state='default']
 * @param {string}  [props.className]
 * @param {string}  [props.scheduleLabel]     — time value for schedule (e.g. "12:30")
 * @param {string}  [props.scheduleOverline]  — overline for schedule (e.g. "Ежедневно")
 * @param {string}  [props.scheduleDescription] — description for schedule (e.g. "Москва (UTC+3)")
 */
export default function NodeStartCard({
  title = 'Старт',
  showTrigger = true,
  showSchedule = false,
  showScheduleDays = false,
  showSegment = true,
  showError = true,
  triggerLabel = '',
  segmentLabel = '',
  scheduleLabel = '',
  scheduleOverline = '',
  scheduleDescription = '',
  scheduleDaysLabel = '',
  scheduleDaysOverline = '',
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
              <InfoRow
                icon={iconTrigger}
                label={triggerLabel || 'Триггер'}
                overline={triggerLabel ? 'Триггер' : ''}
                filled
              />
            )}
            {showScheduleDays && (
              <InfoRow
                icon={iconCalendar}
                label={scheduleDaysLabel || 'В конкретные дни'}
                overline={scheduleDaysOverline || ''}
                filled
              />
            )}
            {showSchedule && (
              <InfoRow
                icon={iconWatch}
                label={scheduleLabel || 'Расписание'}
                overline={scheduleOverline || ''}
                description={scheduleDescription || ''}
                filled
              />
            )}
            {showSegment && (
              <InfoRow
                icon={iconPerson}
                label={segmentLabel || 'Сегмент'}
                overline={segmentLabel ? 'Сегмент' : ''}
                filled
              />
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

function InfoRow({ icon, label, overline = '', description = '', filled = false }) {
  const hasTextGroup = overline || description;
  return (
    <div className="node-start__row">
      <span
        className={`node-start__row-avatar ${filled ? 'node-start__row-avatar--filled' : 'node-start__row-avatar--plain'}`}
      >
        <img src={icon} alt="" width={filled ? 10 : 16} height={filled ? 10 : 16} />
      </span>
      {hasTextGroup ? (
        <span className="node-start__row-text-group">
          {overline && (
            <span className="node-start__row-overline">{overline}</span>
          )}
          <span className="node-start__row-text">{label}</span>
          {description && (
            <span className="node-start__row-description">{description}</span>
          )}
        </span>
      ) : (
        <span className="node-start__row-text">{label}</span>
      )}
    </div>
  );
}
