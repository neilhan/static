import { formatCurrency } from "../../formatters";
import { AppState, computeActiveAnnualSaving, updateIndividualSaving } from "../../state";
import { AccountAllocCard } from "../ui/AccountAllocCard";
import { BarSegmentItem, SegmentedBar } from "../ui/SegmentedBar";

export interface SavingsAllocationProps {
  state: AppState;
  isCouple: boolean;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export function SavingsAllocation({
  state,
  isCouple,
  onUpdateState,
}: SavingsAllocationProps) {
  const total = computeActiveAnnualSaving(state);
  const safeTotal = Math.max(1, total);

  const p1Pct = Math.round((state.p1RrspSaving / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((state.p2RrspSaving / safeTotal) * 100) : 0;
  const corpPct = Math.round((state.corpSaving / safeTotal) * 100);
  const piPct = Math.max(0, 100 - p1Pct - p2Pct - corpPct);

  const p1Refund = Math.round(state.p1RrspSaving * state.workTaxRate);
  const p2Refund = Math.round(state.p2RrspSaving * state.person2WorkTaxRate);
  const totalRefund = isCouple ? p1Refund + p2Refund : p1Refund;

  const segments: BarSegmentItem[] = [
    {
      key: "p1",
      segId: "alloc-seg-p1",
      lblId: "alloc-lbl-p1",
      variant: "p1",
      pct: p1Pct,
      labelText: `${isCouple ? "P1 RRSP" : "RRSP"}: ${p1Pct}% (${formatCurrency(state.p1RrspSaving)})`,
      labelColor: "var(--rrsp-color)",
    },
    ...(isCouple
      ? [
          {
            key: "p2",
            segId: "alloc-seg-p2",
            lblId: "alloc-lbl-p2",
            variant: "p2",
            pct: p2Pct,
            labelText: `P2 RRSP: ${p2Pct}% (${formatCurrency(state.p2RrspSaving)})`,
            labelColor: "#8b5cf6",
          },
        ]
      : []),
    {
      key: "pi",
      segId: "alloc-seg-pi",
      lblId: "alloc-lbl-pi",
      variant: "pi",
      pct: piPct,
      labelText: `PI: ${piPct}% (${formatCurrency(state.piSaving)})`,
      labelColor: "var(--nonreg-color)",
    },
    {
      key: "corp",
      segId: "alloc-seg-corp",
      lblId: "alloc-lbl-corp",
      variant: "corp",
      pct: corpPct,
      labelText: `Corp: ${corpPct}% (${formatCurrency(state.corpSaving)})`,
      labelColor: "var(--corp-color)",
      hiddenWhenZero: true,
      isZero: state.corpSaving === 0,
    },
  ];

  const applyPreset = (fn: (prev: AppState) => AppState) => {
    onUpdateState((prev) => {
      const updated = fn(prev);
      return { ...updated, annualSaving: computeActiveAnnualSaving(updated) };
    });
  };

  return (
    <div className="form-group">
      <div className="form-label-row">
        <label className="form-label">
          {isCouple
            ? "Household Savings Allocation (RRSP / PI / Co-Owned Corp)"
            : "Savings Allocation (RRSP / PI / Corp)"}
        </label>
      </div>

      <SegmentedBar segments={segments} />

      <div className="alloc-presets-grid">
        {isCouple ? (
          <>
            <button
              type="button"
              id="preset-couple-equal"
              className="alloc-preset-btn"
              onClick={() =>
                applyPreset((prev) => {
                  const rrspPool = Math.min(prev.annualSaving, 32490 * 2);
                  const half = Math.min(32490, Math.floor(rrspPool / 2));
                  return {
                    ...prev,
                    p1RrspSaving: half,
                    p2RrspSaving: half,
                    corpSaving: 0,
                    piSaving: Math.max(0, prev.annualSaving - half * 2),
                  };
                })
              }
            >
              ⚡ 50/50 Equal RRSPs
            </button>
            <button
              type="button"
              id="preset-couple-corp"
              className="alloc-preset-btn"
              style={{ borderColor: "rgba(244,114,182,0.45)", color: "var(--corp-color)" }}
              onClick={() =>
                applyPreset((prev) => {
                  const base = Math.max(prev.annualSaving, 70000);
                  const p1 = Math.min(32490, Math.round((base * 0.25) / 500) * 500);
                  const p2 = Math.min(32490, Math.round((base * 0.25) / 500) * 500);
                  const corp = Math.round((base * 0.4) / 1000) * 1000;
                  return {
                    ...prev,
                    p1RrspSaving: p1,
                    p2RrspSaving: p2,
                    corpSaving: corp,
                    piSaving: Math.max(0, base - p1 - p2 - corp),
                  };
                })
              }
            >
              🏢 +Co-Owned Corp
            </button>
            <button
              type="button"
              id="preset-couple-highearner"
              className="alloc-preset-btn"
              onClick={() =>
                applyPreset((prev) => {
                  const p1 = Math.min(32490, prev.annualSaving);
                  const remainder = Math.max(0, prev.annualSaving - p1);
                  const p2 = Math.min(32490, remainder);
                  return {
                    ...prev,
                    p1RrspSaving: p1,
                    p2RrspSaving: p2,
                    corpSaving: 0,
                    piSaving: Math.max(0, remainder - p2),
                  };
                })
              }
            >
              💼 High-Earner First (P1)
            </button>
            <button
              type="button"
              id="preset-couple-balanced"
              className="alloc-preset-btn"
              onClick={() =>
                applyPreset((prev) => {
                  const rrspTarget = Math.round(prev.annualSaving * 0.7);
                  const p1 = Math.min(32490, Math.floor(rrspTarget / 2));
                  const p2 = Math.min(32490, rrspTarget - p1);
                  return {
                    ...prev,
                    p1RrspSaving: p1,
                    p2RrspSaving: p2,
                    corpSaving: 0,
                    piSaving: Math.max(0, prev.annualSaving - p1 - p2),
                  };
                })
              }
            >
              ⚖️ 70% RRSP / 30% PI
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              id="preset-single-max"
              className="alloc-preset-btn"
              onClick={() =>
                applyPreset((prev) => {
                  const p1 = Math.min(32490, prev.annualSaving);
                  return {
                    ...prev,
                    p1RrspSaving: p1,
                    corpSaving: 0,
                    piSaving: Math.max(0, prev.annualSaving - p1),
                  };
                })
              }
            >
              🚀 Max RRSP ($32,490)
            </button>
            <button
              type="button"
              id="preset-single-corp"
              className="alloc-preset-btn"
              style={{ borderColor: "rgba(244,114,182,0.45)", color: "var(--corp-color)" }}
              onClick={() =>
                applyPreset((prev) => {
                  const base = Math.max(prev.annualSaving, 60000);
                  const p1 = Math.min(32490, Math.round((base * 0.4) / 500) * 500);
                  const corp = Math.round((base * 0.5) / 1000) * 1000;
                  return {
                    ...prev,
                    p1RrspSaving: p1,
                    corpSaving: corp,
                    piSaving: Math.max(0, base - p1 - corp),
                  };
                })
              }
            >
              🏢 +Private Corp
            </button>
            <button
              type="button"
              id="preset-single-balanced"
              className="alloc-preset-btn"
              onClick={() =>
                applyPreset((prev) => {
                  const p1 = Math.min(32490, Math.round(prev.annualSaving * 0.7));
                  return {
                    ...prev,
                    p1RrspSaving: p1,
                    corpSaving: 0,
                    piSaving: Math.max(0, prev.annualSaving - p1),
                  };
                })
              }
            >
              ⚖️ 70% RRSP / 30% PI
            </button>
            <button
              type="button"
              id="preset-single-all"
              className="alloc-preset-btn"
              onClick={() =>
                applyPreset((prev) => ({
                  ...prev,
                  p1RrspSaving: Math.min(32490, prev.annualSaving),
                  piSaving: 0,
                  corpSaving: 0,
                }))
              }
            >
              💰 100% RRSP
            </button>
          </>
        )}
      </div>

      <AccountAllocCard
        variant="p1"
        icon="👤"
        title={isCouple ? "Person 1 RRSP" : "RRSP Contribution"}
        badgeId="refund-badge-p1"
        badgeClass="alloc-refund-badge"
        badgeText={`+${formatCurrency(p1Refund)} tax refund`}
        subtitle="Max CRA Limit: $32,490/yr"
        dispId="disp-p1-rrsp"
        displayValue={formatCurrency(state.p1RrspSaving)}
        slider={{
          sliderId: "slider-p1-rrsp",
          numId: "num-p1-rrsp",
          value: state.p1RrspSaving,
          sliderMin: 0,
          sliderMax: 32490,
          step: 500,
          minVal: 0,
          onChange: (v) =>
            onUpdateState((prev) => updateIndividualSaving(prev, { p1RrspSaving: v })),
        }}
      />

      {isCouple && (
        <AccountAllocCard
          variant="p2"
          icon="👤"
          title="Person 2 RRSP / Spousal"
          badgeId="refund-badge-p2"
          badgeClass="alloc-refund-badge"
          badgeText={`+${formatCurrency(p2Refund)} tax refund`}
          subtitle="Max CRA Limit: $32,490/yr"
          dispId="disp-p2-rrsp"
          displayValue={formatCurrency(state.p2RrspSaving)}
          slider={{
            sliderId: "slider-p2-rrsp",
            numId: "num-p2-rrsp",
            value: state.p2RrspSaving,
            sliderMin: 0,
            sliderMax: 32490,
            step: 500,
            minVal: 0,
            onChange: (v) =>
              onUpdateState((prev) => updateIndividualSaving(prev, { p2RrspSaving: v })),
          }}
        />
      )}

      <AccountAllocCard
        variant="pi"
        icon="📈"
        title={isCouple ? "Household Personal Account (PI)" : "Personal Investment (PI)"}
        badgeText="50% Capital Gains"
        subtitle="Taxable Non-Registered"
        dispId="disp-pi"
        displayValue={formatCurrency(state.piSaving)}
        slider={{
          sliderId: "slider-pi",
          numId: "num-pi",
          value: state.piSaving,
          sliderMin: 0,
          sliderMax: 100000,
          numMax: 250000,
          step: 1000,
          minVal: 0,
          onChange: (v) =>
            onUpdateState((prev) => updateIndividualSaving(prev, { piSaving: v })),
        }}
      />

      <AccountAllocCard
        variant="corp"
        icon="🏢"
        title={isCouple ? "2-Person Co-Owned Corp (CCPC)" : "Private Corp (CCPC / HoldCo)"}
        badgeClass="alloc-share-badge corp"
        badgeText="12.2% SBD · CDA + Divs"
        subtitle={
          isCouple
            ? "Retained Earnings Invested Inside Co-Owned HoldCo"
            : "Retained Earnings Invested Inside Corp"
        }
        dispId="disp-corp"
        displayValue={formatCurrency(state.corpSaving)}
        slider={{
          sliderId: "slider-corp",
          numId: "num-corp",
          value: state.corpSaving,
          sliderMin: 0,
          sliderMax: 150000,
          numMax: 400000,
          step: 1000,
          minVal: 0,
          onChange: (v) =>
            onUpdateState((prev) => updateIndividualSaving(prev, { corpSaving: v })),
        }}
      />

      <div className="refund-summary-box">
        <div className="refund-summary-header">
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>
            🎁 Annual Household Tax Refund
          </span>
          <span id="total-refund-val" className="refund-summary-val">
            +{formatCurrency(totalRefund)}/yr
          </span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
          Reinvest this tax refund annually into:
        </div>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button
            type="button"
            className={`preset-btn ${state.reinvestRefundTo === "tfsa" ? "active" : ""}`}
            id="refund-tfsa"
            onClick={() => onUpdateState((prev) => ({ ...prev, reinvestRefundTo: "tfsa" }))}
          >
            {isCouple ? "Dual TFSAs" : "TFSA"}
          </button>
          <button
            type="button"
            className={`preset-btn ${state.reinvestRefundTo === "pi" ? "active" : ""}`}
            id="refund-pi"
            onClick={() => onUpdateState((prev) => ({ ...prev, reinvestRefundTo: "pi" }))}
          >
            Personal (PI)
          </button>
          <button
            type="button"
            className={`preset-btn ${state.reinvestRefundTo === "none" ? "active" : ""}`}
            id="refund-none"
            onClick={() => onUpdateState((prev) => ({ ...prev, reinvestRefundTo: "none" }))}
          >
            Spend
          </button>
        </div>
      </div>
    </div>
  );
}
