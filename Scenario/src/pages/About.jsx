import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="page">
      <h1>О проекте</h1>
      <p>Это React-приложение создано с помощью Vite и использует React Router для навигации.</p>
      <nav>
        <Link to="/">На главную</Link>
      </nav>
    </div>
  )
}

export default About
