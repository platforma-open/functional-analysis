<script setup lang="ts">
import { GraphMaker, GraphMakerProps } from "@milaboratories/graph-maker";
import '@milaboratories/graph-maker/styles';
import { useApp } from "../app";
import { computed } from "vue";
import { PColumnIdAndSpec } from '@platforma-sdk/model';

const app = useApp();

const defaultOptions = computed((): GraphMakerProps['defaultOptions'] => {
    const ORATop10Pcols = app.model.outputs.ORATop10Pcols
    
    if (!ORATop10Pcols) {
        return undefined
    }

    function getIndex(name: string, pcols: PColumnIdAndSpec[]): number {
        return pcols.findIndex((p) => p.spec.name === name);
    }
    
    const defaults: GraphMakerProps['defaultOptions'] = [
        {
            inputName: 'y',
            selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/minlog10padj',
                                                    ORATop10Pcols
                                                    )].spec
        },
        {
            inputName: 'primaryGrouping',
            selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/pathwayname',
                                                    ORATop10Pcols
                                                    )].spec
        },
        {
            inputName: 'tabBy',
            selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/pathwayname',
                                                    ORATop10Pcols
                                                    )].spec.axesSpec[1]
        }
    ];

    // Not found indexes are set to -1
    if ( getIndex('pl7.app/rna-seq/pathwayOntology', ORATop10Pcols) !== -1) {
        defaults.push(
            {
            inputName: 'filters',
            selectedSource: ORATop10Pcols[getIndex('pl7.app/rna-seq/pathwayOntology',
                                                    ORATop10Pcols
                                                    )].spec
            }
        )
    }

    return defaults;
})
</script>

<template>
  <GraphMaker chartType="discrete" template="bar" :p-frame="app.model.outputs.ORATop10Pf" 
  v-model="app.model.ui.graphState" 
  :defaultOptions="defaultOptions" />
</template>