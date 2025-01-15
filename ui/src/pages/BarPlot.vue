<script setup lang="ts">
import { GraphMaker, GraphMakerProps } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { useApp } from "../app";

const app = useApp();

const defaultOptions: GraphMakerProps['defaultOptions'] = [
  {
    inputName: 'y',
    selectedSource: {
      kind: 'PColumn',
      name: "pl7.app/rna-seq/padj",
      valueType: "Double",
      axesSpec: [
        {
          name: "pl7.app/pathwayid",
          type: "String"
        }
      ]
    }
  },
  {
    inputName: 'primaryGrouping',
    selectedSource: {
      kind: 'PColumn',
      name: "pl7.app/rna-seq/pathwayname",
      valueType: "Double",
      axesSpec: [
        {
          name: "pl7.app/pathwayid",
          type: "String"
        }
      ]
    }
  }
];
</script>

<template>
  <GraphMaker chartType="discrete" template="bar" :p-frame="app.model.outputs.ORATop10Pf" v-model="app.model.ui.graphState" 
  :defaultOptions="defaultOptions" />
</template>