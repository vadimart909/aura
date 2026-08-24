import './NodeConditionCard.css';
import { Ports } from './Ports';
import NodeActions from './NodeActions';

import iconCheckmarkCircle from './icons/icon-checkmark-circle.svg';

/**
 * NodeConditionCard — карточка ноды «Условие».
 *
 * @param {object}  props
 * @param {string}  [props.title='Условие']            — заголовок в шапке
 * @param {number}  [props.conditions=1]                — кол-во строк условий (1–3)
 * @param {string[]} [props.conditionLabels=[]]         — названия выбранных условий/сегментов
 * @param {string[]} [props.conditionOverlines=[]]      — overline-текст (категория) для каждого условия
 * @param {boolean} [props.showShowAll=false]            — ссылка «Показать все»
 * @param {boolean} [props.showError=true]               — строка «Заполни поля»
 * @param {'default'|'hover'|'active'} [props.state='default']
 * @param {string}  [props.className]
 */
export default function NodeConditionCard({
  title = 'Условие',
  conditions = 1,
  conditionLabels = [],
  conditionOverlines = [],
  showShowAll = false,
  showError = true,
  showActions = true,
  state = 'default',
  className = '',
  onClick,
  onDelete,
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
      {showActions && <NodeActions onDelete={onDelete} />}

      {/* ---- Card ---- */}
      <div className="node-condition__card">
        {/* Header */}
        <div className="node-condition__header">
          <span className="node-condition__header-title">{title}</span>
        </div>

        {/* Content wrapper — ports center relative to this */}
        <div className="node-condition__content-wrapper">
          <div className="node-condition__content">
            {/* Condition rows */}
            {Array.from({ length: conditionCount }, (_, i) => (
              <div key={i} className="node-condition__row">
                <span className="node-condition__row-avatar node-condition__row-avatar--filled">
                  <img src={iconCheckmarkCircle} alt="" width="10" height="10" />
                </span>
                {conditionOverlines[i] ? (
                  <span className="node-condition__row-text-wrap">
                    <span className="node-condition__row-overline">{conditionOverlines[i]}</span>
                    <span className="node-condition__row-title">{conditionLabels[i] || 'Условие'}</span>
                  </span>
                ) : (
                  <span className="node-condition__row-text">{conditionLabels[i] || 'Условие'}</span>
                )}
              </div>
            ))}

            {/* «Показать все» link + badge */}
            {showShowAll && (
              <div className="node-condition__show-all">
                <span className="node-condition__show-all-text">Показать все</span>
                <span className="node-condition__show-all-badge">{conditions}</span>
              </div>
            )}

            {showError && (
              <div className="node-condition__row node-condition__row--error">
                <span className="node-condition__row-text">Заполни поля</span>
              </div>
            )}
          </div>

          {/* Ports — center vertically across the full content-wrapper */}
          <Ports count={1} side="left" />
          <Ports count={2} side="right" colors={['green', 'red']} />
        </div>
      </div>

    </div>
  );
}
