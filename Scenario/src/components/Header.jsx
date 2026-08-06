import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/requests', label: 'Заявки' },
  { to: '/segments', label: 'Сегменты' },
  { to: '/triggers', label: 'Триггеры' },
  { to: '/', label: 'Сценарии' },
]

function Header() {
  return (
    <header className="header">
      <div className="header__content">
        {/* Logo */}
        <div className="header__logo">
          <svg className="header__logo-icon" width="81" height="20" viewBox="0 0 81 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60.9724 18.9451L68.1445 0H73.828L81 18.9451H75.4518L74.0986 14.8854H67.8738L66.5206 18.9451H60.9724ZM69.227 10.6904H72.7454L71.0403 5.27755H70.9321L69.227 10.6904Z" fill="#191919"/>
            <path d="M42.9235 18.9451V2.29427e-05H51.8547C55.9144 2.29427e-05 58.7561 2.84178 58.7561 6.49547C58.7561 10.5551 55.5084 11.9083 55.5084 11.9083L59.4328 18.9451H54.0199L50.9075 12.9909H48.0657V18.9451H42.9235ZM48.0657 8.38998H51.5841C52.802 8.38998 53.6139 7.57805 53.6139 6.49547C53.6139 5.4129 52.802 4.60096 51.5841 4.60096H48.0657V8.38998Z" fill="#191919"/>
            <path d="M30.0669 19.4864C24.9246 19.4864 21.4063 15.968 21.4063 11.0964V2.29427e-05H26.5485V11.0964C26.5485 13.2616 28.037 14.7501 30.0669 14.7501C32.0967 14.7501 33.5852 13.2616 33.5852 11.0964V2.29427e-05H38.7274V11.0964C38.7274 15.968 35.2091 19.4864 30.0669 19.4864Z" fill="#191919"/>
            <path d="M0 18.9451L7.17206 2.29427e-05H12.8556L20.0276 18.9451H14.4794L13.1262 14.8854H6.90141L5.54819 18.9451H0ZM8.25463 10.6904H11.773L10.0679 5.27757H9.95969L8.25463 10.6904Z" fill="#191919"/>
          </svg>
        </div>

        {/* Navigation */}
        <nav className="header__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `header__nav-btn${isActive ? ' header__nav-btn--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Customer & Settings */}
        <div className="header__user">
          <div className="header__avatar">
            <span className="header__avatar-text">ВА</span>
          </div>
          <span className="header__username">Вадим Артёменко</span>
        </div>
      </div>

      <div className="header__separator" />
    </header>
  )
}

export default Header
