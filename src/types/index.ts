/** Publisher 성향 (관리자 설정) */
export type PoliticalLeaning = 'LEFT' | 'CENTER' | 'RIGHT';

/** Article 성향 (API 응답) */
export type PublisherLeaning = 'CONSERVATIVE' | 'PROGRESSIVE';

export interface LeaningDistribution {
  CONSERVATIVE: number;
  PROGRESSIVE: number;
}

/** 목록 (/api/v1/topics) */
export interface TopicSummary {
  id: number;
  aiSummaryTitle: string;
  summary: Record<string, string>;
  aiSummary: string;
  status: 'ACTIVE' | 'INACTIVE';
  startDate: string;
  articleCount: number;
  leaningDistribution: LeaningDistribution;
  countryDistribution: Record<string, number>;
}

/** 상세 (/api/v1/topics/{id}) 전용 필드 */
export interface TopicDetail extends TopicSummary {
  title: string;
  category: string;
  createdAt: string;
  aiModel: string;
  summaryGeneratedAt: string;
  articles: TopicArticle[];
}

/** 기사 (상세 /api/v1/topics/{id} 응답에 포함) */
export interface TopicArticle {
  articleId: number;
  headline: string;
  url: string;
  publishedAt: string;
  description: string;
  publisherName: string;
  country: string;
  politicalLeaning: PublisherLeaning;
}

export type TopicPage = import('@/lib/pagination').PageData<TopicSummary>;

/** GET 응답·목록 항목 */
export interface Publisher {
  id: number;
  name: string;
  country: string;
  politicalLeaning: PoliticalLeaning;
  rssUrl?: string;
  createdAt?: string;
}

export interface AdminArticle {
  id: number;
  headline: string;
  url: string;
  normalizedUrl?: string;
  description?: string;
  publishedAt: string;
  fetchedAt?: string;
  publisherId: number;
  publisherName: string;
  publisherCountry: string;
  publisherLeaning?: PublisherLeaning;
  category?: string;
}

export type { PageData } from '@/lib/pagination';
export type PublisherPage = import('@/lib/pagination').PageData<Publisher>;
export type ArticlesPage = import('@/lib/pagination').PageData<AdminArticle>;
