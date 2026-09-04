import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './home.css'
import { useScenariosContext } from '../../context/useScenariosContext'
import ConfirmDialog from '../../components/ConfirmDialog'
import dogDigging from './dog-digging.svg'
import { Alert } from '@ds/components/Alert'
import { Chip } from '@ds/components/Chip'
import { ContextMenu } from '@ds/components/ContextMenu'
import { HeaderButton } from '@ds/components/HeaderButton'
import { Tag } from '@ds/components/Tag'
import { Avatar } from '@ds/components/Avatar'
import {
  Magnifier,
  DotsThreeHorizontal,
  LayerOnLayerRectangleVertical,
  PlusCircle,
  Trash,
} from '@ds/icons'

const statusTagClassMap = {
  draft: 'tag--status-grey',
  published: 'tag--status-purple',
  started: 'tag--status-yellow',
  stopped: 'tag--status-red',
  finishing: 'tag--status-red',
}

const CURRENT_USER = 'Вадим Артёменко'

// Автор и нового сценария, и копии — всегда текущий пользователь: копия чужого
// сценария с чужим автором не попала бы на вкладку «Мои сценарии», куда её сразу
// после дублирования и идут искать, и её нельзя было бы удалить.
const CURRENT_USER_IDENTITY = {
  author: CURRENT_USER,
  authorInitials: 'ВА',
  authorColor: 'var(--category-emerald)',
}

// Удалить можно только свой сценарий и только пока он не «Запущен»: у
// запущенного сценария есть живая рассылка, обрывать её удалением нельзя.
const DELETABLE_STATUSES = new Set(['stopped', 'published', 'draft', 'finishing'])

function canDelete(row) {
  return row.author === CURRENT_USER && DELETABLE_STATUSES.has(row.status)
}

function Home() {
  const navigate = useNavigate()
  const { scenarios, addScenario, removeScenario } = useScenariosContext()
  // «Мои сценарии» — вкладка по умолчанию: пользователь приходит на главную
  // за своими сценариями, а не за общим списком.
  const [filter, setFilter] = useState('my')
  const [searchQuery, setSearchQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [menuDropUp, setMenuDropUp] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  // { key } — бамп key ремонтирует Alert, иначе его пружинка и 5-секундный
  // таймер (заведены в useLayoutEffect с пустыми зависимостями) не проиграются
  // на втором удалении подряд.
  const [deletedAlert, setDeletedAlert] = useState(null)
  const menuCellRef = useRef(null)
  const suppressRowClickRef = useRef(false)
  const showAuthor = filter === 'all'

  const baseScenarios = filter === 'my'
    ? scenarios.filter((s) => s.author === CURRENT_USER)
    : scenarios

  const query = searchQuery.toLowerCase().trim()
  const filteredScenarios = baseScenarios.filter((row) => {
    if (!query) return true
    return (
      row.name.toLowerCase().includes(query) ||
      row.description.toLowerCase().includes(query) ||
      (showAuthor && row.author.toLowerCase().includes(query))
    )
  })

  // Панель ContextMenu абсолютная и не портальная, а .table__body скроллится —
  // у нижних строк меню обрезалось бы краем контейнера. Раскрываем всегда вниз,
  // меряем до отрисовки кадра и, если не поместилось, переворачиваем вверх.
  useLayoutEffect(() => {
    if (openMenuId === null) return
    const panel = menuCellRef.current?.querySelector('.context-menu')
    const body = menuCellRef.current?.closest('.table__body')
    if (!panel || !body) return
    setMenuDropUp(panel.getBoundingClientRect().bottom > body.getBoundingClientRect().bottom)
  }, [openMenuId])

  function toggleMenu(id) {
    // Сбрасываем направление до замера — иначе перевёрнутая панель померялась бы
    // уже перевёрнутой и залипла бы в этом состоянии.
    setMenuDropUp(false)
    setOpenMenuId((current) => (current === id ? null : id))
  }

  function handleMenuClose() {
    setOpenMenuId(null)
    // ContextMenu закрывается по mousedown, а следом по тому же нажатию сработал
    // бы onClick строки: пользователь хотел закрыть меню, а уехал в сценарий.
    // Гасим ровно этот клик — он приходит в том же тике.
    suppressRowClickRef.current = true
    setTimeout(() => { suppressRowClickRef.current = false }, 0)
  }

  function menuItems(row) {
    const items = [
      {
        key: 'duplicate',
        label: 'Дублировать',
        icon: <LayerOnLayerRectangleVertical />,
        onClick: () => handleDuplicate(row),
      },
    ]
    if (canDelete(row)) {
      items.push({
        key: 'delete',
        label: 'Удалить',
        icon: <Trash />,
        variant: 'danger',
        onClick: () => setPendingDelete(row),
      })
    }
    return items
  }

  // Копия уносит с собой всё заведённое — описание и канвас целиком, — но
  // рождается черновиком от текущего пользователя. Клонируем глубоко:
  // serializeCanvas отдаёт `config` по ссылке, и поверхностная копия оставила бы
  // оригинал с копией на одном объекте конфигов.
  //
  // Id блоков внутри канваса не перегенерируем: они живут только внутри своего
  // канваса (рёбра + карты конфигов), а счётчик `dndnode_N` при открытии
  // пересеивается вверх от максимума в нём.
  function handleDuplicate(row) {
    const copy = structuredClone(row)
    copy.id = Date.now()
    copy.status = 'draft'
    copy.statusLabel = 'Черновик'
    // «Дата старта» пишется только при «Запустить», у копии её ещё нет.
    copy.date = ''
    Object.assign(copy, CURRENT_USER_IDENTITY)
    addScenario(copy)
    navigate(`/scenario/view/${copy.id}`)
  }

  function handleConfirmDelete() {
    removeScenario(pendingDelete.id)
    setPendingDelete(null)
    setDeletedAlert((prev) => ({ key: (prev?.key ?? 0) + 1 }))
  }

  // Сценарий рождается ДО входа в поток: шаг 1 — канвас, а ему нужен id, чтобы
  // писать граф в стор. Пустышку убирает шаг 1 при чистом выходе «Назад»
  // (handleExit) или «Выйти без сохранения» — базовая линия там null.
  function handleCreate() {
    const newId = Date.now()
    addScenario({
      id: newId,
      name: '',
      description: '',
      status: 'draft',
      statusLabel: 'Черновик',
      ...CURRENT_USER_IDENTITY,
      // «Дата старта» = дата нажатия «Запустить», поэтому у нового сценария
      // ячейка пустая до самого запуска.
      date: '',
    })
    navigate(`/scenario/canvas/${newId}`, {
      // `null` здесь осмысленно: закоммиченной версии ещё нет, значит отмена = удалить.
      state: { originalScenario: null, flowMode: 'create' },
    })
  }

  return (
    <div className="scenarios">
      {/* ---- Уведомление об удалении ---- */}
      {deletedAlert && (
        <Alert
          key={deletedAlert.key}
          type="success"
          textAlign="center"
          onHide={() => setDeletedAlert(null)}
        >
          Сценарий удалён
        </Alert>
      )}

      <div className="scenarios__content">
        {/* Search & Filters */}
        <div className="scenarios__search-block">
          <div className="scenarios__actions">
            <div className="scenarios__chips">
              <Chip
                variant="tab"
                isSelected={filter === 'my'}
                onClick={() => setFilter('my')}
              >
                Мои сценарии
              </Chip>
              <Chip
                variant="tab"
                isSelected={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                Все
              </Chip>
            </div>
            <HeaderButton
              variant="primary"
              icon={<PlusCircle />}
              onClick={handleCreate}
            >
              Создать сценарий
            </HeaderButton>
          </div>

          <div className="search-bar">
            <div className="search-bar__field">
              <span className="search-bar__icon ds-icon ds-icon--m">
                <Magnifier />
              </span>
              <input
                className="search-bar__input ts-400-m"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={filter === 'my' ? 'Название или описание' : 'Название, описание или автор'}
              />
            </div>
          </div>
        </div>

        {filteredScenarios.length === 0 ? (
          filter === 'my' && !query ? (
            <div className="empty-view">
              <img src={dogDigging} alt="" className="empty-view__image" />
              <div className="empty-view__text-block">
                <p className="empty-view__text ts-400-m">Здесь будут твои сценарии. Пока их нет.</p>
              </div>
            </div>
          ) : (
            <div className="search-empty-view">
              <p className="search-empty-view__text ts-400-m">
                Ничего не найдено. Попробуй изменить поисковый запрос.
              </p>
            </div>
          )
        ) : (
          <div className="table">
            {/* Table Header */}
            <div className="table__header">
              <div className="table__cell table__cell--scenario">
                <span className="table__header-text ts-500-m">Сценарии</span>
              </div>
              <div className="table__cell table__cell--status">
                <span className="table__header-text ts-500-m">Статус</span>
              </div>
              {showAuthor && (
                <div className="table__cell table__cell--author">
                  <span className="table__header-text ts-500-m">Автор</span>
                </div>
              )}
              <div className="table__cell table__cell--date">
                <span className="table__header-text ts-500-m">Дата старта</span>
              </div>
              <div className="table__cell table__cell--actions" />
            </div>

            {/* Table Body */}
            <div className="table__body">
              {filteredScenarios.map((row) => (
                <div
                  key={row.id}
                  className="table__row"
                  onClick={() => {
                    if (suppressRowClickRef.current) return
                    navigate(`/scenario/view/${row.id}`)
                  }}
                >
                  <div className="table__cell table__cell--scenario">
                    <div className="table__cell-content">
                      <span className="table__cell-title ts-400-m">{row.name}</span>
                      {row.description && (
                        <span className="table__cell-desc ts-400-s">{row.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="table__cell table__cell--status">
                    <Tag size="m" className={statusTagClassMap[row.status]}>
                      {row.statusLabel}
                    </Tag>
                  </div>
                  {showAuthor && (
                    <div className="table__cell table__cell--author">
                      <div className="table__author">
                        <Avatar
                          shape="circle"
                          size="s"
                          label={row.authorInitials}
                          style={{
                            '--avatar-surface': row.authorColor,
                            // DS default is --primitive-secondary, which has
                            // too little contrast on the tinted category fills
                            '--avatar-color': 'var(--primitive-default)',
                          }}
                        />
                        <span className="table__cell-title ts-400-m">{row.author}</span>
                      </div>
                    </div>
                  )}
                  <div className="table__cell table__cell--date">
                    <span className="table__cell-title ts-400-m">{row.date}</span>
                  </div>
                  <div
                    className="table__cell table__cell--actions"
                    ref={openMenuId === row.id ? menuCellRef : undefined}
                    /* Панель меню — DOM-потомок этой ячейки (всплытие идёт по
                       DOM, а не по раскладке), поэтому её клики ушли бы в строку
                       и увели на просмотр. Глушим разом триггер и панель. */
                    onClick={(event) => event.stopPropagation()}
                  >
                    <ContextMenu
                      className={
                        openMenuId === row.id && menuDropUp
                          ? 'table__menu table__menu--up'
                          : 'table__menu'
                      }
                      isOpen={openMenuId === row.id}
                      onClose={handleMenuClose}
                      placement="left"
                      items={menuItems(row)}
                      trigger={
                        <button
                          type="button"
                          className="table__action-btn"
                          aria-label="Действия со сценарием"
                          onClick={() => toggleMenu(row.id)}
                        >
                          <span className="ds-icon ds-icon--m">
                            <DotsThreeHorizontal />
                          </span>
                        </button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Table Footer */}
            <div className="table__footer">
              <span className="table__footer-text ts-500-m">Показано {filteredScenarios.length} из {baseScenarios.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* ---- Подтверждение удаления ---- */}
      {pendingDelete && (
        <ConfirmDialog
          message="Удалить сценарий?"
          confirmLabel="Удалить"
          confirmIcon={<Trash />}
          tone="error"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

export default Home
