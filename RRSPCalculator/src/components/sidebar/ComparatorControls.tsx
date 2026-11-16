import { formatCompact } from "../../formatters";
import { AppState, computeActiveRetireStartTotal } from "../../state";
import { ModePills } from "../ui/ModePills";

export interface ComparatorControlsProps {
  state: AppState;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export function ComparatorControls({
  state,
  onUpdateState,
}: ComparatorControlsProps) {
  if (state.startAtRetirement) {
    const activeTotal = computeActiveRetireStartTotal(state);
    return (
      <ModePills
        label="Account Comparison Mode"
        options={[
          {
            id: "comp-retire-equal",
            label: "Equal Total Nest Egg",
            active: !state.comparatorUseBreakdown,
            onClick: () =>
              onUpdateState((prev) => ({ ...prev, comparatorUseBreakdown: false })),
          },
          {
            id: "comp-retire-breakdown",
            label: "Exact Asset Breakdown",
            active: state.comparatorUseBreakdown,
            onClick: () =>
              onUpdateState((prev) => ({ ...prev, comparatorUseBreakdown: true })),
          },
        ]}
        hint={
          state.comparatorUseBreakdown
            ? "Compares your exact RRSP, PI, Co-Owned Corp, and TFSA starting bucket balances side-by-side."
            : `Tests how long your total ${formatCompact(activeTotal)} retirement portfolio lasts if held 100% in RRSP vs. PI vs. Co-Owned Corp vs. TFSA.`
        }
      />
    );
  }

  return (
    <ModePills
      label="Comparison Baseline"
      options={[
        {
          id: "mode-pretax",
          label: "Pre-Tax Earnings",
          active: state.comparatorMode === "preTax",
          onClick: () =>
            onUpdateState((prev) => ({ ...prev, comparatorMode: "preTax" })),
        },
        {
          id: "mode-cashout",
          label: "Cash Out-of-Pocket",
          active: state.comparatorMode === "cashOut",
          onClick: () =>
            onUpdateState((prev) => ({ ...prev, comparatorMode: "cashOut" })),
        },
      ]}
      extra={
        state.comparatorMode === "cashOut" ? (
          <label className="reinvest-checkbox-row">
            <input
              type="checkbox"
              id="check-reinvest"
              checked={state.comparatorReinvest}
              onChange={(e) =>
                onUpdateState((prev) => ({
                  ...prev,
                  comparatorReinvest: e.target.checked,
                }))
              }
            />
            <span>Gross-up &amp; Reinvest RRSP Tax Refund</span>
          </label>
        ) : undefined
      }
    />
  );
}
