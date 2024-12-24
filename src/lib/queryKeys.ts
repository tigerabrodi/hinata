import { SearchParams } from './schemas'

const PLACEHOLDER = 'placeholder'

export const photoKeys = {
  all: ['photos'] as const,
  detail: (id: string | undefined) =>
    id ? ([...photoKeys.all, id] as const) : ([PLACEHOLDER] as const),
  search: () => [...photoKeys.all, 'search'] as const,
  searchResults: (params: Omit<SearchParams, 'page'>) => {
    if (!params.query) return [PLACEHOLDER] as const

    // order important to not mess up caching
    const queryParams = [
      params.query,
      params.orderBy,
      params.color,
      params.perPage,
    ] as const

    return [...photoKeys.search(), ...queryParams] as const
  },
} as const
