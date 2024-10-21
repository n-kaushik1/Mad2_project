class Config():
    DEBUG = False
    SQL_ALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig():
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"    