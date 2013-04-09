from sqlalchemy import create_engine, Column, Integer, String, DateTime, \
    ForeignKey, event
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from realtime import app

engine = create_engine(app.config['DATABASE_URI'],
                       convert_unicode=True,
                       **app.config['DATABASE_CONNECT_OPTIONS'])
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))

def init_db():
    Model.metadata.create_all(bind=engine)

Model = declarative_base(name='Model')
Model.query = db_session.query_property()

class Word(Model):
    __tablename__ = 'words'
    id = Column('word_id', Integer, primary_key=True)
    text = Column(String(20))
    color = Column(String(6))
    version = Column(Integer)
    pos_x = Column(Integer)
    pos_y = Column(Integer)

    def __init__(self, text, color, version, pos_x, pos_y):
        self.text = text
        self.color = color
        self.version = version
        self.pos_x = pos_x
        self.pos_y = pos_y

    def to_json(self):
        return dict(text=self.text, color=self.color, version=self.version,
            pos_x=self.pos_x, pos_y=self.pos_y)
