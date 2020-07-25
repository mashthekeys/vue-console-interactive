import Vue from 'vue'
import Router from 'vue-router'
import ConsoleInteractive from '@/components/ConsoleInteractive'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'ConsoleInteractive',
      component: ConsoleInteractive
    }
  ]
})
