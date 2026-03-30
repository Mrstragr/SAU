#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   MYSQL_HOST=127.0.0.1 MYSQL_PORT=3306 MYSQL_USER=root MYSQL_PASSWORD=pass \
#   ./load.sh

DB_NAME=${MYSQL_DATABASE:-sau_transport}
HOST=${MYSQL_HOST:-127.0.0.1}
PORT=${MYSQL_PORT:-3306}
USER=${MYSQL_USER:-root}
PASS=${MYSQL_PASSWORD:-rootpass}

mysql_cmd=( mysql -h"$HOST" -P"$PORT" -u"$USER" -p"$PASS" )

echo "Applying schema..."
"${mysql_cmd[@]}" < "$(dirname "$0")/schema.sql"

echo "Loading seed data..."
"${mysql_cmd[@]}" < "$(dirname "$0")/seed.sql"

echo "Verifying counts..."
"${mysql_cmd[@]}" -D "$DB_NAME" -e "\
SELECT 'Users' AS table_name, COUNT(*) AS row_count FROM Users\nUNION ALL\nSELECT 'Vehicles', COUNT(*) FROM Vehicles\nUNION ALL\nSELECT 'Trips', COUNT(*) FROM Trips;\n"

echo "Done."


