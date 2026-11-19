---
description: "How the fix guard keeps eslint --fix from breaking Pug templates: every fix is parsed again and its structure compared before ESLint applies it."
---

# The fix guard

An autofix that breaks a template is worse than no autofix. Pug makes that easy: indentation is
structure, and moving one line without its children changes the tree. So every fix that touches a
Pug template is checked before ESLint applies it.

## What is checked

For each Pug template, a fix is applied only if the template still parses afterwards and its
structure is unchanged:

- the tags and their nesting;
- each tag's class and id set and attribute count (so `p(class="a b")` and `p.a.b` are equal, but
  losing a class is not);
- the shape of text and interpolations;
- every piece of JavaScript that Pug compiles (unquoted and `${}` attribute values, `&attributes`,
  mixin arguments, code, control heads, `#{}`), up to its indentation.

The parser reports what Pug itself rejects (for example a tab/space mix or a repeated attribute),
so a fix that would introduce it is dropped too.

## How fixes are applied

1. Each fix is verified on its own.
2. The surviving fixes are verified again as the combined set that ESLint will apply.
3. A fix that fails is dropped, and its problem is still reported, so you can fix it by hand.

This covers every rule that fixes `.vue` files, including `vue/*` rules and third-party rules.
While a template has a Pug syntax error, no fix is applied inside it.

## Cost

The guard parses the template again for each distinct fix, so its cost grows with the number of
fixes times the template size. A normal template takes milliseconds; a fully misformatted
3000-line template can take several seconds. The cost only arises while a template has problems
to fix.

## Partial fix sets

The guard verifies the full set of surviving fixes. If ESLint applies only some of them
(`--fix-type`, or a custom `fix` predicate in the Node.js API), that subset was not verified as a
set.
