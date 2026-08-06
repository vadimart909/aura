import { useState, useRef, useEffect } from 'react';
import { NodeStartCard, NodeWaitingCard, NodeCommunicationCard, NodeConditionCard, Port, Ports } from '../components/Nodes';

export default function NodesPreview() {
  const [startActive, setStartActive] = useState(false);
  const [waitingActive, setWaitingActive] = useState(false);
  const [commActive, setCommActive] = useState(false);
  const [condActive, setCondActive] = useState(false);

  const startRef = useRef(null);
  const waitingRef = useRef(null);
  const commRef = useRef(null);
  const condRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (startActive && startRef.current && !startRef.current.contains(e.target)) {
        setStartActive(false);
      }
      if (waitingActive && waitingRef.current && !waitingRef.current.contains(e.target)) {
        setWaitingActive(false);
      }
      if (commActive && commRef.current && !commRef.current.contains(e.target)) {
        setCommActive(false);
      }
      if (condActive && condRef.current && !condRef.current.contains(e.target)) {
        setCondActive(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [startActive, waitingActive, commActive, condActive]);

  return (
    <div style={{ padding: 40, display: 'flex', gap: 40, flexWrap: 'wrap', background: '#f4f4f4', minHeight: '80vh' }}>
      {/* Interactive: hover on mouseover, active on click, deactivate on click outside */}
      <div ref={startRef}>
        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#676767' }}>
          Start — Interactive {startActive ? '(active)' : '(hover me / click me)'}
        </h3>
        <NodeStartCard
          state={startActive ? 'active' : 'default'}
          showError={false}
          onClick={() => setStartActive((v) => !v)}
        />
      </div>

      {/* Interactive Waiting: hover on mouseover, active on click, deactivate on click outside */}
      <div ref={waitingRef}>
        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#676767' }}>
          Waiting — Interactive {waitingActive ? '(active)' : '(hover me / click me)'}
        </h3>
        <NodeWaitingCard
          state={waitingActive ? 'active' : 'default'}
          showError={false}
          onClick={() => setWaitingActive((v) => !v)}
        />
      </div>

      {/* ===== NodeCommunicationCard ===== */}

      {/* Interactive Communication: hover on mouseover, active on click, deactivate on click outside */}
      <div ref={commRef}>
        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#676767' }}>
          Communication — Interactive {commActive ? '(active)' : '(hover me / click me)'}
        </h3>
        <NodeCommunicationCard
          state={commActive ? 'active' : 'default'}
          showError={false}
          onClick={() => setCommActive((v) => !v)}
        />
      </div>

      {/* ===== NodeConditionCard ===== */}

      {/* Interactive Condition: hover on mouseover, active on click, deactivate on click outside */}
      <div ref={condRef}>
        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#676767' }}>
          Condition — Interactive {condActive ? '(active)' : '(hover me / click me)'}
        </h3>
        <NodeConditionCard
          state={condActive ? 'active' : 'default'}
          showError={false}
          onClick={() => setCondActive((v) => !v)}
        />
      </div>

      {/* --- Standalone Port demos --- */}
      <div>
        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#676767' }}>Port States</h3>
        <div style={{ padding: 20, background: '#ddd', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
          <Port state="default" />
          <Port state="active" />
        </div>
      </div>

      {/* Ports container demo */}
      <div>
        <h3 style={{ marginBottom: 12, fontSize: 14, color: '#676767' }}>Ports (1 / 2 / 3)</h3>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ position: 'relative', width: 60, height: 100, background: '#ddd', borderRadius: 8 }}>
            <Ports count={1} side="right" />
          </div>
          <div style={{ position: 'relative', width: 60, height: 100, background: '#ddd', borderRadius: 8 }}>
            <Ports count={2} side="right" />
          </div>
          <div style={{ position: 'relative', width: 60, height: 100, background: '#ddd', borderRadius: 8 }}>
            <Ports count={3} side="right" activeIndexes={[1]} />
          </div>
        </div>
      </div>
    </div>
  );
}
