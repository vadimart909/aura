/* ==========================================================================
   Демо-граф для засеянных сценариев.

   Мок-сценарии, которые «уже собрали» (всё, кроме черновиков), должны
   приезжать с готовым канвасом. Без рёбер не видно ни связей, ни анимации
   запущенного сценария — а нарисовать граф руками не выход: ScenariosContext
   держит сценарии в обычном useState, и нарисованное исчезает на первой же
   перезагрузке страницы.

   Сборщики узлов и рёбер (и правило «data выводится из config») переехали в
   ./mockNodes — здесь остались только сам граф и его конфиг.
   ========================================================================== */

import { MOCK_TEMPLATES } from '../../data/mockTemplates';
import { START_NODE_ID, startCanvas } from '../createscenariocanvas/canvasSnapshot';
import {
  channelsOf,
  communicationNode,
  conditionNode,
  conditionParam,
  edge,
  waitingNode,
} from './mockNodes';

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
          ...conditionParam('industry', 'Является актуальным селлером'),
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
