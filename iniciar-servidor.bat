@echo off
setlocal
title Search Book - servidor local
cd /d "%~dp0"

echo.
echo  ===================================
echo   Search Book - iniciando servidor
echo  ===================================
echo.

REM (sem bloco com parenteses aqui: caminhos como "Projeto (1)" quebrariam o %cd%)
if exist "index.html" goto achou_index
echo [ERRO] Nao encontrei o index.html nesta pasta:
echo        %cd%
echo Coloque este arquivo na mesma pasta do index.html e tente de novo.
echo.
pause
exit /b 1

:achou_index

REM ---- 1) Python pelo launcher "py" (instalador oficial do python.org) ----
py -3 --version >nul 2>&1
if %errorlevel%==0 (
  py -3 servidor.py
  goto fim
)

REM ---- 2) Python pelo comando "python" ----
REM O atalho da Microsoft Store falha no --version, entao ele e ignorado aqui.
python --version >nul 2>&1
if %errorlevel%==0 (
  python servidor.py
  goto fim
)

REM ---- 3) Node.js como alternativa ----
where npx >nul 2>&1
if %errorlevel%==0 (
  echo Python nao encontrado. Usando Node.js ^(http-server^)...
  echo Endereco: http://localhost:8080/index.html
  start "" /b cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:8080/index.html"
  call npx --yes http-server . -a 127.0.0.1 -p 8080 -c-1
  goto fim
)

echo [ERRO] Nao encontrei Python nem Node.js neste computador.
echo.
echo Instale o Python em https://www.python.org/downloads/
echo   - Na instalacao, marque a opcao "Add python.exe to PATH".
echo Depois de instalar, de dois cliques neste arquivo de novo.
echo.
echo Outra opcao: no VS Code, instale a extensao "Live Server"
echo e clique em "Go Live" com o index.html aberto.
echo.

:fim
echo.
echo Servidor encerrado.
pause
