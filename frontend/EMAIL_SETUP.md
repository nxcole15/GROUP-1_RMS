# Email Configuration Guide

The system now requires SMTP credentials to send enrollment confirmation emails. Ethereal (test email) has been removed.

## Quick Setup: Gmail

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** in the left sidebar
3. Find "2-Step Verification" and enable it if not already enabled
4. Complete the setup process

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. If you don't see "App passwords", make sure 2-Step Verification is enabled
3. Select:
   - **App**: Mail
   - **Device**: Windows Computer
4. Click **Generate**
5. Google will show a 16-character password (with spaces): `xxxx xxxx xxxx xxxx`

### Step 3: Add to server/.env
Copy the password and add it to your `server/.env`:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=smart_student_service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="CFEI INFORM System" <your-email@gmail.com>
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `xxxx xxxx xxxx xxxx` with the 16-character password from Step 2

### Step 4: Restart Server
```bash
npm start
# or
node index.js
```

You should see:
```
✅  Mailer: SMTP configured → using real email transport
   Host: smtp.gmail.com
   User: your-email@gmail.com
```

## Alternative: SendGrid

For production, SendGrid is more reliable:

1. Create free account: https://sendgrid.com/free/
2. Create API key in Settings
3. Add to `server/.env`:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_api_key_here
EMAIL_FROM="CFEI INFORM" <noreply@cfei.edu>
```

## Testing

1. Go to `/enrollment` page
2. Fill out the form
3. Click "Save and Enroll"
4. If SMTP is configured, the email will be sent to the email address provided
5. Check your inbox (and spam folder)

## Troubleshooting

### "SMTP credentials not configured" error
- Make sure `SMTP_USER` and `SMTP_PASS` are set in `server/.env`
- Restart the server after updating `.env`

### Gmail says "Less secure app access"
- Gmail app passwords work with the SMTP method above
- Make sure you used "App password" (not regular password)
- The app password should be 16 characters with spaces

### Email not arriving
- Check spam folder
- For Gmail: Verify the app password is correct (spaces matter)
- Check server logs for email errors
- Ensure `EMAIL_FROM` has a valid email domain

## Production Considerations

- Use SendGrid or similar service for production (not Gmail)
- Keep `SMTP_PASS` secure (never commit to git)
- Use environment variables on your hosting platform
- Monitor email delivery rates
- Consider email templates service (SendGrid, Mailgun, etc.)
