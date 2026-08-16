/**
 * Mock-данные сегментов для SegmentModal.
 *
 * MY_SEGMENTS — сегменты текущего пользователя (вкладка «Мои»).
 * SYSTEM_SEGMENTS — системные сегменты (вкладка «Системные»).
 */

export const MY_SEGMENTS = [
  {
    id: '1',
    title: 'Зарплатные клиенты',
    description: 'Клиенты, получающие зарплату на счёт в банке. Высокая вовлечённость, регулярные поступления.',
    clients: '124 800',
    clientsDate: 'на 25.04.26',
    badge: null,
    author: null,
  },
  {
    id: '2',
    title: 'Премиум-вклады от 1 млн ₽',
    description: 'Держатели вкладов с остатком от 1 000 000 ₽. Потенциал для кросс-продаж инвестиционных продуктов.',
    clients: '18 340',
    clientsDate: 'на 25.04.26',
    badge: null,
    author: null,
  },
  {
    id: '3',
    title: 'Активные пользователи мобильного банка',
    description: 'Совершали более 10 операций в мобильном приложении за последние 30 дней.',
    clients: '456 200',
    clientsDate: 'на 25.04.26',
    badge: null,
    author: null,
  },
  {
    id: '4',
    title: 'Новые клиенты до 30 дней',
    description: 'Клиенты, открывшие первый продукт менее 30 дней назад. Требуется онбординг и приветственная цепочка.',
    clients: '8 920',
    clientsDate: 'на 25.04.26',
    badge: null,
    author: null,
  },
  {
    id: '5',
    title: 'Держатели кредитных карт',
    description: 'Клиенты с активной кредитной картой. Средний кредитный лимит — 150 000 ₽.',
    clients: '67 500',
    clientsDate: 'на 25.04.26',
    badge: null,
    author: null,
  },
];

export const SYSTEM_SEGMENTS = [
  ...MY_SEGMENTS,
  {
    id: '6',
    title: 'Клиенты без активных продуктов',
    description: 'Зарегистрированы в системе, но не имеют ни одного активного продукта более 90 дней. Риск оттока.',
    clients: '34 100',
    clientsDate: 'на 25.04.26',
    badge: null,
    author: null,
  },
  {
    id: '7',
    title: 'Ипотечные заёмщики',
    description: 'Клиенты с действующим ипотечным кредитом. Средний срок до погашения — 12 лет.',
    clients: '22 450',
    clientsDate: 'на 01.04.26',
    badge: null,
    author: null,
  },
  {
    id: '8',
    title: 'Молодёжь 18–25 лет',
    description: 'Молодые клиенты, активно использующие цифровые каналы. Высокий отклик на push-уведомления.',
    clients: '89 700',
    clientsDate: 'на 10.03.26',
    badge: null,
    author: null,
  },
  {
    id: '9',
    title: 'Инвесторы брокерского счёта',
    description: 'Клиенты с открытым брокерским счётом и хотя бы одной сделкой за последние 6 месяцев.',
    clients: '15 300',
    clientsDate: 'на 20.02.26',
    badge: null,
    author: null,
  },
  {
    id: '10',
    title: 'VIP-клиенты',
    description: 'Персональное обслуживание, совокупный остаток на счетах от 5 млн ₽. Приоритетная поддержка.',
    clients: '3 280',
    clientsDate: 'на 05.04.26',
    badge: null,
    author: null,
  },
];
