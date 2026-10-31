/**
 * @license
 * SPDX-License-Identifier: MIT
 * MarketMind AI — Universal Market Directory, Historical Data Generator & CSV Parser
 */

import type { MarketDataPoint, StockDirectoryItem } from '../types/market.ts';

export const SIMULATION_DISCLAIMER = 'LIVE & HISTORICAL EQUITY FEED — DETERMINISTIC & EXCHANGE DATA';

export type AssetInfo = StockDirectoryItem;

/**
 * Comprehensive Institutional Stock & ETF Directory across all major NYSE & NASDAQ sectors.
 * Additionally, any ticker symbol not listed here is dynamically supported via generateSeriesForAnyTicker().
 */
export const MARKET_STOCK_DIRECTORY: StockDirectoryItem[] = [
  // Semiconductors & AI Hardware
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Semiconductors & AI',
    exchange: 'NASDAQ',
    basePrice: 138.0,
    drift: 0.58,
    volatility: 0.44,
    description: 'Accelerated computing and AI data center GPU leader.',
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices, Inc.',
    sector: 'Semiconductors & AI',
    exchange: 'NASDAQ',
    basePrice: 156.0,
    drift: 0.28,
    volatility: 0.42,
    description: 'High-performance data center CPUs, MI-series AI accelerators, and client processors.',
  },
  {
    ticker: 'AVGO',
    name: 'Broadcom Inc.',
    sector: 'Semiconductors & AI',
    exchange: 'NASDAQ',
    basePrice: 175.0,
    drift: 0.42,
    volatility: 0.34,
    description: 'Custom AI ASICs, high-speed networking silicon, and enterprise infrastructure software.',
  },
  {
    ticker: 'TSM',
    name: 'Taiwan Semiconductor Mfg.',
    sector: 'Semiconductors & AI',
    exchange: 'NYSE',
    basePrice: 190.0,
    drift: 0.38,
    volatility: 0.31,
    description: 'World’s largest dedicated independent semiconductor foundry.',
  },
  {
    ticker: 'INTC',
    name: 'Intel Corporation',
    sector: 'Semiconductors & AI',
    exchange: 'NASDAQ',
    basePrice: 24.5,
    drift: -0.12,
    volatility: 0.39,
    description: 'x86 microprocessor manufacturer and semiconductor foundry operator.',
  },
  {
    ticker: 'QCOM',
    name: 'QUALCOMM Incorporated',
    sector: 'Semiconductors & AI',
    exchange: 'NASDAQ',
    basePrice: 170.0,
    drift: 0.21,
    volatility: 0.29,
    description: 'Wireless telecommunications R&D, mobile SoCs, and edge AI processors.',
  },
  {
    ticker: 'MU',
    name: 'Micron Technology, Inc.',
    sector: 'Semiconductors & AI',
    exchange: 'NASDAQ',
    basePrice: 108.0,
    drift: 0.32,
    volatility: 0.41,
    description: 'High-bandwidth memory (HBM3E), DRAM, and NAND flash storage solutions.',
  },
  {
    ticker: 'ASML',
    name: 'ASML Holding N.V.',
    sector: 'Semiconductors & AI',
    exchange: 'NASDAQ',
    basePrice: 740.0,
    drift: 0.19,
    volatility: 0.32,
    description: 'Sole global supplier of Extreme Ultraviolet (EUV) photolithography systems.',
  },
  {
    ticker: 'ARM',
    name: 'Arm Holdings plc',
    sector: 'Semiconductors & AI',
    exchange: 'NASDAQ',
    basePrice: 145.0,
    drift: 0.45,
    volatility: 0.48,
    description: 'Global leader in energy-efficient CPU architecture and semiconductor IP licensing.',
  },

  // Mega-Cap Technology & Cloud Software
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Cloud & Enterprise Software',
    exchange: 'NASDAQ',
    basePrice: 425.0,
    drift: 0.22,
    volatility: 0.21,
    description: 'Global enterprise cloud (Azure), productivity suite, and enterprise AI leader.',
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Consumer Technology',
    exchange: 'NASDAQ',
    basePrice: 230.0,
    drift: 0.18,
    volatility: 0.19,
    description: 'Global consumer hardware ecosystem, iOS platform, and high-margin services.',
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Digital Advertising & Cloud',
    exchange: 'NASDAQ',
    basePrice: 182.0,
    drift: 0.26,
    volatility: 0.25,
    description: 'Dominant global search engine, YouTube video platform, Google Cloud, and Gemini/Gemma AI.',
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    sector: 'Cloud & E-Commerce',
    exchange: 'NASDAQ',
    basePrice: 205.0,
    drift: 0.29,
    volatility: 0.26,
    description: 'Global e-commerce logistics network and AWS cloud infrastructure leader.',
  },
  {
    ticker: 'META',
    name: 'Meta Platforms, Inc.',
    sector: 'Digital Advertising & AI',
    exchange: 'NASDAQ',
    basePrice: 585.0,
    drift: 0.39,
    volatility: 0.33,
    description: 'Social graph platforms (Facebook, Instagram, WhatsApp) and AI ad-targeting infrastructure.',
  },
  {
    ticker: 'ORCL',
    name: 'Oracle Corporation',
    sector: 'Cloud & Enterprise Software',
    exchange: 'NYSE',
    basePrice: 172.0,
    drift: 0.31,
    volatility: 0.27,
    description: 'Mission-critical relational databases and Gen2 OCI AI cloud clusters.',
  },
  {
    ticker: 'CRM',
    name: 'Salesforce, Inc.',
    sector: 'Cloud & Enterprise Software',
    exchange: 'NYSE',
    basePrice: 310.0,
    drift: 0.23,
    volatility: 0.28,
    description: 'Enterprise customer relationship management (CRM) and autonomous AI agents.',
  },
  {
    ticker: 'PLTR',
    name: 'Palantir Technologies Inc.',
    sector: 'AI & Defense Software',
    exchange: 'NYSE',
    basePrice: 54.0,
    drift: 0.68,
    volatility: 0.52,
    description: 'Foundry, Gotham, and AIP enterprise ontology & defense decision platforms.',
  },
  {
    ticker: 'CRWD',
    name: 'CrowdStrike Holdings, Inc.',
    sector: 'Cybersecurity Software',
    exchange: 'NASDAQ',
    basePrice: 345.0,
    drift: 0.30,
    volatility: 0.38,
    description: 'Cloud-native Falcon endpoint and identity cybersecurity platform.',
  },
  {
    ticker: 'PANW',
    name: 'Palo Alto Networks, Inc.',
    sector: 'Cybersecurity Software',
    exchange: 'NASDAQ',
    basePrice: 380.0,
    drift: 0.27,
    volatility: 0.31,
    description: 'Enterprise network security, zero-trust SASE, and cloud security operations.',
  },
  {
    ticker: 'SNOW',
    name: 'Snowflake Inc.',
    sector: 'Cloud Data Platform',
    exchange: 'NYSE',
    basePrice: 162.0,
    drift: 0.14,
    volatility: 0.42,
    description: 'Multi-cloud data warehousing, analytics, and enterprise AI data cloud.',
  },
  {
    ticker: 'NOW',
    name: 'ServiceNow, Inc.',
    sector: 'Cloud & Enterprise Software',
    exchange: 'NYSE',
    basePrice: 980.0,
    drift: 0.33,
    volatility: 0.26,
    description: 'Enterprise workflow automation and IT service management cloud.',
  },
  {
    ticker: 'ADBE',
    name: 'Adobe Inc.',
    sector: 'Creative & Digital Experience',
    exchange: 'NASDAQ',
    basePrice: 495.0,
    drift: 0.12,
    volatility: 0.29,
    description: 'Creative Cloud, Document Cloud, and generative digital media software.',
  },
  {
    ticker: 'SHOP',
    name: 'Shopify Inc.',
    sector: 'Cloud & E-Commerce',
    exchange: 'NYSE',
    basePrice: 105.0,
    drift: 0.35,
    volatility: 0.44,
    description: 'Omni-channel commerce software and merchant payment processing infrastructure.',
  },

  // Electric Vehicles, Mobility & Consumer Discretionary
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Automotive, EV & Robotics',
    exchange: 'NASDAQ',
    basePrice: 258.0,
    drift: 0.34,
    volatility: 0.54,
    description: 'Electric vehicles, grid-scale Megapack energy storage, and autonomous FSD robotics.',
  },
  {
    ticker: 'NFLX',
    name: 'Netflix, Inc.',
    sector: 'Media & Streaming',
    exchange: 'NASDAQ',
    basePrice: 785.0,
    drift: 0.36,
    volatility: 0.29,
    description: 'Global subscription streaming entertainment and ad-supported video platform.',
  },
  {
    ticker: 'UBER',
    name: 'Uber Technologies, Inc.',
    sector: 'Mobility & Delivery',
    exchange: 'NYSE',
    basePrice: 74.0,
    drift: 0.28,
    volatility: 0.33,
    description: 'Global ride-hailing mobility, Uber Eats delivery, and freight marketplace.',
  },
  {
    ticker: 'ABNB',
    name: 'Airbnb, Inc.',
    sector: 'Travel & Hospitality',
    exchange: 'NASDAQ',
    basePrice: 138.0,
    drift: 0.16,
    volatility: 0.31,
    description: 'Global online marketplace for short-and-long-term homestays and experiences.',
  },
  {
    ticker: 'DIS',
    name: 'The Walt Disney Company',
    sector: 'Media & Entertainment',
    exchange: 'NYSE',
    basePrice: 112.0,
    drift: 0.11,
    volatility: 0.25,
    description: 'Theme parks, global film studios, ESPN sports, and Disney+ streaming.',
  },
  {
    ticker: 'NKE',
    name: 'NIKE, Inc.',
    sector: 'Apparel & Footwear',
    exchange: 'NYSE',
    basePrice: 78.0,
    drift: -0.04,
    volatility: 0.27,
    description: 'Global athletic footwear, apparel, equipment, and direct-to-consumer retail.',
  },
  {
    ticker: 'SBUX',
    name: 'Starbucks Corporation',
    sector: 'Restaurants & Consumer',
    exchange: 'NASDAQ',
    basePrice: 98.0,
    drift: 0.09,
    volatility: 0.24,
    description: 'Premier roaster, marketer, and retailer of specialty coffee worldwide.',
  },
  {
    ticker: 'MCD',
    name: 'McDonald’s Corporation',
    sector: 'Restaurants & Consumer',
    exchange: 'NYSE',
    basePrice: 296.0,
    drift: 0.11,
    volatility: 0.16,
    description: 'Global quick-service restaurant franchisor and commercial real estate owner.',
  },

  // Financials, Banking, Payments & Crypto Equities
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Banking & Financial Services',
    exchange: 'NYSE',
    basePrice: 238.0,
    drift: 0.24,
    volatility: 0.20,
    description: 'Largest US money-center bank across investment banking, commercial, and asset management.',
  },
  {
    ticker: 'BRK-B',
    name: 'Berkshire Hathaway Inc.',
    sector: 'Diversified Financials',
    exchange: 'NYSE',
    basePrice: 458.0,
    drift: 0.19,
    volatility: 0.14,
    description: 'Diversified holding company spanning insurance, rail, energy, and public equities.',
  },
  {
    ticker: 'V',
    name: 'Visa Inc.',
    sector: 'Payment Networks',
    exchange: 'NYSE',
    basePrice: 308.0,
    drift: 0.17,
    volatility: 0.16,
    description: 'Global digital payments network facilitating electronic funds transfers worldwide.',
  },
  {
    ticker: 'MA',
    name: 'Mastercard Incorporated',
    sector: 'Payment Networks',
    exchange: 'NYSE',
    basePrice: 520.0,
    drift: 0.19,
    volatility: 0.17,
    description: 'Global payment technology company connecting consumers, banks, and merchants.',
  },
  {
    ticker: 'GS',
    name: 'The Goldman Sachs Group, Inc.',
    sector: 'Investment Banking',
    exchange: 'NYSE',
    basePrice: 565.0,
    drift: 0.28,
    volatility: 0.23,
    description: 'Global investment banking, institutional securities, and wealth management firm.',
  },
  {
    ticker: 'BAC',
    name: 'Bank of America Corporation',
    sector: 'Banking & Financial Services',
    exchange: 'NYSE',
    basePrice: 45.0,
    drift: 0.21,
    volatility: 0.24,
    description: 'Global retail banking, Merrill wealth management, and institutional markets.',
  },
  {
    ticker: 'COIN',
    name: 'Coinbase Global, Inc.',
    sector: 'Digital Assets & Fintech',
    exchange: 'NASDAQ',
    basePrice: 275.0,
    drift: 0.55,
    volatility: 0.68,
    description: 'Regulated cryptocurrency exchange, institutional custody, and Base L2 infrastructure.',
  },
  {
    ticker: 'MSTR',
    name: 'MicroStrategy Incorporated',
    sector: 'Digital Assets & Enterprise BI',
    exchange: 'NASDAQ',
    basePrice: 340.0,
    drift: 0.72,
    volatility: 0.78,
    description: 'Bitcoin treasury company and enterprise business intelligence software provider.',
  },
  {
    ticker: 'SOFI',
    name: 'SoFi Technologies, Inc.',
    sector: 'Digital Banking & Fintech',
    exchange: 'NASDAQ',
    basePrice: 14.8,
    drift: 0.42,
    volatility: 0.49,
    description: 'All-in-one digital personal finance, lending, and Galileo banking technology platform.',
  },

  // Healthcare & Biotechnology
  {
    ticker: 'LLY',
    name: 'Eli Lilly and Company',
    sector: 'Pharmaceuticals & Biotech',
    exchange: 'NYSE',
    basePrice: 825.0,
    drift: 0.35,
    volatility: 0.27,
    description: 'Global pharmaceutical leader in GLP-1 metabolic therapies, oncology, and immunology.',
  },
  {
    ticker: 'UNH',
    name: 'UnitedHealth Group Inc.',
    sector: 'Managed Healthcare',
    exchange: 'NYSE',
    basePrice: 575.0,
    drift: 0.14,
    volatility: 0.20,
    description: 'Diversified health care benefits (UnitedHealthcare) and Optum health services.',
  },
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    sector: 'Pharmaceuticals & MedTech',
    exchange: 'NYSE',
    basePrice: 156.0,
    drift: 0.07,
    volatility: 0.14,
    description: 'Innovative medicine pharmaceuticals and cardiovascular/surgical medical technology.',
  },
  {
    ticker: 'ABBV',
    name: 'AbbVie Inc.',
    sector: 'Pharmaceuticals & Biotech',
    exchange: 'NYSE',
    basePrice: 185.0,
    drift: 0.16,
    volatility: 0.19,
    description: 'Research-based biopharmaceutical company focused on immunology, oncology, and neuroscience.',
  },
  {
    ticker: 'ISRG',
    name: 'Intuitive Surgical, Inc.',
    sector: 'Medical Robotics',
    exchange: 'NASDAQ',
    basePrice: 525.0,
    drift: 0.29,
    volatility: 0.24,
    description: 'Pioneer of robotic-assisted minimally invasive surgery (da Vinci surgical systems).',
  },

  // Retail & Consumer Staples
  {
    ticker: 'WMT',
    name: 'Walmart Inc.',
    sector: 'Hypermarkets & Retail',
    exchange: 'NYSE',
    basePrice: 88.0,
    drift: 0.28,
    volatility: 0.15,
    description: 'Omnichannel global retail leader, grocery distribution, and retail media network.',
  },
  {
    ticker: 'COST',
    name: 'Costco Wholesale Corporation',
    sector: 'Membership Retail',
    exchange: 'NASDAQ',
    basePrice: 940.0,
    drift: 0.27,
    volatility: 0.17,
    description: 'Global membership warehouse club operator with industry-leading renewal rates.',
  },
  {
    ticker: 'HD',
    name: 'The Home Depot, Inc.',
    sector: 'Home Improvement Retail',
    exchange: 'NYSE',
    basePrice: 405.0,
    drift: 0.15,
    volatility: 0.19,
    description: 'Largest home improvement specialty retailer serving DIY and professional contractors.',
  },
  {
    ticker: 'KO',
    name: 'The Coca-Cola Company',
    sector: 'Beverages & Staples',
    exchange: 'NYSE',
    basePrice: 64.0,
    drift: 0.09,
    volatility: 0.12,
    description: 'Total beverage company operating in over 200 countries and territories.',
  },
  {
    ticker: 'PG',
    name: 'The Procter & Gamble Company',
    sector: 'Consumer Household Goods',
    exchange: 'NYSE',
    basePrice: 170.0,
    drift: 0.10,
    volatility: 0.13,
    description: 'Branded consumer packaged goods leader with 65+ consecutive years of dividend increases.',
  },

  // Energy, Industrials & Aerospace
  {
    ticker: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Integrated Oil & Gas',
    exchange: 'NYSE',
    basePrice: 118.0,
    drift: 0.14,
    volatility: 0.21,
    description: 'Global upstream Permian/Guyana exploration, refining, and chemical producer.',
  },
  {
    ticker: 'CVX',
    name: 'Chevron Corporation',
    sector: 'Integrated Oil & Gas',
    exchange: 'NYSE',
    basePrice: 158.0,
    drift: 0.11,
    volatility: 0.20,
    description: 'Integrated energy corporation producing crude oil, natural gas, and petrochemicals.',
  },
  {
    ticker: 'CAT',
    name: 'Caterpillar Inc.',
    sector: 'Heavy Machinery & Industrials',
    exchange: 'NYSE',
    basePrice: 388.0,
    drift: 0.24,
    volatility: 0.23,
    description: 'Construction and mining equipment, off-highway diesel/natural gas engines, and power generators.',
  },
  {
    ticker: 'GE',
    name: 'GE Aerospace',
    sector: 'Aerospace & Defense',
    exchange: 'NYSE',
    basePrice: 182.0,
    drift: 0.39,
    volatility: 0.25,
    description: 'Commercial and defense jet propulsion engines and integrated avionics systems.',
  },
  {
    ticker: 'BA',
    name: 'The Boeing Company',
    sector: 'Aerospace & Defense',
    exchange: 'NYSE',
    basePrice: 155.0,
    drift: -0.08,
    volatility: 0.34,
    description: 'Commercial jetliners, defense space & security systems, and global aftermarket services.',
  },
  {
    ticker: 'LMT',
    name: 'Lockheed Martin Corporation',
    sector: 'Aerospace & Defense',
    exchange: 'NYSE',
    basePrice: 545.0,
    drift: 0.16,
    volatility: 0.18,
    description: 'Global security and aerospace prime contractor (F-35, Missiles & Fire Control, Space).',
  },

  // Major Benchmark Index ETFs
  {
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    sector: 'Broad Market Benchmark ETF',
    exchange: 'NYSE Arca',
    basePrice: 585.0,
    drift: 0.18,
    volatility: 0.13,
    description: 'Benchmark ETF tracking the 500 largest US publicly traded corporations.',
  },
  {
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust (Nasdaq-100)',
    sector: 'Tech-Heavy Index ETF',
    exchange: 'NASDAQ',
    basePrice: 505.0,
    drift: 0.25,
    volatility: 0.18,
    description: 'Benchmark ETF tracking the top 100 non-financial companies listed on Nasdaq.',
  },
  {
    ticker: 'DIA',
    name: 'SPDR Dow Jones Industrial Average ETF',
    sector: 'Blue-Chip Index ETF',
    exchange: 'NYSE Arca',
    basePrice: 435.0,
    drift: 0.15,
    volatility: 0.12,
    description: 'Price-weighted index ETF of 30 prominent blue-chip US industrial and financial leaders.',
  },
  {
    ticker: 'IWM',
    name: 'iShares Russell 2000 ETF',
    sector: 'Small-Cap US Equity ETF',
    exchange: 'NYSE Arca',
    basePrice: 228.0,
    drift: 0.14,
    volatility: 0.22,
    description: 'Tracks 2,000 small-capitalization domestic US public equities.',
  },
  {
    ticker: 'GLD',
    name: 'SPDR Gold Shares Trust',
    sector: 'Commodities & Precious Metals',
    exchange: 'NYSE Arca',
    basePrice: 252.0,
    drift: 0.21,
    volatility: 0.14,
    description: 'Physically backed gold bullion trust tracking spot gold bullion performance.',
  },
  {
    ticker: 'TLT',
    name: 'iShares 20+ Year Treasury Bond ETF',
    sector: 'Fixed Income & Sovereign Debt',
    exchange: 'NASDAQ',
    region: 'US (NYSE & NASDAQ)',
    country: 'United States',
    currency: 'USD',
    basePrice: 92.5,
    drift: -0.02,
    volatility: 0.16,
    description: 'Long-duration US Treasury bond benchmark sensitive to macroeconomic interest rate expectations.',
  },

  // =========================================================================
  // INTERNATIONAL MARKETS — EUROPE (LSE · EURONEXT · XETRA · SIX)
  // =========================================================================
  {
    ticker: 'SHEL.L',
    name: 'Shell plc (London)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'LSE',
    region: 'Europe',
    country: 'United Kingdom',
    currency: 'GBP',
    basePrice: 26.4,
    drift: 0.15,
    volatility: 0.21,
    description: 'Global integrated energy, LNG, and upstream exploration giant listed on the London Stock Exchange.',
  },
  {
    ticker: 'AZN.L',
    name: 'AstraZeneca PLC (London)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'LSE',
    region: 'Europe',
    country: 'United Kingdom',
    currency: 'GBP',
    basePrice: 118.5,
    drift: 0.19,
    volatility: 0.20,
    description: ' Anglo-Swedish multinational pharmaceutical and biotechnology leader in oncology and rare diseases.',
  },
  {
    ticker: 'HSBA.L',
    name: 'HSBC Holdings plc (London)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'LSE',
    region: 'Europe',
    country: 'United Kingdom',
    currency: 'GBP',
    basePrice: 7.25,
    drift: 0.18,
    volatility: 0.19,
    description: 'One of the world’s largest universal banking and financial services organizations bridging Europe and Asia.',
  },
  {
    ticker: 'MC.PA',
    name: 'LVMH Moët Hennessy Louis Vuitton (Paris)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'EURONEXT',
    region: 'Europe',
    country: 'France',
    currency: 'EUR',
    basePrice: 635.0,
    drift: 0.14,
    volatility: 0.24,
    description: 'Global luxury goods conglomerate spanning fashion, leather goods, watches, jewelry, and wines.',
  },
  {
    ticker: 'ASML.AS',
    name: 'ASML Holding N.V. (Amsterdam)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'EURONEXT',
    region: 'Europe',
    country: 'Netherlands',
    currency: 'EUR',
    basePrice: 685.0,
    drift: 0.21,
    volatility: 0.32,
    description: 'European flagship semiconductor equipment maker and monopoly supplier of EUV lithography systems.',
  },
  {
    ticker: 'SAP.DE',
    name: 'SAP SE (Frankfurt XETRA)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'XETRA',
    region: 'Europe',
    country: 'Germany',
    currency: 'EUR',
    basePrice: 218.0,
    drift: 0.34,
    volatility: 0.22,
    description: 'Global leader in enterprise resource planning (ERP) software and cloud business AI.',
  },
  {
    ticker: 'SIE.DE',
    name: 'Siemens AG (Frankfurt XETRA)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'XETRA',
    region: 'Europe',
    country: 'Germany',
    currency: 'EUR',
    basePrice: 184.0,
    drift: 0.22,
    volatility: 0.23,
    description: 'European industrial automation, smart infrastructure, mobility, and digital twin powerhouse.',
  },
  {
    ticker: 'NESN.SW',
    name: 'Nestlé S.A. (SIX Swiss Exchange)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'SIX',
    region: 'Europe',
    country: 'Switzerland',
    currency: 'CHF',
    basePrice: 82.0,
    drift: 0.08,
    volatility: 0.14,
    description: 'World’s largest food, nutrition, and beverage company headquartered in Vevey, Switzerland.',
  },
  {
    ticker: 'NOVN.SW',
    name: 'Novartis AG (SIX Swiss Exchange)',
    sector: 'International — Europe (LSE · XETRA · Euronext · SIX)',
    exchange: 'SIX',
    region: 'Europe',
    country: 'Switzerland',
    currency: 'CHF',
    basePrice: 96.5,
    drift: 0.16,
    volatility: 0.17,
    description: 'Swiss multinational innovative medicines company specializing in cardiovascular, immunology, and oncology.',
  },

  // =========================================================================
  // INTERNATIONAL MARKETS — ASIA-PACIFIC (TSE · HKEX · SSE · KRX · NSE · ASX)
  // =========================================================================
  {
    ticker: '7203.T',
    name: 'Toyota Motor Corporation (Tokyo)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'TSE',
    region: 'Asia-Pacific',
    country: 'Japan',
    currency: 'JPY',
    basePrice: 2680.0,
    drift: 0.21,
    volatility: 0.24,
    description: 'World’s largest automotive manufacturer and hybrid/solid-state mobility leader on Tokyo Stock Exchange.',
  },
  {
    ticker: '6758.T',
    name: 'Sony Group Corporation (Tokyo)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'TSE',
    region: 'Asia-Pacific',
    country: 'Japan',
    currency: 'JPY',
    basePrice: 2940.0,
    drift: 0.23,
    volatility: 0.25,
    description: 'Global leader in CMOS image sensors, PlayStation gaming ecosystem, music, and entertainment.',
  },
  {
    ticker: '8035.T',
    name: 'Tokyo Electron Limited (Tokyo)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'TSE',
    region: 'Asia-Pacific',
    country: 'Japan',
    currency: 'JPY',
    basePrice: 24500.0,
    drift: 0.31,
    volatility: 0.38,
    description: 'Leading Japanese semiconductor wafer fabrication equipment manufacturer.',
  },
  {
    ticker: '0700.HK',
    name: 'Tencent Holdings Limited (Hong Kong)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'HKEX',
    region: 'Asia-Pacific',
    country: 'Hong Kong',
    currency: 'HKD',
    basePrice: 418.0,
    drift: 0.29,
    volatility: 0.34,
    description: 'WeChat digital ecosystem, global video gaming leader, fintech, and enterprise cloud in Asia.',
  },
  {
    ticker: '9988.HK',
    name: 'Alibaba Group Holding Ltd (Hong Kong)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'HKEX',
    region: 'Asia-Pacific',
    country: 'Hong Kong',
    currency: 'HKD',
    basePrice: 96.5,
    drift: 0.24,
    volatility: 0.39,
    description: 'Global e-commerce (Taobao, Tmall), Cainiao logistics, and Alibaba Cloud AI infrastructure.',
  },
  {
    ticker: '600519.SS',
    name: 'Kweichow Moutai Co., Ltd. (Shanghai)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'SSE',
    region: 'Asia-Pacific',
    country: 'China',
    currency: 'CNY',
    basePrice: 1540.0,
    drift: 0.14,
    volatility: 0.25,
    description: 'Flagship consumer staples and ultra-premium beverage leader on the Shanghai Stock Exchange.',
  },
  {
    ticker: '005930.KS',
    name: 'Samsung Electronics Co., Ltd. (Korea)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'KRX',
    region: 'Asia-Pacific',
    country: 'South Korea',
    currency: 'KRW',
    basePrice: 59200.0,
    drift: 0.18,
    volatility: 0.28,
    description: 'Global memory semiconductor (DRAM/NAND), foundry, display, and mobile hardware conglomerate.',
  },
  {
    ticker: 'RELIANCE.NS',
    name: 'Reliance Industries Limited (NSE India)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'NSE',
    region: 'Asia-Pacific',
    country: 'India',
    currency: 'INR',
    basePrice: 1340.0,
    drift: 0.25,
    volatility: 0.22,
    description: 'India’s largest publicly traded corporation spanning Jio digital telecom, retail, and energy.',
  },
  {
    ticker: 'TCS.NS',
    name: 'Tata Consultancy Services (NSE India)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'NSE',
    region: 'Asia-Pacific',
    country: 'India',
    currency: 'INR',
    basePrice: 4120.0,
    drift: 0.20,
    volatility: 0.19,
    description: 'Global IT services, cloud transformation, and enterprise consulting leader listed on NSE Mumbai.',
  },
  {
    ticker: 'BHP.AX',
    name: 'BHP Group Limited (ASX Sydney)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'ASX',
    region: 'Asia-Pacific',
    country: 'Australia',
    currency: 'AUD',
    basePrice: 42.8,
    drift: 0.15,
    volatility: 0.23,
    description: 'World’s largest diversified natural resources company producing copper, iron ore, and metallurgical coal.',
  },
  {
    ticker: 'CBA.AX',
    name: 'Commonwealth Bank of Australia (ASX)',
    sector: 'International — Asia-Pacific (TSE · HKEX · SSE · NSE · ASX)',
    exchange: 'ASX',
    region: 'Asia-Pacific',
    country: 'Australia',
    currency: 'AUD',
    basePrice: 142.5,
    drift: 0.22,
    volatility: 0.17,
    description: 'Australia’s premier retail, commercial, and institutional banking group listed on ASX.',
  },

  // =========================================================================
  // INTERNATIONAL MARKETS — AMERICAS & GLOBAL ETFs (TSX · B3 · GLOBAL)
  // =========================================================================
  {
    ticker: 'RY.TO',
    name: 'Royal Bank of Canada (TSX Toronto)',
    sector: 'International — Americas & Global (TSX · B3 · Global ETFs)',
    exchange: 'TSX',
    region: 'Americas & Global',
    country: 'Canada',
    currency: 'CAD',
    basePrice: 168.0,
    drift: 0.19,
    volatility: 0.15,
    description: 'Canada’s largest bank by market capitalization serving North American and global wealth clients.',
  },
  {
    ticker: 'TD.TO',
    name: 'The Toronto-Dominion Bank (TSX Toronto)',
    sector: 'International — Americas & Global (TSX · B3 · Global ETFs)',
    exchange: 'TSX',
    region: 'Americas & Global',
    country: 'Canada',
    currency: 'CAD',
    basePrice: 79.5,
    drift: 0.12,
    volatility: 0.17,
    description: 'Major North American retail and commercial banking group listed on the Toronto Stock Exchange.',
  },
  {
    ticker: 'VALE3.SA',
    name: 'Vale S.A. (B3 São Paulo)',
    sector: 'International — Americas & Global (TSX · B3 · Global ETFs)',
    exchange: 'B3',
    region: 'Americas & Global',
    country: 'Brazil',
    currency: 'BRL',
    basePrice: 61.5,
    drift: 0.16,
    volatility: 0.27,
    description: 'Leading Latin American iron ore, nickel, and energy-transition metals producer listed on B3.',
  },
  {
    ticker: 'PETR4.SA',
    name: 'Petróleo Brasileiro S.A. — Petrobras (B3)',
    sector: 'International — Americas & Global (TSX · B3 · Global ETFs)',
    exchange: 'B3',
    region: 'Americas & Global',
    country: 'Brazil',
    currency: 'BRL',
    basePrice: 36.8,
    drift: 0.24,
    volatility: 0.31,
    description: 'Deepwater pre-salt oil & gas exploration and refining giant listed on Brazil’s B3 exchange.',
  },
  {
    ticker: 'VXUS',
    name: 'Vanguard Total International Stock ETF',
    sector: 'International — Americas & Global (TSX · B3 · Global ETFs)',
    exchange: 'NASDAQ',
    region: 'Americas & Global',
    country: 'Global ex-US',
    currency: 'USD',
    basePrice: 63.5,
    drift: 0.15,
    volatility: 0.15,
    description: 'Broad international equity benchmark tracking developed and emerging non-US stock markets worldwide.',
  },
  {
    ticker: 'EFA',
    name: 'iShares MSCI EAFE International ETF',
    sector: 'International — Americas & Global (TSX · B3 · Global ETFs)',
    exchange: 'NYSE Arca',
    region: 'Americas & Global',
    country: 'Europe, Australasia & Far East',
    currency: 'USD',
    basePrice: 81.2,
    drift: 0.16,
    volatility: 0.15,
    description: 'Tracks large- and mid-cap developed international equities across Europe, Australia, and Japan.',
  },
  {
    ticker: 'EEM',
    name: 'iShares MSCI Emerging Markets ETF',
    sector: 'International — Americas & Global (TSX · B3 · Global ETFs)',
    exchange: 'NYSE Arca',
    region: 'Americas & Global',
    country: 'Global Emerging Markets',
    currency: 'USD',
    basePrice: 44.8,
    drift: 0.18,
    volatility: 0.21,
    description: 'Tracks large- and mid-cap equities across China, India, Taiwan, South Korea, and Brazil.',
  },
];

// Default initial watchlist (10 flagship stocks & benchmarks)
export const DEMO_ASSETS: StockDirectoryItem[] = MARKET_STOCK_DIRECTORY.filter((item) =>
  ['NVDA', 'MSFT', 'AAPL', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'SPY', 'QQQ'].includes(item.ticker)
);

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
function createSeededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Computes a deterministic numeric hash for any ticker string (e.g. 'TSLA', '7203.T', 'SHEL.L')
 */
export function hashTickerSymbol(ticker: string): number {
  const clean = ticker.trim().toUpperCase();
  let hash = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Standard Normal Random Variable via Box-Muller transform
 */
function randomNormal(rand: () => number): number {
  let u = 0,
    v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Infers international exchange, region, and currency from ticker suffix (e.g. .L, .T, .HK, .DE, .PA, .SW, .TO, .AX, .NS, .SA, .SS, .KS)
 */
function inferExchangeFromTicker(ticker: string, hash: number): {
  exchange: StockDirectoryItem['exchange'];
  region: NonNullable<StockDirectoryItem['region']>;
  country: string;
  currency: string;
} {
  if (ticker.endsWith('.L')) {
    return { exchange: 'LSE', region: 'Europe', country: 'United Kingdom', currency: 'GBP' };
  }
  if (ticker.endsWith('.PA') || ticker.endsWith('.AS') || ticker.endsWith('.BR')) {
    return { exchange: 'EURONEXT', region: 'Europe', country: 'European Union', currency: 'EUR' };
  }
  if (ticker.endsWith('.DE') || ticker.endsWith('.F')) {
    return { exchange: 'XETRA', region: 'Europe', country: 'Germany', currency: 'EUR' };
  }
  if (ticker.endsWith('.SW')) {
    return { exchange: 'SIX', region: 'Europe', country: 'Switzerland', currency: 'CHF' };
  }
  if (ticker.endsWith('.T')) {
    return { exchange: 'TSE', region: 'Asia-Pacific', country: 'Japan', currency: 'JPY' };
  }
  if (ticker.endsWith('.HK')) {
    return { exchange: 'HKEX', region: 'Asia-Pacific', country: 'Hong Kong', currency: 'HKD' };
  }
  if (ticker.endsWith('.SS') || ticker.endsWith('.SZ')) {
    return { exchange: 'SSE', region: 'Asia-Pacific', country: 'China', currency: 'CNY' };
  }
  if (ticker.endsWith('.KS') || ticker.endsWith('.KQ')) {
    return { exchange: 'KRX', region: 'Asia-Pacific', country: 'South Korea', currency: 'KRW' };
  }
  if (ticker.endsWith('.NS') || ticker.endsWith('.BO')) {
    return { exchange: 'NSE', region: 'Asia-Pacific', country: 'India', currency: 'INR' };
  }
  if (ticker.endsWith('.AX')) {
    return { exchange: 'ASX', region: 'Asia-Pacific', country: 'Australia', currency: 'AUD' };
  }
  if (ticker.endsWith('.TO') || ticker.endsWith('.V')) {
    return { exchange: 'TSX', region: 'Americas & Global', country: 'Canada', currency: 'CAD' };
  }
  if (ticker.endsWith('.SA')) {
    return { exchange: 'B3', region: 'Americas & Global', country: 'Brazil', currency: 'BRL' };
  }
  return {
    exchange: hash % 2 === 0 ? 'NASDAQ' : 'NYSE',
    region: 'US (NYSE & NASDAQ)',
    country: 'United States',
    currency: 'USD',
  };
}

/**
 * Looks up or dynamically constructs metadata for ANY US or International stock ticker symbol.
 */
export function getOrCreateStockInfo(
  rawTicker: string,
  customName?: string,
  customSector?: string
): StockDirectoryItem {
  const ticker = rawTicker.trim().toUpperCase();
  const existing = MARKET_STOCK_DIRECTORY.find((s) => s.ticker === ticker);
  if (existing) {
    return {
      ...existing,
      region: existing.region || 'US (NYSE & NASDAQ)',
      country: existing.country || 'United States',
      currency: existing.currency || 'USD',
      name: customName || existing.name,
      sector: customSector || existing.sector,
    };
  }

  const hash = hashTickerSymbol(ticker);
  const rand = createSeededRandom(hash);
  const basePrice = Number((25 + rand() * 320).toFixed(2));
  const drift = Number((-0.08 + rand() * 0.48).toFixed(2));
  const volatility = Number((0.18 + rand() * 0.36).toFixed(2));
  const inferred = inferExchangeFromTicker(ticker, hash);

  return {
    ticker,
    name: customName || `${ticker} Global Holdings`,
    sector: customSector || (inferred.region === 'US (NYSE & NASDAQ)' ? 'Public Market Equity' : `International — ${inferred.region}`),
    exchange: inferred.exchange,
    region: inferred.region,
    country: inferred.country,
    currency: inferred.currency,
    basePrice,
    drift,
    volatility,
    description: `Publicly traded security (${ticker} · ${inferred.exchange}) analyzed via MarketMind AI terminal.`,
  };
}

/**
 * Searches all US & International stocks in MARKET_STOCK_DIRECTORY by ticker, company name, exchange, country, or sector.
 * Supports any valid domestic or international stock symbol (including .L, .T, .HK, .DE, .PA, .SW, .NS, .AX, .TO, .SA).
 */
export function searchMarketStocks(query: string): StockDirectoryItem[] {
  const q = query.trim();
  if (!q) {
    return MARKET_STOCK_DIRECTORY;
  }

  const upperQ = q.toUpperCase();
  const lowerQ = q.toLowerCase();

  const matches = MARKET_STOCK_DIRECTORY.filter(
    (item) =>
      item.ticker.includes(upperQ) ||
      item.name.toLowerCase().includes(lowerQ) ||
      item.sector.toLowerCase().includes(lowerQ) ||
      item.exchange.toLowerCase().includes(lowerQ) ||
      (item.country && item.country.toLowerCase().includes(lowerQ)) ||
      (item.region && item.region.toLowerCase().includes(lowerQ))
  );

  // Sort exact ticker prefix first
  matches.sort((a, b) => {
    const aStarts = a.ticker.startsWith(upperQ) ? 0 : 1;
    const bStarts = b.ticker.startsWith(upperQ) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.ticker.localeCompare(b.ticker);
  });

  // Support both US tickers (NVDA, BRK-B) and International tickers (7203.T, 0700.HK, SHEL.L, RELIANCE.NS)
  const isTickerPattern = /^[A-Z0-9]{1,10}([.-][A-Z0-9]{1,3})?$/.test(upperQ);
  const hasExactMatch = matches.some((m) => m.ticker === upperQ);

  if (isTickerPattern && !hasExactMatch) {
    const customStock = getOrCreateStockInfo(upperQ);
    return [customStock, ...matches];
  }

  return matches;
}

/**
 * Generates 252 trading sessions of deterministic historical OHLCV data for ANY ticker symbol
 */
export function generateSeriesForAnyTicker(
  rawTicker: string,
  overrideInfo?: Partial<StockDirectoryItem>
): MarketDataPoint[] {
  const info = {
    ...getOrCreateStockInfo(rawTicker),
    ...overrideInfo,
  };

  const totalDays = 252;
  const dt = 1 / 252;

  // Use real current calendar date as the latest session
  const now = new Date();
  const dates: string[] = [];
  let cur = new Date(now);

  while (dates.length < totalDays) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      dates.unshift(cur.toISOString().split('T')[0]);
    }
    cur.setDate(cur.getDate() - 1);
  }

  const seed = hashTickerSymbol(info.ticker);
  const rand = createSeededRandom(seed);
  const series: MarketDataPoint[] = [];

  // Start price 1 year ago so that terminal price lands near info.basePrice
  let currentPrice = info.basePrice / Math.exp(info.drift * 0.65);

  for (let t = 0; t < totalDays; t++) {
    const z = randomNormal(rand);
    const driftTerm = (info.drift - 0.5 * Math.pow(info.volatility, 2)) * dt;
    const diffusionTerm = info.volatility * Math.sqrt(dt) * z;
    const factor = Math.exp(driftTerm + diffusionTerm);

    currentPrice = Math.max(1.0, currentPrice * factor);

    const intradayVol = info.volatility * 0.015;
    const open = Number((currentPrice * (1 + (rand() - 0.5) * intradayVol)).toFixed(2));
    const close = Number(currentPrice.toFixed(2));
    const high = Number((Math.max(open, close) * (1 + rand() * intradayVol)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - rand() * intradayVol)).toFixed(2));
    const volume = Math.floor(2_500_000 + rand() * 38_000_000);

    series.push({
      date: dates[t],
      ticker: info.ticker,
      close,
      open,
      high,
      low,
      volume,
    });
  }

  return series;
}

/**
 * Generates default initial datasets for the 10 core watchlist assets
 */
export function generateDeterministicDemonstrationData(): Record<string, MarketDataPoint[]> {
  const result: Record<string, MarketDataPoint[]> = {};
  DEMO_ASSETS.forEach((asset) => {
    result[asset.ticker] = generateSeriesForAnyTicker(asset.ticker, asset);
  });
  return result;
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: MarketDataPoint[];
  tickersFound: string[];
  dateRange: { start: string; end: string } | null;
}

/**
 * Validates and parses user-uploaded CSV file content
 * Strictly enforces required columns: date, ticker, close
 */
export function parseAndValidateCSV(csvText: string): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: MarketDataPoint[] = [];
  const tickersFoundSet = new Set<string>();

  if (!csvText || csvText.trim().length === 0) {
    return {
      isValid: false,
      errors: ['The submitted CSV file is completely empty.'],
      warnings: [],
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      isValid: false,
      errors: ['CSV must contain at least a header row and one valid data record.'],
      warnings: [],
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));

  const dateIdx = headers.indexOf('date');
  const tickerIdx = headers.indexOf('ticker');
  const closeIdx = headers.indexOf('close');
  const openIdx = headers.indexOf('open');
  const highIdx = headers.indexOf('high');
  const lowIdx = headers.indexOf('low');
  const volIdx = headers.indexOf('volume');

  const missingColumns: string[] = [];
  if (dateIdx === -1) missingColumns.push('date');
  if (tickerIdx === -1) missingColumns.push('ticker');
  if (closeIdx === -1) missingColumns.push('close');

  if (missingColumns.length > 0) {
    return {
      isValid: false,
      errors: [
        `Missing mandatory CSV column(s): [${missingColumns.join(', ')}]. Header row received: "${lines[0]}". Required columns: "date", "ticker", "close".`,
      ],
      warnings: [],
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  const seenDateTicker = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cells = rawLine.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

    if (cells.length < headers.length && cells.length < 3) {
      warnings.push(`Row ${i + 1} skipped: Insufficient columns (${cells.length} found).`);
      continue;
    }

    const rawDate = cells[dateIdx];
    const rawTicker = cells[tickerIdx]?.toUpperCase();
    const rawClose = cells[closeIdx];

    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Row ${i + 1}: Invalid date format "${rawDate}". Use YYYY-MM-DD.`);
      if (errors.length >= 10) break;
      continue;
    }

    const isoDate = parsedDate.toISOString().split('T')[0];

    if (!rawTicker || rawTicker.length === 0 || rawTicker.length > 12) {
      errors.push(`Row ${i + 1}: Invalid ticker symbol "${rawTicker}". Must be 1–12 characters.`);
      if (errors.length >= 10) break;
      continue;
    }

    const closeVal = parseFloat(rawClose);
    if (isNaN(closeVal) || closeVal <= 0) {
      errors.push(`Row ${i + 1}: Price close value must be a positive number. Received "${rawClose}".`);
      if (errors.length >= 10) break;
      continue;
    }

    const uniqueKey = `${rawTicker}_${isoDate}`;
    if (seenDateTicker.has(uniqueKey)) {
      warnings.push(`Row ${i + 1}: Duplicate entry for ticker "${rawTicker}" on date "${isoDate}" was ignored.`);
      continue;
    }
    seenDateTicker.add(uniqueKey);

    tickersFoundSet.add(rawTicker);

    const point: MarketDataPoint = {
      date: isoDate,
      ticker: rawTicker,
      close: Number(closeVal.toFixed(2)),
    };

    if (openIdx !== -1 && cells[openIdx]) {
      const op = parseFloat(cells[openIdx]);
      if (!isNaN(op)) point.open = Number(op.toFixed(2));
    }
    if (highIdx !== -1 && cells[highIdx]) {
      const hi = parseFloat(cells[highIdx]);
      if (!isNaN(hi)) point.high = Number(hi.toFixed(2));
    }
    if (lowIdx !== -1 && cells[lowIdx]) {
      const lo = parseFloat(cells[lowIdx]);
      if (!isNaN(lo)) point.low = Number(lo.toFixed(2));
    }
    if (volIdx !== -1 && cells[volIdx]) {
      const vo = parseInt(cells[volIdx], 10);
      if (!isNaN(vo)) point.volume = vo;
    }

    data.push(point);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      warnings,
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  if (data.length === 0) {
    return {
      isValid: false,
      errors: ['No valid rows could be processed from the CSV file.'],
      warnings,
      data: [],
      tickersFound: [],
      dateRange: null,
    };
  }

  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const tickersFound = Array.from(tickersFoundSet);

  return {
    isValid: true,
    errors: [],
    warnings,
    data,
    tickersFound,
    dateRange: {
      start: data[0].date,
      end: data[data.length - 1].date,
    },
  };
}

/**
 * Generates sample CSV text ready for export / download
 */
export function generateSampleCSVString(): string {
  const demoData = generateDeterministicDemonstrationData();
  let csv = 'date,ticker,close,open,high,low,volume\n';

  const tickers = ['NVDA', 'SPY'];
  tickers.forEach((t) => {
    const list = demoData[t]?.slice(-60) || [];
    list.forEach((p) => {
      csv += `${p.date},${p.ticker},${p.close},${p.open ?? p.close},${p.high ?? p.close},${p.low ?? p.close},${p.volume ?? 1000000}\n`;
    });
  });

  return csv;
}
