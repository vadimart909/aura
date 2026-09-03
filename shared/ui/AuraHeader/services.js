/**
 * Карта сервисов Ауры — единственный источник адресов для шапки.
 *
 * Аура собрана из отдельных приложений, но для пользователя это одна среда:
 * все сервисы отдаются с одного origin, поэтому адреса здесь абсолютные от
 * корня. Локально это обеспечивает dev-server.mjs, на проде — сборка одного
 * артефакта в .github/workflows/deploy.yml.
 *
 * `key` — то, что каждое приложение передаёт в <AuraHeader service="…">,
 * чтобы отметить себя активным.
 */
export const AURA_SERVICES = [
  { key: 'requests', label: 'Заявки', href: '/requests' },
  { key: 'segments', label: 'Сегменты', href: '/aura/segments/' },
  { key: 'triggers', label: 'Триггеры', href: '/triggers' },
  { key: 'scenarios', label: 'Сценарии', href: '/aura/' },
]
