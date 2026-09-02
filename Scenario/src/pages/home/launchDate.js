/**
 * Дата запуска сценария — то, что показывает колонка «Дата старта» на главной.
 */

/** Дата в формате колонки «Дата старта» — DD.MM.YYYY. */
export function formatLaunchDate(date = new Date()) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${date.getFullYear()}`;
}
