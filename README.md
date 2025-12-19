# StockSync

A Flask web application for managing inventory and tracking reorder reminders.

## Prerequisites

- Python 3.7 or higher
- MongoDB (local installation or MongoDB Atlas connection string)
- pip (Python package manager)

## Setup Instructions

### 1. Install Dependencies

Create a virtual environment (recommended) and install the required packages:

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
MONGO_URI=mongodb://localhost:27017/cement_track_db
```

**For MongoDB Atlas (cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cement_track_db?retryWrites=true&w=majority
```

**For local MongoDB:**
```env
MONGO_URI=mongodb://localhost:27017/cement_track_db
```

### 3. Initialize the Database

Run the database initialization script to create collections and a test user:

```bash
python init_db.py
```

This will:
- Create the necessary collections (users, inventory)
- Create a test user with credentials:
  - Username: `test@example.com`
  - Password: `test123`

### 4. Start MongoDB (if using local MongoDB)

If you're using a local MongoDB installation, make sure MongoDB is running:

```bash
# On macOS (if installed via Homebrew):
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
# Start MongoDB service from Services panel
```

## Running the Application

### Development Mode

Run the Flask application:

```bash
python app.py
```

The application will start on `http://localhost:5000` (or another port if 5000 is in use).

### Access the Application

1. Open your web browser and navigate to: `http://localhost:5000`
2. You will be redirected to the login page
3. Use the test credentials:
   - **Username:** `test@example.com`
   - **Password:** `test123`

## Project Structure

```
Inventory_reorder_reminder/
├── app.py                 # Main Flask application
├── config.py              # Configuration settings
├── init_db.py             # Database initialization script
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── models/                # Database models
│   ├── database.py       # Database connection
│   ├── user.py           # User model
│   └── inventory.py      # Inventory model
├── routes/                # API routes
│   ├── auth.py           # Authentication routes
│   └── inventory.py      # Inventory routes
├── templates/             # HTML templates
│   ├── login.html
│   ├── dashboard.html
│   ├── inventory.html
│   └── ...
└── static/                # Static files (CSS, JS)
```

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running (if using local installation)
- Verify the `MONGO_URI` in your `.env` file is correct
- Check MongoDB connection string format for Atlas

### Port Already in Use

If port 5000 is already in use, the app will automatically use another port. Check the terminal output for the actual port number.

### Module Not Found Errors

Make sure you've activated your virtual environment and installed all dependencies:
```bash
pip install -r requirements.txt
```

## API Endpoints

- `GET /` - Redirects to login
- `GET /login` - Login page
- `GET /dashboard` - Dashboard page
- `GET /inventory` - Inventory page
- `GET /add-inventory` - Add inventory page
- `GET /reminders` - Reminders page
- `POST /api/inventory/*` - Inventory API endpoints

## Notes

- The application runs in debug mode by default (development)
- For production, update the configuration in `config.py` and set `DEBUG = False`
- Make sure to change the default `SECRET_KEY` and `JWT_SECRET` in production


