// Installs the packed tarballs of both packages into a fresh project outside the workspace, with
// eslint / eslint-plugin-vue / vue-eslint-parser from the npm registry, and runs the ESLint CLI.
// This checks what a user gets from npm: `exports`, `files`, the ESM build, dist/tokenizer.cjs being
// loadable by vue-eslint-parser's `require`, config serialization under `--cache`, and the runtime
// dependency on pug-lint-parser.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { scaled } from '../helpers/time-scale.ts'

const pluginDir = fileURLToPath(new URL('../..', import.meta.url))
const parserDir = fileURLToPath(new URL('../../../pug-parser', import.meta.url))
const isWindows = process.platform === 'win32'

const config = `import pluginVue from 'eslint-plugin-vue'
import vuePug from 'eslint-plugin-pug-lint'

export default [...pluginVue.configs['flat/recommended'], ...vuePug.configs.recommended]
`

const messy = `<template lang="pug">
div.page(class="wrap")
	header
			h1(class='title' ,  :title = "t") {{ t }}
	MyButton( @click="go",type='button' :disabled="busy" )/
</template>

<script setup>
const t = 't'
const busy = false
function go() {}
</script>
`

interface Run {
  status: number | null
  output: string
}

function run(cmd: string, args: string[], cwd: string): Run {
  // pnpm and npm are .cmd shims on Windows, which only a shell can start.
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', shell: isWindows && cmd !== process.execPath })
  return { status: r.status, output: `${r.stdout ?? ''}${r.stderr ?? ''}${r.error ? String(r.error) : ''}` }
}

function mustRun(cmd: string, args: string[], cwd: string): void {
  const r = run(cmd, args, cwd)
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(' ')} failed (${r.status}):\n${r.output}`)
}

const tempDirs: string[] = []
function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  tempDirs.push(dir)
  return dir
}

let packDir = ''
let pluginTarball = ''
let parserTarball = ''

beforeAll(() => {
  // The vitest global setup rebuilds only the tokenizer; the full build must have run first.
  for (const file of ['dist/index.js', 'dist/index.d.ts', 'dist/tokenizer.cjs']) {
    expect(existsSync(join(pluginDir, file)), `${file} missing: run \`pnpm build\` first`).toBe(true)
  }
  expect(existsSync(join(parserDir, 'dist/index.js')), 'pug-parser dist missing: run `pnpm build` first').toBe(true)
  packDir = tempDir('pug-lint-pack-')
  for (const dir of [parserDir, pluginDir]) mustRun('pnpm', ['pack', '--pack-destination', packDir], dir)
  const tarballs = readdirSync(packDir)
  parserTarball = join(packDir, tarballs.find((f) => f.startsWith('pug-lint-parser-'))!)
  pluginTarball = join(packDir, tarballs.find((f) => f.startsWith('eslint-plugin-pug-lint-'))!)
}, scaled(60_000))

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true })
})

describe('packed packages', () => {
  for (const [eslintRange, major] of [['^9.15.0', '9'], ['^10', '10']] as const) {
    it(`lint --fix --cache with eslint@${eslintRange}`, () => {
      const project = tempDir('pug-lint-packed-')
      // Dependencies go in package.json, not on the command line: Windows runs npm through cmd.exe,
      // which would eat the `^` of a range and split paths with spaces.
      const devDependencies = {
        eslint: eslintRange,
        'eslint-plugin-vue': '^10.0.0',
        'vue-eslint-parser': '^10.0.0',
        'pug-lint-parser': `file:${parserTarball}`,
        'eslint-plugin-pug-lint': `file:${pluginTarball}`,
      }
      writeFileSync(join(project, 'package.json'), JSON.stringify({ name: 'packed-test', private: true, type: 'module', devDependencies }))
      writeFileSync(join(project, 'eslint.config.js'), config)
      writeFileSync(join(project, 'App.vue'), messy)
      mustRun('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], project)
      const installed = JSON.parse(readFileSync(join(project, 'node_modules/eslint/package.json'), 'utf8')) as { version: string }
      expect(installed.version.split('.')[0]).toBe(major)

      const eslintBin = join(project, 'node_modules/eslint/bin/eslint.js')
      const first = run(process.execPath, [eslintBin, '--fix', '--cache', '.'], project)
      expect([0, 1], first.output).toContain(first.status)
      const fixed = readFileSync(join(project, 'App.vue'), 'utf8')
      expect(fixed).not.toBe(messy)
      expect(fixed).toContain(`h1.title(:title="t") {{ t }}`)
      expect(existsSync(join(project, '.eslintcache')), 'eslint wrote no cache').toBe(true)

      const second = run(process.execPath, [eslintBin, '--fix', '--cache', '.'], project)
      expect([0, 1], second.output).toContain(second.status)
      expect(readFileSync(join(project, 'App.vue'), 'utf8')).toBe(fixed)
    }, scaled(180_000))
  }
})
