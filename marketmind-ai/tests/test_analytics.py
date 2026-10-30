"""
MarketMind AI — Unit Tests for Financial Analytics
"""

import unittest
import pandas as pd
import numpy as np
from marketmind.analytics import (
    calculate_returns,
    calculate_sma,
    calculate_volatility,
    calculate_max_drawdown,
    calculate_sharpe_proxy,
    calculate_var_95,
)


class TestFinancialAnalytics(unittest.TestCase):
    def setUp(self):
        # Deterministic price series: $100 -> $110 -> $99 -> $120
        self.prices = pd.Series([100.0, 110.0, 99.0, 120.0])
        self.dates = ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"]

    def test_daily_returns(self):
        rets = calculate_returns(self.prices)
        self.assertEqual(len(rets), 3)
        self.assertAlmostEqual(rets.iloc[0], 0.10, places=4)
        self.assertAlmostEqual(rets.iloc[1], -0.10, places=4)

    def test_sma_calculation(self):
        sma2 = calculate_sma(self.prices, window=2)
        self.assertTrue(pd.isna(sma2.iloc[0]))
        self.assertEqual(sma2.iloc[1], 105.0)
        self.assertEqual(sma2.iloc[3], 109.5)

    def test_max_drawdown(self):
        # Peak was $110, dropped to $99 -> Drawdown = (99 - 110)/110 = -10.0%
        res = calculate_max_drawdown(self.prices)
        self.assertAlmostEqual(res["max_drawdown_pct"], -10.0, places=2)

    def test_volatility_positive(self):
        rets = calculate_returns(self.prices)
        vol = calculate_volatility(rets)
        self.assertGreater(vol, 0.0)

    def test_sharpe_proxy(self):
        sharpe = calculate_sharpe_proxy(total_return_pct=20.0, vol_pct=15.0, rf=0.045)
        expected = (0.20 - 0.045) / 0.15
        self.assertAlmostEqual(sharpe, expected, places=3)


if __name__ == "__main__":
    unittest.main()
