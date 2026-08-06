import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <nav style={{ display: 'flex', gap: 'var(--spacing-4x)', padding: 'var(--spacing-4x)' }}>
        <NavLink to="/" className="ts-400-m">
          Главная
        </NavLink>
        <NavLink to="/about" className="ts-400-m">
          О проекте
        </NavLink>
      </nav>
      <Outlet />
    </>
  )
}
