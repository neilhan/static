<script lang="ts">
  import { generateLifeGrid, DEFAULT_LIFE_EXPECTANCY } from './lib/lifeLogic';
  
  // Try to load from local storage, fallback to default
  const storedBirthYear = localStorage.getItem('life_birthYear');
  const storedLifeExpectancy = localStorage.getItem('life_lifeExpectancy');
  const storedActiveAge = localStorage.getItem('life_activeAge');

  let birthYear: number = storedBirthYear ? parseInt(storedBirthYear) : new Date().getFullYear() - 30;
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
  <h1>Weeks to experience</h1>
  
  <div class="hero-stat">
    <div class="hero-group">
      <span class="hero-number active">{gridData.activeWeeks}</span>
      <span class="hero-label">Active Remaining</span>
    </div>
    <div class="hero-divider"></div>
    <div class="hero-group">
      <span class="hero-number total">{gridData.remainingWeeks}</span>
      <span class="hero-label">Total Remaining</span>
    </div>
  </div>

  <div class="controls">
    <div class="input-group">
      <div class="input-wrapper">
        <label for="birthYear">Birth Year</label>
        <input id="birthYear" type="number" bind:value={birthYear} min="1900" max={new Date().getFullYear()} />
      </div>
      <div class="input-wrapper">
        <label for="lifeExpectancy">Lifespan</label>
        <input id="lifeExpectancy" type="number" bind:value={lifeExpectancy} min="1" max="150" />
      </div>
      <div class="input-wrapper">
        <label for="activeAge">Senior Start</label>
        <input id="activeAge" type="number" bind:value={activeAge} min="1" max={lifeExpectancy} />
      </div>
    </div>
    
    <div class="stats">
      <span>Lived: <strong>{gridData.livedWeeks}</strong></span>
      <span>Active Remaining: <strong>{gridData.activeWeeks}</strong></span>
      <span>Senior: <strong>{gridData.retirementWeeks}</strong></span>
      <span>Total: <strong>{gridData.totalWeeks}</strong></span>
    </div>
  </div>

  <div class="years-container">
    {#each gridData.years as year}
      <div class="year-row" title="Year {year.year} (Age {year.age})">
        <div class="year-label">
          {year.age % 5 === 0 ? year.age : '\u00A0'}
        </div>
        <div class="weeks-grid">
          {#each year.weeks as week}
            <div 
              class="cell {week.status}" 
              title="Week {week.weekInYear} of {year.year}"
            ></div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</main>
