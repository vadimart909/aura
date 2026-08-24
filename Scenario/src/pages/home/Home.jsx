import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './home.css'
import { useScenariosContext } from '../../context/useScenariosContext'
import dogDigging from './dog-digging.svg'
import { Chip } from '@ds/components/Chip'
import { HeaderButton } from '@ds/components/HeaderButton'
import { Tag } from '@ds/components/Tag'
import { Avatar } from '@ds/components/Avatar'
import { Magnifier, DotsThreeHorizontal, PlusCircle } from '@ds/icons'

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
  // «Мои сценарии» — вкладка по умолчанию: пользователь приходит на главную
  // за своими сценариями, а не за общим списком.
  const [filter, setFilter] = useState('my')
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
            <HeaderButton
              variant="primary"
              icon={<PlusCircle />}
              onClick={() => navigate('/scenario/create')}
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
                <div key={row.id} className="table__row" onClick={() => navigate(`/scenario/view/${row.id}`)}>
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
                  <div className="table__cell table__cell--actions">
                    <button type="button" className="table__action-btn">
                      <span className="ds-icon ds-icon--m">
                        <DotsThreeHorizontal />
                      </span>
                    </button>
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
    </div>
  )
}

export default Home
