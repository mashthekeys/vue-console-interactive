import Vue from 'vue'
import Router from 'vue-router'
import ConsoleInteractive from '@/components/ConsoleInteractive'
import DemoGlobal from '@/components/DemoGlobal'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Echo Demo',
      component: ConsoleInteractive
    },
    {
      path: '/global',
      name: 'Global Console Demo',
      component: DemoGlobal
    }
  ]
})
