import './NodeConditionCard.css';
import { Ports } from './Ports';
import NodeActions from './NodeActions';

import iconCheckmarkCircle from './icons/icon-checkmark-circle.svg';
import iconWarning from './icons/icon-warning.svg';

/**
 * NodeConditionCard — карточка ноды «Условие».
 *
 * @param {object}  props
 * @param {string}  [props.title='Условие']       — заголовок в шапке
 * @param {number}  [props.conditions=1]           — кол-во строк условий (1–3)
 * @param {boolean} [props.showShowAll=false]       — ссылка «Показать все»
 * @param {boolean} [props.showError=true]          — строка «Ошибка»
 * @param {'default'|'hover'|'active'} [props.state='default']
 * @param {string}  [props.className]
 */
export default function NodeConditionCard({
  title = 'Условие',
  conditions = 1,
  showShowAll = false,
  showError = true,
  state = 'default',
  className = '',
  onClick,
}) {
  const stateClass =
    state === 'hover'
      ? 'node-condition--hover'
      : state === 'active'
        ? 'node-condition--active'
        : '';

  const conditionCount = Math.max(1, Math.min(3, conditions));

  return (
    <div className={`node-condition ${stateClass} ${className}`.trim()} onClick={onClick}>
      {/* Actions (visible on hover) */}
      <NodeActions />

      {/* ---- Card ---- */}
      <div className="node-condition__card">
        {/* Header */}
        <div className="node-condition__header">
          <span className="node-condition__header-title">{title}</span>
        </div>

        {/* Content */}
        <div className="node-condition__content">
          {/* Condition rows */}
          {Array.from({ length: conditionCount }, (_, i) => (
            <div key={i} className="node-condition__row">
              <span className="node-condition__row-avatar node-condition__row-avatar--filled">
                <img src={iconCheckmarkCircle} alt="" width="10" height="10" />
              </span>
              <span className="node-condition__row-text">Условие</span>
              {/* Ports on the first condition row */}
              {i === 0 && (
                <>
                  <Ports count={1} side="left" />
                  <Ports count={2} side="right" colors={['green', 'red']} />
                </>
              )}
            </div>
          ))}

          {/* «Показать все» link */}
          {showShowAll && (
            <div className="node-condition__show-all">
              <span className="node-condition__show-all-text">Показать все</span>
            </div>
          )}

          {showError && (
            <div className="node-condition__row node-condition__row--error">
              <span className="node-condition__row-text">Ошибка</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
