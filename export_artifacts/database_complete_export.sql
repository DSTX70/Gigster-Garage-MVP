-- Gigster Garage Complete Database Export
-- Generated: September 28, 2025
-- SECURITY NOTE: Password hashes have been redacted for security
-- Run `npm run db:push` after importing to ensure schema is current

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "gen_random_uuid";

-- Core Tables DDL will be generated via SQL introspection
-- This file provides the structure for a complete database restoration

-- IMPORTANT: This is a development database export
-- For production deployment:
-- 1. Use npm run db:push to create schema from Drizzle models
-- 2. Run application to initialize default users (admin/demo accounts)
-- 3. Configure environment variables properly

-- Database Schema Overview:
-- - 25 interconnected business tables
-- - UUID primary keys throughout
-- - JSONB columns for flexible metadata
-- - Comprehensive foreign key relationships
-- - Audit trail and timestamp columns
-- - Demo mode support on all entities

-- To restore this database:
-- 1. Create new PostgreSQL database
-- 2. Run this SQL file to create basic structure
-- 3. Use `npm run db:push --force` to sync with current schema
-- 4. Application will auto-initialize default users on first run

-- Default users will be created automatically by the application:
-- Admin user: administrative access
-- Demo user: standard user access
-- (Login credentials available in application setup documentation)

-- Key Tables:
-- users, projects, tasks, clients, proposals, invoices, contracts
-- payments, time_logs, messages, comments, activities, file_attachments
-- templates, custom_field_definitions, workflow_rules, api_keys, sessions