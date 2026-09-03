import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { AuraHeader } from '@shared/ui/AuraHeader'
import Home from './pages/home/Home'
import NotFound from './pages/NotFound'
import CreateSegmentTree from './pages/createsegment/CreateSegmentTree'
import { SegmentsProvider } from './context/SegmentsContext'

function Layout() {
  return (
    <SegmentsProvider>
      <AuraHeader service="segments" />
      <main>
        <Outlet />
      </main>
    </SegmentsProvider>
  )
}

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/segment/create', element: <CreateSegmentTree /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    basename: '/aura/segments',
  }
)

function App() {
  return <RouterProvider router={router} />
}

export default App
