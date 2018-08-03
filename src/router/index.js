import Vue from 'vue'
import Router from 'vue-router'
import vueResource from 'vue-resource'
import Participate from '@/components/participate'
import Dashboard from '@/components/dashboard'
import CheckStatus from '@/components/checkstatus'
import Faqhelp from '@/components/faqhelp'
import Admin from '@/components/adminconsole'
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import locale from 'iview/dist/locale/en-US'

Vue.use(Router)
Vue.use(vueResource)
Vue.use(iView, { locale })


export default new Router({
  routes: [
    {
      path: '/participate',
      name: 'participate',
      component: Participate
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/checkstatus',
      name: 'Check Status',
      component: CheckStatus
    },
    {
      path: '/faq',
      name: 'F.A.Q Help',
      component: Faqhelp
    },
    {
      path: '/',
      name: 'F.A.Q Help',
      component: Faqhelp
    },
    {
      path: '/admin',
      name: 'Admin Only',
      component: Admin
    }
  ]
})