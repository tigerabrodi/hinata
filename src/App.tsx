import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HomePage } from './pages/home'
import { Route, Routes } from 'react-router'
import { RootLayout } from './layouts/root/RootLayout'
import { ROUTES } from './lib/constants'
import { PhotoDetailPage } from './pages/photo-detail'
import { UserDetailPage } from './pages/user-detail'

const queryClient = new QueryClient()

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
