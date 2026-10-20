# @platforma-open/milaboratories.functional-analysis.workflow

## 2.3.4

### Patch Changes

- 5d192b7: Release every package through npm trusted publishing (OIDC) so each package's trusted publisher is used before it expires.
- Updated dependencies [5d192b7]
  - @platforma-open/milaboratories.functional-analysis.software@2.3.7

## 2.3.3

### Patch Changes

- 94ea73e: Migrate the block onto the structurer (block-tools 2.16.13) with a full SDK upgrade: model and ui-vue 1.84.20, workflow-tengo 6.15.0, tengo-builder 4.1.11, test 1.84.20. Adopts the tool-managed layout, the slim facade, and the mandatory `kind/` package. Its init-params contract is `{ geneListRef?, pathwayCollection?, geneSubset? }`.

  Move the model to BlockModelV3, because the 1.84 SDK no longer ships the V1 `BlockModel`. Existing projects are upgraded once by `.upgradeLegacy`, and the args keep the V1 keys, so opening a project does not make it stale. Run stays blocked until a gene list, a pathway collection and at least one gene subset are chosen, and the UI now shows the reason.

  Give every data conversion an explicit 16 GiB / 1 CPU budget. The exchange with the R tool stays CSV, because its R environment has no Parquet reader. Results are unchanged.

- Updated dependencies [94ea73e]
  - @platforma-open/milaboratories.functional-analysis.software@2.3.6

## 2.3.2

### Patch Changes

- Updated dependencies [052ed78]
  - @platforma-open/milaboratories.functional-analysis.software@2.3.5

## 2.3.1

### Patch Changes

- Updated dependencies [17a478d]
  - @platforma-open/milaboratories.functional-analysis.software@2.3.4

## 2.3.0

### Minor Changes

- ff391b2: Update workflow-tengo version

## 2.2.4

### Patch Changes

- b30e41b: Improved UI and updated metadata
- Updated dependencies [b30e41b]
  - @platforma-open/milaboratories.functional-analysis.software@2.3.3

## 2.2.3

### Patch Changes

- d610ee6: Support parquet format (update SDK)

## 2.2.2

### Patch Changes

- 3a93570: technical release
- 5046183: technical release
- 1019512: technical release
- 5a0b864: technical release
- Updated dependencies [3a93570]
- Updated dependencies [5046183]
- Updated dependencies [1019512]
- Updated dependencies [5a0b864]
  - @platforma-open/milaboratories.functional-analysis.software@2.3.2

## 2.2.1

### Patch Changes

- Updated dependencies [5505b06]
  - @platforma-open/milaboratories.functional-analysis.software@2.3.1

## 2.2.0

### Minor Changes

- 9692a00: Make block work with cluster-markers block, SDK update, improve table and plots presentation

## 2.1.1

### Patch Changes

- c1082ad: chore: update deps

## 2.1.0

### Minor Changes

- d124204: multiple DEG and new R env
- 2c1dd56: Changeset after merge issues

### Patch Changes

- Updated dependencies [d124204]
- Updated dependencies [2c1dd56]
  - @platforma-open/milaboratories.functional-analysis.software@2.3.0

## 2.0.2

### Patch Changes

- Updated dependencies [065e05a]
- Updated dependencies [d3c2c3f]
  - @platforma-open/milaboratories.functional-analysis.software@2.2.0

## 2.0.1

### Patch Changes

- Updated dependencies [740e35d]
  - @platforma-open/milaboratories.functional-analysis.software@2.1.0

## 2.0.0

### Major Changes

- 3b2e9af: Get gene FC trend Pcolumn and run enrichment separately

### Patch Changes

- Updated dependencies [3b2e9af]
  - @platforma-open/milaboratories.functional-analysis.software@2.0.0

## 1.1.7

### Patch Changes

- Updated dependencies [22d7b54]
  - @platforma-open/milaboratories.functional-analysis.software@1.2.3

## 1.1.6

### Patch Changes

- Updated dependencies [0edc182]
  - @platforma-open/milaboratories.functional-analysis.software@1.2.2

## 1.1.5

### Patch Changes

- Updated dependencies [0f7927c]
  - @platforma-open/milaboratories.functional-analysis.software@1.2.1

## 1.1.4

### Patch Changes

- Updated dependencies [252742f]
  - @platforma-open/milaboratories.functional-analysis.software@1.2.0

## 1.1.3

### Patch Changes

- Updated dependencies [49d36d7]
  - @platforma-open/milaboratories.functional-analysis.software@1.1.3

## 1.1.2

### Patch Changes

- Updated dependencies [b8e381e]
  - @platforma-open/milaboratories.functional-analysis.software@1.1.2

## 1.1.1

### Patch Changes

- Updated dependencies [67c7644]
  - @platforma-open/milaboratories.functional-analysis.software@1.1.1

## 1.1.0

### Minor Changes

- 8ee5d36: Improved barplot visualization

### Patch Changes

- Updated dependencies [8ee5d36]
  - @platforma-open/milaboratories.functional-analysis.software@1.1.0
