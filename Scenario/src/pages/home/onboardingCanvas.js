/* ==========================================================================
   Граф сценария «Онбординг новых клиентов после открытия ОРС».

   Клиент открыл счёт — через 3 часа дожимаем регистрацию, через 7 дней
   разбираем его по сумме поступлений и виду деятельности и подбираем
   предложение: тариф, зарплатный проект, ДМС или кэшбэк. Каждая продуктовая
   ветка, где это уместно, добивается баннером.

   Сборщики узлов и правило «data выводится из config» — в ./mockNodes.
   ========================================================================== */

import { START_NODE_ID, startCanvas } from '../createscenariocanvas/canvasSnapshot';
import {
  communicationNode,
  conditionNode,
  conditionParam,
  edge,
  pickChannels,
  templateByTitle,
  waitingNode,
} from './mockNodes';

/*
 * Карточки шириной 250px, шаг по X — 350px, основная линия на y: 193, куда
 * startCanvas ставит Старт. Каждое Условие уводит зелёную ветку («да») вверх
 * к коммуникации, а красную («нет») — вниз, к следующему Условию: получается
 * лесенка из трёх развилок.
 *
 * Id идут подряд от dndnode_0 — по ним maxDndIndex засевает счётчик новых
 * блоков, когда сценарий открывают в редакторе.
 */
const WAIT_3H = 'dndnode_0';
const SIGNUP = 'dndnode_1';
const WAIT_7D = 'dndnode_2';
const INCOME = 'dndnode_3';
const TARIFF = 'dndnode_4';
const TARIFF_BANNER = 'dndnode_5';
const RETAIL = 'dndnode_6';
const SALARY = 'dndnode_7';
const SERVICES = 'dndnode_8';
const DMS = 'dndnode_9';
const DMS_BANNER = 'dndnode_10';
const CASHBACK = 'dndnode_11';

/**
 * Редактора баннеров нет — дровер прикрепляет ту же запись, что стоит в
 * макете (DrawerCommunication.jsx, PLACEHOLDER_BANNER). Дублируем её здесь,
 * а не импортируем: мок-данные грузятся на старте приложения и не должны
 * тянуть за собой компонент дровера с его стилями.
 */
const PLACEHOLDER_BANNER = { id: 'Test scenario_ID', title: 'Заголовок. Подзаголовок' };

/** Коммуникация-баннер в том виде, в каком её сохраняет DrawerCommunication. */
const bannerConfig = () => ({
  template: null,
  channels: [],
  type: 'banner',
  banner: PLACEHOLDER_BANNER,
});

/** Коммуникация-шаблон с выбранным подмножеством каналов. */
function templateConfig(title, channels) {
  const template = templateByTitle(title);
  return { template, channels: pickChannels(template, channels) };
}

export function onboardingCanvas({ trigger = '', segment = '' } = {}) {
  // Start-карточку берём у startCanvas, а не собираем заново, — она уже
  // настроена под просмотр, и обе версии канваса гарантированно совпадают.
  const [startNode] = startCanvas({ trigger, segment }).nodes;

  // Вид деятельности спрашивают дважды подряд, с разными значениями: сначала
  // отсекается розница, потом услуги, остальные уходят в кэшбэк.
  const activity = () => conditionParam('industry', 'Анкета МКС: вид деятельности');

  const config = {
    startConditionType: 'trigger',
    startTrigger: trigger ? { title: trigger } : null,
    startSegment: segment ? { title: segment } : null,
    startSchedule: null,
    communicationTemplates: {
      [SIGNUP]: templateConfig('Завершение регистрации', ['Email', 'Смс']),
      [TARIFF]: templateConfig('Новый тариф обслуживания', ['Чат']),
      [TARIFF_BANNER]: bannerConfig(),
      [SALARY]: templateConfig('Акция на зарплатные продукты', ['Пуш']),
      [DMS]: templateConfig('Рассылка по ДМС', ['Email']),
      [DMS_BANNER]: bannerConfig(),
      [CASHBACK]: templateConfig('Кэшбэк за покупки', ['Пуш', 'Колокольчик']),
    },
    waitingConfigs: {
      [WAIT_3H]: { unit: 'hours', amount: '3' },
      [WAIT_7D]: { unit: 'days', amount: '7' },
    },
    // Форма — ровно та, что пишет ConditionModal. Лейблы операторов это
    // сохранённые данные, а не выводимые, и должны совпадать с
    // NUMBER_OPERATORS / STRING_OPERATORS символ в символ.
    conditionConfigs: {
      [INCOME]: [
        {
          ...conditionParam('sellers', 'Сумма поступлений'),
          numberOperator: 'greater',
          numberOperatorLabel: 'Больше',
          numberValue: '10000',
        },
        {
          ...conditionParam('industry', 'Вероятность, что клиент селлер'),
          stringOperator: 'equal',
          stringOperatorLabel: 'Равно',
          stringValue: '100%',
        },
      ],
      [RETAIL]: [
        { ...activity(), stringOperator: 'equal', stringOperatorLabel: 'Равно', stringValue: 'Розничная торговля' },
      ],
      [SERVICES]: [
        { ...activity(), stringOperator: 'equal', stringOperatorLabel: 'Равно', stringValue: 'Услуги' },
      ],
    },
  };

  return {
    nodes: [
      startNode,
      waitingNode(WAIT_3H, { x: 430, y: 193 }, config),
      communicationNode(SIGNUP, { x: 780, y: 193 }, config),
      waitingNode(WAIT_7D, { x: 1130, y: 193 }, config),
      conditionNode(INCOME, { x: 1480, y: 193 }, config),
      communicationNode(TARIFF, { x: 1830, y: 60 }, config),
      communicationNode(TARIFF_BANNER, { x: 2180, y: 60 }, config),
      conditionNode(RETAIL, { x: 1830, y: 380 }, config),
      communicationNode(SALARY, { x: 2180, y: 380 }, config),
      conditionNode(SERVICES, { x: 2180, y: 610 }, config),
      communicationNode(DMS, { x: 2530, y: 610 }, config),
      communicationNode(DMS_BANNER, { x: 2880, y: 610 }, config),
      communicationNode(CASHBACK, { x: 2530, y: 840 }, config),
    ],
    edges: [
      edge(START_NODE_ID, 'right-0', WAIT_3H, 'left-0'),
      edge(WAIT_3H, 'right-0', SIGNUP, 'left-0'),
      edge(SIGNUP, 'right-0', WAIT_7D, 'left-0'),
      edge(WAIT_7D, 'right-0', INCOME, 'left-0'),
      // У Условия два правых порта: right-0 зелёный («да»), right-1 красный («нет»).
      edge(INCOME, 'right-0', TARIFF, 'left-0'),
      edge(TARIFF, 'right-0', TARIFF_BANNER, 'left-0'),
      edge(INCOME, 'right-1', RETAIL, 'left-0'),
      edge(RETAIL, 'right-0', SALARY, 'left-0'),
      edge(RETAIL, 'right-1', SERVICES, 'left-0'),
      edge(SERVICES, 'right-0', DMS, 'left-0'),
      edge(DMS, 'right-0', DMS_BANNER, 'left-0'),
      edge(SERVICES, 'right-1', CASHBACK, 'left-0'),
    ],
    config,
  };
}
