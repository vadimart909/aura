import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useScenariosContext } from '../../context/useScenariosContext';
import NavigationBarCanvas from '../../components/NavigationBarCanvas/NavigationBarCanvas';
import ScenarioInfoPopup from '../../components/ScenarioInfoPopup';
import ConditionsPopup from '../../components/ConditionsPopup';
import ConfirmDialog from '../../components/ConfirmDialog';
import { nodeTypes, defaultEdgeOptions, runningEdges } from '../../components/Nodes/FlowNodes/flowConfig';
import { startCanvas } from '../createscenariocanvas/canvasSnapshot';
import PlayIcon from '../../components/icons/PlayIcon';
import StopIcon from '../../components/icons/StopIcon';
import ScenarioLinkIcon from '../../components/icons/ScenarioLinkIcon';
import Scale from '../../components/Scale';
import { Button } from '@ds/components/Button';
import { FlowResultView } from '@ds/components/FlowResultView/FlowResultView';
import { PlayCircle } from '@ds/icons';

import './ScenarioView.css';

/* ------------------------------------------------------------------ */
/*  Inner component — lives inside <ReactFlowProvider>                 */
/* ------------------------------------------------------------------ */
function ScenarioViewInner() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { scenarios, updateScenario } = useScenariosContext();
  const reactFlowInstance = useReactFlow();
  const scenario = scenarios.find((s) => String(s.id) === id);
  const [showInfo, setShowInfo] = useState(false);
  // Items of the «Все условия» popup, or null when it's closed. Owned by the
  // page rather than the card: the DS Modal is `position: fixed` and does not
  // portal, so rendered from inside a node it would inherit the React Flow
  // viewport transform and move with the canvas zoom.
  const [conditionsPopupItems, setConditionsPopupItems] = useState(null);
  const [showRunConfirm, setShowRunConfirm] = useState(false);
  const [showRunSuccess, setShowRunSuccess] = useState(false);
  const [showStopChoice, setShowStopChoice] = useState(false);
  const [showStopFullSuccess, setShowStopFullSuccess] = useState(false);
  const [showStopPartialSuccess, setShowStopPartialSuccess] = useState(false);

  // Saved by the editor via serializeCanvas — the nodes already carry their
  // finished labels and are pinned to state 'default' / showActions false, so
  // the cards render inert with no hover actions and no red rows.
  //
  // A scenario saved as a draft on step 1 and never opened on the canvas has
  // no `canvas` key at all — fall back to an unfilled Start block rather than
  // an empty graph.
  const canvas = scenario?.canvas ?? startCanvas();
  const nodes = canvas.nodes;
  const edges = canvas.edges;

  // Figma gives a draft and a running scenario one wide primary button each;
  // everything else (Опубликован / Остановлен / Завершает работу) gets the
  // «Редактировать» + «Запустить» pair.
  const status = scenario?.status ?? 'draft';

  // Flowing dashes on the cables while the scenario is live, per the
  // reactflow.dev animated-edge look.
  const displayEdges = useMemo(() => runningEdges(edges, status), [edges, status]);

  // «Показать все» opens the full list here instead of being decorative — this
  // is the only page that wires it up. `conditionLabels` / `conditionOverlines`
  // are the untruncated arrays (only the *rendered* rows are capped at three),
  // so everything the popup needs is already on the node.
  const displayNodes = useMemo(
    () => nodes.map((node) => {
      if (node.type !== 'condition') return node;
      const { conditionLabels = [], conditionOverlines = [] } = node.data ?? {};
      return {
        ...node,
        data: {
          ...node.data,
          onShowAll: () => setConditionsPopupItems(
            conditionLabels.map((label, i) => ({ label, overline: conditionOverlines[i] ?? '' })),
          ),
        },
      };
    }),
    [nodes],
  );

  // A hand-typed id that isn't in the store: every read below falls back, so the
  // page would render a blank scenario titled «Сценарий» with a live
  // «Редактировать» button — a dead end that looks like real data. Say so
  // instead. Placed after the hooks so their order never changes.
  if (!scenario) {
    return (
      <div className="page">
        <h1>Сценарий не найден</h1>
        <p>Сценария с таким адресом нет — возможно, его удалили.</p>
        <nav>
          <Link to="/">К списку сценариев</Link>
        </nav>
      </div>
    );
  }

  function handleEdit() {
    navigate(`/scenario/edit/${id}`);
  }

  function handleRunConfirm() {
    // Flip the status right away rather than on close, so «Перейти в сценарий»
    // drops the user onto a view that already reads «Запущен».
    updateScenario(id, { status: 'started', statusLabel: 'Запущен' });
    setShowRunConfirm(false);
    setShowRunSuccess(true);
  }

  function handleStopFull() {
    updateScenario(id, { status: 'stopped', statusLabel: 'Остановлен' });
    setShowStopChoice(false);
    setShowStopFullSuccess(true);
  }

  function handleStopPartial() {
    updateScenario(id, { status: 'finishing', statusLabel: 'Завершает работу' });
    setShowStopChoice(false);
    setShowStopPartialSuccess(true);
  }

  return (
    <div className="scenario-view">
      {/* ---- Navigation Bar Canvas ---- */}
      <NavigationBarCanvas
        mode="read"
        title={scenario?.name ?? 'Сценарий'}
        status={scenario?.status ?? 'draft'}
        statusLabel={scenario?.statusLabel ?? ''}
        onBack={() => navigate('/')}
        onInfo={() => setShowInfo(true)}
      />

      {/* ---- Canvas (read-only) ---- */}
      <div className="scenario-view__canvas">
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          deleteKeyCode={null}
          fitView={false}
          proOptions={{ hideAttribution: true }}
        />

        {/* ---- Scale controls ---- */}
        <Scale
          className="scenario-view__scale"
          onZoomIn={() => reactFlowInstance.zoomIn()}
          onZoomOut={() => reactFlowInstance.zoomOut()}
          onFitView={() => reactFlowInstance.fitView()}
        />
      </div>

      {/* ---- Footer ---- */}
      <footer className="scenario-view__footer">
        <div className="scenario-view__footer-content">
          {status === 'draft' && (
            <Button variant="primary" className="scenario-view__btn" onClick={handleEdit}>
              Редактировать
            </Button>
          )}

          {status === 'started' && (
            <Button
              variant="primary"
              className="scenario-view__btn scenario-view__btn--icon"
              onClick={() => setShowStopChoice(true)}
            >
              <StopIcon />
              Остановить
            </Button>
          )}

          {status === 'finishing' && (
            <>
              <span className="scenario-view__footer-hint ts-400-s">
                Чтобы отредактировать или запустить сценарий, дождись смены статуса на «Остановлен»
              </span>
              <div className="scenario-view__footer-buttons">
                <Button variant="secondary" className="scenario-view__btn" isDisabled>
                  Редактировать
                </Button>
                <Button variant="primary" className="scenario-view__btn scenario-view__btn--icon" isDisabled>
                  <PlayIcon />
                  Запустить
                </Button>
              </div>
            </>
          )}

          {status !== 'draft' && status !== 'started' && status !== 'finishing' && (
            <div className="scenario-view__footer-buttons">
              <Button variant="secondary" className="scenario-view__btn" onClick={handleEdit}>
                Редактировать
              </Button>
              <Button
                variant="primary"
                className="scenario-view__btn scenario-view__btn--icon"
                onClick={() => setShowRunConfirm(true)}
              >
                <PlayIcon />
                Запустить
              </Button>
            </div>
          )}
        </div>
      </footer>

      {/* ---- Info Popup ---- */}
      {showInfo && (
        <ScenarioInfoPopup
          name={scenario?.name ?? ''}
          description={scenario?.description ?? ''}
          status={scenario?.status ?? 'draft'}
          statusLabel={scenario?.statusLabel ?? ''}
          onClose={() => setShowInfo(false)}
        />
      )}

      {/* ---- All conditions of a «Условие» block ---- */}
      {conditionsPopupItems && (
        <ConditionsPopup
          items={conditionsPopupItems}
          onClose={() => setConditionsPopupItems(null)}
        />
      )}

      {/* ---- Run confirmation ---- */}
      {showRunConfirm && (
        <ConfirmDialog
          message="Запустить сценарий? Рассылка начнётся сразу после запуска."
          confirmLabel="Запустить"
          confirmIcon={<PlayCircle />}
          onConfirm={handleRunConfirm}
          onCancel={() => setShowRunConfirm(false)}
        />
      )}

      {/* ---- Run success ---- */}
      <FlowResultView
        isOpen={showRunSuccess}
        onDone={() => navigate('/')}
        state="success"
        title="Сценарий запущен"
        text="Рассылка по нему началась"
        items={[
          {
            title: 'Перейти в сценарий',
            icon: <ScenarioLinkIcon />,
            // Already on the scenario — just get the modal out of the way.
            onClick: () => setShowRunSuccess(false),
          },
        ]}
      />

      {/* ---- Stop: how ---- */}
      {showStopChoice && (
        <ConfirmDialog
          message="Как остановить сценарий?"
          options={[
            {
              label: 'Полностью',
              description: 'Клиентам не придут оставшиеся в сценарии рассылки',
              onClick: handleStopFull,
            },
            {
              label: 'Частично',
              description: 'Клиенты получат оставшиеся в сценарии рассылки',
              onClick: handleStopPartial,
            },
          ]}
          onCancel={() => setShowStopChoice(false)}
        />
      )}

      {/* ---- Stop success: full ---- */}
      <FlowResultView
        isOpen={showStopFullSuccess}
        onDone={() => setShowStopFullSuccess(false)}
        state="success"
        title="Сценарий остановлен"
        text="При необходимости можешь отредактировать его"
      />

      {/* ---- Stop success: partial ---- */}
      <FlowResultView
        isOpen={showStopPartialSuccess}
        onDone={() => setShowStopPartialSuccess(false)}
        state="success"
        title="Сценарий завершается"
        text="Как только клиенты получат оставшиеся рассылки, статус сценария поменяется на «Остановлен»"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function ScenarioView() {
  return (
    <ReactFlowProvider>
      <ScenarioViewInner />
    </ReactFlowProvider>
  );
}
