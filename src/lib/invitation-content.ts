type DressCodePaletteItem = {
  color: string;
  label: string;
};

type ScheduleItem = {
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
    twoGisUrl: string;
  };
} = {
  city: 'Новосибирск',
  couple: 'Рома и Оля',
  dateCode: '07 / 08 / 2026',
  dateCompact: '07/08/2026',
  dateLabel: '7 августа 2026',
  dressCode: {
    description:
      'Дорогие гости, нам будет очень приятно, если вы поддержите цветовую гамму торжества: черный, коричневый, бежевый, светлые оттенки зелёного.\nИзбегайте, пожалуйста, полностью белых образов, чтобы этот цвет остался за невестой',
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
    'Если ваши планы изменятся, пожалуйста, обновите ответ заранее. Нам важно аккуратно собрать RSVP и подготовить комфортный вечер для всех гостей',
  intro:
    'Мы будем счастливы провести этот день вместе с близкими людьми. Приходите разделить с нами церемонию, ужин и очень теплый вечер без спешки',
  kicker: 'Wedding Setup Wizard',
  rsvpDeadline: 'до 1 июня 2026',
  schedule: [
    {
      time: '15:00',
      title: 'Welcome drink / Сбор гостей',
    },
    {
      time: '15:30',
      title: 'Начало церемонии',
    },
    {
      time: '16:30',
      title: 'Начало банкета',
    },
    {
      time: '20:00',
      title: 'Торт',
    },
    {
      time: '22:00',
      title: 'Дискач',
    },
    {
      time: '23:00',
      title: 'Афтерпати',
    },
  ],
  surveyIntro: 'Пожалуйста, заполните анкету',
  surveyOptions: [
    {
      description: 'Подтверждаю, что буду на свадьбе.',
      label: 'Да, буду присутствовать',
    },
    {
      description: 'К сожалению, не смогу присутствовать.',
      label: 'К сожалению, не смогу',
    },
  ],
  timeLabel: '15:00',
  venue: {
    address: 'Речкуновская Зона Отдыха м-н, Бердск, Новосибирская область, 633218',
    description:
      'Локация находится в живописной зоне отдыха, поэтому ближе к дате отдельно подскажем удобный маршрут и детали прибытия.',
    mapHint: '',
    name: 'Ла Вилла',
    twoGisUrl:
      'https://2gis.ru/berdsk/search/%D0%BB%D0%B0%20%D0%B2%D0%B8%D0%BB%D0%BB%D0%B0/firm/70000001065666807/83.181918%2C54.780562?m=83.18246%2C54.780411%2F16.94',
  },
};
