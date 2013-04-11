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

@mod.route('/words/update', methods=['POST'])
def update_word():
    word = Word.query.get(request.form['id'])
    if word is None:
        return jsonify(deleted=True)
    word.pos_x = int(request.form['pos_x'])
    word.pos_y = int(request.form['pos_y'])
    word.version += 1
    db_session.commit()
    return jsonify(word=word.to_json())

@mod.route('/words/delete', methods=['POST'])
def delete_word():
    word = Word.query.get(request.form['id'])
    db_session.delete(word)
    db_session.commit()
    return jsonify(word=word.to_json())

@mod.route('/words/get', methods=['GET'])
def get_words():
    versions = request.args.getlist('versions[]')
    if versions:
        ids = map(lambda x: int(x.split('=')[0]), versions)
        ids_versions = dict(map(tuple,
            map(lambda x: map(int, x.split('=')), versions)))

        words = {w.id: w for w in Word.query.all()}
        if len(ids):
            res_words = []
            for id_, w in words.items():
                if id_ not in ids_versions:
                    # means it is a new word for that user
                    res_words.append(w)
                elif w.version > ids_versions[id_]:
                    # for existing words, only send newer versions
                    res_words.append(w)

            # if a version that does not exist in database is sent, it
            # means we have a deleted word
            for id_, v in ids_versions.items():
                if not id_ in words.keys():
                    w = Word(version=v, text='deleted',
                        color='000000', pos_x=0, pos_y=0)
                    w.id = id_
                    w.version = -1
                    res_words.append(w)
    else:
        res_words = Word.query.all()

    res = json.dumps([w.to_json() for w in res_words])
    return Response(res, mimetype='application/json')
