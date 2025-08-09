#!/usr/bin/env bash
set -eo pipefail

# Read the hook JSON from stdin and extract the edited file path.
payload="$(cat)"
file_path="$(jq -r '.tool_input.file_path // .tool_response.filePath // empty' <<<"$payload")"

# Only act on TS files.
case "$file_path" in
  *.ts)
    # Lint just the changed file (use auto-fix to correct issues).
    npm run lint:fix -- "$file_path" || {
      echo "ESLint failed for $file_path" >&2
      # Exit code 2 tells Claude to treat this as a blocking error and use stderr to fix it.
      exit 2
    }

    # Project-wide typecheck (incremental cache makes repeated runs fast).
    npm run typecheck || {
      echo "TypeScript typecheck failed." >&2
      exit 2
    }
    ;;
esac

exit 0