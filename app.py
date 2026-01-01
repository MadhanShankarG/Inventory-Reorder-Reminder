from flask import Flask, render_template
from config import Config
from routes import api_bp


def create_app():
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.config.from_object(Config)

    # register API blueprint
    app.register_blueprint(api_bp)

    # page routes (render templates). Keep these minimal.
    @app.route('/')
    def home():
        return render_template('login.html')

    @app.route('/dashboard')
    def dashboard():
        return render_template('dashboard.html')

    @app.route('/inventory')
    def inventory_page():
        return render_template('inventory.html')

    @app.route('/add-inventory')
    def add_inventory_page():
        return render_template('add-inventory.html')

    @app.route('/reminders')
    def reminders_page():
        return render_template('reminders.html')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
        use_reloader=False
    )