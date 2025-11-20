<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (! $user || ! $user->is_admin) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Forbidden. Admin only.'], 403);
            }
            // redirect biasa ke home atau login
            return redirect()->route('login')->with('error', 'Anda tidak memiliki akses admin.');
            }
        return $next($request);
    
    }
    
}
