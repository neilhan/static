import { formatCompact, formatCurrency } from "../../formatters";
import {
  AppState,
  applyRetireStartPreset,
  computeActiveRetireStartTotal,
  scaleRetireStartTotal,
  updateIndividualRetireStart,
} from "../../state";
import { AccountAllocCard } from "../ui/AccountAllocCard";
import { BarSegmentItem, SegmentedBar } from "../ui/SegmentedBar";
import { SliderField } from "../ui/SliderField";

export interface RetirementStartAssetsProps {
  state: AppState;
  isCouple: boolean;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export function RetirementStartAssets({
  state,
  isCouple,
  onUpdateState,
}: RetirementStartAssetsProps) {
  const total = computeActiveRetireStartTotal(state);
  const safeTotal = Math.max(1, total);

  const p1Pct = Math.round((state.retireStartP1Rrsp / safeTotal) * 100);
  const p2Pct = isCouple ? Math.round((state.retireStartP2Rrsp / safeTotal) * 100) : 0;
  const piPct = Math.round((state.retireStartPi / safeTotal) * 100);
  const corpPct = Math.round((state.retireStartCorp / safeTotal) * 100);
  const tfsaPct = Math.max(0, 100 - p1Pct - p2Pct - piPct - corpPct);

  const totalRrsp = isCouple
    ? state.retireStartP1Rrsp + state.retireStartP2Rrsp
    : state.retireStartP1Rrsp;
  const piGainDollars = Math.round(state.retireStartPi * (state.retireStartPiGainPct / 100));
  const piAcbDollars = Math.max(0, state.retireStartPi - piGainDollars);
  const corpGainDollars = Math.round(
    state.retireStartCorp * (state.retireStartCorpGainPct / 100)
  );
  const corpCdaDollars = Math.round(corpGainDollars * 0.5);
  const taxFreePool = state.retireStartTfsa + piAcbDollars + corpCdaDollars;

  const segments: BarSegmentItem[] = [
    {
      key: "p1",
      segId: "retire-seg-p1",
      lblId: "retire-lbl-p1",
      variant: "p1",
      pct: p1Pct,
      labelText: `${isCouple ? "P1 RRSP" : "RRSP"}: ${p1Pct}% (${formatCompact(state.retireStartP1Rrsp)})`,
      labelColor: "var(--rrsp-color)",
    },
    ...(isCouple
      ? [
          {
            key: "p2",
            segId: "retire-seg-p2",
            lblId: "retire-lbl-p2",
            variant: "p2",
            pct: p2Pct,
            labelText: `P2 RRSP: ${p2Pct}% (${formatCompact(state.retireStartP2Rrsp)})`,
            labelColor: "#8b5cf6",
          },
        ]
      : []),
    {
      key: "pi",
      segId: "retire-seg-pi",
      lblId: "retire-lbl-pi",
      variant: "pi",
      pct: piPct,
      labelText: `PI: ${piPct}% (${formatCompact(state.retireStartPi)})`,
      labelColor: "var(--nonreg-color)",
    },
    {
      key: "corp",
      segId: "retire-seg-corp",
      lblId: "retire-lbl-corp",
      variant: "corp",
      pct: corpPct,
      labelText: `Corp: ${corpPct}% (${formatCompact(state.retireStartCorp)})`,
      labelColor: "var(--corp-color)",
      hiddenWhenZero: true,
      isZero: state.retireStartCorp === 0,
    },
    {
      key: "tfsa",
      segId: "retire-seg-tfsa",
      lblId: "retire-lbl-tfsa",
      variant: "tfsa",
      pct: tfsaPct,
      labelText: `TFSA: ${tfsaPct}% (${formatCompact(state.retireStartTfsa)})`,
      labelColor: "var(--tfsa-color)",
    },
  ];

  return (
    <>
      <SliderField
        id="retire-start-assets-card"
        label={isCouple ? "Combined Portfolio at Retirement" : "Starting Portfolio at Retirement"}
        sliderId="slider-retire-total"
        numId="num-retire-total"
        dispId="disp-retire-total"
        displayContent={formatCurrency(total)}
        displayStyle={{ color: "var(--total-color)" }}
        value={total}
        sliderMin={50000}
        sliderMax={6000000}
        numMin={0}
        numMax={25000000}
        step={25000}
        minVal={0}
        onChange={(v) => onUpdateState((prev) => scaleRetireStartTotal(prev, v))}
      />

      <div className="form-group">
        <div className="form-label-row">
          <label className="form-label">🏦 Retirement Starting Asset Breakdown</label>
        </div>

        <SegmentedBar segments={segments} />

        <div className="alloc-presets-grid">
          {isCouple ? (
            <>
              <button
                type="button"
                id="retire-preset-couple-equal"
                className="alloc-preset-btn"
                onClick={() => onUpdateState((prev) => applyRetireStartPreset(prev, 0.3, 0.3, 0.25, 0))}
              >
                ⚡ Equal RRSPs (30/30/25/15)
              </button>
              <button
                type="button"
                id="retire-preset-couple-corp"
                className="alloc-preset-btn"
                style={{ borderColor: "rgba(244,114,182,0.45)", color: "var(--corp-color)" }}
                onClick={() => onUpdateState((prev) => applyRetireStartPreset(prev, 0.2, 0.2, 0.1, 0.35))}
              >
                🏢 +Co-Owned Corp Mix
              </button>
              <button
                type="button"
                id="retire-preset-couple-taxfree"
                className="alloc-preset-btn"
                onClick={() => onUpdateState((prev) => applyRetireStartPreset(prev, 0.2, 0.2, 0.3, 0))}
              >
                🛡️ Tax-Efficient (20/20/30/30)
              </button>
              <button
                type="button"
                id="retire-preset-couple-allrrsp"
                className="alloc-preset-btn"
                onClick={() => onUpdateState((prev) => applyRetireStartPreset(prev, 0.5, 0.5, 0, 0))}
              >
                🟣 100% RRSP (50/50)
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                id="retire-preset-single-balanced"
                className="alloc-preset-btn"
                onClick={() => onUpdateState((prev) => applyRetireStartPreset(prev, 0.6, 0, 0.25, 0))}
              >
                ⚖️ 60% RRSP / 25% PI / 15% TFSA
              </button>
              <button
                type="button"
                id="retire-preset-single-corp"
                className="alloc-preset-btn"
                style={{ borderColor: "rgba(244,114,182,0.45)", color: "var(--corp-color)" }}
                onClick={() => onUpdateState((prev) => applyRetireStartPreset(prev, 0.35, 0, 0.1, 0.4))}
              >
                🏢 +Corp HoldCo Mix
              </button>
              <button
                type="button"
                id="retire-preset-single-taxfree"
                className="alloc-preset-btn"
                onClick={() => onUpdateState((prev) => applyRetireStartPreset(prev, 0.4, 0, 0.3, 0))}
              >
                🛡️ 40% RRSP / 30% PI / 30% TFSA
              </button>
              <button
                type="button"
                id="retire-preset-single-allrrsp"
                className="alloc-preset-btn"
                onClick={() => onUpdateState((prev) => applyRetireStartPreset(prev, 1.0, 0, 0, 0))}
              >
                💰 100% RRSP
              </button>
            </>
          )}
        </div>

        <AccountAllocCard
          variant="p1"
          icon="🟣"
          title={isCouple ? "Person 1 RRSP / RRIF" : "RRSP / RRIF Balance"}
          badgeId="retire-badge-p1"
          badgeClass="alloc-share-badge rrsp"
          badgeText={`${p1Pct}% of portfolio`}
          subtitle="100% Taxable · RRIF at 71"
          dispId="disp-retire-p1-rrsp"
          displayValue={formatCurrency(state.retireStartP1Rrsp)}
          slider={{
            sliderId: "slider-retire-p1-rrsp",
            numId: "num-retire-p1-rrsp",
            value: state.retireStartP1Rrsp,
            sliderMin: 0,
            sliderMax: 3000000,
            numMax: 15000000,
            step: 10000,
            minVal: 0,
            onChange: (v) =>
              onUpdateState((prev) => updateIndividualRetireStart(prev, { retireStartP1Rrsp: v })),
          }}
        />

        {isCouple && (
          <AccountAllocCard
            variant="p2"
            icon="🟣"
            title="Person 2 RRSP / Spousal"
            badgeId="retire-badge-p2"
            badgeClass="alloc-share-badge p2"
            badgeText={`${p2Pct}% of portfolio`}
            subtitle="Eligible for 50/50 Split"
            dispId="disp-retire-p2-rrsp"
            displayValue={formatCurrency(state.retireStartP2Rrsp)}
            slider={{
              sliderId: "slider-retire-p2-rrsp",
              numId: "num-retire-p2-rrsp",
              value: state.retireStartP2Rrsp,
              sliderMin: 0,
              sliderMax: 3000000,
              numMax: 15000000,
              step: 10000,
              minVal: 0,
              onChange: (v) =>
                onUpdateState((prev) => updateIndividualRetireStart(prev, { retireStartP2Rrsp: v })),
            }}
          />
        )}

        <AccountAllocCard
          variant="pi"
          icon="🟠"
          title={isCouple ? "Joint Personal Account (PI)" : "Personal Investment (PI)"}
          badgeId="retire-badge-pi"
          badgeClass="alloc-share-badge pi"
          badgeText={`${piPct}% of portfolio`}
          subtitle="Taxable Non-Registered"
          dispId="disp-retire-pi"
          displayValue={formatCurrency(state.retireStartPi)}
          slider={{
            sliderId: "slider-retire-pi",
            numId: "num-retire-pi",
            value: state.retireStartPi,
            sliderMin: 0,
            sliderMax: 3000000,
            numMax: 15000000,
            step: 10000,
            minVal: 0,
            onChange: (v) =>
              onUpdateState((prev) => updateIndividualRetireStart(prev, { retireStartPi: v })),
          }}
          subSlider={{
            label: "Unrealized Capital Gains %:",
            dispId: "disp-retire-pi-gain",
            displayText: `${state.retireStartPiGainPct}% Gain (${formatCompact(piGainDollars)}) · ACB: ${formatCompact(piAcbDollars)}`,
            color: "var(--nonreg-color)",
            sliderId: "slider-retire-pi-gain",
            value: state.retireStartPiGainPct,
            onChange: (v) =>
              onUpdateState((prev) => ({ ...prev, retireStartPiGainPct: v })),
          }}
        />

        <AccountAllocCard
          variant="corp"
          icon="🏢"
          title={isCouple ? "2-Person Co-Owned Corp (CCPC)" : "Private Corp (CCPC / HoldCo)"}
          badgeId="retire-badge-corp"
          badgeClass="alloc-share-badge corp"
          badgeText={`${corpPct}% of portfolio`}
          subtitle={
            isCouple ? "50/50 Spousal Dividends + Tax-Free CDA" : "CCPC Dividends + Tax-Free CDA"
          }
          dispId="disp-retire-corp"
          displayValue={formatCurrency(state.retireStartCorp)}
          slider={{
            sliderId: "slider-retire-corp",
            numId: "num-retire-corp",
            value: state.retireStartCorp,
            sliderMin: 0,
            sliderMax: 4000000,
            numMax: 20000000,
            step: 10000,
            minVal: 0,
            onChange: (v) =>
              onUpdateState((prev) => updateIndividualRetireStart(prev, { retireStartCorp: v })),
          }}
          subSlider={{
            label: "Corp Unrealized Cap Gains %:",
            dispId: "disp-retire-corp-gain",
            displayText: `${state.retireStartCorpGainPct}% Gain · Tax-Free CDA: ${formatCompact(corpCdaDollars)}`,
            color: "var(--corp-color)",
            sliderId: "slider-retire-corp-gain",
            value: state.retireStartCorpGainPct,
            onChange: (v) =>
              onUpdateState((prev) => ({ ...prev, retireStartCorpGainPct: v })),
          }}
        />

        <AccountAllocCard
          variant="tfsa"
          icon="🟢"
          title={isCouple ? "Combined Dual TFSAs" : "TFSA Balance"}
          badgeId="retire-badge-tfsa"
          badgeClass="alloc-share-badge tfsa"
          badgeText={`${tfsaPct}% of portfolio`}
          subtitle="100% Tax-Free Growth & Draw"
          dispId="disp-retire-tfsa"
          displayValue={formatCurrency(state.retireStartTfsa)}
          slider={{
            sliderId: "slider-retire-tfsa",
            numId: "num-retire-tfsa",
            value: state.retireStartTfsa,
            sliderMin: 0,
            sliderMax: 1500000,
            numMax: 10000000,
            step: 5000,
            minVal: 0,
            onChange: (v) =>
              onUpdateState((prev) => updateIndividualRetireStart(prev, { retireStartTfsa: v })),
          }}
        />

        <div
          className="refund-summary-box"
          style={{
            background: "rgba(56,189,248,0.07)",
            borderColor: "rgba(56,189,248,0.25)",
          }}
        >
          <div className="refund-summary-header" style={{ marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
              🛡️ Tax-Free TFSA + ACB + Corp CDA Cushion
            </span>
            <span
              id="retire-taxfree-val"
              className="refund-summary-val"
              style={{ color: "var(--tfsa-color)", fontSize: "0.88rem" }}
            >
              {formatCurrency(taxFreePool)}
            </span>
          </div>
          <div
            id="retire-tax-character-note"
            style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.35 }}
          >
            <strong>Taxable RRSP:</strong> {formatCurrency(totalRrsp)}
            {state.retireStartCorp > 0 && (
              <>
                {" "}
                · <strong>Corp:</strong> {formatCurrency(state.retireStartCorp)}
              </>
            )}{" "}
            · <strong>Tax-Free Cushion:</strong> {formatCurrency(taxFreePool)}
          </div>
        </div>
      </div>
    </>
  );
}
