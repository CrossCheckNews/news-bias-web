/** Publisher 성향 (관리자 설정) */
export type PoliticalLeaning = 'LEFT' | 'CENTER' | 'RIGHT'

/** Article 성향 (API 응답) */
export type ArticleLeaning = 'CONSERVATIVE' | 'PROGRESSIVE'

export interface LeaningDistribution {
  CONSERVATIVE: number
  PROGRESSIVE: number
}

/** 목록 (/api/v1/topics) */
export interface TopicSummary {
  id: number
  aiSummaryTitle: string
  summary: Record<string, string>
  aiSummary: string
  status: 'ACTIVE' | 'INACTIVE'
  startDate: string
  articleCount: number
  leaningDistribution: LeaningDistribution
  countryDistribution: Record<string, number>
}

/** 상세 (/api/v1/topics/{id}) 전용 필드 */
export interface TopicDetail extends TopicSummary {
  title: string
  category: string
  createdAt: string
  aiModel: string
  summaryGeneratedAt: string
  articles: TopicArticle[]
}

/** 기사 (상세 /api/v1/topics/{id} 응답에 포함) */
export interface TopicArticle {
  articleId: number
  headline: string
  url: string
  publishedAt: string
  description: string
  publisherName: string
  country: string
  politicalLeaning: ArticleLeaning
}

export interface TopicPage {
  content: TopicSummary[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  last: boolean
  first: boolean
}

/** GET 응답·목록 항목 */
export interface Publisher {
  id: number
  name: string
  country: string
  politicalLeaning: PoliticalLeaning
  rssUrl?: string
  createdAt?: string
}

export interface PublisherPage {
  content: Publisher[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
