"""
MarketMind AI — Data Loader & Validation
Deterministic synthetic benchmarks and robust CSV validation.
"""

import numpy as np
import pandas as pd

SIMULATED_DATA_DISCLAIMER = "SIMULATED DATA — NOT LIVE MARKET PRICES"


def generate_deterministic_demo_data() -> dict[str, pd.DataFrame]:
    """Generates deterministic synthetic historical datasets for 6 core assets."""
    assets = {
        "NVDA": {"base": 480.0, "drift": 0.58, "vol": 0.44},
        "MSFT": {"base": 375.0, "drift": 0.22, "vol": 0.21},
        "AAPL": {"base": 185.0, "drift": 0.16, "vol": 0.19},
        "GOOGL": {"base": 135.0, "drift": 0.26, "vol": 0.25},
        "SPY": {"base": 460.0, "drift": 0.14, "vol": 0.13},
        "QQQ": {"base": 395.0, "drift": 0.24, "vol": 0.18},
    }

    dates = pd.date_range(end="2026-10-30", periods=252, freq="B").strftime("%Y-%m-%d").tolist()
    datasets = {}

    for idx, (ticker, params) in enumerate(assets.items()):
        np.random.seed(42 + idx * 7919)
        dt = 1.0 / 252.0
        n = len(dates)

        drift = (params["drift"] - 0.5 * params["vol"] ** 2) * dt
        shock = params["vol"] * np.sqrt(dt) * np.random.normal(0, 1, n)
        factors = np.exp(drift + shock)
        factors[0] = 1.0
        prices = np.round(params["base"] * np.cumprod(factors), 2)

        df = pd.DataFrame({"date": dates, "ticker": ticker, "close": prices})
        df["sma20"] = df["close"].rolling(20).mean()
        df["sma50"] = df["close"].rolling(50).mean()
        datasets[ticker] = df

    return datasets


def validate_and_load_csv(uploaded_file) -> tuple[dict[str, pd.DataFrame] | None, str | None]:
    """Strictly validates uploaded CSV for required columns: date, ticker, close."""
    try:
        df = pd.read_csv(uploaded_file)
        cols = [c.strip().lower() for c in df.columns]
        df.columns = cols

        required = {"date", "ticker", "close"}
        if not required.issubset(set(cols)):
            return None, f"Missing required columns. Found: {list(df.columns)}. Required: date, ticker, close."

        df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.strftime("%Y-%m-%d")
        if df["date"].isnull().any():
            return None, "Invalid date format detected. Please use YYYY-MM-DD."

        df["close"] = pd.to_numeric(df["close"], errors="coerce")
        if df["close"].isnull().any() or (df["close"] <= 0).any():
            return None, "Close prices must be positive numerical figures."

        df["ticker"] = df["ticker"].astype(str).str.upper().str.strip()
        df = df.drop_duplicates(subset=["date", "ticker"]).sort_values("date").reset_index(drop=True)

        grouped = {t: sub_df.copy() for t, sub_df in df.groupby("ticker")}
        return grouped, None
    except Exception as e:
        return None, f"Failed to parse CSV: {str(e)}"
