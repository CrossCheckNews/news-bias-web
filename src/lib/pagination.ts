export interface PaginationMeta {
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

export interface PageData<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  hasNext: boolean
  hasPrevious: boolean
}

export function parsePage<T>(raw: PaginatedResponse<T>): PageData<T> {
  return {
    items: raw.items,
    page: raw.pagination.page,
    size: raw.pagination.size,
    totalElements: raw.pagination.totalElements,
    totalPages: raw.pagination.totalPages,
    first: raw.pagination.first,
    last: raw.pagination.last,
    hasNext: raw.pagination.hasNext,
    hasPrevious: raw.pagination.hasPrevious,
  }
}
