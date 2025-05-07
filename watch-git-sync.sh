#!/bin/bash
while true; do
  CHANGES=$(git status --porcelain)
  if [[ $CHANGES ]]; then
    git add .
    git commit -m "Auto sync at $(date)"
    git push origin main
  fi
  sleep 10
done
