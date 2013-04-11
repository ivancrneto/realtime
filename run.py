from realtime import app
import tornado.ioloop

app.run(host='0.0.0.0', port=8081, debug=True)
tornado.ioloop.IOLoop.instance().start()
