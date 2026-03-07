-- db/init.sql
-- Initial database setup — runs once when the container is first created
-- Sequelize handles table creation; this sets up extensions and config

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable inet functions for IP analytics
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search on URLs

-- Set timezone
SET timezone = 'UTC';

-- Performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '512MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET checkpoint_completion_target = '0.9';
ALTER SYSTEM SET wal_buffers = '8MB';
ALTER SYSTEM SET random_page_cost = '1.1';
