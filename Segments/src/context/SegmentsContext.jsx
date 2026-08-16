import { createContext, useContext, useState } from 'react';
import { MY_SEGMENTS } from '../data/mockSegments';

const SegmentsContext = createContext(null);

export function SegmentsProvider({ children }) {
  const [segments, setSegments] = useState(MY_SEGMENTS);

  function addSegment(segment) {
    setSegments((prev) => [segment, ...prev]);
  }

  function updateSegment(id, updates) {
    setSegments((prev) =>
      prev.map((s) => (String(s.id) === String(id) ? { ...s, ...updates } : s)),
    );
  }

  function removeSegment(id) {
    setSegments((prev) => prev.filter((s) => String(s.id) !== String(id)));
  }

  return (
    <SegmentsContext.Provider value={{ segments, addSegment, updateSegment, removeSegment }}>
      {children}
    </SegmentsContext.Provider>
  );
}

export function useSegmentsContext() {
  const context = useContext(SegmentsContext);
  if (!context) {
    throw new Error('useSegmentsContext must be used within a SegmentsProvider');
  }
  return context;
}
