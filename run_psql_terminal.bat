@echo off
title PostgreSQL 15 - cybersecurity_db
set PGPASSWORD=2233
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d cybersecurity_db
pause

