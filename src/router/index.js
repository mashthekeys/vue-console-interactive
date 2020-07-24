import Vue from 'vue'
import Router from 'vue-router'
import BrowserREPL from '@/components/BrowserREPL'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'BrowserREPL',
      component: BrowserREPL
    }
  ]
})
