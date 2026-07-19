import logging
from typing import Dict, Any, Optional
from app.database_metadata_profilinglayer.explorer import DatabaseExplorer
from app.database_metadata_profilinglayer.schema_loader import SchemaLoader

logger = logging.getLogger("metadata_generator")

class MetadataGenerator:
    """
    Coordinates DatabaseExplorer and SchemaLoader to synthesize a unified,
    structured, and JSON-serializable dictionary of database schemas.
    
    This metadata forms the contextual knowledge graph injected into LLM prompts.
    """
    def __init__(
        self,
        explorer: Optional[DatabaseExplorer] = None,
        schema_loader: Optional[SchemaLoader] = None
    ) -> None:
        """
        Initializes the generator with its dependent search components (DI).
        """
        self.explorer = explorer or DatabaseExplorer()
        self.schema_loader = schema_loader or SchemaLoader(self.explorer)

    def generate(self) -> Dict[str, Any]:
        """
        Queries and compiles database specifications for all tables.
        
        Returns:
            Dict[str, Any]: Consolidated metadata describing tables, columns,
                            types, sizes, primary keys, and relationships.
        """
        logger.info("Starting consolidated database schema metadata generation...")
        
        try:
            # 1. Discover database summary
            summary = self.explorer.get_summary()
            db_name = summary["database_name"]
            tables = list(summary["tables"].keys())

            metadata = {
                "database_name": db_name,
                "total_tables": summary["total_tables"],
                "tables": {}
            }

            # 2. Iterate and fetch structure for each user-defined table
            for table in tables:
                table_counts = summary["tables"][table]
                schema = self.schema_loader.load_table_schema(table)

                # Assemble unified table profile
                metadata["tables"][table] = {
                    "row_count": table_counts["row_count"],
                    "column_count": table_counts["column_count"],
                    "columns": schema["columns"],
                    "relationships": schema["relationships"]
                }

            logger.info("Consolidated database schema metadata generation complete.")
            return metadata
            
        except Exception as e:
            logger.error(f"Error compiling database metadata: {str(e)}")
            raise e
