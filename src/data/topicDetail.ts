import type { PoliticalLeaning } from '@/types';

export interface ArticleItem {
  id: number;
  publisher: string;
  title: string;
  titleKo: string;
  url: string;
  readCount: number;
  minutesAgo: number;
  leaning: PoliticalLeaning;
}

export interface TopicDetail {
  id: number;
  eyebrow: string;
  eyebrowEn: string;
  titleEn: string;
  titleKo: string;
  articles: ArticleItem[];
}

export const topicDetails: TopicDetail[] = [
  {
    id: 6,
    eyebrow: '조사 보고서',
    eyebrowEn: 'INVESTIGATIVE DOSSIER',
    titleEn: 'The Global Shift in Green Energy Subsidies',
    titleKo: '글로벌 그린 에너지 보조금의 변화',
    articles: [
      {
        id: 1,
        publisher: 'THE GUARDIAN',
        title:
          'Why government intervention is the only way to save the planet from industrial collapse.',
        titleKo:
          '산업 붕괴로부터 지구를 구하는 유일한 길은 왜 정부의 개입일까?',
        url: '#',
        readCount: 2407,
        minutesAgo: 7,
        leaning: 'LEFT',
      },
      {
        id: 2,
        publisher: 'EL PAIS',
        title:
          'Spanish subsidies face conservative backlash despite historic carbon reduction.',
        titleKo:
          '탄소를 감축에도 불구하고 보수적 반발에 직면한 스페인의 보조금 정책',
        url: '#',
        readCount: 1731,
        minutesAgo: 7,
        leaning: 'LEFT',
      },
      {
        id: 3,
        publisher: 'MENBO',
        title:
          'Biden administration pushes for $40B in additional offshore wind incentives.',
        titleKo:
          '바이든 행정부, 400억 달러 규모의 추가 해상 풍력 인센티브 추진',
        url: '#',
        readCount: 907,
        minutesAgo: 7,
        leaning: 'LEFT',
      },
      {
        id: 4,
        publisher: 'REUTERS',
        title:
          'Global energy markets fluctuate as major powers pivot to varied subsidy models.',
        titleKo:
          '대국들이 다양한 보조금 모델로 전환하면서 흔들리는 글로벌 에너지 시장',
        url: '#',
        readCount: 3020,
        minutesAgo: 7,
        leaning: 'CENTER',
      },
      {
        id: 5,
        publisher: 'ASSOCIATED PRESS',
        title:
          'Analysis: Comparing the efficacy of tax credits versus direct grants in green energy.',
        titleKo:
          '분석: 그린 에너지 분야에서의 세액 공제와 직접 보조금의 효율성 비교',
        url: '#',
        readCount: 1540,
        minutesAgo: 7,
        leaning: 'CENTER',
      },
      {
        id: 6,
        publisher: 'BLOOMBERG',
        title:
          'Investment firms warn of bubble risks in heavily subsidized solar ventures.',
        titleKo:
          '투자사들, 민관이 보조금이 두텁게 깔린 태양광 벤처의 거품 위험성에 경고',
        url: '#',
        readCount: 884,
        minutesAgo: 7,
        leaning: 'CENTER',
      },
      {
        id: 7,
        publisher: 'WALL STREET JOURNAL',
        title:
          'The hidden cost of green subsidies: How taxpayers fund inefficient corporate giants.',
        titleKo:
          '그린 보조금의 숨겨진 비용: 납세자의 돈이 어떻게 비효율적 기업들을 지원하고 있나',
        url: '#',
        readCount: 2210,
        minutesAgo: 7,
        leaning: 'RIGHT',
      },
      {
        id: 8,
        publisher: 'THE TELEGRAPH',
        title:
          'Energy independence is being sacrificed for ideological net-zero quotas.',
        titleKo: "이념적 '넷 제로' 할당량을 위해 희생당하는 에너지 독립",
        url: '#',
        readCount: 1193,
        minutesAgo: 7,
        leaning: 'RIGHT',
      },
      {
        id: 9,
        publisher: 'FOX NEWS',
        title:
          'The new energy crisis: Government overreach threatens traditional fuel sectors.',
        titleKo:
          '새로운 에너지 위기: 과도한 정부 규제가 전통적인 연료 산업에 실질적인 위협이 될 수 있다',
        url: '#',
        readCount: 670,
        minutesAgo: 7,
        leaning: 'RIGHT',
      },
    ],
  },
];

export function getTopicDetail(id: number): TopicDetail | undefined {
  return topicDetails.find((t) => t.id === id);
}
