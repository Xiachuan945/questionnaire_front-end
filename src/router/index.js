import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    // {
    //   path: '/VoteSurvey/:quId',
    //   name: "VoteSurvey",
    //   component: () => import("../components/VoteSurvey.vue"),
    // },
    {
      path: '/VoteSurvey/:qnId',
      name: "VoteSurvey",
      component: () => import("../components/VoteSurvey.vue"),
    },
    // {
    //   path: "/VoteSurvey",
    //   name: "VoteSurvey",
    //   component: () => import("../components/VoteSurvey.vue"),
    // },
    {
      path: "/CheckSurvey",
      name: "CheckSurvey",
      component: () => import("../components/CheckSurvey.vue"),
    },
    {
      path: "/GraphSurvey/:qnId",
      name: "GraphSurvey",
      component: () => import("../components/GraphSurvey.vue"),
    },
    // {
    //   path: "/GraphSurvey",
    //   name: "GraphSurvey",
    //   component: () => import("../components/GraphSurvey.vue"),
    // },
    {
      path: "/QuestionnaireList",
      name: "QuestionnaireList",
      component: () => import("../components/QuestionnaireList.vue"),
    },
    {
      path: "/AddQuestionList",
      name: "AddQuestionList",
      component: () => import("../components/AddQuestionList.vue"),
    },
    {
      path: "/AddQuestion",
      name: "AddQuestion",
      component: () => import("../components/AddQuestion.vue"),
    },
    {
      path: "/DeleteQuestion",
      name: "DeleteQuestion",
      component: () => import("../components/DeleteQuestion.vue"),
    },
  ],
}
);

export default router;
