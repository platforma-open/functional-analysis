# @platforma-open/milaboratories.functional-analysis.software

## 2.3.5

### Patch Changes

- 052ed78: Fix runtime `Permission denied` when the container runs as a non-root UID (MILAB-6263). The entrypoint re-invoked `renv::restore()` on every start, which tries to reconcile the system R library at `/usr/local/lib/R/site-library/` with the project lockfile. When the `r-base:4.4.2` base image preinstalled a version of a locked package (e.g. `rlang`) that differs from `renv.lock`, renv attempted to back up the system-library copy before replacing it — failing on hosts that run the container unprivileged. renv now installs into a project-local library at `/app/renv/library` and `R_LIBS_USER` points R at the same path, so the obsolete `/app/run.sh` wrapper and runtime restore are removed.

## 2.3.4

### Patch Changes

- 17a478d: Make R script executable to run it in docker

## 2.3.3

### Patch Changes

- b30e41b: Improved UI and updated metadata

## 2.3.2

### Patch Changes

- 3a93570: technical release
- 5046183: technical release
- 1019512: technical release
- 5a0b864: technical release

## 2.3.1

### Patch Changes

- 5505b06: Full SDK update

## 2.3.0

### Minor Changes

- d124204: multiple DEG and new R env
- 2c1dd56: Changeset after merge issues
