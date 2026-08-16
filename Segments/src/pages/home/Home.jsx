import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './home.css'
import { useSegmentsContext } from '../../context/SegmentsContext'

function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
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

export default function Home() {
  const navigate = useNavigate()
  const { segments } = useSegmentsContext()
  const [filter, setFilter] = useState('my')
  const [searchQuery, setSearchQuery] = useState('')

  const query = searchQuery.toLowerCase().trim()
  const filteredSegments = segments.filter((row) => {
    if (!query) return true
    return row.title.toLowerCase().includes(query) || row.description.toLowerCase().includes(query)
  })

  return (
    <div className="segments-page">
      <div className="segments-page__content">
        <div className="segments-page__search-block">
          <div className="segments-page__actions">
            <div className="segments-page__chips">
              <button type="button" className={`chip-tab${filter === 'my' ? ' chip-tab--selected' : ''}`} onClick={() => setFilter('my')}>Мои сегменты</button>
              <button type="button" className={`chip-tab${filter === 'all' ? ' chip-tab--selected' : ''}`} onClick={() => setFilter('all')}>Все</button>
            </div>
            <button type="button" className="btn btn--brand" onClick={() => navigate('/segment/create')}>
              <PlusCircleIcon />
              <span>Создать сегмент</span>
            </button>
          </div>
          <div className="segments-page__search">
            <span className="segments-page__search-icon"><SearchIcon /></span>
            <input type="text" className="segments-page__search-input" placeholder="Поиск по сегментам" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {filteredSegments.length === 0 ? (
          query ? (
            <div className="search-empty-view">
              <p className="search-empty-view__text">Ничего не найдено. Попробуй изменить поисковый запрос.</p>
            </div>
          ) : (
            <div className="empty-view">
              <div className="empty-view__text-block">
                <p className="empty-view__text">Здесь будут твои сегменты. Пока их нет.</p>
              </div>
            </div>
          )
        ) : (
          <div className="table">
            <div className="table__header">
              <div className="table__cell table__cell--segment"><span className="table__header-text">Сегменты</span></div>
              <div className="table__cell table__cell--clients"><span className="table__header-text">Клиентов</span></div>
              <div className="table__cell table__cell--date"><span className="table__header-text">Дата</span></div>
              <div className="table__cell table__cell--actions" />
            </div>
            <div className="table__body">
              {filteredSegments.map((row) => (
                <div key={row.id} className="table__row" style={{ cursor: 'pointer' }}>
                  <div className="table__cell table__cell--segment">
                    <div className="table__cell-content">
                      <span className="table__cell-title">{row.title}</span>
                      {row.description && <span className="table__cell-desc">{row.description}</span>}
                    </div>
                  </div>
                  <div className="table__cell table__cell--clients">
                    <span className="table__cell-title">{row.clients}</span>
                    {row.clientsDate && <span className="table__cell-desc">{row.clientsDate}</span>}
                  </div>
                  <div className="table__cell table__cell--date"><span className="table__cell-title">—</span></div>
                  <div className="table__cell table__cell--actions">
                    <button type="button" className="table__action-btn"><DotsIcon /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="table__footer">
              <span className="table__footer-text">Показано {filteredSegments.length} из {segments.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
