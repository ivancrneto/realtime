from flask import Flask
app = Flask(__name__)

from core.views import general
app.register_blueprint(general.mod)
