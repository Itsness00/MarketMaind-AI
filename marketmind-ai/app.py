"""
MarketMind AI — Midnight Market Edition
Hacktoberfest 2026 Open-Source AI Project
Tagline: "Read the Signal. Question the Noise."
"""

import os
import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from marketmind.analytics import (
    calculate_returns,
    calculate_sma,
    calculate_volatility,
    calculate_max_drawdown,
    calculate_var_95,
    calculate_sharpe_proxy,
    calculate_calmar_ratio,
    compute_asset_metrics,
)
from marketmind.data_loader import (
    generate_deterministic_demo_data,
    validate_and_load_csv,
    SIMULATED_DATA_DISCLAIMER,
)
from marketmind.ai_engine import (
    check_ollama_connection,
    query_gemma_analyst,
    generate_financial_research_report,
)

# Page Configuration
st.set_page_config(
    page_title="MarketMind AI — Midnight Market Edition",
    page_icon="🎃",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling (Midnight Market Edition)
st.markdown(
    """
    <style>
    .stApp { background-color: #090B0F; color: #F4F1EA; font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2, h3 { color: #F4F1EA; font-family: 'Syne', sans-serif; }
    .stMetric { background-color: #161920; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px; }
    .pumpkin-accent { color: #FF7518; }
    </style>
    """,
    unsafe_allow_html=True,
)

# Sidebar Configuration
with st.sidebar:
    st.title("🎃 MarketMind AI")
    st.caption("Midnight Market Edition · Hacktoberfest 2026")
    st.markdown("**'Read the Signal. Question the Noise.'**")

    # Ollama Model Configuration via Environment or UI
    default_model = os.getenv("MARKETMIND_MODEL", "gemma4:e4b")
    default_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

    ollama_url = st.text_input("Ollama Endpoint", default_url)
    ollama_model = st.text_input("Model Identifier", default_model)

    is_connected, status_msg = check_ollama_connection(ollama_url, ollama_model)
    if is_connected:
        st.success(f"AI Engine: {ollama_model} (CONNECTED)")
    else:
        st.warning(f"AI Engine: {ollama_model} (STANDBY: {status_msg})")

    st.divider()
    data_source = st.radio("Dataset Mode", ["Simulated Demonstration Benchmark", "Upload CSV File"])

# Load Dataset
if data_source == "Simulated Demonstration Benchmark":
    st.info(f"⚠️ {SIMULATED_DATA_DISCLAIMER}")
    datasets = generate_deterministic_demo_data()
else:
    uploaded = st.file_uploader("Upload CSV (Required: date, ticker, close)", type=["csv"])
    if uploaded:
        datasets, err = validate_and_load_csv(uploaded)
        if err:
            st.error(f"Validation Error: {err}")
            st.stop()
    else:
        st.info("Awaiting CSV upload. Falling back to demonstration benchmark.")
        datasets = generate_deterministic_demo_data()

tickers = list(datasets.keys())
selected_ticker = st.selectbox("Select Asset for Research", tickers)
df = datasets[selected_ticker]

# Compute Financial Indicators Deterministically
metrics = compute_asset_metrics(df, selected_ticker)

# Primary Metrics Bar
st.header(f"Financial Intelligence: {selected_ticker}")
c1, c2, c3, c4 = st.columns(4)
c1.metric("Total Return", f"{metrics['total_return_pct']:+.2f}%")
c2.metric("Annualized Volatility (σ)", f"{metrics['annualized_volatility']:.2f}%")
c3.metric("Max Drawdown (MDD)", f"{metrics['max_drawdown_pct']:.2f}%")
c4.metric("Sharpe Ratio Proxy", f"{metrics['sharpe_ratio']:.2f}")

# Interactive Price & Moving Average Chart
fig = go.Figure()
fig.add_trace(go.Scatter(x=df['date'], y=df['close'], name='Close Price', line=dict(color='#FF7518', width=2)))
if 'sma20' in df.columns:
    fig.add_trace(go.Scatter(x=df['date'], y=df['sma20'], name='SMA 20', line=dict(color='#9B5DE5', width=1)))
if 'sma50' in df.columns:
    fig.add_trace(go.Scatter(x=df['date'], y=df['sma50'], name='SMA 50', line=dict(color='#42C98B', width=1)))
fig.update_layout(
    template='plotly_dark',
    paper_bgcolor='#161920',
    plot_bgcolor='#161920',
    height=450,
    margin=dict(l=20, r=20, t=30, b=20),
)
st.plotly_chart(fig, use_container_width=True)

# Section B: AI Market Analyst
st.subheader("🤖 Ask MarketMind AI (Google Gemma 4)")
user_question = st.text_input(
    "Ask a question about the active dataset:",
    "What are the biggest risks in this dataset?"
)
if st.button("Analyze with Gemma 4"):
    with st.spinner("Gemma 4 is analyzing mathematical indicators..."):
        response = query_gemma_analyst(user_question, metrics, ollama_url, ollama_model)
        st.markdown(response)

# Section E: AI Financial Report Generator
st.divider()
st.subheader("📋 9-Section Institutional Research Report")
if st.button("Generate Structured Report"):
    report = generate_financial_research_report(metrics)
    st.text_area("Generated Research Report (Markdown)", report, height=350)
    st.download_button("Download Report (.md)", report, file_name=f"report_{selected_ticker}.md")
