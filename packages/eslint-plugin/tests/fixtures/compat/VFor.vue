<template lang="pug">
div
  ul
    li(v-for="item in items") {{ item.name }}
    li(v-for="(item, index) in items" :key="item.id") {{ item.name }}
    li(v-for="x in xs" v-if="x.ok" :key="x.id") {{ x.label }}
    li(v-for="(value, key, i) of obj" :key="key") {{ value }}
  table
    tbody
      template(v-for="row in rows")
        tr(:key="row.id")
          td {{ row.v }}
  MyItem(v-for="n in 3")
  span(v-for="item in items" :key="index") {{ item }}
</template>

<script>
export default {
  components: { MyItem: {} },
  data() {
    return { items: [], xs: [], obj: {}, rows: [] }
  },
}
</script>
