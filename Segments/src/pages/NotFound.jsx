import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page">
      <h1>404</h1>
      <p>Страница не найдена</p>
      <nav>
        <Link to="/">Вернуться на главную</Link>
      </nav>
    </div>
  )
}
