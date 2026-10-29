import { formatCompact } from "../../formatters";
import { state } from "../../state";
import { renderModePills } from "../ui/modePills";
import { AppRenderCallbacks } from "../ui/types";

export function renderComparatorSidebarControls(): string {
  if (state.startAtRetirement) {
    return renderModePills({
      label: "Account Comparison Mode",
      options: [
        {
          id: "comp-retire-equal",
          label: "Equal Total Nest Egg",
          active: !state.comparatorUseBreakdown,
        },
        {
          id: "comp-retire-breakdown",
          label: "Exact Asset Breakdown",
          active: state.comparatorUseBreakdown,
        },
      ],
      hintHtml: state.comparatorUseBreakdown
        ? "Compares your exact RRSP, PI, Co-Owned Corp, and TFSA starting bucket balances side-by-side."
        : `Tests how long your total ${formatCompact(state.retireStartTotal)} retirement portfolio lasts if held 100% in RRSP vs. PI vs. Co-Owned Corp vs. TFSA.`,
    });
  }

  return renderModePills({
    label: "Comparison Baseline",
    options: [
      {
        id: "mode-pretax",
        label: "Pre-Tax Earnings",
        active: state.comparatorMode === "preTax",
      },
      {
        id: "mode-cashout",
        label: "Cash Out-of-Pocket",
        active: state.comparatorMode === "cashOut",
      },
    ],
    extraHtml:
      state.comparatorMode === "cashOut"
        ? `
        <label class="reinvest-checkbox-row">
          <input type="checkbox" id="check-reinvest" ${state.comparatorReinvest ? "checked" : ""}>
          <span>Gross-up & Reinvest RRSP Tax Refund</span>
        </label>`
        : "",
  });
}

export function attachComparatorControlsListeners(cb: AppRenderCallbacks): void {
  document.getElementById("mode-pretax")?.addEventListener("click", () => {
    state.comparatorMode = "preTax";
    cb.renderApp();
  });
  document.getElementById("mode-cashout")?.addEventListener("click", () => {
    state.comparatorMode = "cashOut";
    cb.renderApp();
  });
  document.getElementById("check-reinvest")?.addEventListener("change", (e) => {
    state.comparatorReinvest = (e.target as HTMLInputElement).checked;
    cb.updateResultsOnly();
  });
  document.getElementById("comp-retire-equal")?.addEventListener("click", () => {
    state.comparatorUseBreakdown = false;
    cb.renderControlsPanel();
    cb.updateResultsOnly();
  });
  document.getElementById("comp-retire-breakdown")?.addEventListener("click", () => {
    state.comparatorUseBreakdown = true;
    cb.renderControlsPanel();
    cb.updateResultsOnly();
  });
}

