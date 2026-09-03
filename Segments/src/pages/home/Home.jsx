import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './home.css'
import { useSegmentsContext } from '../../context/SegmentsContext'
import { Chip } from '@ds/components/Chip'
import { HeaderButton } from '@ds/components/HeaderButton'
import { Magnifier, DotsThreeHorizontal, PlusCircle } from '@ds/icons'

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
              <Chip variant="tab" isSelected={filter === 'my'} onClick={() => setFilter('my')}>
                Мои сегменты
              </Chip>
              <Chip variant="tab" isSelected={filter === 'all'} onClick={() => setFilter('all')}>
                Все
              </Chip>
            </div>
            <HeaderButton
              variant="primary"
              icon={<PlusCircle />}
              onClick={() => navigate('/segment/create')}
            >
              Создать сегмент
            </HeaderButton>
          </div>
          <div className="segments-page__search">
            <span className="segments-page__search-icon ds-icon ds-icon--m"><Magnifier /></span>
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
                    <button type="button" className="table__action-btn">
                      <span className="ds-icon ds-icon--m"><DotsThreeHorizontal /></span>
                    </button>
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
