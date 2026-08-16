import { useNavigate } from 'react-router-dom'
import './CreateSegment.css'

function ArrowLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function CreateSegment() {
  const navigate = useNavigate()

  return (
    <div className="create-segment">
      {/* Sidebar */}
      <aside className="create-segment__sidebar">
        <button
          type="button"
          className="create-segment__back-btn"
          onClick={() => navigate('/')}
        >
          <ArrowLeftIcon />
        </button>

        <div className="create-segment__sidebar-header">
          <h1 className="create-segment__sidebar-title">Создание сегмента</h1>
        </div>
      </aside>

      {/* Center content — placeholder */}
      <div className="create-segment__main">
        <p className="create-segment__placeholder">
          Здесь будет форма создания сегмента
        </p>
      </div>
    </div>
  )
}
