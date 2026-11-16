import { ReactNode } from "react";
import { formatCurrency } from "../../formatters";
import { AppState } from "../../state";
import { InlineSliderRow, InlineSliderRowProps } from "../ui/SliderField";

interface PensionFieldProps {
  title: string;
  dispId: string;
  displayValue: string;
  slider: InlineSliderRowProps;
  extraFooter?: ReactNode;
}

function PensionField({
  title,
  dispId,
  displayValue,
  slider,
  extraFooter,
}: PensionFieldProps) {
  return (
    <div className="pension-field-group">
      <div className="pension-field-header">
        <span className="pension-field-title">{title}</span>
        <span className="pension-field-tag" id={dispId}>
          {displayValue}
        </span>
      </div>
      <InlineSliderRow {...slider} />
      {extraFooter}
    </div>
  );
}

interface CppAgeSelectProps {
  selectId: string;
  currentAge: number;
  onChange: (age: number) => void;
}

function CppAgeSelect({ selectId, currentAge, onChange }: CppAgeSelectProps) {
  const ages = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "0.2rem",
        fontSize: "0.73rem",
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>Start Age:</span>
      <select
        id={selectId}
        className="form-input-number"
        style={{ padding: "0.15rem 0.4rem", fontSize: "0.75rem" }}
        value={currentAge}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      >
        {ages.map((a) => {
          const suffix =
            a === 65
              ? "(Standard)"
              : a < 65
                ? `(-${((65 - a) * 7.2).toFixed(0)}%)`
                : `(+${((a - 65) * 8.4).toFixed(0)}%)`;
          return (
            <option key={a} value={a}>
              Age {a} {suffix}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function calcEstimatedGuaranteedCoverage(state: AppState, isCouple: boolean) {
  let estGross = 0;
  if (state.includeOtherIncome) {
    if (state.retireAge >= state.person1CppStartAge) estGross += state.person1CppAnnual;
    if (state.retireAge >= 65) estGross += state.person1OasAnnual;
    if (isCouple) {
      if (state.person2RetireAge >= state.person2CppStartAge) estGross += state.person2CppAnnual;
      if (state.person2RetireAge >= 65) estGross += state.person2OasAnnual;
    }
    if (state.retireAge >= state.employerPensionStartAge) estGross += state.employerPensionAnnual;
    estGross += state.otherTaxableIncome;
  }
  const estNet = Math.round(estGross * 0.85);
  const coveragePct = Math.min(
    100,
    Math.round((estNet / Math.max(1, state.retireNetSpending)) * 100)
  );
  const portfolioShortfall = Math.max(0, state.retireNetSpending - estNet);
  return { estNet, coveragePct, portfolioShortfall };
}

export interface PensionsCardProps {
  state: AppState;
  isCouple: boolean;
  pulseHighlight: boolean;
  onUpdateState: (updater: (prev: AppState) => AppState) => void;
}

export function PensionsCard({
  state,
  isCouple,
  pulseHighlight,
  onUpdateState,
}: PensionsCardProps) {
  const { estNet, coveragePct, portfolioShortfall } = calcEstimatedGuaranteedCoverage(
    state,
    isCouple
  );

  return (
    <div
      className={`pension-income-card ${state.includeOtherIncome ? "enabled" : ""} ${pulseHighlight ? "highlight-pulse" : ""}`}
      id="pension-income-card"
    >
      <div className="pension-card-header">
        <div className="pension-card-title-group">
          <span className="icon">🛡️</span>
          <span>Guaranteed Pensions &amp; Income</span>
        </div>
        <div className="pension-header-actions">
          <label
            className="pension-switch"
            title="Toggle Guaranteed Other Income (CPP/OAS/Pensions)"
          >
            <input
              type="checkbox"
              id="check-other-income"
              checked={state.includeOtherIncome}
              onChange={(e) =>
                onUpdateState((prev) => ({
                  ...prev,
                  includeOtherIncome: e.target.checked,
                }))
              }
            />
            <span className="pension-slider-toggle" />
          </label>
          {state.includeOtherIncome && (
            <button
              type="button"
              id="btn-toggle-income-details"
              className="btn-toggle-expand"
              onClick={() =>
                onUpdateState((prev) => ({
                  ...prev,
                  otherIncomeExpanded: !prev.otherIncomeExpanded,
                }))
              }
            >
              {state.otherIncomeExpanded ? "Collapse ▲" : "Tune Details ▼"}
            </button>
          )}
        </div>
      </div>

      {state.includeOtherIncome ? (
        <>
          <div className="pension-coverage-banner" id="pension-coverage-banner">
            <div className="coverage-metrics-row">
              <span>
                🛡️ Covers: <strong>{formatCurrency(estNet)}/yr net</strong> ({coveragePct}%)
              </span>
              <span>
                💼 Portfolio Bridges: <strong>{formatCurrency(portfolioShortfall)}/yr</strong>
              </span>
            </div>
            <div className="coverage-progress-bar">
              <div className="coverage-seg-pension" style={{ width: `${coveragePct}%` }} />
              <div
                className="coverage-seg-portfolio"
                style={{ width: `${100 - coveragePct}%` }}
              />
            </div>
          </div>

          <div className="pension-presets-container">
            <div className="pension-presets-label">⚡ Quick Canadian Benchmarks</div>
            <div className="pension-presets-grid">
              <button
                type="button"
                className="pension-preset-btn"
                id="preset-pension-standard"
                title="Average Canadian CPP ($10k) + full OAS ($8,560)"
                onClick={() =>
                  onUpdateState((prev) => ({
                    ...prev,
                    includeOtherIncome: true,
                    person1CppAnnual: 10000,
                    person1CppStartAge: 65,
                    person1OasAnnual: 8560,
                    ...(isCouple
                      ? {
                          person2CppAnnual: 8000,
                          person2CppStartAge: 65,
                          person2OasAnnual: 8560,
                        }
                      : {}),
                    employerPensionAnnual: 0,
                    otherTaxableIncome: 0,
                  }))
                }
              >
                🇨🇦 Standard CPP + OAS
              </button>
              <button
                type="button"
                className="pension-preset-btn"
                id="preset-pension-max"
                title="Maximum CRA CPP ($16,375) + full OAS ($8,560)"
                onClick={() =>
                  onUpdateState((prev) => ({
                    ...prev,
                    includeOtherIncome: true,
                    person1CppAnnual: 16375,
                    person1CppStartAge: 65,
                    person1OasAnnual: 8560,
                    ...(isCouple
                      ? {
                          person2CppAnnual: 16375,
                          person2CppStartAge: 65,
                          person2OasAnnual: 8560,
                        }
                      : {}),
                    employerPensionAnnual: 0,
                    otherTaxableIncome: 0,
                  }))
                }
              >
                👑 Max CPP + OAS
              </button>
              <button
                type="button"
                className="pension-preset-btn"
                id="preset-pension-db"
                title="Adds a $30,000/yr Employer Defined Benefit pension"
                onClick={() =>
                  onUpdateState((prev) => ({
                    ...prev,
                    includeOtherIncome: true,
                    person1CppAnnual: 10000,
                    person1CppStartAge: 65,
                    person1OasAnnual: 8560,
                    ...(isCouple
                      ? {
                          person2CppAnnual: 8000,
                          person2CppStartAge: 65,
                          person2OasAnnual: 8560,
                        }
                      : {}),
                    employerPensionAnnual: 30000,
                    employerPensionStartAge: prev.retireAge,
                    otherTaxableIncome: 0,
                  }))
                }
              >
                🏢 DB Pension + CPP
              </button>
              <button
                type="button"
                className="pension-preset-btn"
                id="preset-pension-reset"
                title="Model purely on personal investment savings"
                onClick={() =>
                  onUpdateState((prev) => ({
                    ...prev,
                    includeOtherIncome: false,
                    employerPensionAnnual: 0,
                    otherTaxableIncome: 0,
                  }))
                }
              >
                🚫 Private Only
              </button>
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: "0.45rem",
            lineHeight: 1.4,
          }}
        >
          Turn on to factor in <strong>Canada Pension Plan (CPP)</strong>,{" "}
          <strong>Old Age Security (OAS)</strong>, and <strong>Company Pensions</strong>.
        </div>
      )}

      {state.includeOtherIncome && state.otherIncomeExpanded && (
        <div className="pension-details-body" id="pension-details-body">
          <PensionField
            title={`👤 ${isCouple ? "Person 1 CPP" : "Canada Pension Plan (CPP)"}`}
            dispId="disp-p1-cpp"
            displayValue={`${formatCurrency(state.person1CppAnnual)}/yr`}
            slider={{
              sliderId: "slider-p1-cpp",
              numId: "num-p1-cpp",
              value: state.person1CppAnnual,
              sliderMin: 0,
              sliderMax: 22000,
              numMax: 30000,
              step: 500,
              minVal: 0,
              onChange: (v) =>
                onUpdateState((prev) => ({ ...prev, person1CppAnnual: v })),
            }}
            extraFooter={
              <CppAgeSelect
                selectId="select-p1-cpp-age"
                currentAge={state.person1CppStartAge}
                onChange={(age) =>
                  onUpdateState((prev) => ({ ...prev, person1CppStartAge: age }))
                }
              />
            }
          />

          <PensionField
            title={`🍁 ${isCouple ? "Person 1 OAS" : "Old Age Security (OAS)"}`}
            dispId="disp-p1-oas"
            displayValue={`${formatCurrency(state.person1OasAnnual)}/yr`}
            slider={{
              sliderId: "slider-p1-oas",
              numId: "num-p1-oas",
              value: state.person1OasAnnual,
              sliderMin: 0,
              sliderMax: 12000,
              numMax: 15000,
              step: 250,
              minVal: 0,
              onChange: (v) =>
                onUpdateState((prev) => ({ ...prev, person1OasAnnual: v })),
            }}
            extraFooter={
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                Starts at Age 65 ($8,560 2024-2026 CRA rate). Subject to clawback above $91k.
              </div>
            }
          />

          {isCouple && (
            <>
              <PensionField
                title="👤 Person 2 CPP"
                dispId="disp-p2-cpp"
                displayValue={`${formatCurrency(state.person2CppAnnual)}/yr`}
                slider={{
                  sliderId: "slider-p2-cpp",
                  numId: "num-p2-cpp",
                  value: state.person2CppAnnual,
                  sliderMin: 0,
                  sliderMax: 22000,
                  numMax: 30000,
                  step: 500,
                  minVal: 0,
                  onChange: (v) =>
                    onUpdateState((prev) => ({ ...prev, person2CppAnnual: v })),
                }}
                extraFooter={
                  <CppAgeSelect
                    selectId="select-p2-cpp-age"
                    currentAge={state.person2CppStartAge}
                    onChange={(age) =>
                      onUpdateState((prev) => ({ ...prev, person2CppStartAge: age }))
                    }
                  />
                }
              />

              <PensionField
                title="🍁 Person 2 OAS"
                dispId="disp-p2-oas"
                displayValue={`${formatCurrency(state.person2OasAnnual)}/yr`}
                slider={{
                  sliderId: "slider-p2-oas",
                  numId: "num-p2-oas",
                  value: state.person2OasAnnual,
                  sliderMin: 0,
                  sliderMax: 12000,
                  numMax: 15000,
                  step: 250,
                  minVal: 0,
                  onChange: (v) =>
                    onUpdateState((prev) => ({ ...prev, person2OasAnnual: v })),
                }}
              />
            </>
          )}

          <PensionField
            title="🏢 Employer Defined Benefit (DB) Pension"
            dispId="disp-db-pension"
            displayValue={`${formatCurrency(state.employerPensionAnnual)}/yr`}
            slider={{
              sliderId: "slider-db-pension",
              numId: "num-db-pension",
              value: state.employerPensionAnnual,
              sliderMin: 0,
              sliderMax: 80000,
              numMax: 150000,
              step: 2500,
              minVal: 0,
              onChange: (v) =>
                onUpdateState((prev) => ({ ...prev, employerPensionAnnual: v })),
            }}
            extraFooter={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "0.2rem",
                  fontSize: "0.73rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Pension Starts At:</span>
                <select
                  id="select-db-pension-age"
                  className="form-input-number"
                  style={{ padding: "0.15rem 0.4rem", fontSize: "0.75rem" }}
                  value={state.employerPensionStartAge}
                  onChange={(e) =>
                    onUpdateState((prev) => ({
                      ...prev,
                      employerPensionStartAge: parseInt(e.target.value, 10),
                    }))
                  }
                >
                  {[55, 58, 60, 62, 65, 67, 70].map((a) => (
                    <option key={a} value={a}>
                      Age {a}
                    </option>
                  ))}
                </select>
              </div>
            }
          />

          <PensionField
            title="🏠 Rental or Other Taxable Income"
            dispId="disp-other-inc"
            displayValue={`${formatCurrency(state.otherTaxableIncome)}/yr`}
            slider={{
              sliderId: "slider-other-inc",
              numId: "num-other-inc",
              value: state.otherTaxableIncome,
              sliderMin: 0,
              sliderMax: 60000,
              numMax: 150000,
              step: 2000,
              minVal: 0,
              onChange: (v) =>
                onUpdateState((prev) => ({ ...prev, otherTaxableIncome: v })),
            }}
          />
        </div>
      )}
    </div>
  );
}
