#!/bin/bash
until node app.js; do
  echo "Server crashed. Restarting in 5 seconds..."
  sleep 5
done

