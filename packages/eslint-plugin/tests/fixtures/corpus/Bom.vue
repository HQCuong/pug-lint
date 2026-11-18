<template lang="pug">
.card#main(class="wrap")
  MyButton(@click="onClick", :fooBar="x", title='hi') Save
  ul
    li(v-for="item in items") {{ item.name }}
    p 🎉 {{ name }}
    li(v-for="(a, i) in list" :key="a.id") {{ a }}
  div(v-if="ok" v-for="x in xs" :key="x")
  p Hello {{ name }}
  input(type="text" v-model="name")
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
