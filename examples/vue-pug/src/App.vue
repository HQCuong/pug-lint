<template lang="pug">
div#app(class="layout")
  header( class="top" )
    h1(class='title' ,  :title = "pageTitle") {{ pageTitle }}
    nav
      a(href="/" , class="link") Home
      a(href="/about" ,class='link') About
  main
    UserCard(:userName="user.name" :avatarUrl="user.avatar" :isAdmin="user.admin" @select="onSelect")
    TodoList(:items="todos"
      @toggle="onToggle")
    img(src="/logo.png", alt="Logo")/
  div.footer
    p Made with Pug
</template>

<script setup>
import { ref } from 'vue'
import TodoList from './components/TodoList.vue'
import UserCard from './components/UserCard.vue'

const pageTitle = 'Pug lint demo'
const user = ref({ name: 'Ada', avatar: '/ada.png', admin: true })
const todos = ref([{ id: 1, text: 'Try eslint --fix', done: false }])

function onSelect() {}
function onToggle() {}
</script>
