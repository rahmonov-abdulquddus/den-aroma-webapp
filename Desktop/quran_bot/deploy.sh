#!/bin/bash

# Quran Bot Deployment Script
echo "🚀 Quran Bot deployment boshlandi..."

# Environment check
if [ ! -f .env ]; then
    echo "❌ .env fayli topilmadi!"
    echo "📝 .env.example faylini nusxalab, kerakli ma'lumotlarni to'ldiring"
    exit 1
fi

# Dependencies check
if [ ! -d "node_modules" ]; then
    echo "📦 Dependensiyalar o'rnatilmoqda..."
    npm install
fi

# Logs directory
if [ ! -d "logs" ]; then
    echo "📁 Logs papkasi yaratilmoqda..."
    mkdir -p logs
fi

# MongoDB check
echo "🗄️ MongoDB tekshirilmoqda..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️ MongoDB o'rnatilmagan. Docker orqali ishga tushirish mumkin:"
    echo "docker-compose up -d mongo"
fi

# PM2 check
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 o'rnatilmoqda..."
    npm install -g pm2
fi

# Backup directory
if [ ! -d "backups" ]; then
    echo "📁 Backup papkasi yaratilmoqda..."
    mkdir -p backups
fi

# Stop existing process
echo "🛑 Mavjud jarayon to'xtatilmoqda..."
pm2 stop quran-bot 2>/dev/null || true
pm2 delete quran-bot 2>/dev/null || true

# Start with PM2
echo "🚀 Bot PM2 bilan ishga tushirilmoqda..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo "✅ Deployment muvaffaqiyatli yakunlandi!"
echo "📊 Monitoring: pm2 monit"
echo "📋 Loglar: pm2 logs quran-bot"
echo "🔄 Qayta ishga tushirish: pm2 restart quran-bot"
