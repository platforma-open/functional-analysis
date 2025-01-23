# Renv does not 'catch' custom functions used to load and use library
# depenencies (like is used in run_DESeq2).
# This file is not used in production code, but helps renv to see
# all dependencies hidden from static code analysis.

library("optparse")
library("clusterProfiler")
library("tidyr")
library("dplyr")
library("ggplot2")
library("tidytree")
library("AnnotationDbi")
