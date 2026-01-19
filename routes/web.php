<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentDueController;
//use App\Http\Controllers\TaskController;

//Route::get('/send-message', [TaskController::class, 'sendMessage']);

// Payment Dues PDF route (web route for direct access with token)
Route::get('/payment-dues/pdf/{customerId}/{token}', [PaymentDueController::class, 'generateSignedPaymentDuesPDF'])
    ->name('payment-dues.pdf');

Route::get('/{any}', function () {
    return view('dashboard');
})->where('any', '.*');


