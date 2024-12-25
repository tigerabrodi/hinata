import { FormEvent, useState, useCallback } from 'react'
import { DEFAULT_QUERY_PARAM_VALUES, QUERY_PARAMS } from '@/lib/constants'
import { useNavigate, useSearchParams } from 'react-router'
import { useIsFetching } from '@tanstack/react-query'
import { photoKeys } from '@/lib/queryKeys'

import {
  orderBySchema,
  colorSchema,
  SearchParams,
  ColorOption,
} from '@/lib/schemas'
import { useId } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search as SearchIcon } from 'lucide-react'

// Observed from the dev tools
export const SEARCH_FORM_HEIGHT = 136

const SORT_OPTIONS: Array<{ value: SearchParams['orderBy']; label: string }> = [
  {
    value: 'relevant',
    label: 'Relevant',
  },
  {
    value: 'latest',
    label: 'Latest',
  },
]

const COLOR_OPTIONS: Array<{ value: ColorOption; label: string }> = [
  {
    value: 'black_and_white',
    label: 'Black and White',
  },
  {
    value: 'black',
    label: 'Black',
  },
  {
    value: 'white',
    label: 'White',
  },
  {
    value: 'yellow',
    label: 'Yellow',
  },
  {
    value: 'orange',
    label: 'Orange',
  },
  {
    value: 'green',
    label: 'Green',
  },
  {
    value: 'teal',
    label: 'Teal',
  },
  {
    value: 'blue',
    label: 'Blue',
  },
  {
    value: 'purple',
    label: 'Purple',
  },
  {
    value: 'red',
    label: 'Red',
  },
  {
    value: 'magenta',
    label: 'Magenta',
  },
]

export function SearchForm() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const currentParams: SearchParams = {
    query: searchParams.get(QUERY_PARAMS.query) || '',
    page: Number(searchParams.get(QUERY_PARAMS.page)) || 1,
    color:
      (searchParams.get(QUERY_PARAMS.color) as SearchParams['color']) ||
      undefined,
    orderBy:
      (searchParams.get(QUERY_PARAMS.orderBy) as SearchParams['orderBy']) ||
      DEFAULT_QUERY_PARAM_VALUES.orderBy,
    perPage: DEFAULT_QUERY_PARAM_VALUES.perPage,
  }

  const [inputValue, setInputValue] = useState(currentParams.query)
  const searchId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedValue = inputValue.trim()
    if (!trimmedValue || isLoading) return

    const newParams = new URLSearchParams(searchParams)
    newParams.set(QUERY_PARAMS.query, trimmedValue)
    newParams.set(QUERY_PARAMS.page, DEFAULT_QUERY_PARAM_VALUES.page.toString())

    void navigate(`/?${newParams.toString()}`)
  }

  const updateParams = useCallback(
    (updates: Partial<SearchParams>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev)

        Object.entries(updates).forEach(([key, value]) => {
          if (value) {
            newParams.set(key, String(value))
          } else {
            newParams.delete(key)
          }
        })

        if ('color' in updates || 'orderBy' in updates) {
          newParams.set(
            QUERY_PARAMS.page,
            DEFAULT_QUERY_PARAM_VALUES.page.toString()
          )
        }

        return newParams
      })
    },
    [setSearchParams]
  )

  const queriesFetchingSearchResults = useIsFetching({
    queryKey: photoKeys.searchResults({
      orderBy: currentParams.orderBy,
      perPage: currentParams.perPage,
      color: currentParams.color,
      query: currentParams.query,
    }),
  })

  const isLoading = queriesFetchingSearchResults > 0

  return (
    <form
      className="container sticky top-0 z-50 mx-auto flex flex-col justify-between gap-4 bg-background px-4 py-6 md:flex-row md:items-center md:gap-10 md:px-0"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 items-center gap-2">
          <SearchIcon
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2"
          />
          <label htmlFor={searchId} className="sr-only">
            Search for photos
          </label>
          <Input
            id={searchId}
            className="pl-8"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Search for photos"
          />
        </div>
        <Button disabled={!inputValue || isLoading}>Search</Button>
      </div>

      <div className="flex flex-row items-center gap-2">
        <Select
          value={currentParams.orderBy}
          onValueChange={(value) =>
            updateParams({ orderBy: orderBySchema.parse(value) })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentParams.color ?? ''}
          onValueChange={(value) =>
            updateParams({ color: colorSchema.parse(value) })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by color" />
          </SelectTrigger>
          <SelectContent>
            {COLOR_OPTIONS.map((option) =>
              option.value !== undefined ? (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ) : null
            )}
          </SelectContent>
        </Select>
      </div>
    </form>
  )
}
