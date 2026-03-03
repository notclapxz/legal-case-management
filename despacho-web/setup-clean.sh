#!/bin/bash
cd "/Users/sebastian/Desktop/abogados-app/despacho-web"
echo "📍 Current directory: $(pwd)"
echo "🧹 Cleaning old installation..."
rm -rf node_modules package-lock.json .next
echo "📦 Installing fresh dependencies..."
npm install
echo "🚀 Starting development server..."
npm run dev