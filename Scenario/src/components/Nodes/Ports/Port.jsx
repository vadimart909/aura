import './Port.css';

/**
 * Port — единичный порт (эллипс 12×12).
 *
 * @param {object}  props
 * @param {'default'|'active'} [props.state='default']
 * @param {'default'|'green'|'red'} [props.color]  — цветовой вариант
 * @param {function} [props.onClick]
 * @param {string}  [props.ariaLabel='Порт']
 * @param {string}  [props.className]
 */
export default function Port({
  state = 'default',
  color,
  onClick,
  ariaLabel = 'Порт',
  className = '',
}) {
  const stateClass = state === 'active' ? 'port--active' : 'port--default';
  const colorClass = color && color !== 'default' ? `port--${color}` : '';

  return (
    <button
      className={`port ${stateClass} ${colorClass} ${className}`.trim()}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
    />
  );
}
