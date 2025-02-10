<script setup lang="ts">
import { GraphMaker, GraphMakerProps } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { useApp } from "../app";
import { computed } from "vue";

const app = useApp();

const defaultOptions: GraphMakerProps['defaultOptions'] = [
  {
    inputName: 'y',
    selectedSource: {
      kind: 'PColumn',
      name: "pl7.app/rna-seq/minlog10padj",
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
      valueType: "String",
      axesSpec: [
        {
          name: "pl7.app/pathwayid",
          type: "String"
        }
      ]
    }
  },
  {
    inputName: 'tabBy',
    selectedSource: {
      kind: 'PColumn',
      name: "pl7.app/rna-seq/pathwayRegDir",
      valueType: "String",
      axesSpec: [
        {
          name: "pl7.app/pathwayid",
          type: "String"
        }
      ]
    }
  },
  {
    inputName: 'filters',
    selectedSource: {
      kind: 'PColumn',
      name: "pl7.app/rna-seq/pathwayOntology",
      valueType: "String",
      axesSpec: [
        {
          name: "pl7.app/pathwayid",
          type: "String"
        }
      ]
    }
  }
];

// const defaultOptions = computed((): GraphMakerProps['defaultOptions'] => {
//     const ORATop10Pcols = app.model.outputs.ORATop10Pcols
    
//     if (!ORATop10Pcols) {
//         return undefined
//     }

//     const defaults: GraphMakerProps['defaultOptions'] = [
//         {
//             inputName: 'y',
//             selectedSource: ORATop10Pcols[4]
//         },
//         {
//             inputName: 'primaryGrouping',
//             selectedSource: ORATop10Pcols[3]
//         },
//         {
//             inputName: 'tabBy',
//             selectedSource: ORATop10Pcols[5]
//         },
//         {
//             inputName: 'filters',
//             selectedSource: ORATop10Pcols[2]
//         },
        
//     ];

//     return defaults;
// })
</script>

<template>
  <GraphMaker chartType="discrete" template="bar" :p-frame="app.model.outputs.ORATop10Pf" v-model="app.model.ui.graphState" 
  :defaultOptions="defaultOptions" />
</template>