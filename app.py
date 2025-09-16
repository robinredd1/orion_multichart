from flask import Flask, render_template
import config

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("multichart.html",
                           finnhub_key=config.FINNHUB_API_KEY,
                           default_symbols=config.DEFAULT_SYMBOLS,
                           max_charts=config.MAX_CHARTS)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
