/* ==========================================================================
   Вывод подписей карточек из сохранённого конфига дроверов.

   Чистые функции, как в publishValidation.js, и по той же причине: одну и ту
   же выкладку `config` → `node.data` делают две стороны — редактор в своих
   sync-эффектах и сборщики мок-канвасов (pages/home/mockNodes.js). Просмотр
   читает `node.data` напрямую, без эффектов, так что стоит этим двум разъехаться
   — и один и тот же сценарий будет выглядеть по-разному в просмотре и в
   редакторе. Поэтому вывод живёт здесь в единственном экземпляре.

   Лейблы операторов (`numberOperatorLabel`, `stringOperatorLabel`, …) — это
   сохранённые данные: их пишет ConditionModal при сохранении, здесь их только
   читают.
   ========================================================================== */

/** Подпись строки условия — то, что выбрали в модалке, свёрнутое в одну строку. */
function conditionLabel(c) {
  if (c.type === 'boolean') return c.booleanValue ? 'Да' : 'Нет';
  if (c.type === 'date' && c.dateOperatorLabel) {
    if (c.dateOperator === 'period' && c.dateFrom && c.dateTo) {
      return `${c.dateOperatorLabel} ${c.dateFrom} – ${c.dateTo}`;
    }
    if (c.dateValue) return `${c.dateOperatorLabel} ${c.dateValue}`;
    return c.dateOperatorLabel;
  }
  if ((c.type === 'integer' || c.type === 'number') && c.numberOperatorLabel) {
    if (c.numberOperator === 'range' && c.numberFrom !== '' && c.numberTo !== '') {
      return `${c.numberOperatorLabel} ${c.numberFrom} – ${c.numberTo}`;
    }
    if (c.numberValue !== undefined && c.numberValue !== '') {
      return `${c.numberOperatorLabel} ${c.numberValue}`;
    }
    return c.numberOperatorLabel;
  }
  // Сюда же проваливается string: у него оператор в карточку не выносится,
  // строкой идёт само название параметра.
  return c.title;
}

/** Оверлайн строки условия — серая строка над подписью. */
function conditionOverline(c) {
  if (c.type === 'boolean') return c.title;
  if (c.type === 'date' && c.dateOperatorLabel) return c.title;
  if ((c.type === 'integer' || c.type === 'number') && c.numberOperatorLabel) return c.title;
  return c.categoryLabel || '';
}

/**
 * Производные поля карточки «Условие» из conditionConfigs[nodeId].
 * Незаполненный блок (конфига нет или он пуст) рисует одну строку-заглушку.
 */
export function conditionCardData(saved) {
  const hasConditions = (saved?.length ?? 0) > 0;
  return {
    conditions: hasConditions ? saved.length : 1,
    conditionLabels: hasConditions ? saved.map((c) => conditionLabel(c)) : [],
    conditionOverlines: hasConditions ? saved.map((c) => conditionOverline(c)) : [],
    showShowAll: hasConditions && saved.length > 3,
  };
}

/**
 * Производные поля карточки «Коммуникация» из communicationTemplates[nodeId].
 * Конфиг без `type` — это шаблон (так пишут моки).
 *
 * У шаблона и баннера строки идут в разном порядке — так в макете: у шаблона
 * сверху название, снизу каналы; у баннера сверху id, снизу заголовок. Поэтому
 * это разные пары полей, а не одна переиспользованная.
 */
export function communicationCardData(saved) {
  const isBanner = saved?.type === 'banner';
  const hasTemplate = Boolean(saved?.template);
  return {
    communicationType: isBanner ? 'banner' : 'template',
    templateTitle: hasTemplate ? saved.template.title : '',
    templateDescription: hasTemplate ? saved.channels.join(', ') : '',
    bannerId: isBanner ? saved.banner?.id ?? '' : '',
    bannerTitle: isBanner ? saved.banner?.title ?? '' : '',
  };
}
