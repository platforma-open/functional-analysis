---
'@platforma-open/milaboratories.functional-analysis.model': minor
'@platforma-open/milaboratories.functional-analysis.ui': minor
'@platforma-open/milaboratories.functional-analysis': minor
'@platforma-open/milaboratories.functional-analysis.workflow': patch
'@platforma-open/milaboratories.functional-analysis.software': patch
---

Migrate the block onto the structurer (block-tools 2.16.13) with a full SDK upgrade: model and ui-vue 1.84.20, workflow-tengo 6.15.0, tengo-builder 4.1.11, test 1.84.20. Adopts the tool-managed layout, the slim facade, and the mandatory `kind/` package. Its init-params contract is `{ geneListRef?, pathwayCollection?, geneSubset? }`.

Move the model to BlockModelV3, because the 1.84 SDK no longer ships the V1 `BlockModel`. Existing projects are upgraded once by `.upgradeLegacy`, and the args keep the V1 keys, so opening a project does not make it stale. Run stays blocked until a gene list, a pathway collection and at least one gene subset are chosen, and the UI now shows the reason.

Give every data conversion an explicit 16 GiB / 1 CPU budget. The exchange with the R tool stays CSV, because its R environment has no Parquet reader. Results are unchanged.
