import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom'
import { AuraHeader } from '@shared/ui/AuraHeader'
import Home from './pages/home/Home'
import About from './pages/About'
import NodesPreview from './pages/NodesPreview'
import NotFound from './pages/NotFound'
import CreateScenarioInfo from './pages/createscenarioinfo/CreateScenarioInfo'
import CreateScenarioCanvas from './pages/createscenariocanvas/CreateScenarioCanvas'
import ScenarioView from './pages/scenarioview/ScenarioView'
import NavigationBarCanvasPreview from './pages/NavigationBarCanvasPreview'
import { ScenariosProvider } from './context/ScenariosContext'

/**
 * AnimatedOutlet — wrapper around <Outlet /> that triggers a fade-in
 * animation (300 ms) every time the route changes (key = pathname).
 */
function AnimatedOutlet() {
  const location = useLocation()
  return (
    <div className="page-transition" key={location.pathname}>
      <Outlet />
    </div>
  )
}

function Layout() {
  return (
    <ScenariosProvider>
      <AuraHeader service="scenarios" />
      <main>
        <AnimatedOutlet />
      </main>
    </ScenariosProvider>
  )
}

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <Home /> },
        { path: '/about', element: <About /> },
        { path: '/nodes', element: <NodesPreview /> },
        // Поток создания/редактирования: шаг 1 — канвас, шаг 2 — «Название и описание».
        { path: '/scenario/canvas/:id', element: <CreateScenarioCanvas /> },
        { path: '/scenario/info/:id', element: <CreateScenarioInfo /> },
        { path: '/scenario/view/:id', element: <ScenarioView /> },
        { path: '/nav-bar-canvas', element: <NavigationBarCanvasPreview /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    basename: '/aura',
  }
)

function App() {
  return <RouterProvider router={router} />
}

export default App
