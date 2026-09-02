import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation, useBlocker } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useScenariosContext } from '../../context/useScenariosContext';
import NavigationBarCanvas from '../../components/NavigationBarCanvas/NavigationBarCanvas';
import ScenarioInfoPopup from '../../components/ScenarioInfoPopup';
import UnsavedChangesModal from '../../components/UnsavedChangesModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { DrawerStart, DrawerCommunication, DrawerWaiting, DrawerCondition } from '../../components/Drawers';
import { nodeTypes, edgeTypes, defaultEdgeOptions, connectionLineStyle } from '../../components/Nodes/FlowNodes/flowConfig';
import Scale from '../../components/Scale';
import ScenarioLinkIcon from '../../components/icons/ScenarioLinkIcon';
import { Button } from '@ds/components/Button';
import { Alert } from '@ds/components/Alert';
import { FlowResultView } from '@ds/components/FlowResultView/FlowResultView';
import { Trash } from '@ds/icons';
import { NodeErrorsContext, EMPTY_SET } from '../../context/NodeErrorsContext';
import { formatWaitingLabel, getUnfilledNodeIds } from './publishValidation';
import { conditionCardData, communicationCardData } from './nodeLabels';
import { wouldCreateCycle } from './connectionRules';
import {
  serializeCanvas,
  hydrateEditorNodes,
  maxDndIndex,
  canvasFingerprint,
  baselineCanvasFingerprint,
  createStartNode,
  EMPTY_CANVAS_CONFIG,
  START_NODE_ID,
} from './canvasSnapshot';
import './CreateScenarioCanvas.css';

/* --------------------------------------------------------------------------
   Unique node ID generator
   -------------------------------------------------------------------------- */
let dndNodeId = 0;
const getNodeId = () => `dndnode_${dndNodeId++}`;

const DAYS_MAP = {
  mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
};

const REPEAT_LABELS = {
  every_week: 'Каждую неделю',
  every_2_weeks: 'Каждые 2 недели',
  every_3_weeks: 'Каждые 3 недели',
  every_4_weeks: 'Каждые 4 недели',
  every_5_weeks: 'Каждые 5 недель',
  every_6_weeks: 'Каждые 6 недель',
};

/* `formatWaitingLabel` now lives in ./publishValidation — the Waiting sync
   effect and the fill predicate must share one implementation. */

/* --------------------------------------------------------------------------
   Inner component — lives inside <ReactFlowProvider>
   -------------------------------------------------------------------------- */
function CreateScenarioCanvasInner() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { scenarios, updateScenario, replaceScenario, removeScenario, addScenario } = useScenariosContext();
  const reactFlowInstance = useReactFlow();
  const scenarioExists = scenarios.some((s) => String(s.id) === id);

  // 'create' | 'edit' — задаётся точкой входа (Home / ScenarioView) и
  // пробрасывается дальше по потоку. Снимается один раз при монтировании: от
  // него зависит, куда уводит «Назад», а базовая линия для этого не годится —
  // `handleSave` её перевзводит.
  const flowMode = useRef(location.state?.flowMode ?? 'edit').current;
  // В редактировании вторичная кнопка футера — «Сохранить изменения», а не
  // «Сохранить как черновик»: сценарий уже существует, и сохранение правок не
  // должно менять его статус.
  const isEditFlow = flowMode === 'edit';

  // If the scenario doesn't exist (e.g. direct navigation by URL),
  // create a temporary draft so the canvas always renders without errors.
  const didAutoCreate = useRef(false);
  // Set by the discard path. The effect below re-runs on every provider render
  // (`addScenario` gets a fresh identity each time), so without this it would
  // resurrect the scenario `removeScenario` just deleted as an empty stub.
  const discardedRef = useRef(false);
  useEffect(() => {
    if (id && !scenarioExists && !didAutoCreate.current && !discardedRef.current) {
      didAutoCreate.current = true;
      addScenario({
        id: Number(id) || id,
        name: '',
        description: '',
        status: 'draft',
        statusLabel: 'Черновик',
        author: '',
        authorInitials: '',
        authorColor: 'var(--category-indigo)',
        // Пустая до запуска: «Дата старта» ставится только в «Запустить».
        date: '',
      });
    }
  }, [id, scenarioExists, addScenario]);

  const scenario = scenarios.find((s) => String(s.id) === id);

  // The canvas saved by an earlier visit, read exactly once — every piece of
  // state below seeds from it, and none of them may re-seed on later renders.
  const bootRef = useRef(undefined);
  if (bootRef.current === undefined) {
    const saved = scenario?.canvas ?? null;
    if (saved?.nodes?.length) {
      dndNodeId = Math.max(dndNodeId, maxDndIndex(saved.nodes) + 1);
    }
    bootRef.current = saved;
  }
  const savedCanvas = bootRef.current;
  const savedConfig = savedCanvas?.config;

  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  // Auto-open DrawerStart only for a genuinely empty Start block (a brand-new
  // scenario). Once any field has data — even a partially filled tab — the
  // user has already seen the drawer once, so re-entering the canvas should
  // land on the graph, not force it open again.
  const [showDrawerStart, setShowDrawerStart] = useState(
    !(savedConfig?.startTrigger || savedConfig?.startSegment || savedConfig?.startSchedule),
  );

  // DrawerCommunication state
  const [showDrawerCommunication, setShowDrawerCommunication] = useState(false);
  const [activeCommunicationNodeId, setActiveCommunicationNodeId] = useState(null);
  const [communicationTemplates, setCommunicationTemplates] = useState(savedConfig?.communicationTemplates ?? EMPTY_CANVAS_CONFIG.communicationTemplates); // { [nodeId]: { template, channels } }

  // DrawerWaiting state
  const [showDrawerWaiting, setShowDrawerWaiting] = useState(false);
  const [activeWaitingNodeId, setActiveWaitingNodeId] = useState(null);
  const [waitingConfigs, setWaitingConfigs] = useState(savedConfig?.waitingConfigs ?? EMPTY_CANVAS_CONFIG.waitingConfigs); // { [nodeId]: { unit, amount } }

  // DrawerCondition state
  const [showDrawerCondition, setShowDrawerCondition] = useState(false);
  const [activeConditionNodeId, setActiveConditionNodeId] = useState(null);
  const [conditionConfigs, setConditionConfigs] = useState(savedConfig?.conditionConfigs ?? EMPTY_CANVAS_CONFIG.conditionConfigs); // { [nodeId]: conditions[] }

  // Block deletion awaiting confirmation — set by onBeforeDelete below,
  // consumed by handleConfirmDelete/handleCancelDelete.
  const pendingDeleteRef = useRef(null); // { nodes, edges } | null
  // True for exactly one re-invocation of deleteElements — the one we make
  // ourselves after the user confirms — so it isn't asked about again.
  const allowNextDeleteRef = useRef(false);
  const [pendingDeleteCount, setPendingDeleteCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Data chosen via DrawerStart
  const [startConditionType, setStartConditionType] = useState(savedConfig?.startConditionType ?? EMPTY_CANVAS_CONFIG.startConditionType);
  const [startTrigger, setStartTrigger] = useState(savedConfig?.startTrigger ?? EMPTY_CANVAS_CONFIG.startTrigger);
  const [startSegment, setStartSegment] = useState(savedConfig?.startSegment ?? EMPTY_CANVAS_CONFIG.startSegment);
  const [startSchedule, setStartSchedule] = useState(savedConfig?.startSchedule ?? EMPTY_CANVAS_CONFIG.startSchedule);

  // React Flow nodes & edges state. The sync effects below rebuild every
  // node's `data` from the drawer configs right after mount, so the seed only
  // has to get the graph shape (ids, types, positions) right.
  const [nodes, setNodes, onNodesChange] = useNodesState(
    savedCanvas?.nodes?.length
      ? hydrateEditorNodes(savedCanvas.nodes, START_NODE_ID, showDrawerStart)
      : [createStartNode()],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(savedCanvas?.edges ?? []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // One port, one cable — in both directions: reject the attempt if either the
  // source handle already has an outgoing edge or the target handle already has
  // an incoming one. Also reject self-connections: a node wired to itself would
  // otherwise satisfy the "block is connected" publish check.
  //
  // No loops either. The port rules above don't catch them: in a two-block
  // cycle each block has only one of its two ports taken, so the back edge
  // lands on a free pair. wouldCreateCycle walks the graph instead, which
  // covers loops of any length. It goes last — the cheap checks reject almost
  // everything before the walk, and this runs on every hover over a candidate
  // port during a drag.
  //
  // Direction is deliberately NOT checked here — a drag may start on either
  // side of a block, and xyflow normalizes the connection before calling this,
  // so `source` is always the output handle and the side the drag started from
  // is unrecoverable. That normalization is what lets the checks above stay
  // direction-agnostic: both the port-occupancy tests and wouldCreateCycle read
  // an already correctly-oriented source/target either way. The "output → input
  // only" rule lives on the handles themselves (see Port.jsx).
  const isValidConnection = useCallback(
    (connection) =>
      connection.source !== connection.target &&
      !edges.some(
        (edge) =>
          (edge.source === connection.source && edge.sourceHandle === connection.sourceHandle) ||
          (edge.target === connection.target && edge.targetHandle === connection.targetHandle),
      ) &&
      !wouldCreateCycle(edges, connection.source, connection.target),
    [edges],
  );

  /* ---- Delete confirmation -------------------------------------------------
     Single gate for both the trash-icon click and React Flow's built-in
     keyboard delete — both funnel through reactFlowInstance.deleteElements(),
     which awaits onBeforeDelete before touching any state. A lone connection
     (no blocks selected) is let through without asking. */
  const onBeforeDelete = useCallback(({ nodes: nodesToDelete, edges: edgesToDelete }) => {
    if (allowNextDeleteRef.current) {
      allowNextDeleteRef.current = false;
      return true;
    }
    if (nodesToDelete.length === 0) return true;
    pendingDeleteRef.current = { nodes: nodesToDelete, edges: edgesToDelete };
    setPendingDeleteCount(nodesToDelete.length);
    setShowDeleteConfirm(true);
    return false;
  }, []);

  function handleConfirmDelete() {
    const pending = pendingDeleteRef.current;
    pendingDeleteRef.current = null;
    setShowDeleteConfirm(false);
    if (!pending) return;
    allowNextDeleteRef.current = true;
    reactFlowInstance.deleteElements(pending).then(({ deletedNodes }) => {
      // Close whichever drawer was open on a block that just got deleted —
      // covers both the icon click and a keyboard delete of a selection that
      // happens to include the node currently being edited.
      const deletedIds = new Set(deletedNodes.map((n) => n.id));
      if (activeCommunicationNodeId && deletedIds.has(activeCommunicationNodeId)) {
        setShowDrawerCommunication(false);
        setActiveCommunicationNodeId(null);
      }
      if (activeWaitingNodeId && deletedIds.has(activeWaitingNodeId)) {
        setShowDrawerWaiting(false);
        setActiveWaitingNodeId(null);
      }
      if (activeConditionNodeId && deletedIds.has(activeConditionNodeId)) {
        setShowDrawerCondition(false);
        setActiveConditionNodeId(null);
      }
    });
  }

  function handleCancelDelete() {
    pendingDeleteRef.current = null;
    setShowDeleteConfirm(false);
  }

  /* ---- Publish validation ------------------------------------------------ */

  const validationConfig = useMemo(
    () => ({
      startConditionType,
      startTrigger,
      startSegment,
      startSchedule,
      communicationTemplates,
      waitingConfigs,
      conditionConfigs,
    }),
    [
      startConditionType,
      startTrigger,
      startSegment,
      startSchedule,
      communicationTemplates,
      waitingConfigs,
      conditionConfigs,
    ],
  );

  const unfilledNodeIds = useMemo(
    () => getUnfilledNodeIds(nodes, validationConfig),
    [nodes, validationConfig],
  );

  // `nodes` gets a fresh identity on every drag frame, so key the Set on the
  // joined ids instead of the array — otherwise the context value would change
  // 60×/second while dragging and re-render every card.
  const unfilledKey = unfilledNodeIds.join('|');
  const unfilledSet = useMemo(
    () => new Set(unfilledKey ? unfilledKey.split('|') : []),
    [unfilledKey],
  );

  // Ids the last failed publish attempt flagged as unfilled. «Опубликовать»
  // живёт на шаге 2, поэтому и ids, и текст алерта приезжают оттуда в router
  // state — см. эффект ниже. Deliberately a frozen snapshot rather than a live
  // flag over `unfilledSet`: blocks dropped *after* that attempt are not in it,
  // so they stay clean until the user presses Опубликовать again.
  const [flaggedNodeIds, setFlaggedNodeIds] = useState(EMPTY_SET);
  // { key, message } — the key bump remounts the DS Alert so its spring-in
  // animation and 5s auto-hide timer replay on every failed attempt.
  const [publishAlert, setPublishAlert] = useState(null);

  // A flagged block keeps its red row only while it is still unfilled, so
  // filling one in clears its error live. Ids of deleted nodes drop out for
  // free — `unfilledSet` is derived from the current `nodes`.
  const fieldErrorNodeIds = useMemo(
    () => (flaggedNodeIds.size === 0
      ? EMPTY_SET
      : new Set([...flaggedNodeIds].filter((nodeId) => unfilledSet.has(nodeId)))),
    [flaggedNodeIds, unfilledSet],
  );

  // Once every flagged block is filled, drop the snapshot — otherwise emptying
  // one of them again would resurrect the red row with no new publish attempt.
  useEffect(() => {
    if (flaggedNodeIds.size > 0 && fieldErrorNodeIds.size === 0) setFlaggedNodeIds(EMPTY_SET);
  }, [flaggedNodeIds, fieldErrorNodeIds]);

  // «Опубликовать» нажимают на шаге 2, а чинить нечего кроме графа — поэтому
  // шаг 2 отправляет пользователя сюда вместе с текстом алерта и списком
  // незаполненных блоков. Читаем ровно один раз при монтировании и гасим
  // state, чтобы forward/back не проиграли тот же алерт снова.
  //
  // `replace` с тем же pathname безопасен: shouldBlock требует смены pathname,
  // а AnimatedOutlet кейится на нём же и страницу не перемонтирует.
  useEffect(() => {
    const incoming = location.state;
    if (!incoming?.publishBlocker) return;
    setPublishAlert({ key: 1, message: incoming.publishBlocker });
    if (incoming.flaggedNodeIds?.length) setFlaggedNodeIds(new Set(incoming.flaggedNodeIds));
    navigate(location.pathname, {
      replace: true,
      state: { originalScenario: incoming.originalScenario, flowMode: incoming.flowMode },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodeErrors = useMemo(() => ({ fieldErrorNodeIds }), [fieldErrorNodeIds]);

  // Keep Start node data in sync with DrawerStart state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== START_NODE_ID) return node;
        return {
          ...node,
          data: {
            ...node.data,
            showTrigger: startConditionType === 'trigger',
            showSchedule: startConditionType === 'schedule',
            showScheduleDays: startConditionType === 'schedule' && startSchedule?.frequency === 'specificDays',
            triggerLabel: startTrigger?.title || '',
            segmentLabel: startSegment?.title || '',
            scheduleLabel: startSchedule?.time || '',
            scheduleOverline: startSchedule
              ? startSchedule.frequency === 'daily' ? 'Ежедневно' : ''
              : '',
            scheduleDescription: startSchedule?.time ? 'Москва (UTC+3)' : '',
            scheduleDaysLabel: startSchedule?.days?.length
              ? startSchedule.days.map((d) => DAYS_MAP[d] || d).join(', ')
              : '',
            scheduleDaysOverline: startSchedule?.repeat
              ? REPEAT_LABELS[startSchedule.repeat] || ''
              : '',
            state: showDrawerStart ? 'active' : 'default',
            onClick: () => {
              setShowDrawerCommunication(false);
              setActiveCommunicationNodeId(null);
              setShowDrawerWaiting(false);
              setActiveWaitingNodeId(null);
              setShowDrawerCondition(false);
              setActiveConditionNodeId(null);
              setShowDrawerStart(true);
            },
          },
        };
      }),
    );
  }, [startConditionType, startTrigger, startSegment, startSchedule, showDrawerStart, setNodes]);

  // Keep Communication nodes' state & onClick in sync with drawer
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type !== 'communication') return node;
        const isActive = showDrawerCommunication && activeCommunicationNodeId === node.id;
        const saved = communicationTemplates[node.id];
        return {
          ...node,
          data: {
            ...node.data,
            state: isActive ? 'active' : 'default',
            ...communicationCardData(saved),
            onClick: () => {
              setShowDrawerStart(false);
              setShowDrawerWaiting(false);
              setActiveWaitingNodeId(null);
              setShowDrawerCondition(false);
              setActiveConditionNodeId(null);
              setActiveCommunicationNodeId(node.id);
              setShowDrawerCommunication(true);
            },
            // Drawer close-on-delete lives in handleConfirmDelete — the
            // deletion is gated behind a confirmation, so nothing here can
            // assume it actually happened.
            onDelete: () => reactFlowInstance.deleteElements({ nodes: [{ id: node.id }] }),
          },
        };
      }),
    );
  }, [showDrawerCommunication, activeCommunicationNodeId, communicationTemplates, setNodes, reactFlowInstance]);

  // Keep Waiting nodes' state & onClick in sync with drawer
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type !== 'waiting') return node;
        const isActive = showDrawerWaiting && activeWaitingNodeId === node.id;
        const saved = waitingConfigs[node.id];
        const label = saved ? formatWaitingLabel(saved.unit, saved.amount) : '';
        return {
          ...node,
          data: {
            ...node.data,
            state: isActive ? 'active' : 'default',
            waitingLabel: label,
            onClick: () => {
              setShowDrawerStart(false);
              setShowDrawerCommunication(false);
              setActiveCommunicationNodeId(null);
              setShowDrawerCondition(false);
              setActiveConditionNodeId(null);
              setActiveWaitingNodeId(node.id);
              setShowDrawerWaiting(true);
            },
            onDelete: () => reactFlowInstance.deleteElements({ nodes: [{ id: node.id }] }),
          },
        };
      }),
    );
  }, [showDrawerWaiting, activeWaitingNodeId, waitingConfigs, setNodes, reactFlowInstance]);

  // Keep Condition nodes' state & onClick in sync with drawer
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type !== 'condition') return node;
        const isActive = showDrawerCondition && activeConditionNodeId === node.id;
        const saved = conditionConfigs[node.id];
        return {
          ...node,
          data: {
            ...node.data,
            state: isActive ? 'active' : 'default',
            ...conditionCardData(saved),
            onClick: () => {
              setShowDrawerStart(false);
              setShowDrawerCommunication(false);
              setActiveCommunicationNodeId(null);
              setShowDrawerWaiting(false);
              setActiveWaitingNodeId(null);
              setActiveConditionNodeId(node.id);
              setShowDrawerCondition(true);
            },
            onDelete: () => reactFlowInstance.deleteElements({ nodes: [{ id: node.id }] }),
          },
        };
      }),
    );
  }, [showDrawerCondition, activeConditionNodeId, conditionConfigs, setNodes, reactFlowInstance]);

  /* ---- Unsaved-changes baseline ------------------------------------------ */

  // The whole scenario as of the last commit point — entering the editing flow,
  // or the last explicit save. Everything is diffed against this, and «Выйти без
  // сохранения» restores it.
  //
  // `'originalScenario' in state` rather than `?? fallback`: the create flow
  // forwards a deliberate `null` meaning "no committed version exists yet, so
  // discard = delete", and `null ?? {...scenario}` would silently promote that
  // to "revert to the half-finished draft".
  const baselineRef = useRef(
    location.state && 'originalScenario' in location.state
      ? location.state.originalScenario
      : (scenario ? { ...scenario } : null),
  );

  /* ---- Drag & Drop handlers ---- */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaultData = {
        communication: { title: 'Коммуникация' },
        waiting: { title: 'Ожидание' },
        condition: { title: 'Условие' },
      };

      const newNode = {
        id: getNodeId(),
        type,
        position,
        data: { showError: false, ...defaultData[type] },
      };

      setNodes((nds) => [...nds, newNode]);

      // Auto-open DrawerCommunication when a communication node is dropped
      if (type === 'communication') {
        setShowDrawerStart(false);
        setShowDrawerWaiting(false);
        setActiveWaitingNodeId(null);
        setShowDrawerCondition(false);
        setActiveConditionNodeId(null);
        setActiveCommunicationNodeId(newNode.id);
        setShowDrawerCommunication(true);
      }

      // Auto-open DrawerWaiting when a waiting node is dropped
      if (type === 'waiting') {
        setShowDrawerStart(false);
        setShowDrawerCommunication(false);
        setActiveCommunicationNodeId(null);
        setShowDrawerCondition(false);
        setActiveConditionNodeId(null);
        setActiveWaitingNodeId(newNode.id);
        setShowDrawerWaiting(true);
      }

      // Auto-open DrawerCondition when a condition node is dropped
      if (type === 'condition') {
        setShowDrawerStart(false);
        setShowDrawerCommunication(false);
        setActiveCommunicationNodeId(null);
        setShowDrawerWaiting(false);
        setActiveWaitingNodeId(null);
        setActiveConditionNodeId(newNode.id);
        setShowDrawerCondition(true);
      }
    },
    [reactFlowInstance, setNodes],
  );

  /* ---- Canvas persistence ------------------------------------------------ */

  // `validationConfig` is already a memo of exactly the seven drawer configs,
  // so the snapshot and the publish checks can never read different values.
  const canvasSnapshot = useCallback(
    () => serializeCanvas({ nodes, edges, config: validationConfig }),
    [nodes, edges, validationConfig],
  );

  // Persist on unmount, not just in handleBackToForm. AnimatedOutlet remounts
  // the page on any pathname change, so browser Back/Forward to step 2 — which
  // we let through unblocked, being intra-flow — would otherwise drop the whole
  // graph on the floor. Also covers the empty-name early return below.
  const latestSnapshotRef = useRef(null);
  latestSnapshotRef.current = canvasSnapshot;
  useEffect(
    () => () => {
      if (!discardedRef.current) updateScenario(id, { canvas: latestSnapshotRef.current() });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ---- Unsaved-changes guard --------------------------------------------- */

  const isDirty = useMemo(() => {
    const base = baselineRef.current;
    if (canvasFingerprint(canvasSnapshot()) !== baselineCanvasFingerprint(base)) return true;
    // Name and description are edited on step 2, but the scenario object exists
    // from the moment the flow starts, so they are diffed straight off it.
    return base
      ? scenario?.name !== base.name || scenario?.description !== base.description
      : Boolean(scenario?.name?.trim() || scenario?.description?.trim());
  }, [canvasSnapshot, scenario]);

  // Set before every intentional exit so the blocker lets it through.
  const skipBlockerRef = useRef(false);

  const stepTwoPath = `/scenario/info/${id}`;
  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      !skipBlockerRef.current &&
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname &&
      // Step 2 is the other half of this flow, not an exit from it. Matching on
      // the path (not just skipBlockerRef) is what keeps browser back/forward
      // between the two steps quiet. The router strips `basename` first, so
      // this compares against /scenario/..., without /aura.
      nextLocation.pathname !== stepTwoPath,
    [isDirty, stepTwoPath],
  );
  const navBlocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  function handleDiscardAndExit() {
    // Must come first: reset() re-runs the predicate on the navigate below, and
    // the live nodes are never reverted — so anything else here would let the
    // modal reopen and trap the user in it.
    skipBlockerRef.current = true;
    discardedRef.current = true;
    if (baselineRef.current) replaceScenario(id, baselineRef.current);
    else removeScenario(id);
    navBlocker.reset();
    navigate('/', { replace: true });
  }

  /** «Назад» — выход из потока, а не переход на другой шаг. */
  function handleExit() {
    // Сценарий создаётся на входе в поток, поэтому чистый выход из создания
    // обязан убрать за собой пустышку — иначе в списке останется безымянная
    // строка. Грязный поток идёт мимо: его перехватит useBlocker, а
    // «Выйти без сохранения» удалит тот же стаб (базовая линия там null).
    if (flowMode === 'create' && !isDirty) {
      discardedRef.current = true;
      removeScenario(id);
      navigate('/', { replace: true });
      return;
    }
    navigate(flowMode === 'create' ? '/' : `/scenario/view/${id}`);
  }

  /** «Продолжить» → шаг 2, «Название и описание». Ничего не валидирует. */
  function handleContinue() {
    // Шаг 2 → «Назад» перемонтирует эту страницу; без сохранения здесь круг
    // стёр бы канвас.
    skipBlockerRef.current = true;
    updateScenario(id, { canvas: canvasSnapshot() });
    navigate(`/scenario/info/${id}`, {
      state: { originalScenario: baselineRef.current, flowMode },
    });
  }

  /** «Сохранить как черновик» (создание) / «Сохранить изменения» (редактирование). */
  function handleSave() {
    // Название обязательно и для черновика, и для правок, а живёт оно на
    // шаге 2 — уводим туда с уже подсвеченной ошибкой.
    if (!scenario?.name?.trim()) {
      skipBlockerRef.current = true;
      updateScenario(id, { canvas: canvasSnapshot() });
      navigate(`/scenario/info/${id}`, {
        state: {
          originalScenario: baselineRef.current,
          flowMode,
          showNameError: true,
        },
      });
      return;
    }

    // An explicit save is a new commit point: re-arm the baseline so the flow
    // reads clean again. The store update is async, so build the merged object
    // from this render's `scenario` rather than reading it back.
    //
    // Редактирование трогает только граф: статус оставляем как есть, иначе
    // «Сохранить изменения» на опубликованном сценарии уводило бы его обратно в
    // черновики. В создании же это именно «Сохранить как черновик» — статус
    // выставляется здесь. «Дату старта» не пишет ни одна из веток: она
    // появляется только при запуске.
    const patch = { canvas: canvasSnapshot() };
    if (!isEditFlow) {
      patch.status = 'draft';
      patch.statusLabel = 'Черновик';
    }
    updateScenario(id, patch);
    baselineRef.current = { ...scenario, ...patch };
    setShowSavedModal(true);
  }

  function handleModalContinue() {
    setShowSavedModal(false);
  }

  function handleModalDone() {
    setShowSavedModal(false);
    skipBlockerRef.current = true;
    navigate('/');
  }

  return (
    <div className="flow-scenario-canvas">
      {/* ---- Navigation Bar Canvas (Edit mode) ---- */}
      <NavigationBarCanvas
        mode="edit"
        onBack={handleExit}
        /* На шаге 1 создания названия и описания ещё нет — попап был бы пустым,
           а NavigationBarCanvas рисует кнопку только при truthy onInfo. */
        onInfo={scenario?.name?.trim() ? () => setShowInfo(true) : undefined}
      />

      {/* ---- Publish validation alert ---- */}
      {publishAlert && (
        <Alert
          key={publishAlert.key}
          type="error"
          textAlign="center"
          onHide={() => setPublishAlert(null)}
        >
          {publishAlert.message}
        </Alert>
      )}

      {/* ---- Canvas area with ReactFlow ---- */}
      <div className="flow-scenario-canvas__area">
        <NodeErrorsContext.Provider value={nodeErrors}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onBeforeDelete={onBeforeDelete}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineStyle={connectionLineStyle}
            fitView={false}
            proOptions={{ hideAttribution: true }}
          />
        </NodeErrorsContext.Provider>


        {/* Scale controls */}
        <Scale
          className="flow-scenario-canvas__scale"
          onZoomIn={() => reactFlowInstance.zoomIn()}
          onZoomOut={() => reactFlowInstance.zoomOut()}
          onFitView={() => reactFlowInstance.fitView()}
        />
      </div>

      {/* ---- Footer ---- */}
      <footer className="flow-scenario-canvas__footer">
        <div className="flow-scenario-canvas__footer-content">
          <div className="flow-scenario-canvas__footer-buttons">
            <Button variant="secondary" onClick={handleSave} className="flow-scenario-canvas__btn-width">
              {isEditFlow ? 'Сохранить изменения' : 'Сохранить как черновик'}
            </Button>
            <Button variant="primary" onClick={handleContinue} className="flow-scenario-canvas__btn-width">
              Продолжить
            </Button>
          </div>
        </div>
      </footer>

      {/* ---- Drawer Start ---- */}
      {showDrawerStart && (
        <DrawerStart
          onClose={() => setShowDrawerStart(false)}
          onSave={({ conditionType, trigger, segment, schedule }) => {
            setStartConditionType(conditionType);
            setStartTrigger(trigger);
            setStartSegment(segment);
            setStartSchedule(schedule);
            setShowDrawerStart(false);
          }}
          initialConditionType={startConditionType}
          initialTrigger={startTrigger}
          initialSegment={startSegment}
          initialSchedule={startSchedule}
        />
      )}

      {/* ---- Drawer Communication ---- */}
      {showDrawerCommunication && (
        <DrawerCommunication
          onClose={() => {
            setShowDrawerCommunication(false);
            setActiveCommunicationNodeId(null);
          }}
          onSave={({ type, template, channels, banner }) => {
            if (activeCommunicationNodeId) {
              setCommunicationTemplates((prev) => ({
                ...prev,
                // `type` пишем только для баннера: моковые сценарии хранят
                // { template, channels } без него, и безусловное поле меняло бы
                // им отпечаток канваса — открыть дровер и нажать «Сохранить»
                // без правок читалось бы как «есть несохранённые изменения».
                [activeCommunicationNodeId]: {
                  template,
                  channels,
                  ...(type === 'banner' ? { type, banner } : {}),
                },
              }));
            }
            setShowDrawerCommunication(false);
            setActiveCommunicationNodeId(null);
          }}
          initialTemplate={
            activeCommunicationNodeId
              ? communicationTemplates[activeCommunicationNodeId]?.template || null
              : null
          }
          initialType={
            activeCommunicationNodeId
              ? communicationTemplates[activeCommunicationNodeId]?.type ?? 'template'
              : 'template'
          }
          initialBanner={
            activeCommunicationNodeId
              ? communicationTemplates[activeCommunicationNodeId]?.banner ?? null
              : null
          }
        />
      )}

      {/* ---- Drawer Waiting ---- */}
      {showDrawerWaiting && (
        <DrawerWaiting
          onClose={() => {
            setShowDrawerWaiting(false);
            setActiveWaitingNodeId(null);
          }}
          onSave={({ unit, amount }) => {
            if (activeWaitingNodeId) {
              setWaitingConfigs((prev) => ({
                ...prev,
                [activeWaitingNodeId]: { unit, amount },
              }));
            }
            setShowDrawerWaiting(false);
            setActiveWaitingNodeId(null);
          }}
          initialUnit={
            activeWaitingNodeId
              ? waitingConfigs[activeWaitingNodeId]?.unit || null
              : null
          }
          initialAmount={
            activeWaitingNodeId
              ? waitingConfigs[activeWaitingNodeId]?.amount || ''
              : ''
          }
        />
      )}

      {/* ---- Drawer Condition ---- */}
      {showDrawerCondition && (
        <DrawerCondition
          onClose={() => {
            setShowDrawerCondition(false);
            setActiveConditionNodeId(null);
          }}
          onSave={(conditions) => {
            if (activeConditionNodeId) {
              setConditionConfigs((prev) => ({
                ...prev,
                [activeConditionNodeId]: conditions,
              }));
            }
            setShowDrawerCondition(false);
            setActiveConditionNodeId(null);
          }}
          initialConditions={
            activeConditionNodeId
              ? conditionConfigs[activeConditionNodeId] || []
              : []
          }
        />
      )}

      {/* ---- Scenario Info Popup ---- */}
      {showInfo && scenario && (
        <ScenarioInfoPopup
          name={scenario.name}
          description={scenario.description}
          status={scenario.status || 'draft'}
          statusLabel={scenario.statusLabel || 'Черновик'}
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* ---- Saved Modal (черновик / изменения) ---- */}
      <FlowResultView
        isOpen={showSavedModal}
        onDone={handleModalDone}
        state="success"
        title={isEditFlow ? 'Изменения сохранены' : 'Черновик сохранён'}
        text="Можешь продолжить заполнять сценарий сейчас или вернуться позже"
        items={[
          { title: 'Продолжить заполнение', icon: <ScenarioLinkIcon />, onClick: handleModalContinue },
        ]}
      />

      {/* ---- Unsaved changes ---- */}
      {navBlocker.state === 'blocked' && (
        <UnsavedChangesModal
          onExit={handleDiscardAndExit}
          onCancel={() => navBlocker.reset()}
        />
      )}

      {/* ---- Delete confirmation ---- */}
      {showDeleteConfirm && (
        <ConfirmDialog
          message={pendingDeleteCount > 1 ? 'Удалить блоки?' : 'Удалить блок?'}
          confirmLabel="Удалить"
          confirmIcon={<Trash />}
          tone="error"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Exported wrapper — provides ReactFlowProvider context
   -------------------------------------------------------------------------- */
export default function CreateScenarioCanvas() {
  return (
    <ReactFlowProvider>
      <CreateScenarioCanvasInner />
    </ReactFlowProvider>
  );
}
