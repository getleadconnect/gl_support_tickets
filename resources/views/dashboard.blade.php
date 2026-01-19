<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Support Tickets - Dashboard</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="app-url" content="{{ config('app.url') }}">
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}" id="favicon-svg">
    <link rel="alternate icon" href="{{ asset('favicon.ico') }}" id="favicon-ico">
    <link rel="icon" type="image/png" href="" id="dynamic-favicon" style="display: none;">

    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <!-- Wait for jQuery to load -->
    <script>
        window.jQuery = window.$ = jQuery;
    </script>

    <!-- Country Code Picker CSS -->
    <link rel="stylesheet" href="{{ asset('css/ccpicker/ccpicker.css') }}">

    <!-- Country Code Picker JS -->
    <script src="{{ asset('js/ccpicker/ccpicker.js') }}"></script>

    <!-- Dynamic Favicon Script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Function to set favicon
            function setFavicon(faviconUrl) {
                // Hide default favicons
                const defaultSvg = document.getElementById('favicon-svg');
                const defaultIco = document.getElementById('favicon-ico');
                const dynamicFavicon = document.getElementById('dynamic-favicon');
                
                if (defaultSvg) defaultSvg.style.display = 'none';
                if (defaultIco) defaultIco.style.display = 'none';
                
                // Set and show dynamic favicon
                if (dynamicFavicon) {
                    dynamicFavicon.href = faviconUrl;
                    dynamicFavicon.style.display = 'block';
                }
                
                // Also create a new favicon link for better browser support
                const newFavicon = document.createElement('link');
                newFavicon.rel = 'icon';
                newFavicon.type = 'image/png';
                newFavicon.href = faviconUrl;
                
                // Remove any existing dynamic favicons
                const existingDynamic = document.querySelector('link[rel="icon"][data-dynamic="true"]');
                if (existingDynamic) {
                    existingDynamic.remove();
                }
                
                newFavicon.setAttribute('data-dynamic', 'true');
                document.head.appendChild(newFavicon);
            }
            
            // Function to restore default favicon
            function restoreDefaultFavicon() {
                const defaultSvg = document.getElementById('favicon-svg');
                const defaultIco = document.getElementById('favicon-ico');
                const dynamicFavicon = document.getElementById('dynamic-favicon');
                
                if (defaultSvg) defaultSvg.style.display = 'block';
                if (defaultIco) defaultIco.style.display = 'block';
                if (dynamicFavicon) dynamicFavicon.style.display = 'none';
                
                // Remove any dynamic favicons
                const existingDynamic = document.querySelector('link[rel="icon"][data-dynamic="true"]');
                if (existingDynamic) {
                    existingDynamic.remove();
                }
            }
            
            // Fetch active favicon
            function fetchActiveFavicon() {
                const metaTag = document.querySelector('meta[name="app-url"]');
                const appUrl = metaTag ? metaTag.getAttribute('content') : window.location.origin;
                
                fetch(`${appUrl}/api/favicon/active`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success && data.favicon && data.favicon.logo_image) {
                            const faviconUrl = `${window.location.origin}/${data.favicon.logo_image}`;
                            setFavicon(faviconUrl);
                        } else {
                            // No active favicon found, keep default
                            restoreDefaultFavicon();
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching favicon:', error);
                        // Keep default favicon on error
                        restoreDefaultFavicon();
                    });
            }
            
            // Load favicon on page load
            fetchActiveFavicon();
        });
    </script>

    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="antialiased">
    <div id="app"></div>
</body>
</html>