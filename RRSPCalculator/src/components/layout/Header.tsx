import homeIcon from "@static/shared/assets/home.svg?raw";
import { IconGraphic } from "@static/shared";
import { HouseholdMode } from "../../calculator";

export interface HeaderProps {
  isCouple: boolean;
  theme: "dark" | "light";
  viewMode: "simulator" | "comparator";
  onToggleTheme: () => void;
  onSelectHousehold: (mode: HouseholdMode) => void;
  onSelectViewMode: (mode: "simulator" | "comparator") => void;
  onScenarioBaseline: () => void;
  onScenarioCoupleCorp: () => void;
  onScenarioRetireNow: () => void;
  onScenarioEarly: () => void;
  onScenarioFat: () => void;
  onScenarioCppOas: () => void;
  onOptimizeSpending: () => void;
}

export function Header({
  isCouple,
  theme,
  viewMode,
  onToggleTheme,
  onSelectHousehold,
  onSelectViewMode,
  onScenarioBaseline,
  onScenarioCoupleCorp,
  onScenarioRetireNow,
  onScenarioEarly,
  onScenarioFat,
  onScenarioCppOas,
  onOptimizeSpending,
}: HeaderProps) {
  const base = import.meta.env.BASE_URL ?? "./";
  const appIcon = `${base}calculator.svg`;

  return (
    <>
      <header className="app-header">
        <nav className="nav-bar">
          <div className="breadcrumb-group">
            <a
              href="https://neilhan.github.io/static"
              className="home-link"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <IconGraphic
                svgMarkup={homeIcon}
                size="md"
                className="home-icon"
                style={{ width: 18, height: 18 }}
              />
            </a>
            <span className="breadcrumb-sep">/</span>
            <span className="badge-tag">RETIREMENT STRATEGY ENGINE</span>
          </div>
          <button
            id="theme-toggle"
            className="theme-toggle-btn"
            aria-label="Toggle theme"
            onClick={onToggleTheme}
          >
            {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </nav>

        <div className="hero-banner">
          <img src={appIcon} alt="Calculator Logo" className="app-logo" />
          <div className="hero-text">
            <h1>
              {isCouple
                ? "Couples Retirement Strategy Simulator"
                : "Canadian Retirement Strategy Simulator"}
            </h1>
            <p>
              {isCouple
                ? "Optimize household savings across Person 1 RRSP, Person 2 RRSP, Personal Accounts, and a 2-Person Co-Owned Corp (CCPC / HoldCo). Model CRA pension & dividend splitting, CDA tax-free dividends, and dual OAS clawback shields."
                : "Optimize accumulation allocation (RRSP vs. Personal Investment vs. Private Corp vs. TFSA) and decumulation sequence to minimize lifetime taxes and shield your OAS pension."}
            </p>
          </div>
        </div>
      </header>

      <div className="household-toggle-wrapper">
        <div className="household-pills">
          <button
            id="btn-household-single"
            className={`household-pill ${!isCouple ? "active" : ""}`}
            onClick={() => onSelectHousehold("single")}
          >
            👤 Single Individual
          </button>
          <button
            id="btn-household-couple"
            className={`household-pill ${isCouple ? "active" : ""}`}
            onClick={() => onSelectHousehold("couple")}
          >
            👥 Couple (2 Persons / Spousal)
          </button>
        </div>
      </div>

      <nav className="app-nav-tabs" aria-label="View Mode">
        <button
          id="tab-mode-sim"
          className={`nav-tab-btn ${viewMode === "simulator" ? "active" : ""}`}
          onClick={() => onSelectViewMode("simulator")}
        >
          🎯 Strategy Simulator & Optimizer
        </button>
        <button
          id="tab-mode-comp"
          className={`nav-tab-btn ${viewMode === "comparator" ? "active" : ""}`}
          onClick={() => onSelectViewMode("comparator")}
        >
          ⚖️ Direct Account Comparison (RRSP vs PI vs Corp vs TFSA)
        </button>
      </nav>

      <div className="scenario-playbook-bar" aria-label="Quick Experiment Scenarios">
        <span className="scenario-playbook-label">🧪 Quick Scenarios:</span>
        <button
          type="button"
          className="scenario-chip"
          id="chip-scenario-baseline"
          onClick={onScenarioBaseline}
        >
          🎯 Benchmark ($80k @ 65)
        </button>
        <button
          type="button"
          className="scenario-chip"
          id="chip-scenario-couple-corp"
          style={{ borderColor: "rgba(244,114,182,0.5)", color: "var(--corp-color)" }}
          onClick={onScenarioCoupleCorp}
        >
          🏢 2-Person Co-Owned Corp
        </button>
        <button
          type="button"
          className="scenario-chip"
          id="chip-scenario-retire-now"
          style={{ borderColor: "rgba(168,85,247,0.45)", color: "#c084fc" }}
          onClick={onScenarioRetireNow}
        >
          🏦 Start @ Retirement ($1.5M + Corp)
        </button>
        <button
          type="button"
          className="scenario-chip"
          id="chip-scenario-early"
          onClick={onScenarioEarly}
        >
          🏖️ Early Freedom (Age 58, $65k)
        </button>
        <button
          type="button"
          className="scenario-chip"
          id="chip-scenario-fat"
          onClick={onScenarioFat}
        >
          🏰 High Lifestyle ($110k)
        </button>
        <button
          type="button"
          className="scenario-chip"
          id="chip-scenario-cppoas"
          style={{ borderColor: "rgba(59,130,246,0.45)", color: "#60a5fa" }}
          onClick={onScenarioCppOas}
        >
          🛡️ +CPP & OAS Guaranteed
        </button>
        <button
          type="button"
          className="scenario-chip"
          id="chip-scenario-optimize"
          style={{ borderColor: "rgba(16,185,129,0.45)", color: "#10b981" }}
          onClick={onOptimizeSpending}
        >
          ⚡ Auto-Max Safe Spend (to 95)
        </button>
      </div>
    </>
  );
}
