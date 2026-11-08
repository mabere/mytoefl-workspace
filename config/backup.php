<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Database backup settings
    |--------------------------------------------------------------------------
    |
    | Backup archives are stored on the private local disk. They are never
    | written below public/ and every API operation still requires an admin
    | session. Configure DB_DUMP_BINARY on hosting when mysqldump is not on
    | the worker PATH. DB_MYSQL_BINARY applies to restore operations.
    |
    */

    'directory' => env('DB_BACKUP_DIRECTORY', 'backups'),

    'dump_binary' => env('DB_DUMP_BINARY'),

    'mysql_binary' => env('DB_MYSQL_BINARY'),

    'timeout' => (int) env('DB_BACKUP_TIMEOUT', 300),

    'compression_level' => (int) env('DB_BACKUP_COMPRESSION_LEVEL', 9),

    'list_limit' => (int) env('DB_BACKUP_LIST_LIMIT', 50),

    'restore_max_bytes' => (int) env('DB_RESTORE_MAX_BYTES', 536870912),

    'restore_max_sql_bytes' => (int) env('DB_RESTORE_MAX_SQL_BYTES', 2147483648),

];
