# Changesets

Every pull request that changes what a user of a package would notice adds a changeset:

```sh
pnpm changeset
```

Pick the packages, the bump (`patch`, `minor`, `major`) and write one or two lines for the
changelog. The file lands in this folder; commit it with your change. See
[CONTRIBUTING.md](../CONTRIBUTING.md#changesets).
