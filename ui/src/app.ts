import { model } from "@platforma-open/milaboratories.functional-analysis.model";
import { defineApp } from "@platforma-sdk/ui-vue";
import MainPage from "./pages/MainPage.vue";
import BarPlotPage from "./pages/BarPlot.vue";

export const sdkPlugin = defineApp(model, () => {
  return {
    routes: {
      "/": () => MainPage,
      "/graph": () => BarPlotPage
    },
  };
});

export const useApp = sdkPlugin.useApp;
