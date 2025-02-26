#!/usr/bin/env Rscript

# Install and load necessary libraries
if (!requireNamespace("BiocManager", quietly = TRUE)) {
  install.packages("BiocManager", repos = "https://cloud.r-project.org",
                  quiet=TRUE)
}

required_packages <- c(
  "clusterProfiler", "AnnotationDbi", "ReactomePA", "optparse",
  "org.Hs.eg.db", "org.Mm.eg.db", "org.Rn.eg.db", "org.Dr.eg.db", 
  "org.Dm.eg.db", "org.At.tair.db", "org.Sc.sgd.db", "org.Ce.eg.db",
  "org.Gg.eg.db", "org.Bt.eg.db", "org.Ss.eg.db"
)

for (pkg in required_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    BiocManager::install(pkg, ask = FALSE, quiet = TRUE)
  }
  suppressPackageStartupMessages(library(pkg, character.only = TRUE))
}

# Set up command line options
option_list <- list(
  make_option(c("-i", "--input"), type = "character", default = NULL, 
              help = "Input CSV file path with Ensembl IDs", metavar = "file"),
  make_option(c("-p", "--pathway_collection"), type = "character", default = "GO", 
              help = "Pathway collection: GO, Reactome, WikiPathways, KEGG", metavar = "type"),
  make_option(c("-s", "--species"), type = "character", default = "homo-sapiens", 
              help = "Species (e.g., homo-sapiens for Homo sapiens)", metavar = "abbr"),
  make_option(c("-g", "--gene_subset"), type = "character", default = "Up_Down", 
              help = "Gene subsets for functional enrichment (e.g., Up, Down, DEGs). To select \
              more than one option join them in the same string with '_' as separator")
)

# Parse command line arguments
opt_parser <- OptionParser(option_list = option_list)
opt <- parse_args(opt_parser)

# Gene subset naming converter
subset_naming <- c(
  "Up" = "Upregulated",
  "Down" = "Downregulated",
  "DEGs" = "Dysregulated (all DEGs)"
)

# Species mapping function
mapSpecies <- function(speciesAbbr, collection) {
  mappings <- list(
    "GO" = list(
      "homo-sapiens" = "org.Hs.eg.db", 
      "mus-musculus" = "org.Mm.eg.db",
      "rattus-norvegicus" = "org.Rn.eg.db",
      "danio-rerio" = "org.Dr.eg.db",
      "drosophila-melanogaster" = "org.Dm.eg.db",
      "arabidopsis-thaliana" = "org.At.tair.db",
      "saccharomyces-cerevisiae" = "org.Sc.sgd.db",
      "caenorhabditis-elegans" = "org.Ce.eg.db",
      "gallus-gallus" = "org.Gg.eg.db",
      "bos-taurus" = "org.Bt.eg.db",
      "sus-scrofa" = "org.Ss.eg.db",
      "test-species" = "org.Mm.eg.db"
    ),
    "Reactome" = list(
      "homo-sapiens" = "human",
      "mus-musculus" = "mouse",
      "rattus-norvegicus" = "rat",
      "danio-rerio" = "zebrafish",
      "drosophila-melanogaster" = "fly",
      "arabidopsis-thaliana" = "arabidopsis",
      "saccharomyces-cerevisiae" = "yeast",
      "caenorhabditis-elegans" = "celegans",
      "gallus-gallus" = "chicken",
      "bos-taurus" = "cow",
      "sus-scrofa" = "pig",
      "test-species" = "mouse"
    ),
    "WikiPathways" = list(
      "homo-sapiens" = "Homo sapiens",
      "mus-musculus" = "Mus musculus",
      "rattus-norvegicus" = "Rattus norvegicus",
      "danio-rerio" = "Danio rerio",
      "drosophila-melanogaster" = "Drosophila melanogaster",
      "arabidopsis-thaliana" = "Arabidopsis thaliana",
      "saccharomyces-cerevisiae" = "Saccharomyces cerevisiae",
      "caenorhabditis-elegans" = "Caenorhabditis elegans",
      "gallus-gallus" = "Gallus gallus",
      "bos-taurus" = "Bos taurus",
      "sus-scrofa" = "Sus scrofa",
      "test-species" = "Mus musculus"
    ),
    "KEGG" = list(
      "homo-sapiens" = "hsa",
      "mus-musculus" = "mmu",
      "rattus-norvegicus" = "rno",
      "danio-rerio" = "dre",
      "drosophila-melanogaster" = "dme",
      "arabidopsis-thaliana" = "ath",
      "saccharomyces-cerevisiae" = "sce",
      "caenorhabditis-elegans" = "cel",
      "gallus-gallus" = "gga",
      "bos-taurus" = "bta",
      "sus-scrofa" = "ssc",
      "test-species" = "mmu"
    )
  )
  return(mappings[[collection]][[speciesAbbr]])
}

# Function to map Ensembl IDs to Entrez IDs
convertEnsemblToEntrez <- function(ensembl_ids, species) {
  orgDbPackage <- mapSpecies(species, "GO")
  library(orgDbPackage, character.only = TRUE)
  entrez_ids <- AnnotationDbi::mapIds(get(orgDbPackage),
                                      keys = ensembl_ids,
                                      column = "ENTREZID",
                                      keytype = "ENSEMBL",
                                      multiVals = "first")
  return(entrez_ids)
}

# Dynamically load the organism-specific annotation database
getOrgDb <- function(species, collection) {
  orgDbPackage <- mapSpecies(species, collection)
  library(orgDbPackage, character.only = TRUE)
  return(get(orgDbPackage))
}

# Main function to perform over-representation analysis
runORA <- function(trend_data, dir_label) {
  print(paste("Running enrichment analysis for genes with following trend: ",
              dir_label))
  # Proceed only if we have genes with selected trend
  if (nrow(trend_data) != 0) {
    # Map Ensembl IDs to Entrez IDs
    trend_data$EntrezId <- convertEnsemblToEntrez(as.character(trend_data$Ensembl.Id),
                                                  opt$species)
    trend_data <- trend_data[!is.na(trend_data$EntrezId), ]
    gene_ids <- as.character(trend_data$EntrezId)

    # Set species mapping for pathway collection
    species_for_collection <- mapSpecies(opt$species, opt$pathway_collection)
    background_genes <- keys(getOrgDb(opt$species, "GO"), keytype = "ENTREZID")

    # Debugging info
    print(paste("Number of", dir_label, "input genes:", length(gene_ids)))
    print(paste("Number of", dir_label, "background genes:",
                length(background_genes)))

    # Perform enrichment analysis based on pathway collection
    ora_results <- switch(
      tolower(opt$pathway_collection),
      "go" = enrichGO(
        gene = gene_ids,
        OrgDb = getOrgDb(opt$species, "GO"),
        keyType = "ENTREZID",
        universe = background_genes,
        ont = "ALL",
        pvalueCutoff = 0.05,
        qvalueCutoff = 0.2
      ),
      "kegg" = enrichKEGG(
        gene = gene_ids,
        organism = species_for_collection,
        keyType = "kegg",
        universe = background_genes,  # Add universe
        pvalueCutoff = 0.05,
        use_internal_data = TRUE
      ),
      "reactome" = enrichPathway(
        gene = gene_ids,
        organism = species_for_collection,
        universe = background_genes,  # Add universe
        pvalueCutoff = 0.05,
        qvalueCutoff = 0.2
      ),
      "wikipathways" = enrichWP(
        gene = gene_ids,
        organism = species_for_collection,
        pvalueCutoff = 0.05
      ),
      stop("Invalid pathway collection specified.")
    )

    if (is.null(ora_results) || nrow(as.data.frame(ora_results)) == 0) {
      message("No significant pathways found or analysis could not be performed.")

      # Define placeholder column names
      if (opt$pathway_collection == "GO") {
        placeholder_columns <- c("ONTOLOGY", "ID", "Description", "GeneRatio",
                              "BgRatio", "RichFactor", "FoldEnrichment", "zScore",
                              "pvalue", "p.adjust", "qvalue", "geneID", "Count",
                              "minlog10padj")
      } else {
        placeholder_columns <- c("ID", "Description", "GeneRatio",
                                "BgRatio", "RichFactor", "FoldEnrichment", "zScore",
                                "pvalue", "p.adjust", "qvalue", "geneID", "Count",
                                "minlog10padj")
      }
      # Create a placeholder empty data frame
      placeholder_df <- as.data.frame(matrix(ncol = length(placeholder_columns),
                                            nrow = 0))
      colnames(placeholder_df) <- placeholder_columns

      return(placeholder_df)
    }

    # Add -log10(p.adjust) column
    enriched_results <- as.data.frame(ora_results)
    enriched_results$`minlog10padj` <- -log10(enriched_results$p.adjust)

  # No input genes
  } else {
    print(paste("Number of", dir_label, "input genes: 0"))
    print(paste("Skipping analysis for empty tables..."))
    # Define placeholder column names
    if (opt$pathway_collection == "GO") {
      placeholder_columns <- c("ONTOLOGY", "ID", "Description", "GeneRatio",
                            "BgRatio", "RichFactor", "FoldEnrichment", "zScore",
                            "pvalue", "p.adjust", "qvalue", "geneID", "Count",
                            "minlog10padj")
    } else {
      placeholder_columns <- c("ID", "Description", "GeneRatio",
                              "BgRatio", "RichFactor", "FoldEnrichment", "zScore",
                              "pvalue", "p.adjust", "qvalue", "geneID", "Count",
                              "minlog10padj")
    }
    # Create a placeholder empty data frame
    placeholder_df <- as.data.frame(matrix(ncol = length(placeholder_columns),
                                           nrow = 0))
    colnames(placeholder_df) <- placeholder_columns

    return(placeholder_df)
  }

  return(enriched_results)
}

# Load input data table
gene_data <- read.csv(opt$input)
# Get list of interest subsets
subsets <- strsplit(opt$gene_subset, "_")[[1]]

enriched_results <- data.frame()
top10_results <- data.frame()
for (subs in subsets) {
  # Get list of genes with selected FC trend direction
  if (subs == "DEGs") {
    pos <- gene_data[, 2] %in% c("Up", "Down")
  } else {
    pos <- gene_data[, 2] == subs
  }
  trend_data <- gene_data[pos, , drop = FALSE]

  # Run the analysis for specific subset
  df <- runORA(trend_data, dir_label = subs)
  # Continue only if there are results
  if (nrow(df) > 0) {
    df["regDirection"] <- toString(subset_naming[subs])
    # Convert gene ratio to gene %
    df["GenePercent"] <- unlist(lapply(strsplit(df[, "GeneRatio"], "/"),
                                      function(v) as.integer(v[1]) / as.integer(v[2]) * 100))

    # Combine all results in the same dataframe
    enriched_results <- rbind(enriched_results, df)

    # Combine top results in same table
    # For GO we get top 10 per ontology
    if (opt$pathway_collection == "GO") {
      top_row <- c()
      ontology_list <- unique(df["ONTOLOGY"])
      ontology_list <- ontology_list[!is.na(ontology_list)]
      for (onto in ontology_list) {
        pos <- df["ONTOLOGY"] == onto & !(is.na(df["ONTOLOGY"]))
        top_row <- c(top_row, 
                    rownames(head(df[pos, ][order(df[pos, ]$p.adjust), ], 10)))
      }
      top10_results <- rbind(top10_results,
                            df[top_row, ])
    } else {
      top10_results <- rbind(top10_results,
                            head(as.data.frame(df[order(df$p.adjust), ]), 10))
    }
  # If no results, just add needed columns
  } else {
    # Add new columns and turn frame to empty again
    df[1, ] <- NA
    df[, c("regDirection", "GenePercent")] <- NA
    df <- df[0, ]

    # Combine with main tables for rare cases in which we will have no results at all
    enriched_results <- rbind(enriched_results, df)
    top10_results <- rbind(top10_results, df)
  }
}

# Define output file paths
input_dir <- dirname(opt$input)
results_file <- file.path(input_dir,
                          paste0("pathwayEnrichmentResults.csv"))
top10_results_file <- file.path(input_dir,
                                paste0("top10PathwayEnrichmentResults.csv"))
# Save all results
write.csv(as.data.frame(enriched_results), results_file, row.names = FALSE)
# Save the top 10 results by p.adjust
write.csv(top10_results, top10_results_file, row.names = FALSE)

message(paste("Analysis completed. Results are saved in", results_file))
