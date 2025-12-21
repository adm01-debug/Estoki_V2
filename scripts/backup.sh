#!/bin/bash

# Backup script for ESTOKI database
# Usage: ./scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
FILENAME="estoki_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

echo "Starting backup..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/$FILENAME"

if [ $? -eq 0 ]; then
    echo "Backup created: $BACKUP_DIR/$FILENAME"
    gzip "$BACKUP_DIR/$FILENAME"
    echo "Compressed: $BACKUP_DIR/$FILENAME.gz"
else
    echo "Backup failed!"
    exit 1
fi

# Keep only last 7 backups
ls -t $BACKUP_DIR/*.gz | tail -n +8 | xargs -r rm --
echo "Cleanup complete. Keeping last 7 backups."
