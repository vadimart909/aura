import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation, useBlocker } from 'react-router-dom';
import { useScenariosContext } from '../../context/ScenariosContext';
import UnsavedChangesModal from '../../components/UnsavedChangesModal';
import { Input } from '@ds/components/Input';
import { TextArea } from '@ds/components/TextArea';
import { Button } from '@ds/components/Button';
import { FlowResultView } from '@ds/components/FlowResultView/FlowResultView';
import './CreateScenarioInfo.css';

const MAX_DESCRIPTION_LENGTH = 500;

function ArrowLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CreateScenarioInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { scenarios, addScenario, updateScenario } = useScenariosContext();

  const isEditMode = Boolean(id);
  const existingScenario = isEditMode
    ? scenarios.find((s) => String(s.id) === id)
    : null;

  const [name, setName] = useState(existingScenario?.name ?? '');
  const [description, setDescription] = useState(existingScenario?.description ?? '');
  const [nameError, setNameError] = useState(location.state?.showNameError ?? false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [savedScenarioId, setSavedScenarioId] = useState(id ?? null);

  // Original scenario from BEFORE the current editing session started.
  // Passed back from Canvas via navigation state when user clicks "Назад".
  // Used to revert the scenario data when user clicks "Выйти без сохранения".
  const originalScenarioRef = useRef(
    location.state?.originalScenario ?? null,
  );

  // Baseline for dirty detection: the form values when the component MOUNTED.
  // This captures what the user sees when they first land on the page.
  // Changes are detected by comparing current form values against these initial values.
  const initialNameRef = useRef(existingScenario?.name ?? '');
  const initialDescriptionRef = useRef(existingScenario?.description ?? '');

  const hasUnsavedChanges =
    name !== initialNameRef.current || description !== initialDescriptionRef.current;

  // Ref to temporarily skip the blocker for intentional navigations
  // (e.g. "Продолжить" saves & navigates, "Готово" in draft modal)
  const skipBlockerRef = useRef(false);

  // Reset skipBlockerRef when this component mounts (user navigated back to form)
  useEffect(() => {
    skipBlockerRef.current = false;
  }, []);

  // Block client-side navigation (back arrow, Header NavLinks, browser back)
  // ONLY when the user has made changes in the form since it was opened
  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      !skipBlockerRef.current &&
      hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname,
    [hasUnsavedChanges],
  );
  const blocker = useBlocker(shouldBlock);

  // Warn on browser tab close / refresh
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Use primitive values as deps to avoid re-firing when object reference changes
  const existingName = existingScenario?.name;
  const existingDescription = existingScenario?.description;

  // Sync form fields when navigating to edit mode or switching between scenarios.
  // Also update the dirty-detection baseline so that values loaded from context
  // are not treated as "unsaved changes".
  useEffect(() => {
    if (existingName !== undefined) {
      const n = existingName ?? '';
      const d = existingDescription ?? '';
      setName(n);
      setDescription(d);
      initialNameRef.current = n;
      initialDescriptionRef.current = d;
    } else if (!id) {
      setName('');
      setDescription('');
      initialNameRef.current = '';
      initialDescriptionRef.current = '';
    }
  }, [id, existingName, existingDescription]);

  const descriptionCount = description.length;
  const isDescriptionError = descriptionCount >= MAX_DESCRIPTION_LENGTH;
  const counterText = `${String(descriptionCount).padStart(2, '0')} / ${MAX_DESCRIPTION_LENGTH}`;

  function handleDescriptionChange(e) {
    setDescription(e.target.value);
  }

  function handleNameChange(e) {
    setName(e.target.value);
    if (nameError) {
      setNameError(false);
    }
  }

  /** Save as draft */
  function handleSaveDraft() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    if (isEditMode || savedScenarioId) {
      const idToUpdate = id || savedScenarioId;
      updateScenario(idToUpdate, {
        name: name.trim(),
        description: description.trim(),
        date: `${dd}.${mm}.${yyyy}`,
      });
    } else {
      const newId = Date.now();
      addScenario({
        id: newId,
        name: name.trim(),
        description: description.trim(),
        status: 'draft',
        statusLabel: 'Черновик',
        author: 'Вадим Артёменко',
        authorInitials: 'ВА',
        authorColor: '#82C9A1',
        date: `${dd}.${mm}.${yyyy}`,
      });
      setSavedScenarioId(newId);
    }

    // After saving, update the baseline so the form is considered "clean"
    initialNameRef.current = name.trim();
    initialDescriptionRef.current = description.trim();
    // Also sync the displayed values to trimmed versions
    setName(name.trim());
    setDescription(description.trim());

    setShowDraftModal(true);
  }

  /** "Продолжить" → save and go to canvas page (never blocked) */
  function handleContinue() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    let scenarioId = id || savedScenarioId;

    if (isEditMode || savedScenarioId) {
      const idToUpdate = id || savedScenarioId;
      updateScenario(idToUpdate, {
        name: name.trim(),
        description: description.trim(),
        date: `${dd}.${mm}.${yyyy}`,
      });
    } else {
      const newId = Date.now();
      addScenario({
        id: newId,
        name: name.trim(),
        description: description.trim(),
        status: 'draft',
        statusLabel: 'Черновик',
        author: 'Вадим Артёменко',
        authorInitials: 'ВА',
        authorColor: '#82C9A1',
        date: `${dd}.${mm}.${yyyy}`,
      });
      scenarioId = newId;
      setSavedScenarioId(newId);
    }

    // Skip the blocker — this is an intentional save+navigate
    skipBlockerRef.current = true;
    // Pass original (pre-edit) scenario data so the canvas can revert on discard.
    // If we already have an original from a previous round-trip (Canvas→Step1→Canvas),
    // keep forwarding it; otherwise snapshot the current existingScenario.
    const originalToPass = originalScenarioRef.current
      ?? (existingScenario ? { ...existingScenario } : null);
    navigate(`/scenario/canvas/${scenarioId}`, {
      state: { originalScenario: originalToPass },
    });
  }

  function handleModalContinue() {
    setShowDraftModal(false);
  }

  function handleModalDone() {
    setShowDraftModal(false);
    // Skip the blocker — data was just saved as draft
    skipBlockerRef.current = true;
    navigate('/');
  }

  return (
    <div className="flow-scenario">
      {/* ---- Sidebar ---- */}
      <aside className="flow-scenario__sidebar">
        <button
          type="button"
          className="flow-scenario__back-btn"
          onClick={() => {
            if (isEditMode) navigate(`/scenario/view/${id}`);
            else if (savedScenarioId) navigate(`/scenario/view/${savedScenarioId}`);
            else navigate('/');
          }}
          aria-label="Назад"
        >
          <ArrowLeftIcon />
        </button>

        <div className="flow-scenario__sidebar-header">
          <h1 className="flow-scenario__sidebar-title">
            {isEditMode ? 'Редактирование сценария' : 'Создание сценария'}
          </h1>
        </div>
      </aside>

      {/* ---- Main content ---- */}
      <div className="flow-scenario__main">
        <div className="flow-scenario__form">
          {/* Поле «Название» */}
          <Input
            label="Название *"
            placeholder="Введи название сценария"
            value={name}
            onChange={(val) => {
              setName(val);
              if (nameError) setNameError(false);
            }}
            isError={nameError}
            errorMessage="Укажи название"
          />

          {/* Поле «Описание» */}
          <TextArea
            label="Описание"
            placeholder="Опиши суть сценария"
            value={description}
            onChange={setDescription}
            maxLength={MAX_DESCRIPTION_LENGTH}
            isError={isDescriptionError}
            errorMessage={`Сократи описание до ${MAX_DESCRIPTION_LENGTH} символов`}
          />
        </div>
      </div>

      {/* ---- Footer ---- */}
      <footer className="flow-scenario__footer">
        <div className="flow-scenario__footer-content">
          <Button variant="secondary" onClick={handleSaveDraft}>
            Сохранить как черновик
          </Button>
          <Button variant="primary" onClick={handleContinue}>
            Продолжить
          </Button>
        </div>
      </footer>

      {/* ---- Draft Saved Modal ---- */}
      <FlowResultView
        isOpen={showDraftModal}
        onDone={handleModalDone}
        state="success"
        title="Черновик сохранён"
        text="Можешь продолжить заполнять сценарий сейчас или вернуться позже"
        items={[
          {
            title: 'Продолжить заполнение',
            onClick: handleModalContinue,
          },
        ]}
      />

      {/* ---- Unsaved Changes Modal (triggered by useBlocker) ---- */}
      {blocker.state === 'blocked' && (
        <UnsavedChangesModal
          onExit={() => {
            // Revert form values back to what they were when the page loaded,
            // undoing any in-context updates the user may have triggered.
            const revertName = initialNameRef.current;
            const revertDesc = initialDescriptionRef.current;
            const idToRevert = id || savedScenarioId;
            if (idToRevert) {
              updateScenario(idToRevert, {
                name: revertName,
                description: revertDesc,
              });
            }
            blocker.proceed();
          }}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  );
}
