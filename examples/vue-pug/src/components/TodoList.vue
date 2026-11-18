<template lang="pug">
ul.todos
  li(v-for="item in items" , :key="item.id"
     :class=`{
       done: item.done,
       open: !item.done
     }`)
    input(type="checkbox" , :checked="item.done" , @change="$emit('toggle', item.id)")/
    span(class = "text") {{ item.text }}
</template>

<script setup>
defineProps({ items: { type: Array, required: true } })
defineEmits(['toggle'])
</script>
