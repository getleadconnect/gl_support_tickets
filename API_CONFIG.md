# API Configuration

## Setting the Base URL

The application now uses the `APP_URL` from the `.env` file for all API calls.

### For Laravel Development Server:
```
APP_URL=http://127.0.0.1:8000
```

### For XAMPP:
```
APP_URL=http://localhost/AI/gl-tickets-react-app/public
```

### For Production:
```
APP_URL=https://yourdomain.com
```

## How it works:

1. The `APP_URL` is passed to the frontend via a meta tag in `dashboard.blade.php`
2. The `bootstrap.js` file reads this URL and sets it as the axios base URL with `/api` appended
3. All API calls in the application use relative paths (e.g., `/tickets/123/log-notes`)
4. Axios automatically prepends the base URL to all requests

## Important:
- Always ensure your `APP_URL` in `.env` matches your actual application URL
- Don't forget to run `php artisan config:clear` after changing the `.env` file
- For production, make sure to use HTTPS in the APP_URL