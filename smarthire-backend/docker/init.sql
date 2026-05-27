-- PostgreSQL initialisation script
-- Runs once when the container is first created.

\connect smarthiredb001

CREATE SCHEMA IF NOT EXISTS smarthire;

-- Grant full access to the application user
GRANT ALL ON SCHEMA smarthire TO smarthire;
ALTER ROLE smarthire SET search_path TO smarthire, public;
