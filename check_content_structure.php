<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

// Load Laravel bootstrap
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Checking content structure in quote_templates...\n\n";

$template = DB::table('quote_templates')->first();

if ($template) {
    echo "Sample Template:\n";
    echo "ID: {$template->id}\n";
    echo "Name: {$template->name}\n";
    echo "Type: {$template->type}\n";
    echo "Is Default: " . ($template->is_default ? 'Yes' : 'No') . "\n";
    echo "Content Type: " . gettype($template->content) . "\n";
    echo "\nRaw Content:\n";
    echo $template->content . "\n\n";
    
    // Try to decode if it's JSON
    $decoded = json_decode($template->content, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✅ Content is JSON format:\n";
        print_r($decoded);
    } else {
        echo "❌ Content is not JSON\n";
    }
}
?>