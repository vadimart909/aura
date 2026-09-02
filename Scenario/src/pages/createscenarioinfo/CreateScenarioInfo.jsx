import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation, useBlocker, Link } from 'react-router-dom';
import { useScenariosContext } from '../../context/useScenariosContext';
import {
  canvasFingerprint,
  baselineCanvasFingerprint,
  startCanvas,
} from '../createscenariocanvas/canvasSnapshot';
import {
  PUBLISH_ALERTS,
  getPublishBlocker,
  getUnfilledNodeIds,
} from '../createscenariocanvas/publishValidation';
import { formatLaunchDate } from '../home/launchDate';
import UnsavedChangesModal from '../../components/UnsavedChangesModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import ScenarioLinkIcon from '../../components/icons/ScenarioLinkIcon';
import PlayIcon from '../../components/icons/PlayIcon';
import { Input } from '@ds/components/Input';
import { TextArea } from '@ds/components/TextArea';
import { Button } from '@ds/components/Button';
import { NavigationBar } from '@ds/components/NavigationBar';
import { FlowResultView } from '@ds/components/FlowResultView/FlowResultView';
import { PlayCircle } from '@ds/icons';
import './CreateScenarioInfo.css';

const MAX_DESCRIPTION_LENGTH = 500;

export default function CreateScenarioInfo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { scenarios, updateScenario, replaceScenario, removeScenario } = useScenariosContext();

  // 'create' | 'edit' — задаётся точкой входа (Home / ScenarioView) и приезжает
  // сюда с шага 1. Снимается один раз при монтировании: `handleSave`
  // перевзводит базовую линию, так что вывести режим из неё нельзя — заголовок
  // перескакивал бы на «Редактирование» после сохранения черновика.
  const flowMode = useRef(location.state?.flowMode ?? 'edit').current;
  // В редактировании вторичная кнопка футера — «Сохранить изменения», а не
  // «Сохранить как черновик»: сценарий уже существует, и сохранение правок не
  // должно менять его статус.
  const isEditFlow = flowMode === 'edit';

  // Сценарий существует с самого входа в поток (его создаёт Home), поэтому
  // читаем его из стора живьём — отдельный слепок «existing» больше не нужен.
  const scenario = scenarios.find((s) => String(s.id) === id);

  // Статус на момент входа, а не живой: «Опубликовать» переводит сценарий в
  // 'published', и живое чтение перерисовало бы футер в «Запустить» прямо под
  // открытой модалкой успеха.
  const entryStatus = useRef(scenario?.status ?? 'draft').current;
  // Черновик публикуют, всё остальное — запускают. Та же развилка, что в футере
  // ScenarioView: у 'draft' одна широкая кнопка, у опубликованного и
  // остановленного — пара с «Запустить».
  const isPublishFlow = entryStatus === 'draft';

  const [name, setName] = useState(scenario?.name ?? '');
  const [description, setDescription] = useState(scenario?.description ?? '');
  const [nameError, setNameError] = useState(location.state?.showNameError ?? false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showRunConfirm, setShowRunConfirm] = useState(false);
  const [showRunSuccess, setShowRunSuccess] = useState(false);

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

  // Граф рисуют на шаге 1, и он уже лежит в сторе к этому моменту, так что
  // диффать его надо и здесь — иначе правка канваса с последующим выходом с
  // формы прошла бы молча.
  const hasUnsavedChanges = (() => {
    const base = baselineRef.current;
    if (scenario && canvasFingerprint(scenario.canvas) !== baselineCanvasFingerprint(base)) return true;
    return base
      ? name !== (base.name ?? '') || description !== (base.description ?? '')
      // Базовой линии нет — значит сценарий в сторе ещё не закоммичен, и любой
      // выход из потока обязан его удалить. Такой выход всегда идёт через
      // модалку, даже если пользователь ничего не успел напечатать.
      : true;
  })();

  // Ref to temporarily skip the blocker for intentional navigations
  // (e.g. «Опубликовать» saves & navigates, «Готово» in draft modal)
  const skipBlockerRef = useRef(false);

  // Reset skipBlockerRef when this component mounts (user navigated back to form)
  useEffect(() => {
    skipBlockerRef.current = false;
  }, []);

  const canvasPath = `/scenario/canvas/${id}`;

  // Block client-side navigation (back arrow, Header NavLinks, browser back)
  // ONLY when the user has made changes in the flow since it was opened
  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) =>
      !skipBlockerRef.current &&
      hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname &&
      // Канвас — это шаг 1 того же потока, а не выход из него. Сравнение именно
      // по пути (а не только по skipBlockerRef) — то, что оставляет браузерные
      // back/forward между шагами тихими.
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

  const descriptionCount = description.length;
  const isDescriptionError = descriptionCount >= MAX_DESCRIPTION_LENGTH;

  /** Возврат на шаг 1. Базовую линию и режим надо пробросить обратно: `null`
   *  там осмысленный, и потерять его — значит превратить «отмена = удалить» в
   *  «откатиться к недоделанному черновику». */
  function handleBackToCanvas() {
    navigate(canvasPath, {
      state: { originalScenario: baselineRef.current, flowMode },
    });
  }

  /** «Сохранить как черновик» (создание) / «Сохранить изменения» (редактирование). */
  function handleSave() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }

    // An explicit save is a new commit point: re-arm the baseline so the flow
    // reads clean again. The store update is async, so build the merged object
    // here rather than reading it back.
    //
    // Редактирование сохраняет только сами правки: статус оставляем как есть,
    // иначе «Сохранить изменения» на опубликованном сценарии уводило бы его
    // обратно в черновики. В создании же это именно «Сохранить как черновик» —
    // статус выставляется здесь. «Дату старта» не пишет ни одна из веток: она
    // появляется только при запуске.
    const patch = {
      name: name.trim(),
      description: description.trim(),
    };
    if (!isEditFlow) {
      patch.status = 'draft';
      patch.statusLabel = 'Черновик';
    }
    updateScenario(id, patch);
    baselineRef.current = { ...scenario, ...patch };

    // Sync the displayed values to trimmed versions
    setName(name.trim());
    setDescription(description.trim());

    setShowSavedModal(true);
  }

  /**
   * Проверяет граф из стора. Если он не готов — сохраняет правки, уводит на
   * шаг 1 с алертом и подсветкой блоков и возвращает true.
   *
   * Общая для «Опубликовать» и «Запустить»: запускать сломанный сценарий не
   * лучше, чем публиковать, а в редактировании граф могли поломать.
   */
  function bounceOnInvalidCanvas() {
    // Граф уже в сторе: шаг 1 пишет его и на unmount, и явно в «Продолжить».
    // `startCanvas()` — фолбэк для старого черновика, который канваса ни разу
    // не видел: его пустой Старт честно провалит первую же проверку.
    const canvas = scenario?.canvas ?? startCanvas();
    const unfilledNodeIds = getUnfilledNodeIds(canvas.nodes, canvas.config);
    const blockedBy = getPublishBlocker({
      nodes: canvas.nodes,
      edges: canvas.edges,
      unfilledNodeIds,
    });
    if (!blockedBy) return false;

    // Чинить нечего кроме графа, поэтому уводим на шаг 1 — там и алерт, и
    // красные строки в блоках. Название с описанием сохраняем до перехода,
    // иначе круг через канвас их потеряет.
    updateScenario(id, { name: name.trim(), description: description.trim() });
    skipBlockerRef.current = true;
    navigate(canvasPath, {
      state: {
        originalScenario: baselineRef.current,
        flowMode,
        publishBlocker: blockedBy,
        // Красные строки — только для «Заполни обязательные поля»: два
        // остальных блокера про граф в целом, а не про конкретные блоки.
        ...(blockedBy === PUBLISH_ALERTS.fields ? { flaggedNodeIds: unfilledNodeIds } : {}),
      },
    });
    return true;
  }

  /** «Опубликовать» — финальное действие потока для черновика. */
  function handlePublish() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    if (bounceOnInvalidCanvas()) return;

    // «Дату старта» публикация не ставит: опубликованный сценарий ещё не
    // работает, и до «Запустить» ячейка на главной остаётся пустой.
    const patch = {
      name: name.trim(),
      description: description.trim(),
      status: 'published',
      statusLabel: 'Опубликован',
    };
    updateScenario(id, patch);
    baselineRef.current = { ...scenario, ...patch };

    setName(name.trim());
    setDescription(description.trim());

    setShowPublishModal(true);
  }

  /** «Запустить» — финальное действие для уже опубликованного сценария. */
  function handleRun() {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    if (bounceOnInvalidCanvas()) return;
    // Рассылка уходит сразу, поэтому тот же переспрос, что на странице просмотра.
    setShowRunConfirm(true);
  }

  function handleRunConfirm() {
    // «Дата старта» = дата нажатия «Запустить» — та же запись, что в
    // `handleRunConfirm` на странице просмотра. Дату кладём в общий `patch`, а
    // не отдельным `updateScenario`: строкой ниже с него снимается базовая
    // линия, и мимо неё дата протухла бы при откате «Выйти без сохранения».
    const patch = {
      name: name.trim(),
      description: description.trim(),
      status: 'started',
      statusLabel: 'Запущен',
      date: formatLaunchDate(),
    };
    updateScenario(id, patch);
    baselineRef.current = { ...scenario, ...patch };

    setName(name.trim());
    setDescription(description.trim());

    setShowRunConfirm(false);
    setShowRunSuccess(true);
  }

  /** «Выйти без сохранения» — roll the scenario back and leave for Home. */
  function handleDiscardAndExit() {
    // Must come first: reset() re-runs the predicate on the navigate below, so
    // anything else here would let the modal reopen and trap the user in it.
    skipBlockerRef.current = true;
    // A null baseline means nothing was ever committed — the scenario only
    // exists because the flow was started, so drop it entirely.
    if (baselineRef.current) replaceScenario(id, baselineRef.current);
    else removeScenario(id);
    blocker.reset();
    navigate('/', { replace: true });
  }

  function handleModalContinue() {
    setShowSavedModal(false);
  }

  function handleModalDone() {
    setShowSavedModal(false);
    // Skip the blocker — data was just saved as draft
    skipBlockerRef.current = true;
    navigate('/');
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

  function handleRunGoToScenario() {
    setShowRunSuccess(false);
    skipBlockerRef.current = true;
    navigate(`/scenario/view/${id}`);
  }

  function handleRunDone() {
    setShowRunSuccess(false);
    skipBlockerRef.current = true;
    navigate('/');
  }

  // A hand-typed id that isn't in the store: «Опубликовать» would write into
  // nothing and still report success. Say so instead. Placed after the hooks so
  // their order never changes.
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

  return (
    <div className="flow-scenario">
      {/* ---- Sidebar ---- */}
      <aside className="flow-scenario__sidebar">
        <NavigationBar
          title={flowMode === 'create' ? 'Создание сценария' : 'Редактирование сценария'}
          /* defaults to true — would add a "Clear" broom button next to Back */
          hasActionButton={false}
          backButtonLabel="Назад"
          onBackClick={handleBackToCanvas}
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
          {/* Подсказка — только про публикацию: в макете запуска её нет. */}
          {isPublishFlow && (
            <span className="flow-scenario__footer-hint ts-400-s">
              Опубликовать можно только с заполненным блоком «Коммуникация»
            </span>
          )}
          <div className="flow-scenario__footer-buttons">
            <Button variant="secondary" onClick={handleSave}>
              {isEditFlow ? 'Сохранить изменения' : 'Сохранить как черновик'}
            </Button>
            {isPublishFlow ? (
              <Button variant="primary" onClick={handlePublish}>
                Опубликовать
              </Button>
            ) : (
              <Button variant="primary" onClick={handleRun} className="flow-scenario__btn--icon">
                <PlayIcon />
                Запустить
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* ---- Saved Modal (черновик / изменения) ---- */}
      <FlowResultView
        isOpen={showSavedModal}
        onDone={handleModalDone}
        state="success"
        title={isEditFlow ? 'Изменения сохранены' : 'Черновик сохранён'}
        text="Можешь продолжить заполнять сценарий сейчас или вернуться позже"
        items={[
          {
            title: 'Продолжить заполнение',
            icon: <ScenarioLinkIcon />,
            onClick: handleModalContinue,
          },
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
          {
            title: 'Перейти в сценарий',
            icon: <ScenarioLinkIcon />,
            onClick: handlePublishGoToScenario,
          },
        ]}
      />

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
        onDone={handleRunDone}
        state="success"
        title="Сценарий запущен"
        text="Рассылка по нему началась"
        items={[
          {
            title: 'Перейти в сценарий',
            icon: <ScenarioLinkIcon />,
            onClick: handleRunGoToScenario,
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
