<template lang="pug">
ul.menu
  li.item(v-for="i in items"
          :key="i.id"
          :class="{ active: i.on }")
    a(:href="i.url") {{ i.label }}
    ul.sub
        li
          a(href="#") deep
  li.item
    span inline
</template>

<script setup>
const items = []
</script>
