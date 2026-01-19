<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (! Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user()->load(['department', 'designation']);

        // Add role name based on role_id
        $user->role = match ($user->role_id) {
            1 => 'Admin',
            2 => 'Agent',
            3 => 'Manager',
            default => 'User'
        };

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('auth-token')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        $user = $request->user()->load(['department', 'designation']);

        // Add role name based on role_id
        $user->role = match ($user->role_id) {
            1 => 'Admin',
            2 => 'Agent',
            3 => 'Manager',
            default => 'User'
        };

        return response()->json(['user' => $user]);
    }
}
