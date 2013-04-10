(function() {
    realtime.words = {
        form: '#word_form',
        canvas: '#word_canvas',
        max_x: 700,
        max_y: 600,

        init: function() {
            realtime.words.init_form();
            realtime.words.get(realtime.words.setup_drag);
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
        },

        setup_drag: function() {
            $('[draggable]').draggable({
                stop: function(event, ui) {
                    var id = event.target.id.split('_');
                    id = parseInt(id[id.length - 1]);
                    var word = realtime.words.get_word_by_id(id);

                    word.pos_x = ui.position.left;
                    word.pos_y = ui.position.top;

                    realtime.words.update(word);
                }
            });
        },

        word: Class.extend({
            init: function(id, text, color, version, pos_x, pos_y) {
                this.id = id;
                this.text = text;
                this.color = color;
                this.version = version;
                this.pos_x = pos_x;
                this.pos_y = pos_y;
            },

            draw: function() {
                $(realtime.words.canvas).append($.tmpl(this.template,this));
            },

            template: '<div style="' +
                    'background-color:#${color};' +
                    'top:${pos_y}px;' +
                    'left:${pos_x}px;' +
                    'display: inline-block;padding:2px 5px;' +
                    'position:absolute;" ' +
                    'class="word" ' +
                    'draggable="true" ' +
                    'id="word_id_${id}" ' +
                    'version="${version}" >${text}</div>',
        }),

        list: [],

        get: function(callback) {
            $.get('/words/get').
            success(function(data) {
                for(var i in data){
                    var w = data[i];
                    var word = new realtime.words.word(w.id, w.text,
                        w.color, w.version, w.pos_x, w.pos_y);
                    realtime.words.list.push(word);
                    word.draw();
                }

                callback();
            });
        },

        add: function(word){
            var post_data = {};
            for(attr in word) {
                if(word.hasOwnProperty(attr) && attr != 'id') {
                    post_data[attr] = word[attr];
                }
            }

            $.post('/words/add', post_data).
            success(function(data) {
                if(data.sucess == true) {
                    // nothing for now
                }
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
        }
    }
})();

$(document).ready(function() {
    realtime.words.init();
});
