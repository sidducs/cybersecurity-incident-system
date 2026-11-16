@echo off
title PostgreSQL Terminal - cybersecurity_db
echo =====================================================================
echo  Connecting to PostgreSQL: cybersecurity_db (User: postgres)
echo =====================================================================
set PGPASSWORD=2233
"C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -p 5432 -U postgres -d cybersecurity_db
pause

