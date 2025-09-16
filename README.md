# Orion Multi‑Chart (Lite)

A multi‑chart trading dashboard with live TradingView charts (intraday + daily) and a Finnhub time & sales sidebar. Built for viewing **pre‑market, regular session, and post‑market** candles on one page. Place orders in Thinkorswim/Schwab separately.

## Quick start
```bash
pip install -r requirements.txt
python app.py
# open http://localhost:5000
```

## Replit
- Upload all files → ensure `.replit` has `run = "python app.py"` → Run.

## Use
- Top bar: add symbols, set a timeframe (1m/5m/15m/60m/D), apply to all.
- Each chart card has its own symbol + timeframe controls.
- Tape: enter a symbol and press **Start** to stream prints from Finnhub.

## Notes
- TradingView embeds include extended hours (user can toggle to see pre/post candles).
- If a name is illiquid, prints may be sparse pre/post.
