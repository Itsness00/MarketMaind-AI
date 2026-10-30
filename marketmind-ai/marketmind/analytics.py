"""
MarketMind AI — Mathematical Analytics
Strict programmatic indicators: Returns, Volatility, Drawdowns, SMAs, Sharpe & Calmar.
"""

import numpy as np
import pandas as pd


def calculate_returns(prices: pd.Series) -> pd.Series:
    """Calculates daily percentage returns."""
    return prices.pct_change().dropna()


def calculate_sma(prices: pd.Series, window: int) -> pd.Series:
    """Calculates simple moving average."""
    return prices.rolling(window=window).mean()


def calculate_volatility(returns: pd.Series, periods_per_year: int = 252) -> float:
    """Calculates annualized standard deviation of daily returns."""
    if len(returns) <= 1:
        return 0.0
    return float(returns.std() * np.sqrt(periods_per_year) * 100.0)


def calculate_max_drawdown(prices: pd.Series) -> dict:
    """Calculates peak-to-trough maximum drawdown and critical dates."""
    running_max = prices.cummax()
    drawdown = (prices - running_max) / running_max * 100.0
    mdd = float(drawdown.min())
    trough_idx = drawdown.idxmin()
    peak_idx = prices.loc[:trough_idx].idxmax()
    return {
        "max_drawdown_pct": mdd,
        "peak_idx": peak_idx,
        "trough_idx": trough_idx,
    }


def calculate_var_95(returns: pd.Series) -> float:
    """Calculates 1-day 95% historical Value-at-Risk."""
    if len(returns) == 0:
        return 0.0
    return float(abs(np.percentile(returns, 5)) * 100.0)


def calculate_sharpe_proxy(total_return_pct: float, vol_pct: float, rf: float = 0.045) -> float:
    """Calculates Sharpe ratio proxy assuming annual risk-free rate rf."""
    if vol_pct <= 0:
        return 0.0
    return (total_return_pct / 100.0 - rf) / (vol_pct / 100.0)


def calculate_calmar_ratio(ann_return_pct: float, mdd_pct: float) -> float:
    """Calculates Calmar ratio = Annualized Return / |MDD|."""
    abs_mdd = abs(mdd_pct)
    if abs_mdd <= 0:
        return 0.0
    return (ann_return_pct / 100.0) / (abs_mdd / 100.0)


def compute_asset_metrics(df: pd.DataFrame, ticker: str) -> dict:
    """Computes complete indicator dictionary for Gemma 4 conditioning."""
    df_sorted = df.sort_values("date").reset_index(drop=True)
    prices = df_sorted["close"]
    daily_rets = calculate_returns(prices)

    start_p = float(prices.iloc[0])
    end_p = float(prices.iloc[-1])
    tot_ret = (end_p - start_p) / start_p * 100.0
    ann_ret = (np.power(end_p / start_p, 252.0 / max(1, len(prices) - 1)) - 1.0) * 100.0
    vol = calculate_volatility(daily_rets)
    mdd_info = calculate_max_drawdown(prices)
    var_95 = calculate_var_95(daily_rets)
    sharpe = calculate_sharpe_proxy(tot_ret, vol)
    calmar = calculate_calmar_ratio(ann_ret, mdd_info["max_drawdown_pct"])

    return {
        "ticker": ticker,
        "count": len(prices),
        "start_date": str(df_sorted["date"].iloc[0]),
        "end_date": str(df_sorted["date"].iloc[-1]),
        "start_price": start_p,
        "end_price": end_p,
        "total_return_pct": tot_ret,
        "annualized_return_pct": ann_ret,
        "annualized_volatility": vol,
        "max_drawdown_pct": mdd_info["max_drawdown_pct"],
        "var_95_pct": var_95,
        "sharpe_ratio": sharpe,
        "calmar_ratio": calmar,
        "best_day_pct": float(daily_rets.max() * 100) if len(daily_rets) else 0.0,
        "worst_day_pct": float(daily_rets.min() * 100) if len(daily_rets) else 0.0,
    }
