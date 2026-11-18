<template lang="pug">
.card#main(class="wrap")
  MyButton(:foo-bar="x" title='hi' @click="onClick") Save
  ul
    li(v-for="item in items") {{ item.name }}
    li(v-for="(a, i) in list" :key="a.id") {{ a }}
  div(v-for="x in xs" v-if="ok" :key="x")
  p Hello {{ name }}
  input(v-model="name" type="text")
  each n in [1, 2]
    span(v-for="y in ys") {{ y }}
  +card(title)
    span(v-for="z in zs") {{ z }}
  if user
    a(
      href="/x"
      :class="{ active: isActive, big: true }"
      @click.prevent="go"
    ) Link
  //- a comment
    div(v-for="q in qs")
</template>

<script setup>
const x = 1
</script>
