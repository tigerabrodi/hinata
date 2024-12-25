const ONE_SECOND_IN_MS = 1000
const ONE_MINUTE_IN_MS = ONE_SECOND_IN_MS * 60
export const FIVE_MINUTES_IN_MS = ONE_MINUTE_IN_MS * 5

export const DEFAULT_QUERY_PARAM_VALUES = {
  page: 1,
  perPage: 12,
  orderBy: 'relevant',
} as const

export const QUERY_PARAMS = {
  query: 'query',
  page: 'page',
  color: 'color',
  orderBy: 'orderBy',
  perPage: 'perPage',
} as const

export const ROUTES = {
  home: '/',
  user: '/users/:username',
  photoDetail: '/photos/:id',
  userDetail: '/users/:username',
} as const
