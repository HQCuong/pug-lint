<template lang="pug">
.list
  MyItem(v-for="item in items", :key="item.id" :label="item.name",title="x")
  a(href="/a",  target="_blank" ,rel="noopener") Link
  input(type="text",v-model="query" , placeholder='Search')
</template>

<script setup>
const items = []
const query = ''
</script>
