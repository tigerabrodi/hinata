import { Link, Outlet } from 'react-router'
import { SearchForm } from './SearchForm'
import { ROUTES } from '@/lib/constants'

export function RootLayout() {
  return (
    <div className="relative flex min-h-full w-full flex-col">
      <Link
        to={ROUTES.home}
        aria-label="Hinata"
        className="absolute left-6 top-6 hidden text-2xl font-bold italic md:inline"
      >
        H
      </Link>
      <SearchForm />
      <Outlet />
    </div>
  )
}
