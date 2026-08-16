import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreateSegmentTree.css'
import stepActive from './icons/step-active.svg'
import stepInactive from './icons/step-inactive.svg'
import iconPlus from './icons/icon-plus.svg'
import iconPlusCircle from './icons/icon-plus-circle.svg'
import iconTrash from './icons/icon-trash.svg'
import iconInfoCircle from './icons/icon-info-circle.svg'
import iconChevronRight from './icons/icon-chevron-right.svg'
import { DrawerParameter } from '../../components/DrawerParameter'

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
  )
}

export default function CreateSegmentTree() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [rootGroup, setRootGroup] = useState(null)
  const [groupMenuOpen, setGroupMenuOpen] = useState(false)
  const [subMenuOpen, setSubMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuRef = useRef(null)
  const groupMenuRef = useRef(null)

  const handleClickOutside = useCallback((e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setMenuOpen(false)
    }
    if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) {
      setGroupMenuOpen(false)
      setSubMenuOpen(false)
    }
  }, [])

  useEffect(() => {
    if (menuOpen || groupMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen, groupMenuOpen, handleClickOutside])

  const handleCreateGroup = (type) => {
    setRootGroup({ type })
    setMenuOpen(false)
  }

  const handleDeleteGroup = () => {
    setRootGroup(null)
  }

  const handleToggleGroupMenu = () => {
    setGroupMenuOpen((prev) => !prev)
    setSubMenuOpen(false)
  }

  const handleAddSubgroup = (type) => {
    // TODO: wire to nested tree data model
    console.log('Add subgroup:', type)
    setGroupMenuOpen(false)
    setSubMenuOpen(false)
  }

  const handleAddParameter = () => {
    setDrawerOpen(true)
    setGroupMenuOpen(false)
    setSubMenuOpen(false)
  }

  const handleDrawerAdd = (param) => {
    // TODO: wire to tree data model
    console.log('Parameter added:', param)
    setDrawerOpen(false)
  }

  const groupTitle = rootGroup
    ? rootGroup.type === 'AND'
      ? 'И — основная группа'
      : 'ИЛИ — основная группа'
    : ''

  return (
    <div className="cs-tree">
      {/* ---- Sidebar ---- */}
      <aside className="cs-tree__sidebar">
        <button
          type="button"
          className="cs-tree__back-btn"
          onClick={() => navigate('/')}
        >
          <ArrowLeftIcon />
        </button>

        <div className="cs-tree__sidebar-header">
          <h1 className="cs-tree__sidebar-title">Создание сегмента</h1>
        </div>

        {/* Step navigation */}
        <nav className="cs-tree__nav">
          <div className="cs-tree__nav-item cs-tree__nav-item--active">
            <img className="cs-tree__nav-step" src={stepActive} alt="" />
            <span className="cs-tree__nav-label">Параметры</span>
          </div>
          <div className="cs-tree__nav-item">
            <img className="cs-tree__nav-step" src={stepInactive} alt="" />
            <span className="cs-tree__nav-label cs-tree__nav-label--inactive">Описание</span>
          </div>
        </nav>
      </aside>

      {/* ---- Center content ---- */}
      <div className="cs-tree__main">
        <div className="cs-tree__content">
          {/* Intro text + link */}
          <div className="cs-tree__intro">
            <p className="cs-tree__intro-text">
              Сегмент — группа клиентов, которая объединена общими характеристиками/признаками, например, подключенным тарифом, наличием какого-то продукта и&nbsp;т.д.
            </p>
            <a className="cs-tree__intro-link" href="#how" onClick={(e) => e.preventDefault()}>
              Как собрать сегмент
            </a>
          </div>

          {/* Action cell — create group + context menu / Group Cell */}
          {!rootGroup ? (
            <div className="cs-tree__action-wrap" ref={menuRef}>
              <button
                type="button"
                className="cs-tree__action-cell"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <img className="cs-tree__action-icon" src={iconPlus} alt="" />
                <span className="cs-tree__action-text">Создать основную группу</span>
              </button>

              {menuOpen && (
                <div className="cs-tree__context-menu">
                  <button
                    type="button"
                    className="cs-tree__context-menu-item"
                    onClick={() => handleCreateGroup('AND')}
                  >
                    Группа «И»
                  </button>
                  <button
                    type="button"
                    className="cs-tree__context-menu-item"
                    onClick={() => handleCreateGroup('OR')}
                  >
                    Группа «ИЛИ»
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="cs-tree__group-cell">
              <div className="cs-tree__group-cell-inner">
                <div className="cs-tree__group-cell-content">
                  <h2 className="cs-tree__group-title">{groupTitle}</h2>
                </div>
                <div className="cs-tree__group-actions" ref={groupMenuRef}>
                  <button
                    type="button"
                    className="cs-tree__group-action-btn"
                    onClick={handleToggleGroupMenu}
                    title="Добавить условие"
                  >
                    <img src={iconPlusCircle} alt="" width="24" height="24" />
                  </button>
                  <button
                    type="button"
                    className="cs-tree__group-action-btn"
                    onClick={handleDeleteGroup}
                    title="Удалить группу"
                  >
                    <img src={iconTrash} alt="" width="24" height="24" />
                  </button>

                  {/* Context menu — add subgroup / parameter */}
                  {groupMenuOpen && (
                    <div className="cs-tree__context-menu cs-tree__group-context-menu">
                      <div
                        className="cs-tree__context-menu-item cs-tree__context-menu-item--submenu"
                        onMouseEnter={() => setSubMenuOpen(true)}
                        onMouseLeave={() => setSubMenuOpen(false)}
                      >
                        <span>Добавить подгруппу</span>
                        <img
                          className="cs-tree__context-menu-chevron"
                          src={iconChevronRight}
                          alt=""
                          width="16"
                          height="16"
                        />

                        {/* Sub-menu: group type selection */}
                        {subMenuOpen && (
                          <div className="cs-tree__context-submenu">
                            <button
                              type="button"
                              className="cs-tree__context-menu-item"
                              onClick={() => handleAddSubgroup('AND')}
                            >
                              Группа «И»
                            </button>
                            <button
                              type="button"
                              className="cs-tree__context-menu-item"
                              onClick={() => handleAddSubgroup('OR')}
                            >
                              Группа «ИЛИ»
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="cs-tree__context-menu-item"
                        onClick={handleAddParameter}
                      >
                        Добавить параметр
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Right panel ---- */}
      <div className="cs-tree__right-panel">
        <div className="cs-tree__notification">
          <div className="cs-tree__notification-icon-wrap">
            <img className="cs-tree__notification-icon" src={iconInfoCircle} alt="" />
          </div>
          <div className="cs-tree__notification-body">
            <p className="cs-tree__notification-text">
              Для запроса недостающих данных в ручной настройке сегмента пиши в канал{' '}
              <span className="cs-tree__notification-highlight">~dannye_v_cdp</span>
            </p>
          </div>
        </div>
      </div>

      {/* ---- Footer ---- */}
      <footer className="cs-tree__footer">
        <div className="cs-tree__footer-content">
          <button type="button" className="cs-tree__footer-btn">
            Продолжить
          </button>
        </div>
      </footer>

      {/* ---- Parameter drawer ---- */}
      {drawerOpen && (
        <DrawerParameter
          onClose={() => setDrawerOpen(false)}
          onAdd={handleDrawerAdd}
        />
      )}
    </div>
  )
}
