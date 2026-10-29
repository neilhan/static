import "./style.css";
import {
  compareAllStrategies,
  runSimulation,
  simulatePortfolioStrategy,
} from "./calculator";
import { renderFooter } from "./components/layout/footer";
import { attachHeaderListeners, renderAppHeader } from "./components/layout/header";
import { renderRulesSection } from "./components/layout/rulesSection";
import { renderComparatorResults } from "./components/results/comparatorView";
import {
  attachSimulatorViewListeners,
  renderSimulatorResults,
} from "./components/results/simulatorView";
import {
  attachControlsEventListeners,
  renderControlsHTML,
} from "./components/sidebar/sidebarPanel";
import { AppRenderCallbacks } from "./components/ui/types";
import {
  getComparatorParams,
  getStrategyParams,
  normalizeHouseholdAllocations,
  state,
} from "./state";

document.documentElement.setAttribute("data-theme", state.theme);

const app = document.getElementById("app")!;

const callbacks: AppRenderCallbacks = {
  renderApp,
  renderControlsPanel,
  updateResultsOnly,
};

/**
 * Top-Level App Render (Layout Shell)
 * Called on page load and when switching Household Mode (Single/Couple) or View Mode (Simulator/Comparator).
 * Sliders NEVER call this function directly so mouse dragging is 100% uninterrupted.
 */
function renderApp(): void {
  const isCouple = state.householdMode === "couple";
  normalizeHouseholdAllocations();

  app.innerHTML = `
    <div class="container">
      ${renderAppHeader(isCouple)}

      <main class="main-layout">
        <!-- Controls Sidebar (Persistent DOM Element) -->
        <aside id="controls-panel" class="panel" aria-label="Calculator Settings">
          ${renderControlsHTML(isCouple)}
        </aside>

        <!-- Dynamic Results Panel (Updated on Drag) -->
        <section id="results-container" class="results-container" aria-label="Results">
          <!-- Populated by updateResultsOnly() -->
        </section>
      </main>

      ${renderRulesSection()}
      ${renderFooter()}
    </div>
  `;

  attachHeaderListeners(callbacks);
  attachControlsEventListeners(callbacks);
  updateResultsOnly();
}

/**
 * Re-renders the controls panel contents without recreating the outer container.
 */
function renderControlsPanel(): void {
  const panel = document.getElementById("controls-panel");
  if (!panel) return;
  panel.innerHTML = renderControlsHTML(state.householdMode === "couple");
  attachControlsEventListeners(callbacks);
}

/**
 * Updates ONLY the results panel (#results-container) without touching the controls sidebar DOM.
 * This guarantees slider dragging maintains pointer capture smoothly.
 */
function updateResultsOnly(): void {
  const isCouple = state.householdMode === "couple";
  const resultsContainer = document.getElementById("results-container");
  if (!resultsContainer) return;

  if (state.viewMode === "simulator") {
    const strategyParams = getStrategyParams();
    const currentStratResult = simulatePortfolioStrategy({
      ...strategyParams,
      decumStrategy: state.decumStrategy,
    });
    const allStratComparisons = compareAllStrategies(strategyParams);

    resultsContainer.innerHTML = renderSimulatorResults(
      currentStratResult,
      allStratComparisons,
      isCouple
    );
    attachSimulatorViewListeners(currentStratResult, isCouple, callbacks);
  } else {
    const comparatorSim = runSimulation(getComparatorParams());
    resultsContainer.innerHTML = renderComparatorResults(comparatorSim, isCouple);
  }
}

// Initial render
renderApp();

