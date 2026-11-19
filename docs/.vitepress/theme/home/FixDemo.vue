<script setup lang="ts">
// The homepage's working example: the template and the 15 warnings are the real output of
// `eslint` with `configs.recommended` on this file, and the fixed lines are what `eslint --fix`
// writes. Spaces are drawn as dots, like an editor's "render whitespace", because in Pug
// whitespace is structure. "Run eslint --fix" replaces the lines one by one.
import { useData } from 'vitepress'
import { computed, onBeforeUnmount, ref } from 'vue'
import type { ThemeConfig } from '../../config'

const { theme } = useData<ThemeConfig>()
const t = computed(() => theme.value.strings.demo)
const fill = (text: string, count: number) => text.replace('{count}', String(count))

interface Problem {
  line: number // 1-based, as ESLint reports it
  col: number // 1-based
  len: number // characters the squiggle covers
  message: string
  rule: string
}

const BEFORE = [
  '<template lang="pug">',
  'div.card( class="shadow" , :title = "title" )',
  "    h2( v-if='title' ) {{ title }}",
  "    input(v-model=\"name\" , type='text' disabled)/",
  '</template>',
]
const AFTER = [
  '<template lang="pug">',
  '.card.shadow(:title="title")',
  '  h2(v-if="title") {{ title }}',
  '  input(v-model="name" type="text" disabled)',
  '</template>',
]

const PROBLEMS: Problem[] = [
  { line: 2, col: 1, len: 3, rule: 'implicit-div', message: 'Omit `div` before a class or id shorthand' },
  { line: 2, col: 10, len: 1, rule: 'attribute-parens-spacing', message: "Unexpected space after '('" },
  { line: 2, col: 11, len: 14, rule: 'prefer-shorthand', message: "Use the '.shadow' shorthand instead of the class attribute" },
  { line: 2, col: 26, len: 1, rule: 'attribute-commas', message: 'Unexpected comma in attribute block' },
  { line: 2, col: 34, len: 1, rule: 'attribute-equals-spacing', message: "Unexpected space around '='" },
  { line: 2, col: 36, len: 1, rule: 'attribute-equals-spacing', message: "Unexpected space around '='" },
  { line: 2, col: 44, len: 1, rule: 'attribute-parens-spacing', message: "Unexpected space before ')'" },
  { line: 3, col: 1, len: 4, rule: 'indent', message: 'Expected indentation of 2 spaces but found 4 spaces' },
  { line: 3, col: 8, len: 1, rule: 'attribute-parens-spacing', message: "Unexpected space after '('" },
  { line: 3, col: 14, len: 7, rule: 'attribute-quotes', message: 'Expected double quotes' },
  { line: 3, col: 21, len: 1, rule: 'attribute-parens-spacing', message: "Unexpected space before ')'" },
  { line: 4, col: 1, len: 4, rule: 'indent', message: 'Expected indentation of 2 spaces but found 4 spaces' },
  { line: 4, col: 26, len: 1, rule: 'attribute-commas', message: 'Unexpected comma in attribute block' },
  { line: 4, col: 33, len: 6, rule: 'attribute-quotes', message: 'Expected double quotes' },
  { line: 4, col: 49, len: 1, rule: 'self-closing', message: 'Unexpected self-closing `/`' },
]

type Kind = 'tag' | 'cls' | 'attr' | 'str' | 'punct' | 'mustache' | 'ws' | 'text' | 'markup'
interface Piece {
  text: string
  kind: Kind
  problem?: Problem
}

/** Character classes for one line of this snippet (enough for these lines, not a Pug lexer). */
function classify(line: string): Kind[] {
  const kinds: Kind[] = Array.from(line, () => 'text')
  const mark = (from: number, to: number, kind: Kind) => {
    for (let i = from; i < to; i++) kinds[i] = kind
  }
  if (line.startsWith('<')) {
    mark(0, line.length, 'markup')
    const str = /"[^"]*"/.exec(line)
    if (str) mark(str.index, str.index + str[0].length, 'str')
    return kinds
  }
  const head = /^(\s*)([\w-]*)((?:\.[\w-]+)*)/.exec(line)!
  mark(head[1].length, head[1].length + head[2].length, 'tag')
  const clsStart = head[1].length + head[2].length
  mark(clsStart, clsStart + head[3].length, 'cls')
  const open = line.indexOf('(')
  const close = line.lastIndexOf(')')
  if (open !== -1 && close > open) {
    mark(open, open + 1, 'punct')
    mark(close, close + 1, 'punct')
    for (const m of line.slice(open + 1, close).matchAll(/[:@\w-]+(?=\s*=|\s|\)|$)/g)) {
      const at = open + 1 + m.index!
      mark(at, at + m[0].length, 'attr')
    }
    for (const m of line.slice(open + 1, close).matchAll(/"[^"]*"|'[^']*'|[=,]/g)) {
      const at = open + 1 + m.index!
      mark(at, at + m[0].length, m[0].length === 1 ? 'punct' : 'str')
    }
  }
  for (const m of line.matchAll(/\{\{[^}]*\}\}/g)) mark(m.index!, m.index! + m[0].length, 'mustache')
  if (line.endsWith('/')) mark(line.length - 1, line.length, 'punct')
  for (let i = 0; i < line.length; i++) if (line[i] === ' ') kinds[i] = 'ws'
  return kinds
}

/** One line split into runs of the same class and the same problem. */
function pieces(line: string, lineNo: number, problems: Problem[]): Piece[] {
  const kinds = classify(line)
  const owner = (i: number) => problems.find((p) => p.line === lineNo && i >= p.col - 1 && i < p.col - 1 + p.len)
  const out: Piece[] = []
  for (let i = 0; i < line.length; i++) {
    const problem = owner(i)
    const last = out[out.length - 1]
    if (last && last.kind === kinds[i] && last.problem === problem) last.text += line[i]
    else out.push({ text: line[i]!, kind: kinds[i]!, problem })
  }
  return out
}

const fixedLines = ref<Set<number>>(new Set())
const running = ref(false)
let timers: ReturnType<typeof setTimeout>[] = []

const remaining = computed(() => PROBLEMS.filter((p) => !fixedLines.value.has(p.line)))
const done = computed(() => remaining.value.length === 0)

const rows = computed(() =>
  BEFORE.map((before, i) => {
    const lineNo = i + 1
    const fixed = fixedLines.value.has(lineNo)
    const text = fixed ? AFTER[i]! : before
    return { lineNo, fixed, changed: before !== AFTER[i], pieces: pieces(text, lineNo, fixed ? [] : PROBLEMS) }
  }),
)

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function run(): void {
  if (running.value) return
  if (done.value) {
    fixedLines.value = new Set()
    return
  }
  const changed = BEFORE.map((_, i) => i + 1).filter((n) => BEFORE[n - 1] !== AFTER[n - 1])
  if (reduceMotion()) {
    fixedLines.value = new Set(changed)
    return
  }
  running.value = true
  changed.forEach((lineNo, k) => {
    timers.push(
      setTimeout(() => {
        fixedLines.value = new Set([...fixedLines.value, lineNo])
        if (k === changed.length - 1) running.value = false
      }, 260 + k * 320),
    )
  })
}

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <figure class="FixDemo" :aria-label="t.label">
    <div class="bar">
      <span class="file">UserCard.vue</span>
      <button type="button" class="run" :disabled="running" @click="run">
        {{ done ? t.reset : t.run }}
      </button>
    </div>

    <pre class="code" :class="{ done }"><code><span
      v-for="row in rows" :key="row.lineNo" class="line" :class="{ fixed: row.fixed && row.changed }"
    ><span class="ln" aria-hidden="true">{{ row.lineNo }}</span><span
      v-for="(piece, j) in row.pieces" :key="j" :class="['t-' + piece.kind, { squiggle: piece.problem }]"
      :title="piece.problem ? `${piece.problem.message}  vue-pug/${piece.problem.rule}` : undefined"
    >{{ piece.kind === 'ws' ? '·'.repeat(piece.text.length) : piece.text }}</span></span></code></pre>

    <figcaption class="status" aria-live="polite">
      <template v-if="done">
        <span class="ok">{{ t.done }}</span> {{ fill(t.doneDetail, PROBLEMS.length) }}
      </template>
      <template v-else>
        <span class="warn">{{ fill(t.problems, remaining.length) }}</span>
        <span class="hint">{{ t.hint }}</span>
      </template>
    </figcaption>

    <details class="list">
      <summary>{{ fill(t.allWarnings, PROBLEMS.length) }}</summary>
      <ul>
        <li v-for="p in PROBLEMS" :key="`${p.line}:${p.col}`">
          <span class="pos">{{ p.line }}:{{ p.col }}</span> {{ p.message }} <span class="rule">vue-pug/{{ p.rule }}</span>
        </li>
      </ul>
    </details>
  </figure>
</template>

<style scoped>
.FixDemo {
  margin: 0;
  border-radius: 16px;
  background: var(--pl-muzzle);
  color: #ece6df;
  box-shadow: 0 24px 60px -28px rgba(43, 39, 48, 0.55);
  overflow: hidden;
}
.dark .FixDemo {
  background: #25212b;
  box-shadow: 0 0 0 1px rgba(227, 194, 155, 0.16);
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px 10px 18px;
  border-bottom: 1px solid rgba(227, 194, 155, 0.14);
}
.file {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: #b9b0a6;
}
.run {
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 8px;
  background: var(--pl-fawn);
  color: var(--pl-muzzle);
  transition: background-color 0.15s;
}
.run:hover {
  background: #edd3b3;
}
.run:disabled {
  opacity: 0.6;
  cursor: progress;
}
.run:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
.code {
  margin: 0;
  padding: 18px 0;
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  line-height: 1.75;
  overflow-x: auto;
}
.line {
  display: block;
  padding-right: 18px;
  white-space: pre;
  transition: background-color 0.6s;
}
.line.fixed {
  animation: settle 0.9s ease-out;
}
@keyframes settle {
  from {
    background: rgba(63, 178, 127, 0.28);
  }
  to {
    background: transparent;
  }
}
.ln {
  display: inline-block;
  width: 3em;
  padding-right: 1.2em;
  text-align: right;
  color: #6f6672;
  user-select: none;
}
.t-markup {
  color: #9d93a0;
}
.t-tag {
  color: #f0a7a0;
}
.t-cls {
  color: var(--pl-fawn);
}
.t-attr {
  color: #9fd3bb;
}
.t-str {
  color: #e7d59a;
}
.t-punct {
  color: #cfc6bd;
}
.t-mustache {
  color: #b7c4f0;
}
.t-ws {
  color: #5d5561;
}
.squiggle {
  text-decoration: underline wavy var(--pl-warn);
  text-decoration-thickness: 1.5px;
  text-underline-offset: 4px;
  cursor: help;
}
.t-ws.squiggle {
  color: var(--pl-warn);
}
.status {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  padding: 10px 18px;
  border-top: 1px solid rgba(227, 194, 155, 0.14);
  font-size: 13px;
  color: #b9b0a6;
}
.status code {
  font-size: 12px;
  color: #ece6df;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 5px;
  border-radius: 4px;
}
.warn {
  color: var(--pl-warn);
  font-weight: 600;
}
.ok {
  color: #3fb27f;
  font-weight: 600;
}
.list {
  padding: 0 18px 12px;
  font-size: 13px;
  color: #b9b0a6;
}
.list summary {
  cursor: pointer;
  padding: 4px 0;
}
.list summary:focus-visible {
  outline: 2px solid var(--pl-fawn);
  outline-offset: 2px;
}
.list summary code {
  font-size: 12px;
}
.list ul {
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 1.8;
}
.pos {
  display: inline-block;
  min-width: 3.4em;
  color: #6f6672;
}
.rule {
  color: #6f6672;
}
@media (prefers-reduced-motion: reduce) {
  .line.fixed {
    animation: none;
  }
}
</style>
