import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="page">
      <h1>404 — Страница не найдена</h1>
      <p>Запрашиваемая страница не существует.</p>
      <nav>
        <Link to="/">На главную</Link>
      </nav>
    </div>
  )
}

export default NotFound
