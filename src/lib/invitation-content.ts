type DressCodePaletteItem = {
  color: string;
  label: string;
};

type ScheduleItem = {
  description: string;
  time: string;
  title: string;
};

type SurveyOption = {
  description: string;
  label: string;
};

export const invitationContent: {
  city: string;
  couple: string;
  dateCode: string;
  dateCompact: string;
  dateLabel: string;
  dressCode: {
    description: string;
    note: string;
    palette: DressCodePaletteItem[];
  };
  footerNote: string;
  intro: string;
  kicker: string;
  rsvpDeadline: string;
  schedule: ScheduleItem[];
  surveyIntro: string;
  surveyOptions: SurveyOption[];
  timeLabel: string;
  venue: {
    address: string;
    description: string;
    mapHint: string;
    name: string;
  };
} = {
  city: 'Новосибирск',
  couple: 'Алексей и Мария',
  dateCode: '18 / 07 / 2026',
  dateCompact: '18.07.2026',
  dateLabel: '18 июля 2026',
  dressCode: {
    description:
      'Нам будет приятно видеть вас в образах, которые поддержат спокойную и праздничную атмосферу вечера. Подойдут светлые, пастельные и приглушенные природные оттенки.',
    note: 'Если сомневаетесь, выбирайте наряд в нейтральной палитре и удобную обувь для длинного вечера.',
    palette: [
      {
        color: '#d8cfc4',
        label: 'песочный',
      },
      {
        color: '#b8c4d6',
        label: 'пыльно-голубой',
      },
      {
        color: '#c9b8c8',
        label: 'пудровый',
      },
      {
        color: '#6d7b8d',
        label: 'графитовый',
      },
      {
        color: '#e8dfd1',
        label: 'молочный беж',
      },
      {
        color: '#8b6f7d',
        label: 'приглушенная роза',
      },
    ],
  },
  footerNote:
    'Если ваши планы изменятся, пожалуйста, обновите ответ заранее. Нам важно аккуратно собрать RSVP и подготовить комфортный вечер для всех гостей.',
  intro:
    'Мы будем счастливы провести этот день вместе с близкими людьми. Приходите разделить с нами церемонию, ужин и очень теплый вечер без спешки.',
  kicker: 'Wedding Setup Wizard',
  rsvpDeadline: 'до 1 июня 2026',
  schedule: [
    {
      description:
        'Легкий welcome, время спокойно собраться и поздороваться со всеми.',
      time: '15:30',
      title: 'Сбор гостей',
    },
    {
      description:
        'Короткая церемония, после которой сразу перейдем к поздравлениям и фото.',
      time: '16:00',
      title: 'Церемония',
    },
    {
      description: 'Ужин, тосты, музыка и небольшая программа без перегруза.',
      time: '17:00',
      title: 'Праздничный вечер',
    },
    {
      description: 'Финальный торт, объятия и свободное завершение вечера.',
      time: '21:30',
      title: 'Торт и завершение',
    },
  ],
  surveyIntro:
    'Пожалуйста, отметьте, сможете ли вы быть с нами, и при необходимости напишите короткий комментарий по меню или логистике. Это поможет нам все подготовить без спешки.',
  surveyOptions: [
    {
      description: 'Уже планирую приехать и очень жду этот день.',
      label: 'Обязательно буду',
    },
    {
      description: 'Скорее всего буду, но детали уточню ближе к дате.',
      label: 'Скорее всего буду',
    },
    {
      description: 'Пока не могу подтвердить и вернусь с ответом позже.',
      label: 'Пока не уверен(а)',
    },
    {
      description:
        'К сожалению, не смогу присутствовать, но буду очень рад(а) за вас.',
      label: 'К сожалению, не смогу',
    },
  ],
  timeLabel: '15:30',
  venue: {
    address: 'Ресторан «Белый сад», ул. Лесная, 12, Новосибирск',
    description:
      'Локация находится в черте города, поэтому до нее удобно добраться и на такси, и на машине.',
    mapHint:
      'Ссылку на маршрут и финальный тайминг мы пришлем ближе к дате в общем сообщении для гостей.',
    name: 'Белый сад',
  },
};
