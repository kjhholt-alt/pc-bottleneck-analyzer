# Feature: Component Upgrade Simulator

## Description
Allow users to swap out their current CPU or GPU for a different component from the hardware database and instantly see how the performance score and bottleneck analysis would change. This gives users confidence before purchasing upgrades.

## User Story
As a PC gamer, I want to select a different CPU or GPU from a dropdown and see how my performance score would change, so I can decide which upgrade gives me the best value.

## Acceptance Criteria

1. A "Simulate Upgrade" button appears on the Overview tab next to the score gauge
2. Clicking it opens a modal/panel with two dropdowns: CPU and GPU
3. Each dropdown lists all components from the hardware database, sorted by tier then gaming score
4. The current component is pre-selected and marked with "(Current)"
5. When a different component is selected, the analysis re-runs with the swapped component
6. A side-by-side comparison shows: old score vs new score, old bottlenecks vs new bottlenecks
7. The score delta is prominently displayed (e.g., "+12 points")
8. Changed bottlenecks are highlighted (removed in green, new in red)
9. The simulation is client-side only -- no API calls needed
10. A "Reset" button returns to the original scan data

## Technical Design

### New Files
- `src/components/UpgradeSimulator.tsx` -- Main modal/panel component
- `src/components/ScoreComparison.tsx` -- Side-by-side score display
- `src/lib/simulate.ts` -- Logic to clone scan data with swapped components

### Modifications
- `src/components/SystemOverview.tsx` -- Add "Simulate Upgrade" button
- `src/components/Dashboard.tsx` -- Manage simulator open/closed state

### Component Props

```typescript
interface UpgradeSimulatorProps {
  scan: SystemScan;
  currentAnalysis: AnalysisResult;
  onClose: () => void;
}

interface ScoreComparisonProps {
  before: PerformanceScore;
  after: PerformanceScore;
}
```

### Key Functions
```typescript
function simulateUpgrade(scan: SystemScan, newCpu?: string, newGpu?: string): AnalysisResult
```

## Edge Cases
- User selects same component as current -- show "No change" message
- Component not in database -- disable selection or show "Unknown tier" warning
- Swapping CPU but keeping GPU creates new tier mismatch -- surface this clearly
- Mobile layout for the comparison view
