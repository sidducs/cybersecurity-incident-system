-- ============================================================================
-- DBMS EXPERIENTIAL LEARNING LEVEL 3 PROJECT
-- PROJECT: Cybersecurity Incident Correlation & Response Intelligence System
-- PHASE 2: SQL DDL IMPLEMENTATION - CONSTRAINTS VERIFICATION & METADATA AUDIT
-- TARGET RDBMS: PostgreSQL 14+
-- ============================================================================
-- Purpose:
-- Provides analytical catalog queries to verify all Primary Keys, Foreign Keys,
-- Unique constraints, Check constraints, and Default rules implemented across
-- the 11 database relations.
-- ============================================================================

-- 1. INSPECT ALL PRIMARY KEYS
SELECT 
    tc.table_name, 
    kc.column_name, 
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kc 
    ON tc.constraint_name = kc.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 2. INSPECT ALL FOREIGN KEYS AND REFERENTIAL ACTIONS (CASCADE/RESTRICT/SET NULL)
SELECT 
    tc.table_name AS dependent_table,
    kcu.column_name AS foreign_key_column,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_primary_key,
    rc.update_rule,
    rc.delete_rule,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY dependent_table;

-- 3. INSPECT ALL DOMAIN CHECK CONSTRAINTS
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK' 
  AND tc.table_schema = 'public'
  AND tc.constraint_name NOT LIKE '%_not_null'
ORDER BY tc.table_name, tc.constraint_name;

-- 4. INSPECT ALL UNIQUE CONSTRAINTS
SELECT 
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;
