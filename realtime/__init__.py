from flask import Flask
app = Flask(__name__)

import core
app.register_blueprint(core.mod)
