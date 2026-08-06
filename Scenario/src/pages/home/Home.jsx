import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './home.css'
import { useScenariosContext } from '../../context/ScenariosContext'
import dogDigging from './dog-digging.svg'

const statusClassMap = {
  draft: 'badge--grey',
  published: 'badge--purple',
  started: 'badge--yellow',
  stopped: 'badge--red',
  finishing: 'badge--red',
}

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 7C11.4477 7 11 7.44772 11 8V11H8C7.44772 11 7 11.4477 7 12C7 12.5523 7.44772 13 8 13H11V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V13H16C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11H13V8C13 7.44772 12.5523 7 12 7Z"
        fill="white"
      />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

function Home() {
  const navigate = useNavigate()
  const { scenarios } = useScenariosContext()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const showAuthor = filter === 'all'

  const query = searchQuery.toLowerCase().trim()
  const filteredScenarios = scenarios.filter((row) => {
    if (!query) return true
    return (
      row.name.toLowerCase().includes(query) ||
      row.description.toLowerCase().includes(query) ||
      row.author.toLowerCase().includes(query)
    )
  })

  return (
    <div className="scenarios">
      <div className="scenarios__content">
        {/* Search & Filters */}
        <div className="scenarios__search-block">
          <div className="scenarios__actions">
            <div className="scenarios__chips">
              <button
                type="button"
                className={`chip-tab${filter === 'my' ? ' chip-tab--selected' : ''}`}
                onClick={() => setFilter('my')}
              >
                Мои сценарии
              </button>
              <button
                type="button"
                className={`chip-tab${filter === 'all' ? ' chip-tab--selected' : ''}`}
                onClick={() => setFilter('all')}
              >
                Все
              </button>
            </div>
            <button type="button" className="btn btn--brand" onClick={() => navigate('/scenario/create')}>
              <span className="btn__icon">
                <PlusCircleIcon />
              </span>
              <span className="btn__label">Создать сценарий</span>
            </button>
          </div>

          <div className="search-bar">
            <div className="search-bar__field">
              <span className="search-bar__icon">
                <SearchIcon />
              </span>
              <input
                className="search-bar__input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={filter === 'my' ? 'Название или описание' : 'Название, описание или автор'}
              />
            </div>
          </div>
        </div>

        {filter === 'my' ? (
          <div className="empty-view">
            <img src={dogDigging} alt="" className="empty-view__image" />
            <div className="empty-view__text-block">
              <p className="empty-view__text">Здесь будут твои сценарии. Пока их нет.</p>
            </div>
          </div>
        ) : filteredScenarios.length === 0 ? (
          <div className="search-empty-view">
            <p className="search-empty-view__text">
              Ничего не найдено. Попробуй изменить поисковый запрос.
            </p>
          </div>
        ) : (
          <div className="table">
            {/* Table Header */}
            <div className="table__header">
              <div className="table__cell table__cell--scenario">
                <span className="table__header-text">Сценарии</span>
              </div>
              <div className="table__cell table__cell--status">
                <span className="table__header-text">Статус</span>
              </div>
              {showAuthor && (
                <div className="table__cell table__cell--author">
                  <span className="table__header-text">Автор</span>
                </div>
              )}
              <div className="table__cell table__cell--date">
                <span className="table__header-text">Дата создания</span>
              </div>
              <div className="table__cell table__cell--actions" />
            </div>

            {/* Table Body */}
            <div className="table__body">
              {filteredScenarios.map((row) => (
                <div key={row.id} className="table__row" onClick={() => navigate(`/scenario/view/${row.id}`)} style={{ cursor: 'pointer' }}>
                  <div className="table__cell table__cell--scenario">
                    <div className="table__cell-content">
                      <span className="table__cell-title">{row.name}</span>
                      {row.description && (
                        <span className="table__cell-desc">{row.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="table__cell table__cell--status">
                    <span className={`badge ${statusClassMap[row.status]}`}>
                      {row.statusLabel}
                    </span>
                  </div>
                  {showAuthor && (
                    <div className="table__cell table__cell--author">
                      <div className="table__author">
                        <div
                          className="table__author-avatar"
                          style={{ backgroundColor: row.authorColor }}
                        >
                          <span className="table__author-initials">{row.authorInitials}</span>
                        </div>
                        <span className="table__cell-title">{row.author}</span>
                      </div>
                    </div>
                  )}
                  <div className="table__cell table__cell--date">
                    <span className="table__cell-title">{row.date}</span>
                  </div>
                  <div className="table__cell table__cell--actions">
                    <button type="button" className="table__action-btn">
                      <DotsIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Footer */}
            <div className="table__footer">
              <span className="table__footer-text">Показано {filteredScenarios.length} из {scenarios.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
