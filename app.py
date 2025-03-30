from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = "Madhan@inventory"

# Home Route
@app.route('/')
def home():
    return render_template('index.html')

# Login Page
@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('login.html')

# Signup Page
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    return render_template('signup.html')

# Dashboard
@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# Inventory List
@app.route('/inventory')
def inventory():
    return render_template('inventory.html')

# Add Inventory
@app.route('/add_inventory', methods=['GET', 'POST'])
def add_inventory():
    return render_template('add_inventory.html')

# Reminders / Notifications Page
@app.route('/reminders')
def reminders():
    return render_template('reminders.html')

if __name__ == "__main__":
    app.run(debug=True, port=5005)