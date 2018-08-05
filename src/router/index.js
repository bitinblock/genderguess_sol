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
import fs from 'fs'
import path from 'path'
import web3 from '../router/web3';

Vue.use(Router)
Vue.use(vueResource)
Vue.use(iView, { locale })
Vue.use("/", 'index.html')

export default new Router({
  mode: 'history',
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
      name: 'checkstatus',
      component: CheckStatus
    },
    {
      path: '/faq',
      name: 'faq',
      component: Faqhelp
    },
    {
      path: '/',
      name: 'faq',
      component: Faqhelp
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin
    }
  ]
})