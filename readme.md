# URL Shortener Backend API

A robust and secure URL shortener backend built with Node.js, Express, PostgreSQL, and Drizzle ORM. This backend-only service provides user authentication, URL shortening with custom aliases, and secure redirect functionality.

## 🚀 Features

- **User Authentication**: JWT-based authentication with secure password hashing
- **URL Shortening**: Generate short URLs with automatic or custom codes
- **User Management**: User registration, login, and profile management
- **Database Management**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Security**: Password salting, JWT tokens, and input validation
- **Docker Support**: Easy deployment with Docker Compose
- **Modern Architecture**: Clean code structure with MVC pattern

## 🛠️ Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Password Hashing**: Node.js Crypto (HMAC SHA-256)
- **ID Generation**: nanoid
- **Containerization**: Docker & Docker Compose
- **Package Manager**: pnpm

## 📁 Project Structure

```
URL_SHORTENER/
├── db/                     # Database configuration
│   └── index.js           # Drizzle database connection
├── middlewares/           # Express middlewares
│   └── auth.middleware.js # Authentication middleware
├── models/                # Database models/schemas
│   ├── index.js          # Model exports
│   ├── user.model.js     # User table schema
│   └── url.model.js      # URL table schema
├── routes/                # API route handlers
│   ├── user.routes.js    # User authentication routes
│   └── url.routes.js     # URL shortening routes
├── services/              # Business logic layer
│   ├── user.service.js   # User-related services
│   └── urls.service.js   # URL-related services
├── utils/                 # Utility functions
│   ├── hash.js           # Password hashing utilities
│   └── token.js          # JWT token utilities
├── validation/            # Input validation schemas
│   ├── request.validation.js # API request validation
│   └── token.validation.js   # Token validation
├── docker-compose.yml     # Docker services configuration
├── drizzle.config.js     # Drizzle ORM configuration
├── index.js              # Application entry point
├── package.json          # Dependencies and scripts
└── .env.sample           # Environment variables template
```

## ⚙️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- pnpm (recommended) or npm
- Docker & Docker Compose (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/aphex18/URL_SHORTENER.git
cd URL_SHORTENER
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Configuration

Copy the sample environment file and configure your settings:

```bash
cp .env.sample .env
```

Update the `.env` file with your configuration:

```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5433/url_shortener
POSTGRES_PASSWORD=your_secure_password
POSTGRES_USER=your_username
POSTGRES_DB=url_shortener
POSTGRES_PORT=5433
JWT_SECRET=your_super_secret_jwt_key
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d

# Push database schema
pnpm run db:push
```

#### Option B: Local PostgreSQL

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in your `.env` file
3. Run the schema migration:

```bash
pnpm run db:push
```

### 5. Start the Server

```bash
# Development mode (with auto-reload)
pnpm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

#### Register User
```http
POST /user/signup
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "userId": "uuid-string"
}
```

#### Login User
```http
POST /user/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": "jwt-token-string"
}
```

### URL Shortening Endpoints

> **Note**: All URL endpoints require authentication. Include the JWT token in the Authorization header:
> `Authorization: Bearer your-jwt-token`

#### Shorten URL
```http
POST /shorten
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "url": "https://www.example.com/very/long/url/that/needs/shortening",
  "code": "custom-code" // Optional custom short code
}
```

**Response:**
```json
{
  "message": "URL shortened successfully",
  "url": {
    "id": "uuid-string",
    "shortCode": "abc123",
    "targetUrl": "https://www.example.com/very/long/url/that/needs/shortening"
  }
}
```

#### Get User's URLs
```http
GET /codes
Authorization: Bearer your-jwt-token
```

**Response:**
```json
{
  "result": [
    {
      "id": "uuid-string",
      "shortCode": "abc123",
      "targetUrl": "https://www.example.com/very/long/url",
      "userId": "user-uuid",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": null
    }
  ]
}
```

#### Delete URL
```http
DELETE /:id
Authorization: Bearer your-jwt-token
```

**Response:**
```json
{
  "message": "URL deleted successfully"
}
```

#### Redirect to Original URL
```http
GET /:shortCode
```

This endpoint redirects the user to the original URL associated with the short code.

### Health Check

#### Server Status
```http
GET /
```

**Response:**
```json
{
  "status": "Server is running"
}
```

## 🗄️ Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `first_name` (VARCHAR, 55)
- `last_name` (VARCHAR, 55, Optional)
- `email` (VARCHAR, 255, Unique)
- `password` (TEXT, Hashed)
- `salt` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### URLs Table
- `id` (UUID, Primary Key)
- `code` (VARCHAR, 155, Unique)
- `target_url` (TEXT)
- `user_id` (UUID, Foreign Key → users.id)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔧 Available Scripts

```bash
# Development with auto-reload
pnpm run dev

# Push database schema changes
pnpm run db:push

# Open Drizzle Studio (Database GUI)
pnpm run db:studio

# Start Docker services
docker-compose up -d

# Stop Docker services
docker-compose down
```

## 🔐 Security Features

- **Password Security**: Passwords are hashed using HMAC SHA-256 with random salts
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation using Zod
- **SQL Injection Protection**: Parameterized queries via Drizzle ORM
- **Authorization**: Route-level authentication middleware

## 🚀 Deployment

### Docker Deployment

1. Ensure your `.env` file is properly configured
2. Build and start the services:

```bash
docker-compose up --build -d
```

### Manual Deployment

1. Set up a PostgreSQL database
2. Configure environment variables
3. Install dependencies and run database migrations
4. Start the application

```bash
pnpm install
pnpm run db:push
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**GAURAV SHARMA** ([@aphex18](https://github.com/aphex18))

---

**Note**: This is a backend-only implementation. For a complete URL shortener solution, you would need to integrate this API with a frontend application.