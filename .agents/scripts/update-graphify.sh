#!/usr/bin/env bash

# Discard stdin safely (hook lifecycle payload)
cat > /dev/null 2>&1 || true

# Determine workspace root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if ! pgrep -f "graphify" >/dev/null 2>&1; then
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import subprocess; subprocess.Popen(['graphify', 'update'], cwd='$WORKSPACE_ROOT', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, start_new_session=True)" 2>/dev/null || true
    fi
fi

# Return empty JSON object for tool hook contracts
echo "{}"
