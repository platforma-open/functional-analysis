# @platforma-open/milaboratories.functional-analysis.model

## 2.5.1

### Patch Changes

- 5d192b7: Release every package through npm trusted publishing (OIDC) so each package's trusted publisher is used before it expires.

## 2.5.0

### Minor Changes

- 94ea73e: Migrate the block onto the structurer (block-tools 2.16.13) with a full SDK upgrade: model and ui-vue 1.84.20, workflow-tengo 6.15.0, tengo-builder 4.1.11, test 1.84.20. Adopts the tool-managed layout, the slim facade, and the mandatory `kind/` package. Its init-params contract is `{ geneListRef?, pathwayCollection?, geneSubset? }`.

  Move the model to BlockModelV3, because the 1.84 SDK no longer ships the V1 `BlockModel`. Existing projects are upgraded once by `.upgradeLegacy`, and the args keep the V1 keys, so opening a project does not make it stale. Run stays blocked until a gene list, a pathway collection and at least one gene subset are chosen, and the UI now shows the reason.

  Give every data conversion an explicit 16 GiB / 1 CPU budget. The exchange with the R tool stays CSV, because its R environment has no Parquet reader. Results are unchanged.

## 2.4.4

### Patch Changes

- b30e41b: Improved UI and updated metadata

## 2.4.3

### Patch Changes

- 3a93570: technical release
- 5046183: technical release
- 1019512: technical release
- 5a0b864: technical release

## 2.4.2

### Patch Changes

- 5505b06: Full SDK update

## 2.4.1

### Patch Changes

- 1dcc1e4: Added dynamic block title

## 2.4.0

### Minor Changes

- 9692a00: Make block work with cluster-markers block, SDK update, improve table and plots presentation

## 2.3.0

### Minor Changes

- f7102ee: Update graph creation

## 2.2.0

### Minor Changes

- d124204: multiple DEG and new R env
- 2c1dd56: Changeset after merge issues

## 2.1.0

### Minor Changes

- 818d935: Update page name

## 2.0.0

### Major Changes

- 3b2e9af: Get gene FC trend Pcolumn and run enrichment separately

## 1.2.0

### Minor Changes

- 0ca97b2: Update to work with latest upstream blocks versions

## 1.1.0

### Minor Changes

- 8ee5d36: Improved barplot visualization
