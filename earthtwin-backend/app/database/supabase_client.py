"""
Supabase Database Client & In-Memory Fallback Adapter for EarthTwin.

Ensures the backend works reliably in two modes:
1. Production Mode: Connected to real Supabase PostgreSQL via Supabase Python client.
2. College Demo / Mock Mode: In-memory repository with realistic ecological data
   when SUPABASE_URL / SUPABASE_KEY are omitted.
"""

import logging
from typing import Optional, List, Dict, Any
from app.config import settings

logger = logging.getLogger("earthtwin.database")

# Try importing supabase-py
try:
    from supabase import create_client, Client
    SUPABASE_SDK_AVAILABLE = True
except ImportError:
    Client = Any  # type: ignore
    SUPABASE_SDK_AVAILABLE = False


class SupabaseService:
    def __init__(self):
        self.client: Optional[Client] = None
        self.is_connected = False
        self._initialize_connection()

    def _initialize_connection(self):
        """Attempt connection to Supabase if credentials exist."""
        if not SUPABASE_SDK_AVAILABLE:
            logger.info("ℹ️ Supabase Python SDK not installed or unavailable; using EarthTwin Mock Store.")
            self.is_connected = False
            return

        if settings.SUPABASE_CONNECTED:
            try:
                self.client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                self.is_connected = True
                logger.info("✅ Successfully connected to Supabase PostgreSQL at %s", settings.SUPABASE_URL)
            except Exception as e:
                logger.warning("⚠️ Failed to initialize Supabase client (%s). Defaulting to mock data mode.", str(e))
                self.is_connected = False
        else:
            logger.info("ℹ️ Supabase credentials not set in .env. Running in standalone Mock Mode.")
            self.is_connected = False

    def get_client(self) -> Optional[Client]:
        """Returns active client or None."""
        return self.client if self.is_connected else None


# Global singleton instance
supabase_service = SupabaseService()
