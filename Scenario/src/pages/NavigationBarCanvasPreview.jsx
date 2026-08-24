import NavigationBarCanvas from '../components/NavigationBarCanvas/NavigationBarCanvas';

export default function NavigationBarCanvasPreview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40, background: 'var(--bg-neutral-1)', minHeight: '80vh', padding: 0 }}>
      <div>
        <h3 style={{ padding: '20px 20px 0', fontSize: 'var(--font-size-s)', color: 'var(--primitive-secondary)' }}>Draft status</h3>
        <NavigationBarCanvas
          title="Вход в сервис Витрина"
          status="draft"
          statusLabel="Черновик"
          onBack={() => window.history.back()}
          onInfo={() => alert('Info clicked')}
          onMore={() => alert('More clicked')}
          onAction={() => alert('Action clicked')}
          actionLabel="Запустить"
        />
      </div>

      <div>
        <h3 style={{ padding: '0 20px', fontSize: 'var(--font-size-s)', color: 'var(--primitive-secondary)' }}>Published status</h3>
        <NavigationBarCanvas
          title="Продвижение ДМС"
          status="published"
          statusLabel="Опубликован"
          onBack={() => window.history.back()}
          onInfo={() => alert('Info clicked')}
          onMore={() => alert('More clicked')}
          onAction={() => alert('Action clicked')}
          actionLabel="Запустить"
        />
      </div>

      <div>
        <h3 style={{ padding: '0 20px', fontSize: 'var(--font-size-s)', color: 'var(--primitive-secondary)' }}>Started status</h3>
        <NavigationBarCanvas
          title="Тест в неработе"
          status="started"
          statusLabel="Запущен"
          onBack={() => window.history.back()}
          onInfo={() => alert('Info clicked')}
          onMore={() => alert('More clicked')}
        />
      </div>

      <div>
        <h3 style={{ padding: '0 20px', fontSize: 'var(--font-size-s)', color: 'var(--primitive-secondary)' }}>Stopped status</h3>
        <NavigationBarCanvas
          title="Бенну. Переход на вкладку ИИ-ассистента в личном кабинете корпоративного клиента"
          status="stopped"
          statusLabel="Остановлен"
          onBack={() => window.history.back()}
          onMore={() => alert('More clicked')}
        />
      </div>

      <div>
        <h3 style={{ padding: '0 20px', fontSize: 'var(--font-size-s)', color: 'var(--primitive-secondary)' }}>Finishing status (minimal — no right buttons)</h3>
        <NavigationBarCanvas
          title="Показ плашки об обновлении страницы в Blink"
          status="finishing"
          statusLabel="Завершает работу"
          onBack={() => window.history.back()}
        />
      </div>

      <div>
        <h3 style={{ padding: '0 20px', fontSize: 'var(--font-size-s)', color: 'var(--primitive-secondary)' }}>Edit mode (toolbar)</h3>
        <NavigationBarCanvas
          mode="edit"
          onBack={() => window.history.back()}
          onToolbarItemClick={(id) => alert(`Toolbar item: ${id}`)}
        />
      </div>
    </div>
  );
}
