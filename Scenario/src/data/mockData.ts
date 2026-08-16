/**
 * Мок-данные шаблонов для модалки выбора шаблона (TemplateModal).
 *
 * - title       — название шаблона (рус)
 * - description — описание шаблона (англ)
 * - subtitle    — каналы отправки, случайная комбинация из:
 *                 Email, пуш, чат, смс, колокольчик
 */

export interface MockTemplate {
  id: string;
  title: string;
  description: string;
  subtitle: string;
}

export const MOCK_TEMPLATES: MockTemplate[] = [
  {
    id: '1',
    title: 'Приветственное письмо',
    description: 'Privetstvennoe pismo',
    subtitle: 'Email, пуш',
  },
  {
    id: '2',
    title: 'Подтверждение заказа',
    description: 'Podtverzhdenie zakaza',
    subtitle: 'Email, смс',
  },
  {
    id: '3',
    title: 'Напоминание об оплате',
    description: 'Napominanie ob oplate',
    subtitle: 'пуш, смс, колокольчик',
  },
  {
    id: '4',
    title: 'Акция на зарплатные продукты',
    description: 'Aktsiya na zarplatnye produkty',
    subtitle: 'Email, пуш, чат',
  },
  {
    id: '5',
    title: 'Уведомление о входе в систему',
    description: 'Uvedomlenie o vkhode v sistemu',
    subtitle: 'пуш, колокольчик',
  },
  {
    id: '6',
    title: 'Рассылка по ДМС',
    description: 'Rassylka po DMS',
    subtitle: 'Email',
  },
  {
    id: '7',
    title: 'Завершение регистрации',
    description: 'Zavershenie registratsii',
    subtitle: 'Email, пуш, смс',
  },
  {
    id: '8',
    title: 'Ежемесячный отчёт',
    description: 'Ezhemesyachnyy otchyot',
    subtitle: 'Email',
  },
  {
    id: '9',
    title: 'Реактивация клиента',
    description: 'Reaktivatsiya klienta',
    subtitle: 'Email, пуш, чат, смс',
  },
  {
    id: '10',
    title: 'Кэшбэк за покупки',
    description: 'Keshbek za pokupki',
    subtitle: 'пуш, колокольчик',
  },
  {
    id: '11',
    title: 'Новый тариф обслуживания',
    description: 'Novyy tarif obsluzhivaniya',
    subtitle: 'Email, чат',
  },
  {
    id: '12',
    title: 'Поздравление с днём рождения',
    description: 'Pozdravlenie s dnyom rozhdeniya',
    subtitle: 'пуш, смс',
  },
  {
    id: '13',
    title: 'Смена реквизитов',
    description: 'Smena rekvizitov',
    subtitle: 'Email, смс, колокольчик',
  },
  {
    id: '14',
    title: 'Приглашение на вебинар',
    description: 'Priglashenie na vebinar',
    subtitle: 'Email, пуш',
  },
  {
    id: '15',
    title: 'Опрос удовлетворённости',
    description: 'Opros udovletvoryonnosti',
    subtitle: 'чат, колокольчик',
  },
  {
    id: '16',
    title: 'Одобрение кредитной заявки',
    description: 'Odobrenie kreditnoy zayavki',
    subtitle: 'пуш, смс, колокольчик',
  },
  {
    id: '17',
    title: 'Технические работы',
    description: 'Tekhnicheskie raboty',
    subtitle: 'Email, пуш, чат, смс, колокольчик',
  },
  {
    id: '18',
    title: 'Партнёрское предложение',
    description: 'Partyorskoe predlozhenie',
    subtitle: 'Email, чат',
  },
];
