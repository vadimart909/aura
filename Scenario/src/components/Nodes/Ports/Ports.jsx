import './Ports.css';
import Port from './Port';

/**
 * Ports — контейнер портов (1–3 штуки).
 *
 * @param {object}  props
 * @param {1|2|3}   [props.count=1]           — количество портов
 * @param {'left'|'right'} [props.side='right'] — сторона размещения
 * @param {number[]} [props.activeIndexes=[]]  — индексы портов с явным override state='active' (0-based)
 * @param {string[]} [props.colors=[]]         — цвет каждого порта ('default'|'green'|'red')
 * @param {string}  [props.className]
 */
export default function Ports({
  count = 1,
  side = 'right',
  activeIndexes = [],
  colors = [],
  className = '',
}) {
  const countClass = `ports--count-${count}`;
  const sideClass = `ports--${side}`;

  return (
    <div className={`ports ${countClass} ${sideClass} ${className}`.trim()}>
      {Array.from({ length: count }, (_, i) => {
        const id = `${side}-${i}`;
        return (
          <Port
            key={id}
            id={id}
            side={side}
            state={activeIndexes.includes(i) ? 'active' : undefined}
            color={colors[i]}
            ariaLabel={`${side === 'left' ? 'Левый' : 'Правый'} порт ${i + 1}`}
          />
        );
      })}
    </div>
  );
}
