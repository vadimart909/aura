import './NodeCommunicationCard.css';
import { Ports } from './Ports';
import NodeActions from './NodeActions';

import iconDocumentList from './icons/icon-document-list.svg';
import iconWarning from './icons/icon-warning.svg';

/**
 * NodeCommunicationCard — карточка ноды «Коммуникация».
 *
 * @param {object}  props
 * @param {string}  [props.title='Коммуникация']  — заголовок в шапке
 * @param {boolean} [props.showError=true]          — строка «Ошибка»
 * @param {'default'|'hover'|'active'} [props.state='default']
 * @param {function} [props.onClick]
 * @param {string}  [props.className]
 */
export default function NodeCommunicationCard({
  title = 'Коммуникация',
  showError = true,
  state = 'default',
  className = '',
  onClick,
}) {
  const stateClass =
    state === 'hover'
      ? 'node-communication--hover'
      : state === 'active'
        ? 'node-communication--active'
        : '';

  return (
    <div className={`node-communication ${stateClass} ${className}`.trim()} onClick={onClick}>
      {/* Actions (visible on hover) */}
      <NodeActions />

      {/* ---- Card ---- */}
      <div className="node-communication__card">
        {/* Header */}
        <div className="node-communication__header">
          <span className="node-communication__header-title">{title}</span>
        </div>

        {/* Content */}
        <div className="node-communication__content">
          {/* Строка «Шаблон» */}
          <div className="node-communication__row">
            <span className="node-communication__row-avatar node-communication__row-avatar--filled">
              <img src={iconDocumentList} alt="" width="10" height="10" />
            </span>
            <span className="node-communication__row-text">Шаблон</span>
            {/* ---- Ports ---- */}
            <Ports count={1} side="left" />
            <Ports count={1} side="right" />
          </div>

          {showError && (
            <div className="node-communication__row node-communication__row--error">
              <span className="node-communication__row-text">Ошибка</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
