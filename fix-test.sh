#!/bin/bash
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

echo "Installing dependencies..."
npm install

echo "Running tests..."
npm test
