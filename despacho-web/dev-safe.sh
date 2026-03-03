#!/bin/bash

echo "🛑 Deteniendo procesos existentes..."
sudo pkill -f node
sudo pkill -f npm
sudo pkill -f next

echo "📊 Verificando que no quede nada..."
sleep 2
ps aux | grep -E "(node|npm|next)" || echo "✅ No hay procesos corriendo"

echo "🚀 Iniciando servidor con límite de memoria..."
cd "/Users/sebastian/Desktop/abogados app/despacho-web"
NODE_OPTIONS="--max-old-space-size=4096" npm run dev 2>&1 | tee -a dev-safe.log