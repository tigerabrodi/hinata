import { FormEvent, useState } from 'react'

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

type SearchFormProps = {
  defaultValue?: string
  onSearch: (query: string) => void
  orderBy: SearchParams['orderBy']
  color?: SearchParams['color']
  onOrderByChange: (value: SearchParams['orderBy']) => void
  onColorChange: (value: SearchParams['color']) => void
  isLoading: boolean
}

export function SearchForm({
  defaultValue = '',
  onSearch,
  orderBy,
  color,
  onOrderByChange,
  onColorChange,
  isLoading,
}: SearchFormProps) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const searchId = useId()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedValue = inputValue.trim()
    if (!trimmedValue || isLoading) return
    onSearch(trimmedValue)
  }

  return (
    <form
      className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-center md:gap-10"
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
          value={orderBy}
          onValueChange={(value) => onOrderByChange(orderBySchema.parse(value))}
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
          value={color ?? ''}
          onValueChange={(value) => onColorChange(colorSchema.parse(value))}
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
