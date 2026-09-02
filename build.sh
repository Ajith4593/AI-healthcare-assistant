#!/usr/bin/env bash
# exit on error
set -o errexit

echo "========================================="
echo "Building RuralCare AI for Render Deployment"
echo "========================================="

# 1. Install Python Dependencies
echo "--> Installing Python requirements..."
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn uvicorn[standard]

# 2. Install Node.js & Build Frontend
echo "--> Installing Node.js packages..."
npm install

echo "--> Building Vite React Frontend..."
npm run build

# 3. Initialize Database Schema
echo "--> Initializing Database Schema..."
python -c "import sys, os; sys.path.insert(0, os.path.join(os.getcwd(), 'healthcare-backend', 'backend')); from app.database.session import init_db; init_db(); print('Database tables initialized successfully!')"

echo "========================================="
echo "Build Completed Successfully!"
echo "========================================="
