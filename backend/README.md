# Indo Smile South Services - CRM Backend

## Installation Guide

### 1. Upload Files to Server
Upload the entire `backend` folder to your web server at:
```
/public_html/backend/
```

### 2. Database Setup

1. Access phpMyAdmin on your cPanel
2. Select database: `sevensmile_indosmile`
3. Click "Import" tab
4. Upload and execute: `backend/database_schema.sql`

This will create all necessary tables and insert:
- Default admin user
- 8 sample tours
- Default settings

### 3. Default Admin Credentials

**Username:** `admin`
**Password:** `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

### 4. Configuration

Edit `backend/config/config.php` if needed:
- Database credentials (already configured)
- Upload directories
- CORS settings
- Session settings

### 5. Folder Permissions

Set folder permissions using cPanel File Manager or FTP:

```bash
chmod 755 backend/
chmod 755 backend/uploads/
chmod 755 backend/uploads/tours/
```

### 6. Access Admin Dashboard

Navigate to: `https://indosmilesouthservices.com/backend/admin/`

## API Endpoints

### Authentication
- `POST /api/v1/auth.php/login` - Admin login
- `POST /api/v1/auth.php/logout` - Admin logout
- `GET /api/v1/auth.php/check` - Check session
- `GET /api/v1/auth.php/me` - Get current user

### Tours
- `GET /api/v1/tours.php` - Get all tours
- `GET /api/v1/tours.php?id={id}` - Get tour by ID
- `GET /api/v1/tours.php?slug={slug}` - Get tour by slug
- `POST /api/v1/tours.php` - Create tour (admin only)
- `PUT /api/v1/tours.php?id={id}` - Update tour (admin only)
- `DELETE /api/v1/tours.php?id={id}` - Delete tour (admin only)

### Bookings
- `GET /api/v1/bookings.php` - Get all bookings (admin only)
- `GET /api/v1/bookings.php?id={id}` - Get booking by ID
- `GET /api/v1/bookings.php?reference={ref}` - Get booking by reference
- `GET /api/v1/bookings.php?stats=1` - Get booking statistics (admin only)
- `POST /api/v1/bookings.php` - Create new booking (public)
- `PUT /api/v1/bookings.php?id={id}` - Update booking (admin only)
- `PUT /api/v1/bookings.php?id={id}&action=confirm` - Confirm booking (admin only)
- `PUT /api/v1/bookings.php?id={id}&action=cancel` - Cancel booking (admin only)

## Query Parameters

### Tours API Filters
- `type` - Filter by tour type (inbound, outbound, incentive)
- `destination` - Filter by destination
- `featured` - Filter featured tours (0 or 1)
- `active` - Filter active tours (0 or 1)
- `search` - Search in name, destination, description
- `min_price` - Minimum price
- `max_price` - Maximum price
- `duration` - Filter by duration in days
- `sort_by` - Sort field (price, rating, created_at, duration_days, name)
- `sort_order` - Sort direction (ASC, DESC)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

### Bookings API Filters
- `status` - Filter by status (pending, confirmed, cancelled, completed)
- `payment_status` - Filter by payment status (unpaid, partial, paid, refunded)
- `tour_id` - Filter by tour ID
- `search` - Search in reference, customer name, email
- `date_from` - Filter from date (YYYY-MM-DD)
- `date_to` - Filter to date (YYYY-MM-DD)
- `sort_by` - Sort field (created_at, travel_date, total_price, status)
- `sort_order` - Sort direction (ASC, DESC)
- `page` - Page number
- `limit` - Items per page

## File Structure

```
backend/
├── admin/                  # Admin dashboard
│   ├── index.html         # Dashboard UI
│   ├── style.css          # Dashboard styles
│   └── app.js             # Dashboard JavaScript
├── api/
│   └── v1/                # API version 1
│       ├── auth.php       # Authentication endpoints
│       ├── tours.php      # Tours endpoints
│       ├── bookings.php   # Bookings endpoints
│       └── helpers.php    # Helper functions
├── config/
│   ├── config.php         # Configuration
│   └── Database.php       # Database connection class
├── models/
│   ├── Tour.php           # Tour model
│   ├── Booking.php        # Booking model
│   └── Admin.php          # Admin model
├── uploads/
│   └── tours/             # Tour images upload folder
├── database_schema.sql    # Database schema
└── README.md              # This file
```

## Security Notes

1. **Change Default Password** - Change admin password immediately
2. **SSL/HTTPS** - Always use HTTPS in production
3. **Backup Database** - Regular database backups recommended
4. **File Permissions** - Do not set 777 permissions
5. **Update Dependencies** - Keep PHP version updated

## Troubleshooting

### Database Connection Error
- Check database credentials in `config/config.php`
- Ensure database exists and user has permissions

### CORS Errors
- Add your frontend domain to `ALLOWED_ORIGINS` in `config/config.php`

### Session Issues
- Check PHP session configuration
- Ensure cookies are enabled
- Check `session.cookie_samesite` settings

### Upload Errors
- Check folder permissions (755)
- Check PHP `upload_max_filesize` and `post_max_size`

## Support

For issues or questions, contact your system administrator.

## Version
1.0.0 - Initial Release
