#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

cd "$ROOT_DIR"

case "$1" in
  version)
    echo "Applying version changes..."
    pnpm changeset version "${@:2}"
    echo "Installing dependencies..."
    pnpm install
    ;;
  publish)
    echo "Publishing packages..."
    pnpm changeset publish "${@:2}"
    ;;
  add)
    echo "Adding changeset..."
    pnpm changeset add "${@:2}"
    ;;
  pre)
    echo "Entering pre-release mode..."
    pnpm changeset pre "${@:2}"
    ;;
  status)
    echo "Checking changeset status..."
    pnpm changeset status "${@:2}"
    ;;
  *)
    echo "Usage: ./release.sh <command>"
    echo ""
    echo "Commands:"
    echo "  version  - Apply version changes from changesets"
    echo "  publish  - Publish packages to npm"
    echo "  add      - Add a new changeset"
    echo "  pre      - Enter pre-release mode (pre major/minor/patch)"
    echo "  status   - Check the status of changesets"
    exit 1
    ;;
esac
