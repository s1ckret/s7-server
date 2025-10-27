# S7

## About

These notes are for me. So dynamodb idea didn't worked out, so I switched to sqllite.

## How-tos

### Migrations

Create using
```bash
npm run knex --  migrate:make create-initial-tables --env production
```

Run using
```bash
npm run knex -- migrate:latest --env production
```

### Database backup to external disk (DigitalOcean)

1. Create a volume
2. Mount it
```sh
sudo mkdir /mnt/sqlite3-backup
sudo mount -o defaults,nofail,discard,noatime /dev/disk/by-id/scsi-0DO_Volume_volume-fra1-01  /mnt/sqlite3-backup
findmnt /mnt/sqlite3-backup
```
3. Copy
```sh
sqlite3 /root/s7-server/app/s7-db.sqlite3 ".backup /mnt/sqlite3-backup/s7-db-2025-10-27.sqlite3"
```
4. Setup backup script

```sh
#!/bin/bash

# --- Configuration ---
SOURCE_DB="/root/s7-server/app/s7-db.sqlite3"
BACKUP_DIR="/mnt/sqlite3-backup"
# --- End Configuration ---

# 1. Generate the current date in YYYY-MM-DD format
# Example output: 2025-10-27
CURRENT_DATE=$(date +%Y-%m-%d)

# 2. Construct the full destination file path
DESTINATION_FILE="${BACKUP_DIR}/s7-db-${CURRENT_DATE}.sqlite3"

# 3. Ensure the backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "--- Starting SQLite Backup ---"
echo "Source DB: ${SOURCE_DB}"
echo "Backup File: ${DESTINATION_FILE}"

# 4. Execute the SQLite backup command
# IMPORTANT: For cron jobs, always use the full path to the executable.
# You can find the path using 'which sqlite3' (e.g., /usr/bin/sqlite3).
# We use single quotes around the destination file inside the .backup command 
# to protect it from any shell expansion, although in this case it's simple.
/usr/bin/sqlite3 "${SOURCE_DB}" ".backup '${DESTINATION_FILE}'"

# 5. Check the exit status of the sqlite3 command
if [ $? -eq 0 ]; then
    echo "SUCCESS: Database backup completed."
    # Display the size and name of the new file
    ls -lh "${DESTINATION_FILE}"
else
    echo "ERROR: SQLite backup failed!" >&2
    echo "Please check if 'sqlite3' is installed and if the source path (${SOURCE_DB}) is correct." >&2
fi
echo "--- Backup Script Finished ---"
```
5. Setup crontab
```sh
crontab -e
# Add this line
0 23 * * * /root/db-backup.sh
# show it
crontab -l
```