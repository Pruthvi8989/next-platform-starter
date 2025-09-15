# Apexture - Comprehensive Accounting Software

Apexture is a modern, feature-rich accounting software designed to help you manage all your company accounts efficiently. Built with React and Node.js, it provides a seamless experience across all platforms.

## Features

### 🏢 Multi-Dashboard Management
- **6 Predefined Dashboards**: Pruthvi, Nirav, Mitesh, Other, Apexture, MGC
- Separate accounting spaces for different entities
- Individual account management for each dashboard

### 🔐 Secure Authentication
- 6-digit User ID system
- 4-digit password protection
- JWT-based secure authentication
- Account lockout protection

### 💰 Account Management
- Multiple account types (Bank, Cash, Credit Card, Investment, Loan, Other)
- Real-time balance tracking
- Transaction history
- Account categorization

### 📊 Bill Payment System
- Bill creation and management
- Due date tracking
- Automatic status updates (Pending, Paid, Overdue)
- WhatsApp reminders (2 days before due date)
- 3 daily reminders on payment day

### 📈 Statement Generation
- PDF and Excel statement downloads
- Customizable date ranges
- Scheduled statement delivery (daily, weekly, monthly)
- Read-only statement sharing

### 📱 WhatsApp Integration
- Login notifications
- Bill payment reminders
- Statement sharing notifications
- Automated reminder system

### 📁 File Upload Support
- Bank statement uploads (PhonePe, etc.)
- Bill photo uploads with auto-processing
- Automatic transaction extraction
- Document management

### 🎨 Modern UI/UX
- Responsive design for all devices
- Custom color scheme (#e3b448, #cbd18f, #3a6b35)
- Intuitive navigation
- Real-time updates

## Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Twilio** - WhatsApp integration
- **PDFKit** - PDF generation
- **ExcelJS** - Excel generation
- **Node-cron** - Scheduled tasks

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Twilio account (for WhatsApp integration)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd apexture-accounting
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/apexture
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here
   
   # WhatsApp/Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   
   # Notification Settings
   WHATSAPP_NOTIFICATIONS_ENABLED=true
   ```

4. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### Initial Setup
1. Open the application in your browser
2. Click "Register here" to create a new account
3. Fill in your details:
   - 6-digit User ID
   - 4-digit Password
   - Full Name
   - Email Address
   - Phone Number
   - WhatsApp Number

### Creating Dashboards
1. After login, you'll see the main dashboard
2. Click "Create [Dashboard Name]" to create any of the 6 predefined dashboards
3. Each dashboard operates independently

### Managing Accounts
1. Navigate to "Accounts" in the sidebar
2. Click "Add Account" to create new accounts
3. Select account type and enter details
4. View and manage existing accounts

### Bill Management
1. Go to "Bills" section
2. Add bills with due dates
3. System will automatically send WhatsApp reminders
4. Mark bills as paid when completed

### Statement Generation
1. Visit "Statements" section
2. Select dashboard and date range
3. Choose format (PDF/Excel)
4. Download or schedule automatic delivery

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

### Dashboards
- `GET /api/dashboards` - Get all dashboards
- `POST /api/dashboards` - Create dashboard
- `GET /api/dashboards/:id` - Get dashboard details
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard

### Accounts
- `GET /api/accounts/dashboard/:dashboardId` - Get accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Bills
- `GET /api/bills/dashboard/:dashboardId` - Get bills
- `POST /api/bills` - Create bill
- `PUT /api/bills/:id` - Update bill
- `PATCH /api/bills/:id/paid` - Mark as paid
- `DELETE /api/bills/:id` - Delete bill

### Statements
- `POST /api/statements/generate` - Generate statement
- `POST /api/statements/schedule` - Schedule statement
- `POST /api/statements/share` - Share statement

### File Upload
- `POST /api/upload/bank-statement` - Upload bank statement
- `POST /api/upload/bill-photo` - Upload bill photo
- `GET /api/upload/files` - Get uploaded files

### Notifications
- `GET /api/notifications/settings` - Get notification settings
- `PUT /api/notifications/settings` - Update settings
- `POST /api/notifications/test-whatsapp` - Test WhatsApp

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use a production MongoDB instance
- Configure proper CORS origins
- Set up SSL certificates
- Use a process manager like PM2

### Cross-Platform Support
The application is built with web technologies and can be deployed on:
- **Web**: Any modern web browser
- **Mobile**: Using React Native or PWA
- **Desktop**: Using Electron
- **Cloud**: AWS, Google Cloud, Azure

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Account lockout after failed attempts
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

## Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting features
- [ ] Multi-currency support
- [ ] Integration with banking APIs
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Automated bookkeeping
- [ ] Tax calculation features