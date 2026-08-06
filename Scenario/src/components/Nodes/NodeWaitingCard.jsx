import './NodeWaitingCard.css';
import { Ports } from './Ports';
import NodeActions from './NodeActions';

import iconHourglass from './icons/icon-hourglass.svg';
import iconWarning from './icons/icon-warning.svg';

/**
 * NodeWaitingCard — карточка ноды «Ожидание».
 *
 * @param {object}  props
 * @param {string}  [props.title='Ожидание']  — заголовок в шапке
 * @param {boolean} [props.showError=true]     — строка «Ошибка»
 * @param {'default'|'hover'|'active'} [props.state='default']
 * @param {function} [props.onClick]
 * @param {string}  [props.className]
 */
export default function NodeWaitingCard({
  title = 'Ожидание',
  showError = true,
  state = 'default',
  className = '',
  onClick,
}) {
  const stateClass =
    state === 'hover'
      ? 'node-waiting--hover'
      : state === 'active'
        ? 'node-waiting--active'
        : '';

  return (
    <div className={`node-waiting ${stateClass} ${className}`.trim()} onClick={onClick}>
      {/* Actions (visible on hover) */}
      <NodeActions />

      {/* ---- Card ---- */}
      <div className="node-waiting__card">
        {/* Header */}
        <div className="node-waiting__header">
          <span className="node-waiting__header-title">{title}</span>
        </div>

        {/* Content */}
        <div className="node-waiting__content">
          {/* Строка «Ожидание» */}
          <div className="node-waiting__row">
            <span className="node-waiting__row-avatar node-waiting__row-avatar--filled">
              <img src={iconHourglass} alt="" width="10" height="10" />
            </span>
            <span className="node-waiting__row-text">Ожидание</span>
            {/* ---- Ports ---- */}
            <Ports count={1} side="left" />
            <Ports count={1} side="right" />
          </div>

          {showError && (
            <div className="node-waiting__row node-waiting__row--error">
              <span className="node-waiting__row-text">Ошибка</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
