export type PoliticalLeaning = 'LEFT' | 'CENTER' | 'RIGHT'

/** GET 응답·목록 항목 (POST 200 응답은 rssUrl 없을 수 있음) */
export interface Publisher {
  id: number
  name: string
  country: string // ISO 3166-1 alpha-2 (e.g. "KR", "US")
  politicalLeaning: PoliticalLeaning
  rssUrl?: string
  createdAt?: string
}

export interface LeaningDistribution {
  LEFT: number
  CENTER: number
  RIGHT: number
}

export interface CountryDistributionItem {
  country: string
  count: number
}

/** 목록 (/api/v1/topics) 에서 내려오는 항목 */
export interface TopicSummary {
  id: number
  title: string
  description: string
  category: string
  status: 'ACTIVE' | 'INACTIVE'
  startDate: string
  endDate: string
  articleCount: number
}

/** 상세 (/api/v1/topics/{id}) 에서 내려오는 항목 */
export interface Topic extends TopicSummary {
  leaningDistribution: LeaningDistribution
  countryDistribution: CountryDistributionItem[]
}

export interface TopicPage {
  content: TopicSummary[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface PublisherPage {
  content: Publisher[]
  totalElements: number
  totalPages: number
  number: number        // current page (0-indexed)
  size: number
}

export interface TopicArticle {
  id: number
  title: string
  url: string
  publishedAt: string   // ISO 8601
  publisher: Publisher
}
