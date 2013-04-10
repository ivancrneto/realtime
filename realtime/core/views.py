from flask import Blueprint, request, render_template, jsonify, \
    Response
from realtime.database import Word, db_session
import simplejson as json

mod = Blueprint('core', __name__)

@mod.route('/')
def home():
    return render_template('core/index.html')

@mod.route('/words/add', methods=['POST'])
def add_word():
    word = Word(**request.form.to_dict())
    db_session.add(word)
    db_session.commit()
    return jsonify(word=word.to_json())

@mod.route('/words/get', methods=['GET'])
def get_words():
    words = Word.query.all()
    res = json.dumps([w.to_json() for w in words])
    return Response(res, mimetype='application/json')
