<script lang="ts">
  import { onMount } from 'svelte';
  import { generateLifeGrid, DEFAULT_LIFE_EXPECTANCY } from './lib/lifeLogic';
  import HeroStats from './lib/components/HeroStats.svelte';
  import YearsGrid from './lib/components/YearsGrid.svelte';
  import ControlsPanel from './lib/components/ControlsPanel.svelte';
  import homeIcon from '@static/shared/assets/home.svg?raw';
  
  let now = new Date();
  $: currentYear = now.getFullYear();

  const base = import.meta.env.BASE_URL ?? '/';
  const appIcon = `${base}calendar.svg`;

  // Try to load from local storage, fallback to default
  const storedBirthYear = localStorage.getItem('life_birthYear');
  const storedLifeExpectancy = localStorage.getItem('life_lifeExpectancy');
  const storedActiveAge = localStorage.getItem('life_activeAge');

  let birthYear: number = storedBirthYear ? parseInt(storedBirthYear) : now.getFullYear() - 30;
  let lifeExpectancy: number = storedLifeExpectancy ? parseInt(storedLifeExpectancy) : 100;
  let activeAge: number = storedActiveAge ? parseInt(storedActiveAge) : 80;
  
  onMount(() => {
    const interval = setInterval(() => {
      now = new Date();
    }, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  });

  // Reactive statement to save to local storage when values change
  $: {
    if (birthYear) localStorage.setItem('life_birthYear', birthYear.toString());
    if (lifeExpectancy) localStorage.setItem('life_lifeExpectancy', lifeExpectancy.toString());
    if (activeAge) localStorage.setItem('life_activeAge', activeAge.toString());
  }

  // Reactive statement in Svelte: automatically re-runs when birthYear, lifeExpectancy, activeAge or now changes
  $: gridData = generateLifeGrid(birthYear, lifeExpectancy, activeAge, now);
</script>

<main>
  <div class="header-row">
    <div class="header-title-group">
      <a
        href="https://neilhan.github.io/static"
        class="home-link"
        title="Back to Home"
        aria-label="Back to Home"
      >
        <span class="home-icon" aria-hidden="true">{@html homeIcon}</span>
      </a>
      <span class="breadcrumb-separator">/</span>
      <img src={appIcon} alt="Calendar icon" width="32" height="32" class="header-app-icon" />
      <h1>Life to experience</h1>
    </div>
  </div>
  
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
