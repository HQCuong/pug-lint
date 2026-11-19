---
title: fix guard
description: "fix guard가 eslint --fix로부터 Pug 템플릿을 보호하는 방법: ESLint가 fix를 적용하기 전에 모든 fix를 다시 파싱하고 구조를 비교합니다."
---

# fix guard

템플릿을 깨뜨리는 autofix는 없느니만 못합니다. Pug에서는 그런 일이 쉽게 일어납니다. 들여쓰기가 곧 구조이고,
자식 없이 한 줄만 옮겨도 트리가 바뀌기 때문입니다. 그래서 Pug 템플릿을 건드리는 모든 fix는 ESLint가 적용하기
전에 검사를 거칩니다.

## 검사하는 것 {#what-is-checked}

각 Pug 템플릿에서 fix는 적용 후에도 템플릿이 파싱되고 구조가 바뀌지 않았을 때만 적용됩니다.

- 태그와 그 중첩
- 각 태그의 class와 id 집합, 속성 개수(그래서 `p(class="a b")`와 `p.a.b`는 같지만, class를 잃으면 다릅니다)
- 텍스트와 interpolation의 형태
- Pug가 컴파일하는 모든 JavaScript(따옴표 없는 값과 `${}` 속성 값, `&attributes`, mixin 인자, code, control
  head, `#{}`). 들여쓰기는 무시하고 비교합니다.

파서는 Pug 자체가 거부하는 것(예: 탭과 공백 혼용, 반복된 속성)도 보고하므로, 그런 문제를 새로 만드는 fix도
버려집니다.

## fix가 적용되는 방식 {#how-fixes-are-applied}

1. 각 fix를 개별적으로 검증합니다.
2. 통과한 fix들을 ESLint가 적용할 묶음 그대로 다시 검증합니다.
3. 실패한 fix는 버려지지만 해당 문제는 계속 보고되므로 직접 고칠 수 있습니다.

이는 `vue/*` 규칙과 서드파티 규칙을 포함해 `.vue` 파일을 고치는 모든 규칙에 적용됩니다. 템플릿에 Pug 구문 에러가
있는 동안에는 그 안에서 어떤 fix도 적용되지 않습니다.

## 비용 {#cost}

guard는 서로 다른 fix마다 템플릿을 다시 파싱하므로, 비용은 fix 수와 템플릿 크기를 곱한 만큼 늘어납니다. 보통
템플릿은 몇 밀리초면 끝나지만, 포맷이 완전히 엉망인 3000줄 템플릿은 몇 초가 걸릴 수 있습니다. 이 비용은
템플릿에 고칠 문제가 있을 때만 발생합니다.

## 일부만 적용되는 fix 묶음 {#partial-fix-sets}

guard는 통과한 fix 전체를 하나의 묶음으로 검증합니다. ESLint가 그중 일부만 적용하면(`--fix-type`이나 Node.js
API의 사용자 정의 `fix` predicate), 그 부분 집합은 묶음으로서 검증되지 않은 것입니다.
