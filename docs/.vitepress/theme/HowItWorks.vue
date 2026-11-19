<script setup lang="ts">
// The "how it works" diagram: what happens to a .vue file with a Pug template, from parsing to the
// fix guard. Plain HTML and CSS, so it follows the site's light and dark colors and reflows on a
// phone. Each box names the package that does the work.
</script>

<template>
  <figure class="HowItWorks" aria-label="How eslint-plugin-pug-vue lints a Pug template">
    <ol class="flow">
      <li class="step">
        <div class="box file">
          <span class="who">your code</span>
          <strong>A <code>.vue</code> file</strong>
          <code class="snippet">&lt;template lang="pug"&gt;</code>
        </div>
      </li>

      <li class="step">
        <div class="box panel">
          <span class="who">vue-eslint-parser</span>
          <strong>Parse the file</strong>
          <div class="inner">
            <div class="box sub accent">
              <span class="who">eslint-plugin-pug-vue</span>
              <strong>Pug tokenizer</strong>
              <span>turns the Pug into the tokens Vue expects from HTML</span>
            </div>
            <div class="uses">uses</div>
            <div class="box sub core">
              <span class="who">pug-lint-parser</span>
              <strong>Pug → syntax tree</strong>
              <span>exact positions, never throws</span>
            </div>
          </div>
          <span class="out">gives a Vue template AST, plus the Pug tree</span>
        </div>
      </li>

      <li class="step">
        <div class="split">
          <div class="box">
            <span class="who">eslint-plugin-vue</span>
            <strong><code>vue/*</code> rules</strong>
            <span>read the Vue AST, as on an HTML template</span>
          </div>
          <div class="box accent">
            <span class="who">eslint-plugin-pug-vue</span>
            <strong><code>vue-pug/*</code> rules</strong>
            <span>read the Pug tree: indentation, attributes, quotes…</span>
          </div>
        </div>
        <span class="out">problems, each maybe with a fix</span>
      </li>

      <li class="step">
        <div class="box panel">
          <span class="who">eslint-plugin-pug-vue processor</span>
          <strong>Check before ESLint writes anything</strong>
          <div class="inner two">
            <div class="box sub">
              <strong>Suppress</strong>
              <span>drops <code>vue/*</code> messages that misreport on Pug, only inside Pug templates</span>
            </div>
            <div class="box sub core">
              <strong>Fix guard</strong>
              <span>applies each fix to a copy, parses it again with pug-lint-parser and compares the structure</span>
            </div>
          </div>
        </div>
      </li>

      <li class="step">
        <div class="split">
          <div class="box result ok">
            <strong>Same structure</strong>
            <span>the fix is applied by <code>eslint --fix</code> or fix-on-save</span>
          </div>
          <div class="box result warn">
            <strong>Structure changed</strong>
            <span>the fix is dropped; the warning stays for you to fix by hand</span>
          </div>
        </div>
      </li>
    </ol>
  </figure>
</template>

<style scoped>
.HowItWorks {
  margin: 24px 0;
  --hw-line: var(--vp-c-divider);
  --hw-accent: var(--vp-c-brand-1);
  --hw-core: var(--pl-fawn);
}
.flow {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
}
.step {
  position: relative;
  margin: 0 !important;
  padding-bottom: 34px;
}
.step:last-child {
  padding-bottom: 0;
}
/* the arrow between steps */
.step:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 6px;
  width: 2px;
  height: 22px;
  background: var(--hw-line);
  transform: translateX(-50%);
}
.step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 2px;
  border: 6px solid transparent;
  border-top-color: var(--hw-line);
  border-bottom: 0;
  transform: translateX(-50%);
}
.box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border: 1px solid var(--hw-line);
  border-radius: 12px;
  background: var(--vp-c-bg);
  font-size: 14px;
  line-height: 1.45;
  color: var(--vp-c-text-2);
}
.box strong {
  font-family: var(--pl-font-display);
  font-size: 16px;
  font-weight: 650;
  color: var(--vp-c-text-1);
}
.who {
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.file {
  max-width: 320px;
  margin: 0 auto;
  align-items: center;
  text-align: center;
}
.snippet {
  font-size: 13px;
}
.panel {
  background: var(--vp-c-bg-alt);
}
.inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}
.inner.two {
  grid-template-columns: 1fr 1fr;
}
.uses {
  font-size: 12px;
  color: var(--vp-c-text-3);
}
.sub {
  background: var(--vp-c-bg);
  height: 100%;
}
.accent {
  border-color: var(--hw-accent);
  box-shadow: inset 3px 0 0 var(--hw-accent);
}
.core {
  border-color: var(--hw-core);
  box-shadow: inset 3px 0 0 var(--hw-core);
}
.out {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  color: var(--vp-c-text-3);
  text-align: center;
}
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.result.ok {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.result.warn {
  border-color: var(--pl-warn);
  background: rgba(217, 150, 43, 0.1);
}
code {
  font-size: 0.9em;
}
@media (max-width: 640px) {
  .inner,
  .inner.two,
  .split {
    grid-template-columns: 1fr;
  }
  .uses {
    text-align: center;
  }
}
</style>
