<?php

/**
 * Script to check migration status and compare database tables with migration files
 * Run: php check_migration_status.php
 */

// Database configuration
$host = 'localhost';
$dbname = 'gltickets_ai';
$username = 'root';
$password = '';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== GL Tickets Database Migration Status Check ===\n\n";
    
    // Get all tables in database
    $stmt = $pdo->query("SHOW TABLES");
    $dbTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    sort($dbTables);
    
    echo "Total tables in database: " . count($dbTables) . "\n\n";
    
    // Get all migration files
    $migrationPath = __DIR__ . '/database/migrations/';
    $migrationFiles = glob($migrationPath . '*.php');
    
    echo "Total migration files: " . count($migrationFiles) . "\n\n";
    
    // Extract table names from migration files
    $migrationTables = [];
    foreach ($migrationFiles as $file) {
        $content = file_get_contents($file);
        
        // Look for Schema::create('table_name', ...)
        if (preg_match_all("/Schema::create\s*\(\s*['\"]([^'\"]+)['\"]/", $content, $matches)) {
            foreach ($matches[1] as $table) {
                $migrationTables[] = $table;
            }
        }
    }
    sort($migrationTables);
    
    // Compare tables
    $tablesOnlyInDb = array_diff($dbTables, $migrationTables);
    $tablesOnlyInMigrations = array_diff($migrationTables, $dbTables);
    
    if (count($tablesOnlyInDb) > 0) {
        echo "⚠️  Tables in database but NOT in migrations:\n";
        foreach ($tablesOnlyInDb as $table) {
            echo "   - $table\n";
        }
        echo "\n";
    }
    
    if (count($tablesOnlyInMigrations) > 0) {
        echo "⚠️  Tables in migrations but NOT in database:\n";
        foreach ($tablesOnlyInMigrations as $table) {
            echo "   - $table\n";
        }
        echo "\n";
    }
    
    if (count($tablesOnlyInDb) == 0 && count($tablesOnlyInMigrations) == 0) {
        echo "✅ All tables are properly synchronized between database and migrations!\n\n";
    }
    
    // Check migration status
    echo "=== Migration Status ===\n";
    try {
        $stmt = $pdo->query("SELECT migration FROM migrations ORDER BY migration");
        $ranMigrations = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "Migrations already run: " . count($ranMigrations) . "\n";
        
        // Check which migration files haven't been run
        $pendingMigrations = [];
        foreach ($migrationFiles as $file) {
            $filename = basename($file);
            $migrationName = str_replace('.php', '', $filename);
            
            if (!in_array($migrationName, $ranMigrations)) {
                $pendingMigrations[] = $filename;
            }
        }
        
        if (count($pendingMigrations) > 0) {
            echo "\n⚠️  Pending migrations:\n";
            foreach ($pendingMigrations as $migration) {
                echo "   - $migration\n";
            }
            echo "\nRun 'php artisan migrate' to apply pending migrations.\n";
        } else {
            echo "✅ All migrations have been run!\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Migrations table not found. Run 'php artisan migrate' to create it.\n";
    }
    
    // Table structure summary
    echo "\n=== Table Categories ===\n";
    
    $categories = [
        'Core Tables' => ['users', 'customers', 'tickets', 'tasks', 'invoices', 'payments', 'products', 'brands', 'categories'],
        'Pivot Tables' => ['agent_ticket', 'agent_task', 'assign_agents', 'notify_ticket', 'label_ticket', 'product_tickets', 'invoice_items'],
        'Config Tables' => ['roles', 'permissions', 'branches', 'departments', 'designations', 'priorities', 'ticket_statuses', 'task_statuses'],
        'Activity Tables' => ['activities', 'ticket_histories', 'ticket_status_histories', 'logs', 'notifications'],
        'System Tables' => ['migrations', 'cache', 'cache_locks', 'sessions', 'jobs', 'failed_jobs', 'password_reset_tokens', 'personal_access_tokens']
    ];
    
    foreach ($categories as $category => $tables) {
        $existing = array_intersect($tables, $dbTables);
        echo "\n$category: " . count($existing) . "/" . count($tables) . " tables\n";
        
        $missing = array_diff($tables, $dbTables);
        if (count($missing) > 0) {
            echo "   Missing: " . implode(', ', $missing) . "\n";
        }
    }
    
    echo "\n=== Complete ===\n";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "Make sure the database 'gltickets_ai' exists and is accessible.\n";
}