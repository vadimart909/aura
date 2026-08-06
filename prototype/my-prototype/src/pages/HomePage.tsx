import { Avatar } from '@ds'
import '../styles/home-page.css'

/* ───── helpers ───── */
const CATEGORY_COLORS = [
  'var(--category-sand)',
  'var(--category-coral)',
  'var(--category-flamingo)',
  'var(--category-orchid)',
  'var(--category-amethyst)',
  'var(--category-lavender)',
  'var(--category-indigo)',
  'var(--category-sky)',
  'var(--category-mint)',
  'var(--category-emerald)',
]

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return fullName.slice(0, 2).toUpperCase()
}

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length]
}

/* ───── data ───── */
type MailingStatus = 'published' | 'in-work' | 'draft' | 'editing' | 'cancelled'
type MailingType = 'regular' | 'one-time' | 'trigger'

interface Mailing {
  name: string
  type: MailingType
  status: MailingStatus
  statusLabel: string
  date: string
  tags: string[]
  customer: string
  executor: string
}

const mailings: Mailing[] = [
  {
    name: 'Закрытие Точка Такси',
    type: 'trigger',
    status: 'published',
    statusLabel: 'Опубликована',
    date: '12.05.2025',
    tags: ['Калькулятор', 'Торговый Дом'],
    customer: 'Татьяна Блинникова',
    executor: 'Юлия Алексеева',
  },
  {
    name: 'Рассылка по ОБ срочные для неклиентов',
    type: 'regular',
    status: 'in-work',
    statusLabel: 'В работе',
    date: '14.02.2025',
    tags: ['Переход на НПД'],
    customer: 'Наталья Корлякова',
    executor: 'Петр Махнёв',
  },
  {
    name: 'Расторжение договора эквайринг-агрегация',
    type: 'regular',
    status: 'published',
    statusLabel: 'Опубликована',
    date: '10.05.2025',
    tags: [],
    customer: 'Ирина Волосникова',
    executor: 'Петр Махнёв',
  },
  {
    name: 'Нетворк: Анонс эфиров и мероприятий',
    type: 'one-time',
    status: 'in-work',
    statusLabel: 'В работе',
    date: '10.05.2025',
    tags: ['Экспресс-кредит', 'ДОМ.РФ'],
    customer: 'Наталья Корлякова',
    executor: 'Петр Махнёв',
  },
  {
    name: 'Дорассылка Опрос Эквайринг',
    type: 'one-time',
    status: 'draft',
    statusLabel: 'Черновик',
    date: '23.10.2025',
    tags: ['Нейтральное', 'Продвижение'],
    customer: 'Наталья Корлякова',
    executor: 'Екатерина Компаиди',
  },
  {
    name: 'Закрытие Точка Такси',
    type: 'regular',
    status: 'editing',
    statusLabel: 'Редактируется',
    date: '30.05.2025',
    tags: ['Переход на НПД'],
    customer: 'Юлия Алексеева',
    executor: 'Петр Махнёв',
  },
  {
    name: 'Опрос: Удовлетворённость сервисами',
    type: 'one-time',
    status: 'published',
    statusLabel: 'Опубликована',
    date: '04.06.2025',
    tags: ['Продвижение'],
    customer: 'Ирина Волосникова',
    executor: 'Юлия Алексеева',
  },
  {
    name: 'Уведомление о лимитах счёта',
    type: 'trigger',
    status: 'published',
    statusLabel: 'Опубликована',
    date: '18.03.2025',
    tags: ['РКО'],
    customer: 'Татьяна Блинникова',
    executor: 'Петр Махнёв',
  },
  {
    name: 'Промо: Кешбэк на покупки',
    type: 'one-time',
    status: 'cancelled',
    statusLabel: 'Отменена',
    date: '22.04.2025',
    tags: ['Кешбэк', 'Карты'],
    customer: 'Наталья Корлякова',
    executor: 'Екатерина Компаиди',
  },
  {
    name: 'Реактивация неактивных клиентов',
    type: 'regular',
    status: 'draft',
    statusLabel: 'Черновик',
    date: '01.06.2025',
    tags: ['CRM'],
    customer: 'Юлия Алексеева',
    executor: 'Петр Махнёв',
  },
  {
    name: 'Приветственная серия: Новые ИП',
    type: 'trigger',
    status: 'in-work',
    statusLabel: 'В работе',
    date: '15.05.2025',
    tags: ['Онбординг'],
    customer: 'Ирина Волосникова',
    executor: 'Юлия Алексеева',
  },
  {
    name: 'Информирование об изменениях в тарифах',
    type: 'regular',
    status: 'published',
    statusLabel: 'Опубликована',
    date: '28.05.2025',
    tags: ['Тарифы', 'РКО'],
    customer: 'Татьяна Блинникова',
    executor: 'Екатерина Компаиди',
  },
]

const TYPE_LABELS: Record<MailingType, string> = {
  regular: 'Регулярная',
  'one-time': 'Разовая',
  trigger: 'Триггерная',
}

const STATUS_CLASS: Record<MailingStatus, string> = {
  published: 'status-badge--published',
  'in-work': 'status-badge--in-work',
  draft: 'status-badge--draft',
  editing: 'status-badge--editing',
  cancelled: 'status-badge--cancelled',
}

/* ───── icons (inline SVG) ───── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="m3 4.5 3 3 3-3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PlusCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2Z"
      fill="currentColor"
    />
  </svg>
)

const FiltersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M11.25 9.4502C12.677 9.4502 13.8823 10.399 14.2695 11.7002H16.2002C16.697 11.7003 17.0994 12.1028 17.0996 12.5996C17.0996 13.0966 16.6972 13.4999 16.2002 13.5H14.2695C13.8822 14.8011 12.6769 15.75 11.25 15.75C9.82308 15.75 8.61775 14.8011 8.23047 13.5H1.7998C1.30284 13.4999 0.900391 13.0966 0.900391 12.5996C0.900602 12.1028 1.30297 11.7003 1.7998 11.7002H8.23047C8.61772 10.399 9.82304 9.4502 11.25 9.4502ZM11.25 11.25C10.5045 11.25 9.9006 11.8542 9.90039 12.5996C9.90039 13.3452 10.5044 13.9502 11.25 13.9502C11.9956 13.9502 12.5996 13.3452 12.5996 12.5996C12.5994 11.8542 11.9955 11.25 11.25 11.25ZM6.75 2.25C8.17692 2.25 9.38225 3.19888 9.76953 4.5H16.2002C16.6972 4.50011 17.0996 4.9034 17.0996 5.40039C17.0994 5.8972 16.697 6.2997 16.2002 6.2998H9.76953C9.38228 7.60097 8.17696 8.5498 6.75 8.5498C5.32304 8.5498 4.11772 7.60097 3.73047 6.2998H1.7998C1.30297 6.2997 0.900602 5.8972 0.900391 5.40039C0.900391 4.9034 1.30284 4.50011 1.7998 4.5H3.73047C4.11775 3.19888 5.32308 2.25 6.75 2.25ZM6.75 4.0498C6.00442 4.0498 5.40039 4.65481 5.40039 5.40039C5.4006 6.1458 6.00455 6.75 6.75 6.75C7.49545 6.75 8.0994 6.1458 8.09961 5.40039C8.09961 4.65481 7.49558 4.0498 6.75 4.0498Z"
      fill="currentColor"
    />
  </svg>
)

const LightningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M13 2L4.5 13H12L11 22L19.5 11H12L13 2Z"
      fill="currentColor"
    />
  </svg>
)

/* ───── component ───── */
export default function HomePage() {
  return (
    <div className="home-page">
      {/* ── Header ── */}
      <header className="home-header">
        <div className="home-header__left">
          <a href="/" className="home-header__logo">
            <span className="ts-600-xl">AURA</span>
          </a>

          <nav className="home-header__nav">
            <a className="home-header__nav-item home-header__nav-item--active ts-500-s" href="#">
              Заявки
            </a>
            <a className="home-header__nav-item ts-500-s" href="#">
              Сегменты
            </a>
            <a className="home-header__nav-item ts-500-s" href="#">
              Триггеры
            </a>
          </nav>
        </div>

        <div className="home-header__right">
          <div className="home-header__avatar ts-600-xs">ВА</div>
          <span className="home-header__user-name ts-400-s">Вадим Артёменко</span>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <section className="home-toolbar">
        {/* Actions row: chips + create button */}
        <div className="home-toolbar__actions">
          <div className="home-toolbar__chips">
            {/* Tab chips */}
            <div className="home-toolbar__chip-group">
              <button className="home-toolbar__chip home-toolbar__chip--tab-active ts-500-s">
                Мои заявки
              </button>
              <button className="home-toolbar__chip home-toolbar__chip--tab ts-500-s">
                Все заявки
              </button>
            </div>

            {/* Divider */}
            <div className="home-toolbar__divider" />

            {/* Filter chips */}
            <div className="home-toolbar__chip-group">
              <button className="home-toolbar__chip home-toolbar__chip--filter-icon">
                <FiltersIcon />
              </button>
              <button className="home-toolbar__chip home-toolbar__chip--filter-active ts-500-s">
                Тег продукта
              </button>
              <button className="home-toolbar__chip home-toolbar__chip--filter-active ts-500-s">
                Заказчик
              </button>
              <button className="home-toolbar__chip home-toolbar__chip--dropdown ts-500-s">
                Дата начала
                <ChevronDown />
              </button>
              <button className="home-toolbar__chip home-toolbar__chip--dropdown ts-500-s">
                Назначение
                <ChevronDown />
              </button>
            </div>
          </div>

          <button className="home-toolbar__create-btn">
            <PlusCircleIcon />
            <span>Создать заявку</span>
          </button>
        </div>

        {/* Search field */}
        <div className="home-toolbar__search">
          <div className="home-toolbar__search-field">
            <span className="home-toolbar__search-icon">
              <SearchIcon />
            </span>
            <input
              className="home-toolbar__search-input"
              type="text"
              placeholder="Название рассылки"
            />
          </div>
        </div>
      </section>

      {/* ── Table ── */}
      <div className="home-table-wrapper">
        <table className="home-table">
          <thead>
            <tr>
              <th className="home-table__col-name ts-500-xs">Название</th>
              <th className="home-table__col-status ts-500-xs">Статус</th>
              <th className="home-table__col-date ts-500-xs">Дата начала</th>
              <th className="home-table__col-tags ts-500-xs">Тег продукта</th>
              <th className="home-table__col-customer ts-500-xs">Заказчик</th>
              <th className="home-table__col-executor ts-500-xs">Исполнитель</th>
            </tr>
          </thead>
          <tbody>
            {mailings.map((m, i) => (
              <tr key={i}>
                {/* Название */}
                <td className="home-table__name">
                  <div className="home-table__name-cell">
                    <span className={`home-table__name-icon ${m.type === 'trigger' ? 'home-table__name-icon--visible' : ''}`}>
                      <LightningIcon />
                    </span>
                    <div className="home-table__name-content">
                      <span className="home-table__name-title">{m.name}</span>
                      <span className="home-table__name-description">{TYPE_LABELS[m.type]}</span>
                    </div>
                  </div>
                </td>

                {/* Статус */}
                <td className="home-table__status">
                  <span className={`status-badge ${STATUS_CLASS[m.status]}`}>
                    {m.statusLabel}
                  </span>
                </td>

                {/* Дата */}
                <td className="ts-400-s">{m.date}</td>

                {/* Теги */}
                <td className="home-table__tags">
                  {m.tags.length > 0 ? (
                    <span className="home-table__tags-text">{m.tags.join(', ')}</span>
                  ) : (
                    <span className="home-table__tags-text home-table__tags-text--empty">—</span>
                  )}
                </td>

                {/* Заказчик */}
                <td className="home-table__person">
                  <div className="home-table__person-cell">
                    <Avatar
                      label={getInitials(m.customer)}
                      size="s"
                      shape="superellipse"
                      style={{ background: getAvatarColor(m.customer), color: '#fff' }}
                    />
                    <span className="home-table__person-name ts-400-m">{m.customer}</span>
                  </div>
                </td>

                {/* Исполнитель */}
                <td className="home-table__person">
                  <div className="home-table__person-cell">
                    <Avatar
                      label={getInitials(m.executor)}
                      size="s"
                      shape="superellipse"
                      style={{ background: getAvatarColor(m.executor), color: '#fff' }}
                    />
                    <span className="home-table__person-name ts-400-m">{m.executor}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Table Footer */}
        <div className="home-table__footer ts-400-xs">
          <span>Показано {mailings.length} из 432</span>
        </div>
      </div>
    </div>
  )
}
