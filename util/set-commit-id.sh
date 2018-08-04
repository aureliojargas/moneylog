#!/bin/bash
# Aurelio Jargas
#
# Set the hash for the latest Git commit in $commit_id variable
#
# Usage:
#	source set-commit-id.sh
#

commit_id=$(git log -1 --format="%H" | cut -c 1-8)  # 8 chars are enough

# Check
if ! echo "$commit_id" | grep '^[0-9a-f]\{8\}$' > /dev/null
then
	echo "ERROR: Invalid Git commit hash: '$commit_id'. Aborting." >&2
	exit 1
fi
