# Mission Control - Agent Registry

## Active Agents

### Morning Market Brief Agent
**Status:** Ready to Deploy
**Schedule:** Daily, 7:00 AM pre-market
**Purpose:** Pre-market intelligence & trade preparation

#### Capabilities:
1. **Watchlist Scan**
   - Price gaps (>3%)
   - Volume spikes (>200% avg)
   - Options flow (unusual OI)
   
2. **Catalyst Summary**
   - Overnight news
   - Analyst upgrades/downgrades
   - Sector rotation signals
   - Macro events (Fed, economic data)

3. **Technical Levels**
   - Support/resistance (key pivots)
   - 52-week highs/lows proximity
   - Moving average alignment

4. **Sentiment Analysis**
   - Social sentiment (Twitter/Reddit)
   - Institutional flow (dark pools)
   - Fear/Greed Index

5. **Risk Assessment**
   - Volatility (IV rank vs HV)
   - Earnings proximity
   - Event calendar

#### Output Format:
```
📊 MORNING BRIEF - [DATE]

🔥 TOP MOVERS:
- Symbol | Gap% | Volume | Catalyst

📈 TECHNICAL SETUPS:
- Symbol | Near Support | Target | Stop

⚠️ RISK ALERTS:
- Earnings today: [list]
- High IV crush risk: [list]

🎯 TRADE IDEAS:
Bullish: [symbol] - [setup] - [risk score]
Bearish: [symbol] - [setup] - [risk score]

💡 MARKET CONTEXT:
- Futures: [SPY, QQQ, IWM]
- VIX: [level]
- Dollar: [DXY]
- Key Events: [today]
```

#### Data Sources:
- Polygon.io (market data)
- Finviz (screener)
- Unusual Whales (options flow)
- TradingView (technicals)
- Benzinga Pro (news)
- OpenInsider (insider trades)

#### Additional Recommendations:
1. **Evening Recap Agent** - Post-market summary, performance tracking
2. **Earnings Play Agent** - Pre-earnings setups, IV crush analysis
3. **Sector Rotation Agent** - Heatmap tracking, momentum shifts
4. **Crypto Brief Agent** - BTC/ETH correlation, DeFi flows
5. **Options Flow Agent** - Whale tracking, sweep detection

---

## Archive
- BabyNest Deployment (On Hold - TypeScript errors)

## Next Up
1. Deploy Morning Market Brief Agent
2. Build Evening Recap Agent
3. Research: Earnings Play automation
