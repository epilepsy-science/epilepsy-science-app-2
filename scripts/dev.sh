#!/bin/sh

if [ -f env_var_set.sh ]; then
  . env_var_set.sh
else
  echo ""
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║                                                                ║"
  echo "║   WARNING: env_var_set.sh not found!                           ║"
  echo "║                                                                ║"
  echo "║   The app may not work correctly without environment vars.     ║"
  echo "║   See README.md for required environment variables.            ║"
  echo "║                                                                ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo ""
fi

exec nuxt dev
