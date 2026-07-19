import time
import logging
from typing import Dict, Any, Optional
from app.database_metadata_profilinglayer.metadata import MetadataGenerator
from app.database_metadata_profilinglayer.profiler import DatabaseProfiler

logger = logging.getLogger("metadata_cache")

class MetadataCache:
    """
    In-memory singleton cache to store consolidated database schemas and profiles.
    
    Caching schema metadata:
    - Eliminates network latencies to PostgreSQL database catalogs on user requests.
    - Prevents CPU spikes and connection starvation on database servers.
    - Resolves catalog structures in milliseconds from RAM instead of hundreds of milliseconds from disk.
    """
    _instance: Optional["MetadataCache"] = None

    def __new__(cls) -> "MetadataCache":
        """Enforces Singleton design pattern."""
        if cls._instance is None:
            cls._instance = super(MetadataCache, cls).__new__(cls)
            cls._instance._metadata = None
            cls._instance._last_loaded = 0.0
        return cls._instance

    def __init__(self) -> None:
        # Avoid re-initializing dependencies if already initialized (due to Singleton behavior)
        if not hasattr(self, "initialized"):
            self.metadata_generator = MetadataGenerator()
            self.profiler = DatabaseProfiler()
            self.initialized = True

    def load(self, force: bool = False) -> None:
        """
        Queries PostgreSQL catalog views, aggregates statistical metrics,
        and caches the consolidated structure in memory.
        
        Args:
            force (bool): If True, re-queries database catalogs even if data is cached.
        """
        if self._metadata is not None and not force:
            logger.info("Metadata already present in cache. Skipping catalog re-query.")
            return

        start_time = time.time()
        logger.info("Building database metadata cache. Querying catalogs and profiling contents...")
        
        try:
            # 1. Fetch structural schema layouts
            schema_meta = self.metadata_generator.generate()
            
            # 2. Fetch value statistical profiles
            profiling_meta = self.profiler.profile_database()

            # 3. Consolidate structural layouts with statistical profiles
            consolidated = {
                "database_name": schema_meta["database_name"],
                "total_tables": schema_meta["total_tables"],
                "tables": {}
            }

            for table_name, table_schema in schema_meta["tables"].items():
                profile = profiling_meta.get(table_name, {})
                
                # Align structural column specs with statistical profiles
                columns_consolidated = []
                for col in table_schema["columns"]:
                    col_name = col["name"]
                    col_profile = profile.get("columns", {}).get(col_name, {})

                    columns_consolidated.append({
                        "name": col_name,
                        "data_type": col["data_type"],
                        "nullable": col["nullable"],
                        "default": col["default"],
                        "is_primary": col["is_primary"],
                        "type_classification": col_profile.get("type_classification", "text"),
                        "null_count": col_profile.get("null_count", 0),
                        "distinct_count": col_profile.get("distinct_count", 0),
                        "min": col_profile.get("min"),
                        "max": col_profile.get("max"),
                        "average": col_profile.get("average"),
                        "sample_values": col_profile.get("sample_values", [])
                    })

                consolidated["tables"][table_name] = {
                    "row_count": table_schema["row_count"],
                    "column_count": table_schema["column_count"],
                    "columns": columns_consolidated,
                    "relationships": table_schema["relationships"]
                }

            self._metadata = consolidated
            self._last_loaded = time.time()
            elapsed_time = self._last_loaded - start_time
            logger.info(f"Metadata cache loaded successfully in {elapsed_time:.3f} seconds.")
            
        except Exception as e:
            logger.error(f"Failed to populate metadata cache: {str(e)}")
            raise e

    def get_metadata(self) -> Dict[str, Any]:
        """
        Retrieves the cached metadata. Automatically lazy-loads if empty.
        
        Returns:
            Dict[str, Any]: Consolidated metadata dictionary.
        """
        if self._metadata is None:
            logger.info("Cache miss: metadata not built yet. Triggering lazy load...")
            self.load()
        return self._metadata

    def clear(self) -> None:
        """
        Flushes cached metadata from memory.
        """
        self._metadata = None
        self._last_loaded = 0.0
        logger.info("Metadata cache flushed.")
