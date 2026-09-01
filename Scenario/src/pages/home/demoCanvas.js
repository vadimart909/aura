/* ==========================================================================
   Демо-граф для засеянных сценариев.

   Мок-сценарии, которые «уже собрали» (всё, кроме черновиков), должны
   приезжать с готовым канвасом. Без рёбер не видно ни связей, ни анимации
   запущенного сценария — а нарисовать граф руками не выход: ScenariosContext
   держит сценарии в обычном useState, и нарисованное исчезает на первой же
   перезагрузке страницы.

   Формат — ровно тот, что отдаёт serializeCanvas: node.data с готовыми
   лейблами и приколоченными state/showActions/showError, ребро только с
   id/source/target/handles.

   Важно: `data` здесь ВЫВОДИТСЯ из `config`, а не пишется руками рядом.
   Просмотр читает data напрямую (у него нет sync-эффектов), а редактор
   пересобирает data из config на маунте — и «Опубликован»/«Остановлен»
   открываются в редакторе по кнопке «Редактировать». Разъедься эти две
   половины, и один и тот же сценарий показывал бы разные подписи.
   ========================================================================== */

import { MOCK_TEMPLATES } from '../../data/mockTemplates';
import { CONDITION_CATEGORIES, CONDITION_PARAMETERS } from '../../data/mockConditions';
import { START_NODE_ID, startCanvas } from '../createscenariocanvas/canvasSnapshot';
import { formatWaitingLabel } from '../createscenariocanvas/publishValidation';

/* ---- Узлы ---------------------------------------------------------------- */

/** Нейтральная поза, в которую serializeCanvas приколачивает каждый узел. */
const VIEW_FLAGS = { state: 'default', showActions: false, showError: false };

/** То же, что делает DrawerCommunication при выборе шаблона: каналы из subtitle. */
function channelsOf(template) {
  return template.subtitle
    .split(',')
    .map((channel) => channel.trim())
    .filter(Boolean)
    .map((channel) => channel.charAt(0).toUpperCase() + channel.slice(1));
}

function communicationNode(id, position, config) {
  const saved = config.communicationTemplates[id];
  return {
    id,
    type: 'communication',
    position,
    data: {
      ...VIEW_FLAGS,
      title: 'Коммуникация',
      templateTitle: saved.template.title,
      templateDescription: saved.channels.join(', '),
    },
  };
}

function waitingNode(id, position, config) {
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

function conditionNode(id, position, config) {
  const saved = config.conditionConfigs[id];
  return {
    id,
    type: 'condition',
    position,
    data: {
      ...VIEW_FLAGS,
      title: 'Условие',
      conditions: saved.length,
      // Демо-граф собран на одном boolean-параметре, поэтому здесь только
      // его ветка вывода из редактора: значение в строку, название в оверлайн.
      conditionLabels: saved.map((c) => (c.booleanValue ? 'Да' : 'Нет')),
      conditionOverlines: saved.map((c) => c.title),
      showShowAll: saved.length > 3,
    },
  };
}

/* ---- Рёбра --------------------------------------------------------------- */

/** Ребро в том же виде, в каком его создал бы addEdge на живом канвасе. */
const edge = (source, sourceHandle, target, targetHandle) => ({
  id: `xy-edge__${source}${sourceHandle}-${target}${targetHandle}`,
  source,
  target,
  sourceHandle,
  targetHandle,
});

/* ---- Граф ---------------------------------------------------------------- */

/*
 * Старт → Коммуникация → Ожидание → Условие → 2× Коммуникация.
 * Карточки шириной 250px, шаг по X — 350px. Старт стоит там же, где его
 * ставит startCanvas, чтобы точка входа не съезжала между черновиком и
 * собранным сценарием.
 */
const WELCOME = 'dndnode_0';
const WAIT = 'dndnode_1';
const BRANCH = 'dndnode_2';
const BRANCH_YES = 'dndnode_3';
const BRANCH_NO = 'dndnode_4';

export function demoCanvas({ trigger = '', segment = '' } = {}) {
  // Start-карточку берём у startCanvas, а не собираем заново, — она уже
  // настроена под просмотр, и обе версии канваса гарантированно совпадают.
  const [startNode] = startCanvas({ trigger, segment }).nodes;

  const welcomeTemplate = MOCK_TEMPLATES[0]; // Приветственное письмо
  const offerTemplate = MOCK_TEMPLATES[3]; // Акция на зарплатные продукты
  const reminderTemplate = MOCK_TEMPLATES[2]; // Напоминание об оплате

  const sellerParam = CONDITION_PARAMETERS.find(
    (p) => p.category === 'industry' && p.title === 'Является актуальным селлером',
  );
  const sellerCategory = CONDITION_CATEGORIES.find((c) => c.value === sellerParam.category);

  const config = {
    startConditionType: 'trigger',
    startTrigger: trigger ? { title: trigger } : null,
    startSegment: segment ? { title: segment } : null,
    startSchedule: null,
    communicationTemplates: {
      [WELCOME]: { template: welcomeTemplate, channels: channelsOf(welcomeTemplate) },
      [BRANCH_YES]: { template: offerTemplate, channels: channelsOf(offerTemplate) },
      [BRANCH_NO]: { template: reminderTemplate, channels: channelsOf(reminderTemplate) },
    },
    waitingConfigs: {
      [WAIT]: { unit: 'days', amount: '2' },
    },
    conditionConfigs: {
      // Ровно та форма, которую пишет ConditionModal для boolean-параметра.
      [BRANCH]: [
        {
          id: sellerParam.id,
          title: sellerParam.title,
          description: sellerParam.description,
          category: sellerParam.category,
          categoryLabel: sellerCategory.label,
          type: 'boolean',
          booleanValue: true,
        },
      ],
    },
  };

  return {
    nodes: [
      startNode,
      communicationNode(WELCOME, { x: 430, y: 193 }, config),
      waitingNode(WAIT, { x: 780, y: 193 }, config),
      conditionNode(BRANCH, { x: 1130, y: 193 }, config),
      communicationNode(BRANCH_YES, { x: 1480, y: 60 }, config),
      communicationNode(BRANCH_NO, { x: 1480, y: 330 }, config),
    ],
    edges: [
      edge(START_NODE_ID, 'right-0', WELCOME, 'left-0'),
      edge(WELCOME, 'right-0', WAIT, 'left-0'),
      edge(WAIT, 'right-0', BRANCH, 'left-0'),
      // У Условия два правых порта: right-0 зелёный («да»), right-1 красный («нет»).
      edge(BRANCH, 'right-0', BRANCH_YES, 'left-0'),
      edge(BRANCH, 'right-1', BRANCH_NO, 'left-0'),
    ],
    config,
  };
}
