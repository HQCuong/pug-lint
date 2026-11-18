<template lang="pug">
ul
  //- eslint-disable-next-line vue/require-v-for-key
  li(v-for="a in as") {{ a }}
  //- eslint-disable vue/require-v-for-key
  li(v-for="b in bs") {{ b }}
  //- eslint-enable vue/require-v-for-key
  li(v-for="c in cs") {{ c }}
  //- eslint-disable-next-line vue/no-v-html
  p hello
</template>

<script setup>
const x = 1
</script>
