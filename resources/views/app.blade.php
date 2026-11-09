<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#101828">
    <title>SignalDesk Studio · Customer Operations</title>
    <meta name="description" content="Laravel + React Customer Operations Studio Demo">
    @viteReactRefresh
    @vite(['resources/js/main.tsx'])
</head>
<body>
    <div id="root"></div>
</body>
</html>
