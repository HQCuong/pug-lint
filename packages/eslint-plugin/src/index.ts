import pkg from '../package.json' with { type: 'json' }

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version,
  },
}

export default plugin
