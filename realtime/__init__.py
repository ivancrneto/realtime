from flask import Flask
app = Flask(__name__)
app.config.from_object('config')

from core import views
app.register_blueprint(views.mod)
