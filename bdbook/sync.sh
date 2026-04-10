#!/bin/bash
while true
do
  git add .
  git commit -m "Auto-sync from Termux bdbook folder"
  git push origin main
  echo "✅ GitHub updated! Waiting for next change..."
  sleep 300
done
