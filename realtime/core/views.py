from flask import Blueprint, request, render_template

mod = Blueprint('core', __name__)

@mod.route('/')
def home():
  # return 'Hello world'
  return render_template('core/index.html')
