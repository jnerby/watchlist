"""
Authentication from the MovieDB
https://developers.themoviedb.org/3/getting-started/authentication
"""

import os
import requests
from flask import Flask, redirect, request, render_template, session


app = Flask(__name__)

def get_film_obj(user_search):
    """Renders and jsonifies film objects from the Movie DB API"""

    # get api key from environment
    key = os.environ.get('API_KEY')
    # url = 'https://api.themoviedb.org/3/search/movie?api_key=' + key + '&query=' + user_search
    # res = requests.get(url)
    
    payload = {"query": user_search}
    url = 'https://api.themoviedb.org/3/search/movie?api_key=' + key
    res = requests.get(url, params=payload)
    
    # convert json object to python dict
    data = res.json()
    # return results key from python dict
    search_results = data['results']
    return search_results


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        use_reloader=True,
        use_debugger=True,
    )