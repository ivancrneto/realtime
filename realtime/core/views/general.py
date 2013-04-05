from flask import Blueprint, request, render_template

mod = Blueprint('core.general', __name__)

@mod.route('/')
def home():
  return 'Hello world'
