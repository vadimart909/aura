import './NodeCommunicationCard.css';
import { Ports } from './Ports';
import NodeActions from './NodeActions';

import { DocumentReport } from '@ds/icons';

import iconDocumentList from './icons/icon-document-list.svg';

/**
 * NodeCommunicationCard — карточка ноды «Коммуникация».
 *
 * @param {object}  props
 * @param {string}  [props.title='Коммуникация']  — заголовок в шапке
 * @param {boolean} [props.showError=true]          — строка «Заполни поля»
 * @param {'template'|'banner'} [props.type='template'] — тип коммуникации
 * @param {string}  [props.templateTitle]           — название выбранного шаблона
 * @param {string}  [props.templateDescription]     — каналы (например «Email, Пуш, Чат»)
 * @param {string}  [props.bannerId]                — id баннера, идёт надстрочником
 * @param {string}  [props.bannerTitle]             — заголовок баннера
 * @param {'default'|'hover'|'active'} [props.state='default']
 * @param {function} [props.onClick]
 * @param {string}  [props.className]
 */
export default function NodeCommunicationCard({
  title = 'Коммуникация',
  showError = true,
  showActions = true,
  type = 'template',
  templateTitle = '',
  templateDescription = '',
  bannerId = '',
  bannerTitle = '',
  state = 'default',
  className = '',
  onClick,
  onDelete,
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
      {showActions && <NodeActions onDelete={onDelete} />}

      {/* ---- Card ---- */}
      <div className="node-communication__card">
        {/* Header */}
        <div className="node-communication__header">
          <span className="node-communication__header-title">{title}</span>
        </div>

        {/* Content */}
        <div className="node-communication__content">
          {/* Строка «Шаблон» / «Баннер» */}
          <div className="node-communication__row">
            <span className="node-communication__row-avatar node-communication__row-avatar--filled">
              {type === 'banner' ? (
                <DocumentReport />
              ) : (
                <img src={iconDocumentList} alt="" width="10" height="10" />
              )}
            </span>
            {/* Незаполненный блок читается как подпись типа — «Баннер» или
                «Шаблон», смотря какой чип выбран в дровере. */}
            {type === 'banner' ? (
              bannerTitle ? (
                /* У баннера id идёт надстрочником над заголовком — обратный
                   порядок относительно шаблона, так в макете. */
                <span className="node-communication__row-text-group">
                  <span className="node-communication__row-overline">{bannerId}</span>
                  <span className="node-communication__row-text">{bannerTitle}</span>
                </span>
              ) : (
                <span className="node-communication__row-text">Баннер</span>
              )
            ) : templateTitle ? (
              <span className="node-communication__row-text-group">
                <span className="node-communication__row-text">{templateTitle}</span>
                {templateDescription && (
                  <span className="node-communication__row-description">
                    {templateDescription}
                  </span>
                )}
              </span>
            ) : (
              <span className="node-communication__row-text">Шаблон</span>
            )}
            {/* ---- Ports ---- */}
            <Ports count={1} side="left" />
            <Ports count={1} side="right" />
          </div>

          {showError && (
            <div className="node-communication__row node-communication__row--error">
              <span className="node-communication__row-text">Заполни поля</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
