#!/bin/bash
# Build website https://moneylog.aurelio.net
# The actual deploy is handled automatically by Netlify.

# Enter repo root
cd $(dirname "$0")
cd ..
root="$PWD"

deploy_dir="$root/public"

# Copy files
cp -r \
  moneylog.{css,js,html} \
  css/ \
  storage/ \
  "$deploy_dir"
