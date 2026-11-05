# FigSuite Finance Terminal — UI System (Alpha 0.1)

## Design objective

A credible, high-density institutional workspace, coupled with intuitive two-outcome probability discovery. The layout uses general interaction patterns common to advanced charting products (watchlists, timeframes, dense data grids, risk/indicator rails) and outcome-based forecasting interfaces (Yes/No outcome panels, implied percentages, compact scenario discovery cards). This is **not** a copy of TradingView or Polymarket US branding, screens, licensed charting widgets, or data.

## Brand primitives

- Background: `#090E19`; side/navigation: `#0A101C`; surface: `#101827`; elevated surface `#131D2F`.
- Borders: `#253044`; foreground `#ECF2FB`; secondary `#8897AE`.
- Action blue `#3579F5`; positive `#28C997`; negative `#FA8C91`.
- Slightly rounded panels (11–14 px), restrained shadows, clear segmentation.
- System font stack; high-density typography with 9–13 px data labels and bold numeric hierarchy.

## Page anatomy

1. Workspace navigation (overview, discovery, forecasts, watchlist, combines and rankings).
2. Utility/search bar with ⌘K / Ctrl+K shortcut.
3. Explicit **sandbox** designation; no implications of real-time/live payouts.
4. Four compact KPIs: provisional skill, nonmonetary Bips, illustrated scenarios, simulated unit balance.
5. Primary analytical chart with interval switching and instrument metadata.
6. Right forecast ticket with stateful Yes/No choice, confidence adjustment and LMSR simulation mode.
7. Discovery grid for scenarios with filters, probability bars and watchlist saves.
8. Secondary watchlist, sample analysts and integrity guidance.

## States and interactions

- Filters/search/sort, watchlist toggles and scenario selection update the current view.
- Forecast submission updates **in-memory browser state only**; no server or browser persistence.
- Simulation allocation updates **in-memory** outcome quantities and abstract-unit balance.
- Tabs and intervals update a deterministic illustrative chart.
- Informational controls open a methodology dialog; all sample values prominently labeled.
- Mobile sidebar is a modal drawer and main panels stack responsively.

## Next passes

- Accessible keyboard and screen-reader audit with actual browser tests.
- Responsive usability tests for mobile/tablet/desktop and color-contrast verification.
- Finalize design tokens, reusable component library and external chart licensing decisions.
- Replace mock datasets with approved, timestamped, provenance-rich live or delayed feeds. Label timestamps, freshness and session calendar.
- Bring chart to independent zoom, pan, crosshair and optional candle support only after charting-library license decision.
- Real Supabase Auth, server-authoritative forecast writes and event-resolution history are separate from this alpha.
