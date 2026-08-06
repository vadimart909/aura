import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/home/Home'
import About from './pages/About'
import NodesPreview from './pages/NodesPreview'
import NotFound from './pages/NotFound'
import CreateScenario from './pages/createscenario/CreateScenario'
import ScenarioView from './pages/scenarioview/ScenarioView'
import NavigationBarCanvasPreview from './pages/NavigationBarCanvasPreview'
import { ScenariosProvider } from './context/ScenariosContext'

function App() {
  return (
    <ScenariosProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/nodes" element={<NodesPreview />} />
          <Route path="/scenario/create" element={<CreateScenario />} />
          <Route path="/scenario/view/:id" element={<ScenarioView />} />
          <Route path="/nav-bar-canvas" element={<NavigationBarCanvasPreview />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </ScenariosProvider>
  )
}

export default App
