<?php

use Illuminate\Support\Facades\Route;
use Barryvdh\DomPDF\Facade\Pdf;

Route::get('/test-pdf', function() {
    try {
        $pdf = Pdf::loadHTML('<h1>Test PDF</h1><p>This is a test PDF document.</p>');
        return $pdf->download('test.pdf');
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});