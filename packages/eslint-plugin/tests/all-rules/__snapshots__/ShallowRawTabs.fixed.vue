<template lang="pug">
div
  //-
    an old block
    shallower line
  p.
    deep first line
    shallower text
  -
    var a = 1
    var b = 2
  :cdata
    kept
    shallower
  p.x {{ a }}
</template>

<script setup>
const a = 1
</script>
