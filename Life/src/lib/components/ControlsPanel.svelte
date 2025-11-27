<script lang="ts">
  export let birthYear: number;
  export let lifeExpectancy: number;
  export let activeAge: number;
  export let currentYear: number;
  export let livedWeeks: number;
  export let activeWeeks: number;
  export let retirementWeeks: number;
  export let totalWeeks: number;
</script>

<div class="controls">
  <div class="input-group">
    <div class="input-wrapper">
      <label for="birthYear">Birth Year</label>
      <input
        id="birthYear"
        type="number"
        bind:value={birthYear}
        min="1900"
        max={currentYear}
      />
    </div>
    <div class="input-wrapper">
      <label for="lifeExpectancy">Lifespan</label>
      <input
        id="lifeExpectancy"
        type="number"
        bind:value={lifeExpectancy}
        min="1"
        max="150"
      />
    </div>
    <div class="input-wrapper">
      <label for="activeAge">Senior Start</label>
      <input
        id="activeAge"
        type="number"
        bind:value={activeAge}
        min="1"
        max={lifeExpectancy}
      />
    </div>
  </div>

  <div class="stats">
    <span>Lived: <strong>{livedWeeks}</strong></span>
    <span>Active Remaining: <strong>{activeWeeks}</strong></span>
    <span>Senior: <strong>{retirementWeeks}</strong></span>
    <span>Total: <strong>{totalWeeks}</strong></span>
  </div>
</div>

