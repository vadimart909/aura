import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useScenariosContext } from '../../context/ScenariosContext';
import NavigationBarCanvas from '../../components/NavigationBarCanvas/NavigationBarCanvas';
import NodeStartCard from '../../components/Nodes/NodeStartCard';
import Scale from '../../components/Scale';

import './ScenarioView.css';

/* ------------------------------------------------------------------ */
/*  Status → badge CSS-class mapping (reused from NavigationBarCanvas) */
/* ------------------------------------------------------------------ */
const popupBadgeClassMap = {
  draft: 'scenario-info__badge--grey',
  published: 'scenario-info__badge--purple',
  started: 'scenario-info__badge--yellow',
  stopped: 'scenario-info__badge--red',
  finishing: 'scenario-info__badge--red',
};

/* ------------------------------------------------------------------ */
/*  ScenarioInfoPopup                                                  */
/* ------------------------------------------------------------------ */
function ScenarioInfoPopup({ name, description, status, statusLabel, onClose }) {
  const badgeClass = popupBadgeClassMap[status] || popupBadgeClassMap.draft;

  return (
    <div className="scenario-info-overlay" onClick={onClose}>
      <div className="scenario-info" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="scenario-info__header">
          <span className="scenario-info__title">О сценарии</span>
          <span className={`scenario-info__badge ${badgeClass}`}>{statusLabel}</span>
        </div>

        {/* Content */}
        <div className="scenario-info__content">
          <div className="scenario-info__cell">
            <span className="scenario-info__name">{name}</span>
            {description && (
              <span className="scenario-info__description">{description}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="scenario-info__footer">
          <button type="button" className="scenario-info__close-btn" onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

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
        title={scenario?.name ?? 'Сценарий'}
        status={scenario?.status ?? 'draft'}
        statusLabel={scenario?.statusLabel ?? ''}
        onBack={() => navigate(-1)}
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
        <button type="button" className="scenario-view__footer-btn">
          Редактировать
        </button>
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
