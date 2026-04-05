export type HomeFeedCardBg = 'white' | 'surface1' | 'surface2' | 'hero'

export type HomeCategoryTagStyle = 'solidDark' | 'solidLight' | 'outline' | 'none'

export type HomeFeedCta =
  | 'smallCompare'
  | 'fullOutline'
  | 'fullSolidDark'
  | 'fullSolidLight'
  | 'link'
  | 'heroReport'

export type HomeLeftRibbon = 'popular' | 'notable'

export interface HomeFeedItem {
  id: number
  title: string
  category: string
  categoryTagStyle: HomeCategoryTagStyle
  articleCount: number
  keywords?: string
  cardBg: HomeFeedCardBg
  cta: HomeFeedCta
  ctaLabel: string
  leftRibbon?: HomeLeftRibbon
  heroEyebrow?: string
  /** Optional; hero falls back to CSS gradient when omitted */
  heroImageUrl?: string
}

export const HOME_FEED_TABS = [
  '모바일 홈(N)',
  '전체 주제',
  '스탠스',
  '아카이브',
  '내 피드',
] as const

export const homeFeedItems: HomeFeedItem[] = [
  {
    id: 1,
    title: '글로벌 반도체 주권의 지형 변화',
    category: 'IT/기술',
    categoryTagStyle: 'solidDark',
    articleCount: 12,
    keywords: '애플, 엔비디아, 삼성...',
    cardBg: 'surface1',
    cta: 'smallCompare',
    ctaLabel: '보도 내용 비교',
  },
  {
    id: 2,
    title: '북유럽의 도시재조립 이니셔티브',
    category: '정치/사회',
    categoryTagStyle: 'outline',
    articleCount: 8,
    cardBg: 'surface2',
    cta: 'fullOutline',
    ctaLabel: '비교하기',
  },
  {
    id: 3,
    title: '탈중앙화 금융: 규제의 교차로',
    category: '경제/금융',
    categoryTagStyle: 'solidDark',
    articleCount: 24,
    cardBg: 'white',
    cta: 'fullSolidDark',
    ctaLabel: '비교하기',
  },
  {
    id: 4,
    title: '공공 기관에 남겨진 브루탈리즘 건축의 유산',
    category: '인문/사회',
    categoryTagStyle: 'solidLight',
    articleCount: 5,
    cardBg: 'white',
    cta: 'fullSolidLight',
    ctaLabel: '비교하기',
  },
  {
    id: 5,
    title: '재생 에너지 저장: 리튬의 대안들',
    category: '에너지/환경',
    categoryTagStyle: 'solidDark',
    articleCount: 13,
    cardBg: 'surface2',
    cta: 'fullSolidDark',
    ctaLabel: '비교하기',
  },
  {
    id: 6,
    title: '합성의 시대, 탐사 보도 저널리즘의 미래',
    category: '',
    categoryTagStyle: 'none',
    articleCount: 0,
    cardBg: 'hero',
    cta: 'heroReport',
    ctaLabel: '리포트 살펴보기',
    heroEyebrow: '심층 기사',
  },
  {
    id: 7,
    title: '심해 채굴 입법의 새로운 진전',
    category: '',
    categoryTagStyle: 'none',
    articleCount: 3,
    cardBg: 'white',
    cta: 'link',
    ctaLabel: '주제 비교',
    leftRibbon: 'popular',
  },
  {
    id: 8,
    title: '인지과학: 창의성에서 지루함의 역할',
    category: '',
    categoryTagStyle: 'none',
    articleCount: 4,
    cardBg: 'surface2',
    cta: 'link',
    ctaLabel: '주제 비교',
    leftRibbon: 'notable',
  },
]
