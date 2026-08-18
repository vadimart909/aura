import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useScenariosContext } from '../../context/ScenariosContext';
import NavigationBarCanvas from '../../components/NavigationBarCanvas/NavigationBarCanvas';
import ScenarioInfoPopup from '../../components/ScenarioInfoPopup';
import { DrawerStart, DrawerCommunication, DrawerWaiting, DrawerCondition } from '../../components/Drawers';
import { FlowStartNode, FlowCommunicationNode, FlowWaitingNode, FlowConditionNode } from '../../components/Nodes/FlowNodes';
import Scale from '../../components/Scale';
import { Button } from '@ds/components/Button';
import { FlowResultView } from '@ds/components/FlowResultView/FlowResultView';
import './CreateScenarioCanvas.css';

/* --------------------------------------------------------------------------
   Node type registry — defined outside component to avoid re-creation
   -------------------------------------------------------------------------- */
const nodeTypes = {
  start: FlowStartNode,
  communication: FlowCommunicationNode,
  waiting: FlowWaitingNode,
  condition: FlowConditionNode,
};

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

/* --------------------------------------------------------------------------
   Russian pluralization helper
   -------------------------------------------------------------------------- */
function pluralize(n, one, few, many) {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`;
  return `${n} ${many}`;
}

function formatWaitingLabel(unit, amount) {
  const num = Number(amount);
  if (!unit || !amount || Number.isNaN(num) || num <= 0) return '';
  if (unit === 'days') return pluralize(num, 'день', 'дня', 'дней');
  if (unit === 'hours') return pluralize(num, 'час', 'часа', 'часов');
  return '';
}

/* --------------------------------------------------------------------------
   Inner component — lives inside <ReactFlowProvider>
   -------------------------------------------------------------------------- */
function CreateScenarioCanvasInner() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { scenarios, updateScenario, addScenario } = useScenariosContext();
  const reactFlowInstance = useReactFlow();
  const scenarioExists = scenarios.some((s) => String(s.id) === id);

  // If the scenario doesn't exist (e.g. direct navigation by URL),
  // create a temporary draft so the canvas always renders without errors.
  const didAutoCreate = useRef(false);
  useEffect(() => {
    if (id && !scenarioExists && !didAutoCreate.current) {
      didAutoCreate.current = true;
      addScenario({
        id: Number(id) || id,
        name: '',
        description: '',
        status: 'draft',
        statusLabel: 'Черновик',
        author: '',
        authorInitials: '',
        authorColor: '#95AEE2',
        date: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      });
    }
  }, [id, scenarioExists, addScenario]);

  const scenario = scenarios.find((s) => String(s.id) === id);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showDrawerStart, setShowDrawerStart] = useState(true);

  // DrawerCommunication state
  const [showDrawerCommunication, setShowDrawerCommunication] = useState(false);
  const [activeCommunicationNodeId, setActiveCommunicationNodeId] = useState(null);
  const [communicationTemplates, setCommunicationTemplates] = useState({}); // { [nodeId]: { template, channels } }

  // DrawerWaiting state
  const [showDrawerWaiting, setShowDrawerWaiting] = useState(false);
  const [activeWaitingNodeId, setActiveWaitingNodeId] = useState(null);
  const [waitingConfigs, setWaitingConfigs] = useState({}); // { [nodeId]: { unit, amount } }

  // DrawerCondition state
  const [showDrawerCondition, setShowDrawerCondition] = useState(false);
  const [activeConditionNodeId, setActiveConditionNodeId] = useState(null);
  const [conditionConfigs, setConditionConfigs] = useState({}); // { [nodeId]: conditions[] }

  // Data chosen via DrawerStart
  const [startConditionType, setStartConditionType] = useState('trigger');
  const [startTrigger, setStartTrigger] = useState(null);
  const [startSegment, setStartSegment] = useState(null);
  const [startSchedule, setStartSchedule] = useState(null);

  // React Flow nodes & edges state
  const START_NODE_ID = 'start_node';
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: START_NODE_ID,
      type: 'start',
      position: { x: 80, y: 193 },
      draggable: true,
      data: {
        showError: false,
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
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
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
          },
        };
      }),
    );
  }, [showDrawerCommunication, activeCommunicationNodeId, communicationTemplates, setNodes]);

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
          },
        };
      }),
    );
  }, [showDrawerWaiting, activeWaitingNodeId, waitingConfigs, setNodes]);

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
                  return `${c.dateOperatorLabel}: ${c.dateFrom} – ${c.dateTo}`;
                }
                if (c.dateValue) return `${c.dateOperatorLabel}: ${c.dateValue}`;
                return c.dateOperatorLabel;
              }
              if ((c.type === 'integer' || c.type === 'number') && c.numberOperatorLabel) {
                if (c.numberOperator === 'range' && c.numberFrom !== '' && c.numberTo !== '') {
                  return `${c.numberOperatorLabel}: ${c.numberFrom} – ${c.numberTo}`;
                }
                if (c.numberValue !== undefined && c.numberValue !== '') {
                  return `${c.numberOperatorLabel}: ${c.numberValue}`;
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
          },
        };
      }),
    );
  }, [showDrawerCondition, activeConditionNodeId, conditionConfigs, setNodes]);

  // Original scenario data from BEFORE Step 1 edits were applied.
  // Passed via navigation state from CreateScenarioInfo's "Продолжить".
  // null when creating a brand-new scenario (no prior data to revert to).
  const originalScenarioRef = useRef(
    location.state?.originalScenario ?? null,
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
        data: { showError: false, showActions: false, ...defaultData[type] },
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

  function handleBackToForm() {
    navigate(`/scenario/edit/${id}`, {
      state: { originalScenario: originalScenarioRef.current },
    });
  }

  function handleSaveDraft() {
    // If name is empty, redirect to Step 1 and show the name error
    if (!scenario?.name?.trim()) {
      navigate(`/scenario/edit/${id}`, {
        state: {
          originalScenario: originalScenarioRef.current,
          showNameError: true,
        },
      });
      return;
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    updateScenario(id, {
      date: `${dd}.${mm}.${yyyy}`,
    });
    setShowDraftModal(true);
  }

  function handleModalContinue() {
    setShowDraftModal(false);
  }

  function handleModalDone() {
    setShowDraftModal(false);
    navigate('/');
  }

  function handlePublish() {
    // If name is empty, redirect to Step 1 and show the name error
    if (!scenario?.name?.trim()) {
      navigate(`/scenario/edit/${id}`, {
        state: {
          originalScenario: originalScenarioRef.current,
          showNameError: true,
        },
      });
      return;
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    updateScenario(id, {
      status: 'published',
      statusLabel: 'Опубликован',
      date: `${dd}.${mm}.${yyyy}`,
    });

    setShowPublishModal(true);
  }

  function handlePublishGoToScenario() {
    setShowPublishModal(false);
    navigate(`/scenario/view/${id}`);
  }

  function handlePublishDone() {
    setShowPublishModal(false);
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

      {/* ---- Canvas area with ReactFlow ---- */}
      <div className="flow-scenario-canvas__area">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView={false}
          proOptions={{ hideAttribution: true }}
        />


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
            Опубликовать можно только если есть блок Коммуникация
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
