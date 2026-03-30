from flask import Flask
from src.logger import setup_logger
from src.main import main_bp

app = Flask(__name__)

# Set up logger
logger = setup_logger()

app.register_blueprint(main_bp)

if __name__ == '__main__':
    app.run(debug=True, port=4000)
