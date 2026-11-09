<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function session(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()?->only(['id', 'name', 'email', 'role']), 'csrf_token' => csrf_token()]);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages(['email' => ['E-Mail oder Passwort ist nicht korrekt.']]);
        }
        $request->session()->regenerate();
        return $this->session($request);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['ok' => true, 'csrf_token' => csrf_token()]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'min:2', 'max:100']]);
        $request->user()->update($data);
        return response()->json(['user' => $request->user()->only(['id', 'name', 'email', 'role'])]);
    }
}
