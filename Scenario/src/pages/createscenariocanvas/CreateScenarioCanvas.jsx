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
import { Button } from '@ds/components/Button';
import { Alert } from '@ds/components/Alert';
import { FlowResultView } from '@ds/components/FlowResultView/FlowResultView';
import { Trash } from '@ds/icons';
import { NodeErrorsContext } from '../../context/NodeErrorsContext';
import {
  PUBLISH_ALERTS,
  formatWaitingLabel,
  getPublishBlocker,
  getUnfilledNodeIds,
} from './publishValidation';
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
        date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
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

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
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

  // A port can only ever drive a single outgoing connection — reject a new
  // connection attempt if its source handle already has an edge. Also reject
  // self-connections: a node wired to itself would otherwise satisfy the
  // "block is connected" publish check.
  const isValidConnection = useCallback(
    (connection) =>
      connection.source !== connection.target &&
      !edges.some(
        (edge) => edge.source === connection.source && edge.sourceHandle === connection.sourceHandle,
      ),
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

  // Red rows appear only after a publish attempt, then track fixes live.
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  // { key, message } — the key bump remounts the DS Alert so its spring-in
  // animation and 5s auto-hide timer replay on every failed attempt.
  const [publishAlert, setPublishAlert] = useState(null);

  // Leave validation mode once everything is filled in, so a freshly dropped
  // (and therefore empty) block doesn't turn red before it's even opened.
  useEffect(() => {
    if (showFieldErrors && unfilledSet.size === 0) setShowFieldErrors(false);
  }, [showFieldErrors, unfilledSet]);

  const nodeErrors = useMemo(
    () => ({ showFieldErrors, unfilledNodeIds: unfilledSet }),
    [showFieldErrors, unfilledSet],
  );

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
        const hasTemplate = Boolean(saved?.template);
        return {
          ...node,
          data: {
            ...node.data,
            state: isActive ? 'active' : 'default',
            templateTitle: hasTemplate ? saved.template.title : '',
            templateDescription: hasTemplate ? saved.channels.join(', ') : '',
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
            showError: Boolean(saved) && !label,
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
        const hasSaved = Boolean(saved);
        const hasConditions = hasSaved && saved.length > 0;
        return {
          ...node,
          data: {
            ...node.data,
            state: isActive ? 'active' : 'default',
            conditions: hasConditions ? saved.length : 1,
            conditionLabels: hasConditions ? saved.map((c) => {
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
              return c.title;
            }) : [],
            conditionOverlines: hasConditions ? saved.map((c) => {
              if (c.type === 'boolean') return c.title;
              if (c.type === 'date' && c.dateOperatorLabel) return c.title;
              if ((c.type === 'integer' || c.type === 'number') && c.numberOperatorLabel) return c.title;
              return c.categoryLabel || '';
            }) : [],
            showShowAll: hasConditions && saved.length > 3,
            showError: hasSaved && !hasConditions,
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
  // the page on any pathname change, so browser Back to step 1 — which we let
  // through unblocked, being intra-flow — would otherwise drop the whole graph
  // on the floor. Also covers the empty-name early returns below.
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
    // Name and description are edited on step 1 but already live in the store
    // by the time we get here, so they are diffed from the scenario object.
    return base
      ? scenario?.name !== base.name || scenario?.description !== base.description
      : Boolean(scenario?.name?.trim() || scenario?.description?.trim());
  }, [canvasSnapshot, scenario]);

  // Set before every intentional exit so the blocker lets it through.
  const skipBlockerRef = useRef(false);

  const stepOnePath = `/scenario/edit/${id}`;
  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      !skipBlockerRef.current &&
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname &&
      // Step 1 is the other half of this flow, not an exit from it. Matching on
      // the path (not just skipBlockerRef) is what keeps browser back/forward
      // between the two steps quiet. The router strips `basename` first, so
      // this compares against /scenario/..., without /aura.
      nextLocation.pathname !== stepOnePath,
    [isDirty, stepOnePath],
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

  function handleBackToForm() {
    // Step 1 → «Продолжить» remounts this page; without saving here the round
    // trip would wipe the canvas.
    skipBlockerRef.current = true;
    updateScenario(id, { canvas: canvasSnapshot() });
    navigate(`/scenario/edit/${id}`, {
      state: { originalScenario: baselineRef.current },
    });
  }

  function handleSaveDraft() {
    // If name is empty, redirect to Step 1 and show the name error
    if (!scenario?.name?.trim()) {
      skipBlockerRef.current = true;
      navigate(`/scenario/edit/${id}`, {
        state: {
          originalScenario: baselineRef.current,
          showNameError: true,
        },
      });
      return;
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    // An explicit save is a new commit point: re-arm the baseline so the flow
    // reads clean again. The store update is async, so build the merged object
    // from this render's `scenario` rather than reading it back.
    const patch = { date: `${dd}.${mm}.${yyyy}`, canvas: canvasSnapshot() };
    updateScenario(id, patch);
    baselineRef.current = { ...scenario, ...patch };
    setShowDraftModal(true);
  }

  function handleModalContinue() {
    setShowDraftModal(false);
  }

  function handleModalDone() {
    setShowDraftModal(false);
    skipBlockerRef.current = true;
    navigate('/');
  }

  function handlePublish() {
    // If name is empty, redirect to Step 1 and show the name error
    if (!scenario?.name?.trim()) {
      skipBlockerRef.current = true;
      navigate(`/scenario/edit/${id}`, {
        state: {
          originalScenario: baselineRef.current,
          showNameError: true,
        },
      });
      return;
    }

    // Canvas checks, in order: filled fields → connected blocks → has a
    // Коммуникация block. Only the first check marks individual nodes.
    const blocker = getPublishBlocker({ nodes, edges, unfilledNodeIds });
    if (blocker) {
      if (blocker === PUBLISH_ALERTS.fields) setShowFieldErrors(true);
      setPublishAlert((prev) => ({ key: (prev?.key ?? 0) + 1, message: blocker }));
      return;
    }

    setPublishAlert(null);
    setShowFieldErrors(false);

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    const patch = {
      status: 'published',
      statusLabel: 'Опубликован',
      date: `${dd}.${mm}.${yyyy}`,
      canvas: canvasSnapshot(),
    };
    updateScenario(id, patch);
    baselineRef.current = { ...scenario, ...patch };

    setShowPublishModal(true);
  }

  function handlePublishGoToScenario() {
    setShowPublishModal(false);
    skipBlockerRef.current = true;
    navigate(`/scenario/view/${id}`);
  }

  function handlePublishDone() {
    setShowPublishModal(false);
    skipBlockerRef.current = true;
    navigate('/');
  }

  return (
    <div className="flow-scenario-canvas">
      {/* ---- Navigation Bar Canvas (Edit mode) ---- */}
      <NavigationBarCanvas
        mode="edit"
        onBack={handleBackToForm}
        onInfo={() => setShowInfo(true)}
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
          <span className="flow-scenario-canvas__footer-hint ts-400-s">
            Опубликовать можно только с заполненным блоком «Коммуникация»
          </span>
          <div className="flow-scenario-canvas__footer-buttons">
            <Button variant="secondary" onClick={handleSaveDraft} className="flow-scenario-canvas__btn-width">
              Сохранить как черновик
            </Button>
            <Button variant="primary" onClick={handlePublish} className="flow-scenario-canvas__btn-width">
              Опубликовать
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
          onSave={({ template, channels }) => {
            if (activeCommunicationNodeId) {
              setCommunicationTemplates((prev) => ({
                ...prev,
                [activeCommunicationNodeId]: { template, channels },
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

      {/* ---- Draft Saved Modal ---- */}
      <FlowResultView
        isOpen={showDraftModal}
        onDone={handleModalDone}
        state="success"
        title="Черновик сохранён"
        text="Можешь продолжить заполнять сценарий сейчас или вернуться позже"
        items={[
          { title: 'Продолжить заполнение', onClick: handleModalContinue },
        ]}
      />

      {/* ---- Published Modal ---- */}
      <FlowResultView
        isOpen={showPublishModal}
        onDone={handlePublishDone}
        state="success"
        title="Сценарий опубликован"
        text="Скоро повелители рассылок возьмут его в работу"
        items={[
          { title: 'Перейти в сценарий', onClick: handlePublishGoToScenario },
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
