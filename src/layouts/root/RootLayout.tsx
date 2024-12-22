import { Outlet } from 'react-router'
import { SearchForm } from './SearchForm'

export function RootLayout() {
  return (
    <div className="relative flex min-h-full w-full flex-col gap-4">
      <SearchForm />
      <Outlet />
    </div>
  )
}
