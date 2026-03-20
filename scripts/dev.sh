#!/bin/sh

if [ -f env_var.sh ]; then
  . env_var.sh
else
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║                                                                ║"
  echo "║   WARNING: env_var.sh not found!                               ║"
  echo "║                                                                ║"
  echo "║   The app may not work correctly without environment vars.     ║"
  echo "║   See README.md for required environment variables.            ║"
  echo "║                                                                ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
fi

exec nuxt dev
