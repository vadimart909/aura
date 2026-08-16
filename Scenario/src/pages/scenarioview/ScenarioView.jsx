import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useScenariosContext } from '../../context/ScenariosContext';
import NavigationBarCanvas from '../../components/NavigationBarCanvas/NavigationBarCanvas';
import ScenarioInfoPopup from '../../components/ScenarioInfoPopup';
import NodeStartCard from '../../components/Nodes/NodeStartCard';
import Scale from '../../components/Scale';
import { Button } from '@ds/components/Button';

import './ScenarioView.css';

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */
export default function ScenarioView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { scenarios } = useScenariosContext();
  const scenario = scenarios.find((s) => String(s.id) === id);
  const [showInfo, setShowInfo] = useState(false);

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

      {/* ---- Canvas ---- */}
      <div className="scenario-view__canvas">
        <div style={{ position: 'absolute', left: 100, top: 50 }}>
          <NodeStartCard showError={false} showSchedule={false} showTime={false} />
        </div>

        {/* ---- Scale controls ---- */}
        <Scale className="scenario-view__scale" />
      </div>

      {/* ---- Footer ---- */}
      <footer className="scenario-view__footer">
        <div className="scenario-view__footer-content">
          <Button variant="primary" onClick={() => navigate(`/scenario/edit/${id}`)}>
            Редактировать
          </Button>
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
    </div>
  );
}
