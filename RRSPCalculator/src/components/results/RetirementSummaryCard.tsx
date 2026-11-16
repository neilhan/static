import { StrategyResult } from "../../calculator";
import { formatCurrency } from "../../formatters";
import { AppState, computeActiveAnnualSaving } from "../../state";
import { BlueprintCol } from "../ui/BlueprintCol";
import { BarSegmentItem, SegmentedBar } from "../ui/SegmentedBar";

export interface RetirementSummaryCardProps {
  currentStrat: StrategyResult;
  state: AppState;
  isCouple: boolean;
  onCustomizeStartingAssets: () => void;
  onSwitchToAccumulation: () => void;
}

export function RetirementSummaryCard({
  currentStrat,
  state,
  isCouple,
  onCustomizeStartingAssets,
  onSwitchToAccumulation,
}: RetirementSummaryCardProps) {
  const tb = currentStrat.terminalBalanceAtRetirement;
  const safeTotal = Math.max(1, tb.total);
  const p1Rrsp = tb.person1Rrsp ?? (isCouple ? Math.round(tb.rrsp * 0.5) : tb.rrsp);
  const p2Rrsp = isCouple ? (tb.person2Rrsp ?? Math.max(0, tb.rrsp - p1Rrsp)) : 0;

  const p1Pct = Math.round((p1Rrsp / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((p2Rrsp / safeTotal) * 100) : 0;
  const rrspTotalPct = Math.round((tb.rrsp / safeTotal) * 100);
  const piPct = Math.round((tb.pi / safeTotal) * 100);
  const corpPct = Math.round((tb.corp / safeTotal) * 100);
  const tfsaPct = Math.max(
    0,
    100 - (isCouple ? p1Pct + p2Pct : rrspTotalPct) - piPct - corpPct
  );

  const piCostBasis = tb.piCostBasis ?? Math.round(tb.pi * 0.5);
  const piGain = tb.piUnrealizedGain ?? Math.max(0, tb.pi - piCostBasis);
  const corpCostBasis = tb.corpCostBasis ?? Math.round(tb.corp * 0.5);
  const corpGain = tb.corpUnrealizedGain ?? Math.max(0, tb.corp - corpCostBasis);
  const corpCda = Math.round(corpGain * 0.5);
  const taxFreeCushion = tb.tfsa + piCostBasis + corpCda;
  const activeAnnualSaving = computeActiveAnnualSaving(state);

  const segments: BarSegmentItem[] = [
    {
      key: "p1",
      variant: "p1",
      pct: isCouple ? p1Pct : rrspTotalPct,
      title: `${isCouple ? "Person 1 RRSP" : "RRSP"}: ${formatCurrency(p1Rrsp)}`,
      labelText: `🟣 ${
        isCouple
          ? `P1 RRSP: ${formatCurrency(p1Rrsp)} (${p1Pct}%)`
          : `RRSP/RRIF: ${formatCurrency(tb.rrsp)} (${rrspTotalPct}%)`
      }`,
      labelColor: "var(--rrsp-color)",
      labelWeight: 600,
    },
    ...(isCouple
      ? [
          {
            key: "p2",
            variant: "p2",
            pct: p2Pct,
            title: `Person 2 RRSP: ${formatCurrency(p2Rrsp)}`,
            labelText: `🟣 P2 RRSP: ${formatCurrency(p2Rrsp)} (${p2Pct}%)`,
            labelColor: "#8b5cf6",
            labelWeight: 600,
          },
        ]
      : []),
    {
      key: "pi",
      variant: "pi",
      pct: piPct,
      title: `Personal Account (PI): ${formatCurrency(tb.pi)}`,
      labelText: `🟠 Personal (PI): ${formatCurrency(tb.pi)} (${piPct}%)`,
      labelColor: "var(--nonreg-color)",
      labelWeight: 600,
    },
    {
      key: "corp",
      variant: "corp",
      pct: corpPct,
      title: `Co-Owned Corp (CCPC): ${formatCurrency(tb.corp)}`,
      labelText: `🏢 ${isCouple ? "Co-Owned Corp" : "Corp"}: ${formatCurrency(tb.corp)} (${corpPct}%)`,
      labelColor: "var(--corp-color)",
      labelWeight: 600,
      hiddenWhenZero: true,
      isZero: tb.corp <= 0,
    },
    {
      key: "tfsa",
      variant: "tfsa",
      pct: tfsaPct,
      title: `TFSA: ${formatCurrency(tb.tfsa)}`,
      labelText: `🟢 ${isCouple ? "Dual TFSAs" : "TFSA"}: ${formatCurrency(tb.tfsa)} (${tfsaPct}%)`,
      labelColor: "var(--tfsa-color)",
      labelWeight: 600,
    },
  ];

  return (
    <article
      className="withdrawal-blueprint-card"
      style={{ marginTop: 0, marginBottom: "0.25rem" }}
    >
      <div className="blueprint-header" style={{ marginBottom: "0.75rem" }}>
        <div>
          <div className="blueprint-title">
            <span>🏦</span> Starting Point at Retirement (Age {state.retireAge}
            {isCouple ? ` & ${state.person2RetireAge}` : ""}) — Asset Breakdown
          </div>
          <div
            style={{
              fontSize: "0.76rem",
              color: "var(--text-secondary)",
              marginTop: "0.15rem",
            }}
          >
            {state.startAtRetirement
              ? "Directly configured retirement nest egg & account allocation"
              : `Projected portfolio accumulated after ${state.yearsAccumulation} years of saving ${formatCurrency(activeAnnualSaving)}/yr`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span
            className="badge-recommended"
            style={{
              background: "rgba(56,189,248,0.18)",
              color: "var(--total-color)",
              border: "1px solid rgba(56,189,248,0.4)",
            }}
          >
            Total Nest Egg: {formatCurrency(tb.total)}
          </span>
          {!state.startAtRetirement ? (
            <button
              type="button"
              id="btn-customize-retire-breakdown"
              className="btn-toggle-expand"
              style={{
                borderColor: "rgba(99,102,241,0.45)",
                color: "var(--rrsp-color)",
                fontWeight: 600,
                padding: "0.25rem 0.65rem",
              }}
              onClick={onCustomizeStartingAssets}
            >
              ✏️ Customize Starting Assets
            </button>
          ) : (
            <button
              type="button"
              id="btn-switch-to-accum"
              className="btn-toggle-expand"
              style={{ padding: "0.25rem 0.65rem" }}
              onClick={onSwitchToAccumulation}
            >
              📈 Switch to Working Years
            </button>
          )}
        </div>
      </div>

      <SegmentedBar
        segments={segments}
        barHeightPx={14}
        wrapperStyle={{ margin: "0.35rem 0 0.85rem 0" }}
      />

      <div className="blueprint-grid" style={{ marginBottom: 0 }}>
        <BlueprintCol
          variant="rrsp"
          icon="🟣"
          title={`${isCouple ? "Person 1 RRSP / RRIF" : "RRSP / RRIF"} (${isCouple ? p1Pct : rrspTotalPct}%)`}
          titleColor="var(--rrsp-color)"
          amountText={formatCurrency(isCouple ? p1Rrsp : tb.rrsp)}
          noteText="100% taxable on withdrawal · Converts to RRIF at 71"
        />
        {isCouple && (
          <BlueprintCol
            variant="rrsp"
            icon="🟣"
            title={`Person 2 RRSP / Spousal (${p2Pct}%)`}
            titleColor="#8b5cf6"
            amountText={formatCurrency(p2Rrsp)}
            noteText="Eligible for 50/50 CRA Form T1032 pension splitting"
            customStyle={{ borderLeftColor: "#8b5cf6" }}
          />
        )}
        <BlueprintCol
          variant="pi"
          icon="🟠"
          title={`Personal Account (PI) (${piPct}%)`}
          titleColor="var(--nonreg-color)"
          amountText={formatCurrency(tb.pi)}
          noteText={`ACB Principal: ${formatCurrency(piCostBasis)} · Cap Gain: ${formatCurrency(piGain)}`}
        />
        {tb.corp > 0 && (
          <BlueprintCol
            variant="corp"
            icon="🏢"
            title={`${isCouple ? "2-Person Co-Owned Corp" : "Private Corp (CCPC)"} (${corpPct}%)`}
            titleColor="var(--corp-color)"
            amountText={formatCurrency(tb.corp)}
            noteText={`Retained Basis: ${formatCurrency(corpCostBasis)} · Tax-Free CDA: ${formatCurrency(corpCda)}`}
          />
        )}
        <BlueprintCol
          variant="tfsa"
          icon="🟢"
          title={`${isCouple ? "Dual TFSAs" : "TFSA"} (${tfsaPct}%)`}
          titleColor="var(--tfsa-color)"
          amountText={formatCurrency(tb.tfsa)}
          noteText={`100% tax-free · Total Tax-Free Cushion: ${formatCurrency(taxFreeCushion)}`}
        />
      </div>
    </article>
  );
}
