from unipath import Path

_basedir = Path(__file__).parent

DATABASE_URI = 'sqlite:///' + Path(_basedir, 'realtime.db')
DATABASE_CONNECT_OPTIONS = {}
