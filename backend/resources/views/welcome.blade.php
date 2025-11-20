<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Welcome</title>
</head>
<body>
  <h1>Welcome to Laravel</h1>
  <p>This is a placeholder welcome page. Breeze installer expects this file to exist.</p>

  @if (Route::has('login'))
    <div>
      @auth
        <a href="{{ url('/dashboard') }}">Dashboard</a>
      @else
        <a href="{{ route('login') }}">Log in</a>

        @if (Route::has('register'))
            <a href="{{ route('register') }}">Register</a>
        @endif
      @endauth
    </div>
  @endif
</body>
</html>
