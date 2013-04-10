(function() {
    realtime.words = {
        form: '#word_form',
        canvas: '#word_canvas',
        max_x: 650,
        max_y: 550,

        init: function() {
            realtime.words.init_form();
            realtime.words.get(realtime.words.setup_drag);
            realtime.words.setup_trash();
        },

        init_form: function() {
            $('button[type="submit"]', $(realtime.words.form)).click(function(e){
                e.preventDefault();
                var text = $('#input_text', $(realtime.words.form)).val();
                var color = $('#input_color', $(realtime.words.form)).val();
                var x = Math.floor((Math.random()*realtime.words.max_x)+1);
                var y = Math.floor((Math.random()*realtime.words.max_y)+1);
                y = Math.min(y + 61, realtime.words.max_y); // header issue
                var word = new realtime.words.word(0, text, color, 0, x, y);

                realtime.words.add(word);
            });
        },

        get_word_by_id: function(id) {
            for(var i in realtime.words.list) {
                if(realtime.words.list[i].id == id) {
                    return realtime.words.list[i];
                }
            }

            return null;
        },

        extract_id: function(raw_id) {
            var id = raw_id.split('_');
            return parseInt(id[id.length - 1]);
        },

        setup_drag: function() {
            $('[draggable]').draggable({
                stop: function(event, ui) {
                    var id = realtime.words.extract_id(event.target.id);
                    var word = realtime.words.get_word_by_id(id);

                    word.pos_x = ui.position.left;
                    word.pos_y = ui.position.top;

                    realtime.words.update(word);
                }
            });
        },

        setup_trash: function() {
            $('.trash').droppable({
                accept: '[draggable]',
                drop: function(event, ui) {
                    var id = ui.draggable.attr('id');
                    id = realtime.words.extract_id(id);
                    var word = realtime.words.get_word_by_id(id);

                    realtime.words.remove(word);
                }
            });
        },

        word: Class.extend({
            init: function(id, text, color, version, pos_x, pos_y) {
                this.id = id;
                this.elem_id = 'word_id_' + this.id;
                this.text = text;
                this.color = color;
                this.version = version;
                this.pos_x = pos_x;
                this.pos_y = pos_y;
            },

            draw: function() {
                var html = $.tmpl(this.template, this);
                var existing = $('#' + this.elem_id, $(realtime.words.canvas));
                if(existing.length) {
                    existing.remove();
                }

                $(realtime.words.canvas).append(html);
            },

            remove: function() {
                var html = $.tmpl(this.template, this);
                $('#' + this.elem_id, $(realtime.words.canvas)).remove();
            },

            template: '<div style="' +
                    'background-color:#${color};' +
                    'top:${pos_y}px;' +
                    'left:${pos_x}px;' +
                    'display: inline-block;padding:2px 5px;' +
                    'position:absolute;" ' +
                    'class="word" ' +
                    'draggable="true" ' +
                    'id="${elem_id}" ' +
                    'version="${version}" >${text}</div>',
        }),

        list: [],

        get: function(callback) {
            $.get('/words/get').
            success(function(data) {
                for(var i in data){
                    var w = data[i];
                    var word = realtime.words.get_word_by_id(w.id);
                    if(word == null){
                        word = new realtime.words.word(w.id, w.text,
                            w.color, w.version, w.pos_x, w.pos_y);
                        realtime.words.list.push(word);
                    } else {
                        word.version = w.version;
                        word.pos_x = w.pos_x;
                        word.pos_y = w.pos_y;
                    }
                    word.draw();
                }

                // check for words to delete
                var data_ids = [];
                for(var i in data) {
                    data_ids.push(data[i].id);
                }

                for(var i in realtime.words.list) {
                    // means the word was deleted by other user
                    if($.inArray(realtime.words.list[i].id, data_ids) == -1) {
                        realtime.words.list[i].remove();
                        realtime.words.list.splice(i, 1);
                    }
                }

                callback();
            }).
            complete(function(data) {
                realtime.words.poll.run();
            });
        },

        add: function(word){
            var post_data = {};
            for(attr in word) {
                if(word.hasOwnProperty(attr) && attr != 'id' && attr != 'elem_id') {
                    post_data[attr] = word[attr];
                }
            }

            $.post('/words/add', post_data).
            success(function(data) {
                data = data.word;
                var word = new realtime.words.word(data.id, data.text,
                    data.color, data.version, data.pos_x, data.pos_y);
                realtime.words.list.push(word);
                word.draw();
                realtime.words.setup_drag();
            }).
            error(function() {
                alert('Error when adding a new word!');
            });
        },

        update: function(word) {
            var post_data = {
                'pos_x': word.pos_x,
                'pos_y': word.pos_y,
                'id': word.id
            };

            $.post('/words/update', post_data).
            success(function(data) {
                if(data.success == true) {
                    // nothing for now
                }
            }).
            error(function() {
                alert('Error when updating a word!');
            });
        },

        remove: function(word) {
            var post_data = {
                'id': word.id
            };

            $.post('/words/delete', post_data).
            success(function(data) {
                data = data.word;
                $('#word_id_' + data.id).remove();
            }).
            error(function() {
                alert('Error when deleting a word!');
            });
        },

        poll: {
            timer: null,
            interval: 3,

            run: function() {
                this.stop();
                this.timer = setTimeout(function() {
                    realtime.words.get(realtime.words.setup_drag);
                }, this.interval * 1000);
            },

            stop: function() {
                if(this.timer) {
                    clearTimeout(this.timer);
                }
            }
        }
    }
})();

$(document).ready(function() {
    realtime.words.init();
});
