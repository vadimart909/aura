/* ==========================================================================
   Сборщики узлов и рёбер для мок-канвасов.

   Формат — ровно тот, что отдаёт serializeCanvas: node.data с готовыми
   лейблами и приколоченными state/showActions/showError, ребро только с
   id/source/target/handles.

   Важно: `data` здесь ВЫВОДИТСЯ из `config` — через те же функции
   createscenariocanvas/nodeLabels.js, которыми пользуется редактор. Просмотр
   читает data напрямую (у него нет sync-эффектов), а редактор пересобирает
   data из config на маунте. Разъедься эти две половины, и один и тот же
   сценарий показывал бы разные подписи в просмотре и в редактировании.
   ========================================================================== */

import { CONDITION_CATEGORIES, CONDITION_PARAMETERS } from '../../data/mockConditions';
import { MOCK_TEMPLATES } from '../../data/mockTemplates';
import { formatWaitingLabel } from '../createscenariocanvas/publishValidation';
import { conditionCardData, communicationCardData } from '../createscenariocanvas/nodeLabels';

/* ---- Узлы ---------------------------------------------------------------- */

/** Нейтральная поза, в которую serializeCanvas приколачивает каждый узел. */
export const VIEW_FLAGS = { state: 'default', showActions: false, showError: false };

/** То же, что делает DrawerCommunication при выборе шаблона: каналы из subtitle. */
export function channelsOf(template) {
  return template.subtitle
    .split(',')
    .map((channel) => channel.trim())
    .filter(Boolean)
    .map((channel) => channel.charAt(0).toUpperCase() + channel.slice(1));
}

export function communicationNode(id, position, config) {
  return {
    id,
    type: 'communication',
    position,
    data: {
      ...VIEW_FLAGS,
      title: 'Коммуникация',
      ...communicationCardData(config.communicationTemplates[id]),
    },
  };
}

export function waitingNode(id, position, config) {
  const saved = config.waitingConfigs[id];
  return {
    id,
    type: 'waiting',
    position,
    data: {
      ...VIEW_FLAGS,
      title: 'Ожидание',
      waitingLabel: formatWaitingLabel(saved.unit, saved.amount),
    },
  };
}

export function conditionNode(id, position, config) {
  return {
    id,
    type: 'condition',
    position,
    data: {
      ...VIEW_FLAGS,
      title: 'Условие',
      ...conditionCardData(config.conditionConfigs[id]),
    },
  };
}

/**
 * Шаблон коммуникации по названию — надёжнее индекса в MOCK_TEMPLATES, если
 * список однажды переупорядочат.
 */
export function templateByTitle(title) {
  const template = MOCK_TEMPLATES.find((t) => t.title === title);
  if (!template) throw new Error(`Нет шаблона коммуникации «${title}»`);
  return template;
}

/**
 * Подмножество каналов шаблона — дровер даёт снимать галочки, поэтому у ноды
 * каналов может быть меньше, чем в subtitle. Но не больше и не других: чего
 * нет в шаблоне, того пользователь выбрать не мог.
 */
export function pickChannels(template, names) {
  const all = channelsOf(template);
  const alien = names.filter((name) => !all.includes(name));
  if (alien.length) {
    throw new Error(`Каналов ${alien.join(', ')} нет у шаблона «${template.title}» (${all.join(', ')})`);
  }
  return names;
}

/* ---- Условия ------------------------------------------------------------- */

/**
 * Базовая часть сохранённого условия — то, что кладёт в него ConditionModal
 * до операторов и значений. Ищем по паре «категория + название», а не по
 * attr_N: каталог генерируется из shared/client-attributes/attributes.csv,
 * id там позиционные, и новая строка в CSV сдвинет всё, что ниже.
 *
 * Промах — это ошибка сборки моков, а не пустое условие: mockData.js
 * вычисляется на импорте, и молчаливый undefined обернулся бы белым экраном
 * при старте приложения.
 */
export function conditionParam(category, title) {
  const param = CONDITION_PARAMETERS.find((p) => p.category === category && p.title === title);
  if (!param) throw new Error(`Нет параметра условия «${title}» в категории «${category}»`);
  const categoryObj = CONDITION_CATEGORIES.find((c) => c.value === category);
  return {
    id: param.id,
    title: param.title,
    description: param.description,
    category: param.category,
    categoryLabel: categoryObj?.label || param.category,
    type: param.type,
  };
}

/* ---- Рёбра --------------------------------------------------------------- */

/** Ребро в том же виде, в каком его создал бы addEdge на живом канвасе. */
export const edge = (source, sourceHandle, target, targetHandle) => ({
  id: `xy-edge__${source}${sourceHandle}-${target}${targetHandle}`,
  source,
  target,
  sourceHandle,
  targetHandle,
});
