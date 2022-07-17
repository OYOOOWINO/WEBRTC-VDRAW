import Vue from "vue";
import VueRouter from "vue-router";
import store from "../store/index";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/HomeView.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/contacts",
    name: "contacts",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/ContactsView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/LoginView.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/signup",
    name: "signup",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/SignupView.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/chat",
    name: "chat",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/ChatView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/404",
    name: "404",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/404View.vue"),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/confirm",
    name: "confrim",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/ConfirmReg.vue"),
    meta: {
      requiresAuth: false,
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach(async (to, from,next) => {
  await store.commit("fetchToken");
  let requiresAuth = to.meta.requiresAuth;
  let authorised = store.state.user.loggedin;
  if (requiresAuth && !authorised) {
    store.commit("setRedirect", to.path);
    next({name: 'login'})
  }else{
      next()
  }
});
export default router;
