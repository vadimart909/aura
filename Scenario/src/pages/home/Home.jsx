import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './home.css'
import { useScenariosContext } from '../../context/ScenariosContext'
import dogDigging from './dog-digging.svg'
import { Chip } from '@ds/components/Chip'
import { Button } from '@ds/components/Button'
import { Tag } from '@ds/components/Tag'

function DotsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="19" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
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

const statusTagClassMap = {
  draft: 'tag--status-grey',
  published: 'tag--status-purple',
  started: 'tag--status-yellow',
  stopped: 'tag--status-red',
  finishing: 'tag--status-red',
}

const CURRENT_USER = 'Вадим Артёменко'

function Home() {
  const navigate = useNavigate()
  const { scenarios } = useScenariosContext()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
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

  return (
    <div className="scenarios">
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
            <Button variant="primary" onClick={() => navigate('/scenario/create')}>
              Создать сценарий
            </Button>
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

        {filteredScenarios.length === 0 ? (
          filter === 'my' && !query ? (
            <div className="empty-view">
              <img src={dogDigging} alt="" className="empty-view__image" />
              <div className="empty-view__text-block">
                <p className="empty-view__text">Здесь будут твои сценарии. Пока их нет.</p>
              </div>
            </div>
          ) : (
            <div className="search-empty-view">
              <p className="search-empty-view__text">
                Ничего не найдено. Попробуй изменить поисковый запрос.
              </p>
            </div>
          )
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
                    <Tag size="s" className={statusTagClassMap[row.status]}>
                      {row.statusLabel}
                    </Tag>
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
              <span className="table__footer-text">Показано {filteredScenarios.length} из {baseScenarios.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
