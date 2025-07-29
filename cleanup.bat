@echo off
REM Script para limpeza diária do CodeShare
echo [%date% %time%] Iniciando limpeza automatica...

cd /d "c:\Users\r.cruz\Desktop\CodeShare"
node cleanup.js

echo [%date% %time%] Limpeza concluida.
