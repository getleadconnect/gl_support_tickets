#!/bin/bash

echo "Starting GL Tickets React App..."
echo ""
echo "==================================="
echo "IMPORTANT: PHP DOM Extension Missing"
echo "==================================="
echo ""
echo "The DOMDocument class is not available in your system PHP (8.4.11)."
echo "This is required for Laravel's PDF generation and other features."
echo ""
echo "To fix this issue, you need to install the PHP XML extension:"
echo ""
echo "  sudo apt-get update"
echo "  sudo apt-get install php8.4-xml"
echo ""
echo "Alternatively, you can use XAMPP's PHP which has DOM extension:"
echo "  /opt/lampp/bin/php artisan serve"
echo ""
echo "However, XAMPP's PHP (8.1.25) is too old for Laravel 12 (requires PHP >= 8.2.0)"
echo ""
echo "==================================="
echo ""
echo "For now, trying to start with limited functionality..."
echo ""

# Try to start the development server
# First, let's try to run the frontend
echo "Starting Vite development server..."
npm run dev &

# Store the PID
VITE_PID=$!

echo "Vite server started with PID: $VITE_PID"
echo ""
echo "Frontend should be accessible at: http://localhost:5173"
echo ""
echo "Note: Backend API endpoints will not work without the PHP DOM extension."
echo "Please install php8.4-xml to enable full functionality."
echo ""
echo "Press Ctrl+C to stop the server..."

# Wait for interrupt
trap "echo 'Shutting down...'; kill $VITE_PID; exit" INT TERM
wait $VITE_PID