#!/bin/bash

# Script per pulire i file non necessari dal repository
# Utilizzare con cautela - controlla prima cosa viene rimosso

echo "🧹 Pulizia file non necessari dal repository CareerConnect..."

# Rimuovi file di test e debug (solo se esistono)
echo "📝 Rimozione file di test e debug..."
find . -name "*test*.js" -type f -delete 2>/dev/null || true
find . -name "*test*.cjs" -type f -delete 2>/dev/null || true
find . -name "*debug*.js" -type f -delete 2>/dev/null || true
find . -name "*debug*.cjs" -type f -delete 2>/dev/null || true
find . -name "check-*.js" -type f -delete 2>/dev/null || true
find . -name "check-*.cjs" -type f -delete 2>/dev/null || true
find . -name "add-test-*.cjs" -type f -delete 2>/dev/null || true
find . -name "fix-*.cjs" -type f -delete 2>/dev/null || true
find . -name "complete-*.cjs" -type f -delete 2>/dev/null || true

# Rimuovi file di configurazione temporanei
echo "⚙️ Rimozione file temporanei..."
rm -f block-*.json 2>/dev/null || true
rm -f unblock-*.json 2>/dev/null || true

# Rimuovi script di migrazione database (mantieni solo quelli essenziali)
echo "🗄️ Rimozione script migrazione non essenziali..."
rm -f migrate-*.js 2>/dev/null || true
rm -f update-user-schema.js 2>/dev/null || true
rm -f add-company-description.cjs 2>/dev/null || true
rm -f add-cv-field.cjs 2>/dev/null || true
rm -f add-user-blocking.cjs 2>/dev/null || true

echo "✅ Pulizia completata!"
echo "⚠️ Ricorda di controllare che il sito funzioni ancora correttamente"
