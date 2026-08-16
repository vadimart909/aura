import { createContext, useContext, useState } from 'react';
import { scenarios as initialScenarios } from '../pages/home/mockData';

const ScenariosContext = createContext(null);

export function ScenariosProvider({ children }) {
  const [scenarios, setScenarios] = useState(initialScenarios);

  function addScenario(scenario) {
    setScenarios((prev) => [scenario, ...prev]);
  }

  function updateScenario(id, updates) {
    setScenarios((prev) =>
      prev.map((s) => (String(s.id) === String(id) ? { ...s, ...updates } : s)),
    );
  }

  function removeScenario(id) {
    setScenarios((prev) => prev.filter((s) => String(s.id) !== String(id)));
  }

  return (
    <ScenariosContext.Provider value={{ scenarios, addScenario, updateScenario, removeScenario }}>
      {children}
    </ScenariosContext.Provider>
  );
}

export function useScenariosContext() {
  const context = useContext(ScenariosContext);
  if (!context) {
    throw new Error('useScenariosContext must be used within a ScenariosProvider');
  }
  return context;
}
