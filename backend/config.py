class Config():
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class LocalDevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.sqlite3"
    DEBUG = True
    SECURITY_PASSWORD_HASH = 'bcrypt'
    SECURITY_PASSWORD_SALT = 'thisshouldbesecrete'
    SECRET_KEY = 'shouldbehidden'
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    WTF_CSRF_ENABLED = False    
    SECURITY_TOKEN_AUTHENTICATION_KEY = 'Authentication-Token'

    #cache specific
    CACHE_TYPE = "RedisCache"
    CACHE_DEFAULT_TIMEOUT = 20
    CACHE_REDIS_PORT = 6379
