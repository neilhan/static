import { useEffect, useMemo, useRef, useState } from "react";
import {
  compareAllStrategies,
  findMaxSafeSpending,
  HouseholdMode,
  runSimulation,
  simulatePortfolioStrategy,
  StrategyResult,
} from "./calculator";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { RulesSection } from "./components/layout/RulesSection";
import { ComparatorView } from "./components/results/ComparatorView";
import { SimulatorView } from "./components/results/SimulatorView";
import { SidebarPanel } from "./components/sidebar/SidebarPanel";
import {
  AppState,
  computeActiveAnnualSaving,
  createInitialState,
  getComparatorParams,
  getStrategyParams,
  normalizeHouseholdAllocations,
  OptimizeBannerInfo,
} from "./state";

export function App() {
  const [state, setState] = useState<AppState>(() => createInitialState());
  const [optimizeBanner, setOptimizeBanner] = useState<OptimizeBannerInfo | null>(null);
  const [pensionPulse, setPensionPulse] = useState(false);
  const pulseTimerRef = useRef<number | null>(null);

  const isCouple = state.householdMode === "couple";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", state.theme);
    }
  }, [state.theme]);

  useEffect(() => {
    return () => {
      if (pulseTimerRef.current !== null) {
        window.clearTimeout(pulseTimerRef.current);
      }
    };
  }, []);

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(updater);
  };

  const handleToggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === "dark" ? "light" : "dark",
    }));
  };

  const handleSelectHousehold = (mode: HouseholdMode) => {
    setState((prev) => {
      if (prev.householdMode === mode) return prev;
      return normalizeHouseholdAllocations({ ...prev, householdMode: mode });
    });
    setOptimizeBanner(null);
  };

  const handleSelectViewMode = (viewMode: "simulator" | "comparator") => {
    setState((prev) => (prev.viewMode === viewMode ? prev : { ...prev, viewMode }));
  };

  const handleOptimizeSpending = () => {
    const params = getStrategyParams(state);
    const opt = findMaxSafeSpending(params, 95);
    setState((prev) => ({
      ...prev,
      retireNetSpending: opt.maxSpending,
      decumStrategy: opt.bestStrategy,
    }));
    setOptimizeBanner({
      maxSpending: opt.maxSpending,
      depletionAge: opt.strategyResult.depletionAge,
      strategyName: opt.strategyResult.name,
    });
  };

  const handleScenarioBaseline = () => {
    setOptimizeBanner(null);
    setState((prev) => ({
      ...prev,
      startAtRetirement: false,
      retireAge: 65,
      person2RetireAge: 63,
      yearsAccumulation: 15,
      retireNetSpending: 80000,
      corpSaving: 0,
      decumStrategy: "oasShield",
    }));
  };

  const handleScenarioCoupleCorp = () => {
    setOptimizeBanner(null);
    setState((prev) => {
      const next: AppState = {
        ...prev,
        householdMode: "couple",
        viewMode: "simulator",
        retireAge: 65,
        person2RetireAge: 63,
        enableIncomeSplitting: true,
        retireNetSpending: 100000,
        decumStrategy: "oasShield",
      };
      if (prev.startAtRetirement) {
        next.retireStartP1Rrsp = 350000;
        next.retireStartP2Rrsp = 350000;
        next.retireStartPi = 150000;
        next.retireStartCorp = 600000;
        next.retireStartCorpGainPct = 50;
        next.retireStartTfsa = 200000;
        next.retireStartTotal = 1650000;
      } else {
        next.yearsAccumulation = 15;
        next.p1RrspSaving = 20000;
        next.p2RrspSaving = 20000;
        next.piSaving = 5000;
        next.corpSaving = 35000;
        next.annualSaving = computeActiveAnnualSaving(next);
      }
      return next;
    });
  };

  const handleScenarioRetireNow = () => {
    setOptimizeBanner(null);
    setState((prev) => {
      const couple = prev.householdMode === "couple";
      return {
        ...prev,
        startAtRetirement: true,
        retireAge: 65,
        person2RetireAge: 63,
        retireNetSpending: 90000,
        retireStartP1Rrsp: couple ? 350000 : 650000,
        retireStartP2Rrsp: couple ? 350000 : prev.retireStartP2Rrsp,
        retireStartPi: couple ? 200000 : 250000,
        retireStartCorp: 400000,
        retireStartTfsa: 200000,
        retireStartTotal: 1500000,
        retireStartPiGainPct: 50,
        retireStartCorpGainPct: 50,
        decumStrategy: "oasShield",
      };
    });
  };

  const handleScenarioEarly = () => {
    setOptimizeBanner(null);
    setState((prev) => ({
      ...prev,
      startAtRetirement: false,
      retireAge: 58,
      person2RetireAge: 56,
      yearsAccumulation: 18,
      retireNetSpending: 65000,
      decumStrategy: "rrspMeltdown",
    }));
  };

  const handleScenarioFat = () => {
    setOptimizeBanner(null);
    setState((prev) => ({
      ...prev,
      retireNetSpending: 110000,
      decumStrategy: "oasShield",
    }));
  };

  const handleScenarioCppOas = () => {
    setState((prev) => ({
      ...prev,
      includeOtherIncome: true,
      person1CppAnnual: 10000,
      person1CppStartAge: 65,
      person1OasAnnual: 8560,
      ...(prev.householdMode === "couple"
        ? {
            person2CppAnnual: 8000,
            person2CppStartAge: 65,
            person2OasAnnual: 8560,
          }
        : {}),
    }));
  };

  const handleCustomizeStartingAssets = (currentStrat: StrategyResult) => {
    const tb = currentStrat.terminalBalanceAtRetirement;
    setState((prev) => {
      const couple = prev.householdMode === "couple";
      const p1Rrsp = couple
        ? (tb.person1Rrsp ?? Math.round(tb.rrsp * 0.5))
        : tb.rrsp;
      const p2Rrsp = couple
        ? (tb.person2Rrsp ?? Math.max(0, tb.rrsp - p1Rrsp))
        : 0;

      const piGainPct =
        tb.pi > 0 && tb.piUnrealizedGain !== undefined
          ? Math.min(95, Math.max(0, Math.round(((tb.piUnrealizedGain / tb.pi) * 100) / 5) * 5))
          : prev.retireStartPiGainPct;

      const corpGainPct =
        tb.corp > 0 && tb.corpUnrealizedGain !== undefined
          ? Math.min(
              95,
              Math.max(0, Math.round(((tb.corpUnrealizedGain / tb.corp) * 100) / 5) * 5)
            )
          : prev.retireStartCorpGainPct;

      return {
        ...prev,
        retireStartP1Rrsp: p1Rrsp,
        retireStartP2Rrsp: p2Rrsp,
        retireStartPi: tb.pi,
        retireStartPiGainPct: piGainPct,
        retireStartCorp: tb.corp,
        retireStartCorpGainPct: corpGainPct,
        retireStartTfsa: tb.tfsa,
        retireStartTotal: tb.total,
        startAtRetirement: true,
      };
    });

    window.requestAnimationFrame(() => {
      document
        .getElementById("retire-start-assets-card")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const handleEnablePensions = () => {
    setState((prev) => ({
      ...prev,
      includeOtherIncome: true,
      otherIncomeExpanded: true,
    }));
    setPensionPulse(true);
    if (pulseTimerRef.current !== null) {
      window.clearTimeout(pulseTimerRef.current);
    }
    pulseTimerRef.current = window.setTimeout(() => {
      setPensionPulse(false);
    }, 2000);

    window.requestAnimationFrame(() => {
      document
        .getElementById("pension-income-card")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const simulatorData = useMemo(() => {
    if (state.viewMode !== "simulator") return null;
    const strategyParams = getStrategyParams(state);
    const currentStratResult = simulatePortfolioStrategy({
      ...strategyParams,
      decumStrategy: state.decumStrategy,
    });
    const allStratComparisons = compareAllStrategies(strategyParams);
    return { currentStratResult, allStratComparisons };
  }, [state]);

  const comparatorSim = useMemo(() => {
    if (state.viewMode !== "comparator") return null;
    return runSimulation(getComparatorParams(state));
  }, [state]);

  return (
    <div className="container">
      <Header
        isCouple={isCouple}
        theme={state.theme}
        viewMode={state.viewMode}
        onToggleTheme={handleToggleTheme}
        onSelectHousehold={handleSelectHousehold}
        onSelectViewMode={handleSelectViewMode}
        onScenarioBaseline={handleScenarioBaseline}
        onScenarioCoupleCorp={handleScenarioCoupleCorp}
        onScenarioRetireNow={handleScenarioRetireNow}
        onScenarioEarly={handleScenarioEarly}
        onScenarioFat={handleScenarioFat}
        onScenarioCppOas={handleScenarioCppOas}
        onOptimizeSpending={handleOptimizeSpending}
      />

      <main className="main-layout">
        <SidebarPanel
          state={state}
          isCouple={isCouple}
          optimizeBanner={optimizeBanner}
          pensionPulse={pensionPulse}
          onUpdateState={updateState}
          onOptimizeSpending={handleOptimizeSpending}
        />

        <section
          id="results-container"
          className="results-container"
          aria-label="Results"
        >
          {state.viewMode === "simulator" && simulatorData ? (
            <SimulatorView
              currentStrat={simulatorData.currentStratResult}
              allStrats={simulatorData.allStratComparisons}
              state={state}
              isCouple={isCouple}
              onSelectStrategy={(decumStrategy) =>
                setState((prev) => ({ ...prev, decumStrategy }))
              }
              onSelectChartViewMode={(chartViewMode) =>
                setState((prev) => ({ ...prev, chartViewMode }))
              }
              onSelectBlueprintAge={(blueprintSelectedAge) =>
                setState((prev) => ({ ...prev, blueprintSelectedAge }))
              }
              onToggleLedger={() =>
                setState((prev) => ({ ...prev, ledgerOpen: !prev.ledgerOpen }))
              }
              onCustomizeStartingAssets={handleCustomizeStartingAssets}
              onSwitchToAccumulation={() =>
                setState((prev) => ({ ...prev, startAtRetirement: false }))
              }
              onEnablePensions={handleEnablePensions}
            />
          ) : (
            comparatorSim && (
              <ComparatorView
                sim={comparatorSim}
                retireAge={state.retireAge}
                isCouple={isCouple}
              />
            )
          )}
        </section>
      </main>

      <RulesSection />
      <Footer />
    </div>
  );
}

export default App;
