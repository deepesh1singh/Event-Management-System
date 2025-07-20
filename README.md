# Event Management System

A comprehensive web application for managing events, ticket booking, and user management with different role-based access levels.

## Project Overview

This Event Management System allows users to create, manage, and book tickets for events. It includes features like user authentication, role-based access control, ticket management, payment processing, and reporting capabilities.

## Features

- **User Authentication**: Sign up, login, password reset
- **Role-Based Access Control**: Manager, Vendor (Salesperson), Accountant, Customer
- **Event Management**: Create, view, edit, and delete events
- **Ticket Booking**: Select and book tickets for events
- **Payment Processing**: Process payments for tickets
- **PDF Generation**: Generate tickets as PDF documents
- **Email Notifications**: Send email notifications for various actions
- **Reporting**: Generate reports on sales, revenue, and expenditure
- **User Management**: Add, edit, delete, and restore users

## Project Structure

software_project/
├── controllers/              # Request handlers / Controllers
│   ├── auth.controller.js
│   ├── pdf.controller.js
│   └── users.controller.js
│
├── models/                   # Mongoose or Sequelize models
│   ├── booking.model.js
│   ├── event.model.js
│   ├── Token.model.js
│   └── User.model.js
│
├── public/                   # Static assets served to client
│   ├── backgrounds/          # Background images
│   ├── *.css                 # Stylesheets
│   └── script.js             # Frontend JavaScript
│
├── routes/                   # Route definitions
│   ├── index.route.js
│   └── profile.routes.js
│
├── services/                 # Business logic
│   └── auth.service.js
│
├── utils/                    # Utility functions and helpers
│   └── email/
│       └── sendEmail.js      # Email sending utility
│
├── views/                    # EJS view templates
│   ├── *.ejs                 # Page views
│   └── template/             # Email templates
│
├── .env                      # Environment configuration
├── db.js                     # Database connection file
└── index.js                  # Entry point of the application


## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Template Engine**: EJS
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer, Handlebars
- **PDF Generation**: Puppeteer
- **CSS Framework**: Custom CSS
- **Other Libraries**: bcrypt (password hashing), cors, dotenv

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd software_project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the required environment variables (see below).

## Environment Variables (.env)

Create a `.env` file in the root directory with the following variables:

```
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-email-app-password
FROM_EMAIL=your-email@gmail.com
DB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
BCRYPT_SALT=10
PORT=3000
```

- `EMAIL_USERNAME`: Gmail account username for sending emails
- `EMAIL_PASSWORD`: Gmail app password (not regular password)
- `FROM_EMAIL`: Email address that appears as sender
- `DB_URL`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `CLIENT_URL`: URL of the client application
- `BCRYPT_SALT`: Salt rounds for password hashing
- `PORT`: Port number for the server

## Running the Application

1. Install nodemon globally (if not already installed):
   ```bash
   npm install -g nodemon
   ```

2. Start the server with nodemon for automatic reloading during development:
   ```bash
   nodemon index.js
   ```
   
   Or start the server normally:
   ```bash
   node index.js
   ```

3. The application will be available at `http://localhost:3000` (or the port specified in your `.env` file)

## User Roles and Permissions

### Manager
- Add/edit/delete events
- Add/edit/delete users
- View reports and analytics
- Manage all aspects of the system

### Vendor (Salesperson)
- View events
- Book tickets for customers
- Track bookings and commissions

### Accountant
- View financial reports
- Track revenue and expenditure
- Monitor ticket sales

### Customer
- View events
- Book tickets
- View booking history

## API Routes

### Authentication Routes
- `POST /index/signup`: Register a new user
- `POST /index/login`: Login a user
- `POST /index/forgot`: Request password reset
- `POST /index/resetPassword`: Reset password

### User Routes
- `GET /index/:user_id`: User dashboard
- `GET /index/:user_id/profile`: View user profile
- `PATCH /index/:user_id/profile`: Update user profile

### Event Routes
- `GET /index/:user_id/AddEvent`: Add event form
- `POST /index/:user_id/AddEvent`: Create a new event
- `GET /index/:user_id/search`: Search events
- `GET /index/:user_id/details/:event_id`: View event details

### Ticket Routes
- `GET /index/:user_id/details/:event_id/booking`: Booking form
- `POST /index/:user_id/details/:event_id/booking`: Create a booking
- `PATCH /index/:user_id/details/:event_id/booking/:ticket_id`: Update a booking
- `GET /index/:user_id/details/:event_id/booking/:ticket_id/payment`: Payment page
- `GET /index/:user_id/details/:event_id/booking/:ticket_id/payment/:email/download`: Generate ticket PDF

