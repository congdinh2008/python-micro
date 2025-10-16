#!/bin/bash
# Script để chạy Product Catalog Service

echo "🚀 Starting Product Catalog Service..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  File .env không tồn tại. Đang tạo từ .env.example..."
    cp .env.example .env
    echo "✅ Đã tạo file .env. Vui lòng kiểm tra và cập nhật cấu hình nếu cần."
    echo ""
fi

# Check if database needs migration
if [ ! -f product_catalog.db ]; then
    echo "📊 Database chưa được khởi tạo. Đang chạy migrations..."
    alembic upgrade head
    echo "✅ Đã tạo database."
    echo ""
fi

# Run the application
echo "🌐 Starting server at http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload
