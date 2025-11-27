<script lang="ts">
  import type { YearData } from '../../lib/lifeLogic';

  export let years: YearData[];
</script>

<div class="years-container">
  {#each years as year}
    <div class="year-row" title={`Year ${year.year} (Age ${year.age})`}>
      <div class="year-label">
        {year.age % 5 === 0 ? year.age : '\u00A0'}
      </div>
      <div class="weeks-grid">
        {#each year.weeks as week}
          <div 
            class={`cell ${week.status}`} 
            title={`Week ${week.weekInYear} of ${year.year}`}
          ></div>
        {/each}
      </div>
    </div>
  {/each}
</div>

