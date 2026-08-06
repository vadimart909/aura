import { createContext, useContext, useState } from 'react';
import { scenarios as initialScenarios } from '../pages/home/mockData';

const ScenariosContext = createContext(null);

export function ScenariosProvider({ children }) {
  const [scenarios, setScenarios] = useState(initialScenarios);

  function addScenario(scenario) {
    setScenarios((prev) => [scenario, ...prev]);
  }

  return (
    <ScenariosContext.Provider value={{ scenarios, addScenario }}>
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
