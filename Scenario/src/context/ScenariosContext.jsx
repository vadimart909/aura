import { useState } from 'react';
import { scenarios as initialScenarios } from '../pages/home/mockData';
import { ScenariosContext } from './useScenariosContext';

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

  // Full replace, not a merge — used by the discard path, where keys the user
  // added during the session (e.g. a `canvas` on a scenario that had none)
  // must disappear, which `updateScenario`'s shallow merge would leave behind.
  function replaceScenario(id, next) {
    setScenarios((prev) => prev.map((s) => (String(s.id) === String(id) ? next : s)));
  }

  function removeScenario(id) {
    setScenarios((prev) => prev.filter((s) => String(s.id) !== String(id)));
  }

  return (
    <ScenariosContext.Provider value={{ scenarios, addScenario, updateScenario, replaceScenario, removeScenario }}>
      {children}
    </ScenariosContext.Provider>
  );
}
