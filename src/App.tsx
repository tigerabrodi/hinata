import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HomePage } from './pages/home-page'
import { Route } from 'react-router'
import { Routes } from 'react-router'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}

export default App
