import { platforma } from "@platforma-open/milaboratories.functional-analysis.model";
import { defineAppV3 } from "@platforma-sdk/ui-vue";
import MainPage from "./pages/MainPage.vue";
import BarPlotPage from "./pages/BarPlot.vue";

export const sdkPlugin = defineAppV3(platforma, () => {
  return {
    routes: {
      "/": () => MainPage,
      "/graph": () => BarPlotPage,
    },
  };
});

export const useApp = sdkPlugin.useApp;
