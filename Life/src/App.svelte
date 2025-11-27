<script lang="ts">
  import { generateLifeGrid, DEFAULT_LIFE_EXPECTANCY } from './lib/lifeLogic';
  import HeroStats from './lib/components/HeroStats.svelte';
  import YearsGrid from './lib/components/YearsGrid.svelte';
  import ControlsPanel from './lib/components/ControlsPanel.svelte';
  
  const currentYear = new Date().getFullYear();

  // Try to load from local storage, fallback to default
  const storedBirthYear = localStorage.getItem('life_birthYear');
  const storedLifeExpectancy = localStorage.getItem('life_lifeExpectancy');
  const storedActiveAge = localStorage.getItem('life_activeAge');

  let birthYear: number = storedBirthYear ? parseInt(storedBirthYear) : currentYear - 30;
  let lifeExpectancy: number = storedLifeExpectancy ? parseInt(storedLifeExpectancy) : 100;
  let activeAge: number = storedActiveAge ? parseInt(storedActiveAge) : 80;
  
  // Reactive statement to save to local storage when values change
  $: {
    if (birthYear) localStorage.setItem('life_birthYear', birthYear.toString());
    if (lifeExpectancy) localStorage.setItem('life_lifeExpectancy', lifeExpectancy.toString());
    if (activeAge) localStorage.setItem('life_activeAge', activeAge.toString());
  }

  // Reactive statement in Svelte: automatically re-runs when birthYear, lifeExpectancy or activeAge changes
  $: gridData = generateLifeGrid(birthYear, lifeExpectancy, activeAge);
</script>

<main>
  <h1>Life to experience</h1>
  
  <HeroStats
    activeWeeks={gridData.activeWeeks}
    remainingWeeks={gridData.remainingWeeks}
  />

  <ControlsPanel
    bind:birthYear={birthYear}
    bind:lifeExpectancy={lifeExpectancy}
    bind:activeAge={activeAge}
    currentYear={currentYear}
    livedWeeks={gridData.livedWeeks}
    activeWeeks={gridData.activeWeeks}
    retirementWeeks={gridData.retirementWeeks}
    totalWeeks={gridData.totalWeeks}
  />

  <YearsGrid years={gridData.years} />
</main>
