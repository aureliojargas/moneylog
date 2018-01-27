#!/bin/bash
# Call ESLint to lint our JavaScript files.
# Lint rules are on .eslintrc.yml at repo root.

# Enter repo root
cd $(dirname "$0")
cd ..

# Lint all JavaScript files
eslint --fix \
  *.js \
  */*.js \
  */*/*.js
