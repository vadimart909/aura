import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation, useBlocker } from 'react-router-dom';
import { useScenariosContext } from '../../context/useScenariosContext';
import { canvasFingerprint, baselineCanvasFingerprint } from '../createscenariocanvas/canvasSnapshot';
import UnsavedChangesModal from '../../components/UnsavedChangesModal';
import ScenarioLinkIcon from '../../components/icons/ScenarioLinkIcon';
import { Input } from '@ds/components/Input';
import { TextArea } from '@ds/components/TextArea';
import { Button } from '@ds/components/Button';
import { NavigationBar } from '@ds/components/NavigationBar';
import { FlowResultView } from '@ds/components/FlowResultView/FlowResultView';
import './CreateScenarioInfo.css';

const MAX_DESCRIPTION_LENGTH = 500;

export default function CreateScenarioInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { scenarios, addScenario, updateScenario, replaceScenario, removeScenario } = useScenariosContext();

  const isEditMode = Boolean(id);
  const existingScenario = isEditMode
    ? scenarios.find((s) => String(s.id) === id)
    : null;

  const [name, setName] = useState(existingScenario?.name ?? '');
  const [description, setDescription] = useState(existingScenario?.description ?? '');
  const [nameError, setNameError] = useState(location.state?.showNameError ?? false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [savedScenarioId, setSavedScenarioId] = useState(id ?? null);

  // The whole scenario as of the last commit point — entering the editing flow,
  // or the last explicit save. Everything is diffed against this, and «Выйти без
  // сохранения» restores it.
  //
  // `'originalScenario' in state` rather than `?? fallback`: the create flow
  // forwards a deliberate `null` meaning "no committed version exists yet, so
  // discard = delete", and `null ?? {...existingScenario}` would silently
  // promote that to "revert to the half-finished draft".
  const baselineRef = useRef(
    location.state && 'originalScenario' in location.state
      ? location.state.originalScenario
      : (existingScenario ? { ...existingScenario } : null),
  );

  // Canvas edits made earlier in this session are already in the store by now
  // (the canvas persists on unmount), so leaving from step 1 has to account for
  // them too — otherwise a graph change followed by a back-press exits silently.
  const currentScenario = scenarios.find((s) => String(s.id) === String(id ?? savedScenarioId));
  const hasUnsavedChanges = (() => {
    const base = baselineRef.current;
    // Only diff the canvas once the scenario exists in the store. In create mode
    // it doesn't, and `canvasFingerprint(undefined)` is '' — which never equals
    // the pristine baseline, so a blank form read dirty from frame one and the
    // exit guard trapped the user behind «Данные не сохранятся».
    if (currentScenario && canvasFingerprint(currentScenario.canvas) !== baselineCanvasFingerprint(base)) return true;
    return base
      ? name !== (base.name ?? '') || description !== (base.description ?? '')
      : Boolean(name.trim() || description.trim());
  })();

  // Ref to temporarily skip the blocker for intentional navigations
  // (e.g. "Продолжить" saves & navigates, "Готово" in draft modal)
  const skipBlockerRef = useRef(false);

  // Reset skipBlockerRef when this component mounts (user navigated back to form)
  useEffect(() => {
    skipBlockerRef.current = false;
  }, []);

  const canvasPath = `/scenario/canvas/${id ?? savedScenarioId}`;

  // Block client-side navigation (back arrow, Header NavLinks, browser back)
  // ONLY when the user has made changes in the form since it was opened
  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      !skipBlockerRef.current &&
      hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname &&
      // The canvas is the other half of this flow, not an exit from it. Matching
      // on the path (not just skipBlockerRef) is what keeps browser
      // back/forward between the two steps quiet.
      nextLocation.pathname !== canvasPath,
    [hasUnsavedChanges, canvasPath],
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
  // The dirty baseline is `baselineRef`, captured once at mount — it must NOT be
  // re-armed here, or a canvas round trip would launder the user's edits into
  // the baseline and the exit guard would read clean.
  useEffect(() => {
    if (existingName !== undefined) {
      setName(existingName ?? '');
      setDescription(existingDescription ?? '');
    } else if (!id) {
      setName('');
      setDescription('');
    }
  }, [id, existingName, existingDescription]);

  const descriptionCount = description.length;
  const isDescriptionError = descriptionCount >= MAX_DESCRIPTION_LENGTH;

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

    // An explicit save is a new commit point: re-arm the baseline so the flow
    // reads clean again. The store update is async, so build the merged object
    // here rather than reading it back.
    if (isEditMode || savedScenarioId) {
      const idToUpdate = id || savedScenarioId;
      // Unconditionally back to draft — this button means "save as draft"
      // regardless of what the scenario's status was before this edit session
      // (published, stopped, already draft).
      const patch = {
        name: name.trim(),
        description: description.trim(),
        status: 'draft',
        statusLabel: 'Черновик',
        date: `${dd}.${mm}.${yyyy}`,
      };
      // `existingScenario` is null when there is no `id` and only a
      // `savedScenarioId`, so read the live object out of the array instead.
      const current = scenarios.find((s) => String(s.id) === String(idToUpdate));
      updateScenario(idToUpdate, patch);
      baselineRef.current = { ...current, ...patch };
    } else {
      const created = {
        id: Date.now(),
        name: name.trim(),
        description: description.trim(),
        status: 'draft',
        statusLabel: 'Черновик',
        author: 'Вадим Артёменко',
        authorInitials: 'ВА',
        authorColor: 'var(--category-emerald)',
        date: `${dd}.${mm}.${yyyy}`,
      };
      addScenario(created);
      // No longer null: a committed version now exists, so a later discard
      // reverts to this draft instead of deleting it.
      baselineRef.current = created;
      setSavedScenarioId(created.id);
    }

    // Sync the displayed values to trimmed versions
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
      const base = baselineRef.current;
      const changed = name.trim() !== (base?.name ?? '')
        || description.trim() !== (base?.description ?? '');
      updateScenario(idToUpdate, {
        name: name.trim(),
        description: description.trim(),
        // Only touch the start date when something actually changed — stepping
        // through «Продолжить» and straight back out used to silently bump it.
        ...(changed ? { date: `${dd}.${mm}.${yyyy}` } : {}),
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
        authorColor: 'var(--category-emerald)',
        date: `${dd}.${mm}.${yyyy}`,
      });
      scenarioId = newId;
      setSavedScenarioId(newId);
    }

    // Skip the blocker — this is an intentional save+navigate
    skipBlockerRef.current = true;
    // Forward the baseline verbatim: a `null` here is meaningful (create flow,
    // nothing committed yet) and must not be replaced with a fallback.
    navigate(`/scenario/canvas/${scenarioId}`, {
      state: { originalScenario: baselineRef.current },
    });
  }

  /** «Выйти без сохранения» — roll the scenario back and leave for Home. */
  function handleDiscardAndExit() {
    // Must come first: reset() re-runs the predicate on the navigate below, so
    // anything else here would let the modal reopen and trap the user in it.
    skipBlockerRef.current = true;
    const idToRevert = id || savedScenarioId;
    if (idToRevert) {
      // A null baseline means nothing was ever committed — the draft only
      // exists because «Продолжить» created it, so drop it entirely.
      if (baselineRef.current) replaceScenario(idToRevert, baselineRef.current);
      else removeScenario(idToRevert);
    }
    blocker.reset();
    navigate('/', { replace: true });
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
        <NavigationBar
          title={isEditMode ? 'Редактирование сценария' : 'Создание сценария'}
          /* defaults to true — would add a "Clear" broom button next to Back */
          hasActionButton={false}
          backButtonLabel="Назад"
          onBackClick={() => {
            if (isEditMode) navigate(`/scenario/view/${id}`);
            else if (savedScenarioId) navigate(`/scenario/view/${savedScenarioId}`);
            else navigate('/');
          }}
        />
      </aside>

      {/* ---- Main content ---- */}
      <div className="flow-scenario__main">
        <div className="flow-scenario__form">
          {/* Поле «Название» */}
          {/* The red required asterisk is drawn by CSS — the DS Input has no
              required prop and types `label` as a plain string */}
          <Input
            label="Название"
            placeholder="Например, Активация ДМС"
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
            placeholder="Суть, гипотеза, метрики и ожидаемый результат"
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
            icon: <ScenarioLinkIcon />,
            onClick: handleModalContinue,
          },
        ]}
      />

      {/* ---- Unsaved Changes Modal (triggered by useBlocker) ---- */}
      {blocker.state === 'blocked' && (
        <UnsavedChangesModal
          onExit={handleDiscardAndExit}
          onCancel={() => blocker.reset()}
        />
      )}
    </div>
  );
}
