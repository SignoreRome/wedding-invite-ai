type DressCodePaletteItem = {
  color: string;
  label: string;
};

type ScheduleItem = {
  description?: string;
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
  dateCode: '07 / 08 / 2026',
  dateCompact: '07/08/2026',
  dateLabel: '7 августа 2026',
  dressCode: {
    description:
      'Будем рады видеть вас в образах в черных, коричневых, бежевых и зеленых оттенках. Подойдет как более строгий, так и спокойный природный образ в этой палитре.',
    note: 'Если сомневаетесь, выбирайте удобный наряд в одной из рекомендованных палитр без слишком ярких акцентов.',
    palette: [
      {
        color: '#140F0B',
        label: 'черный',
      },
      {
        color: '#503D33',
        label: 'коричневый',
      },
      {
        color: '#F5F5DC',
        label: 'бежевый',
      },
      {
        color: '#89AC76',
        label: 'зеленый',
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
      description: 'Welcome drink и спокойный сбор гостей перед церемонией.',
      time: '15:00',
      title: 'Welcome drink / Сбор гостей',
    },
    {
      description: 'Начинаем церемонию и собираемся рядом с самыми близкими.',
      time: '15:30',
      title: 'Начало церемонии',
    },
    {
      description: 'Переходим к банкету, ужину и поздравлениям.',
      time: '16:30',
      title: 'Начало банкета',
    },
    {
      description: 'Время для сладкого финала первой части вечера.',
      time: '20:00',
      title: 'Торт',
    },
    {
      description: 'Любимая музыка, танцы и побольше энергии.',
      time: '22:00',
      title: 'Дискач',
    },
    {
      description: 'Для тех, кто захочет остаться с нами подольше.',
      time: '23:00',
      title: 'Афтерпати',
    },
  ],
  surveyIntro:
    'Пожалуйста, укажите, будете ли вы на свадьбе, планируете ли прийти с парой, нужен ли вам трансфер после банкета, и оставьте комментарий, если есть аллергии или важные пожелания.',
  surveyOptions: [
    {
      description: 'Подтверждаю, что буду на свадьбе.',
      label: 'Буду присутствовать',
    },
    {
      description: 'К сожалению, не смогу присутствовать.',
      label: 'Не буду',
    },
  ],
  timeLabel: '15:00',
  venue: {
    address: 'Речкуновская Зона Отдыха м-н, Бердск, Новосибирская область, 633218',
    description:
      'Локация находится в живописной зоне отдыха, поэтому ближе к дате отдельно подскажем удобный маршрут и детали прибытия.',
    mapHint:
      'Ссылку на маршрут и финальный тайминг мы пришлем ближе к дате в общем сообщении для гостей.',
    name: 'Ла Вилла',
  },
};
