import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HomePage } from './pages/home-page'
import { Route, Routes } from 'react-router'
import { RootLayout } from './layouts/root/RootLayout'
import { FIVE_MINUTES_IN_MS, ROUTES } from './lib/constants'
import { PhotoDetailPage } from './pages/photo-detail-page'
import { UserDetailPage } from './pages/user-detail-page'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_MINUTES_IN_MS,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path={ROUTES.photoDetail} element={<PhotoDetailPage />} />
          <Route path={ROUTES.userDetail} element={<UserDetailPage />} />
        </Route>
      </Routes>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default App
