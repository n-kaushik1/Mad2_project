from flask import Flask

def createApp():
     app = Flask(__name__)

     return app

app =createApp()

@app.get('/')
def home():
     return '<h1> home page </h1>'

if (__name__ == '__main__'):
     app.run(debug=True)
