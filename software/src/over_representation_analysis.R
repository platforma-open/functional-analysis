#!/usr/bin/env Rscript

# Install and load necessary libraries
if (!requireNamespace("BiocManager", quietly = TRUE)) {
  install.packages("BiocManager", repos = "https://cloud.r-project.org")
}

required_packages <- c(
  "clusterProfiler", "AnnotationDbi", "ReactomePA", "optparse",
  "org.Hs.eg.db", "org.Mm.eg.db", "org.Rn.eg.db", "org.Dr.eg.db", 
  "org.Dm.eg.db", "org.At.tair.db", "org.Sc.sgd.db", "org.Ce.eg.db",
  "org.Gg.eg.db", "org.Bt.eg.db", "org.Ss.eg.db"
)

for (pkg in required_packages) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    BiocManager::install(pkg, ask = FALSE)
  }
  library(pkg, character.only = TRUE)
}

# Set up command line options
option_list <- list(
  make_option(c("-i", "--input"), type = "character", default = NULL, 
              help = "Input CSV file path with Ensembl IDs", metavar = "file"),
  make_option(c("-p", "--pathway_collection"), type = "character", default = "GO", 
              help = "Pathway collection: GO, Reactome, WikiPathways, KEGG", metavar = "type"),
  make_option(c("-s", "--species"), type = "character", default = "homo-sapiens", 
              help = "Species (e.g., homo-sapiens for Homo sapiens)", metavar = "abbr")
)

# Parse command line arguments
opt_parser <- OptionParser(option_list = option_list)
opt <- parse_args(opt_parser)

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
runORA <- function() {
  gene_data <- read.csv(opt$input)
  
  # Map Ensembl IDs to Entrez IDs
  gene_data$EntrezId <- convertEnsemblToEntrez(as.character(gene_data$Ensembl.Id), opt$species)
  gene_data <- gene_data[!is.na(gene_data$EntrezId), ]
  gene_ids <- as.character(gene_data$EntrezId)
  
  # Set species mapping for pathway collection
  species_for_collection <- mapSpecies(opt$species, opt$pathway_collection)
  background_genes <- keys(getOrgDb(opt$species, "GO"), keytype = "ENTREZID")
  
  # Debugging info
  print(paste("Number of input genes:", length(gene_ids)))
  print(paste("Number of background genes:", length(background_genes)))
  
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
  
  # Check if results exist
  input_dir <- dirname(opt$input)
  results_file <- file.path(input_dir, "pathwayEnrichmentResults.csv")
  top10_results_file <- file.path(input_dir, "top10PathwayEnrichmentResults.csv")

  if (is.null(ora_results) || nrow(as.data.frame(ora_results)) == 0) {
    message("No significant pathways found or analysis could not be performed.")
    
    # Define placeholder column names
    placeholder_columns <- c("ONTOLOGY", "ID", "Description", "zScore", "GeneRatio", "BgRatio", 
                             "pvalue", "p.adjust", "qvalue", "geneID", "Count", "-log10(p.adjust)")
    
    # Create a placeholder data frame
    placeholder_df <- as.data.frame(matrix(ncol = length(placeholder_columns), nrow = 1))
    colnames(placeholder_df) <- placeholder_columns
    placeholder_df[1, 2] <- "No significant pathways found or analysis could not be performed."
    
    # Save the placeholder CSV file
    write.csv(placeholder_df, results_file, row.names = FALSE)
    write.csv(placeholder_df, top10_results_file, row.names = FALSE)
    
    message(paste("An empty results file has been created at", results_file))
    return(invisible())
  }
  
  # Add -log10(p.adjust) column
  enriched_results <- as.data.frame(ora_results)
  enriched_results$`minlog10padj` <- -log10(enriched_results$p.adjust)

  # Save results
  write.csv(as.data.frame(enriched_results), results_file, row.names = FALSE)

  # Save the top 10 results by p.adjust
  top10_results <- head(as.data.frame(enriched_results[order(enriched_results$p.adjust), ]), 10)
  write.csv(top10_results, top10_results_file, row.names = FALSE)
  
  message(paste("Analysis completed. Results are saved in", results_file))
}

# Run the analysis
runORA()
