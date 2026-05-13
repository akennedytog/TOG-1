# Social-Manager Agent

This agent handles social media management tasks:

1. Post daily trend hooks on X
2. Post weekly deep dives on Fridays
3. Log daily metrics into `memory/social-metrics/YYYY-MM-DD.md`
4. Append daily performance notes into `memory/social-updates/YYYY-MM-DD.md`
5. Draft weekly newsletter on Fridays into `newsletters/NN-YYYY-MM-DD.md`

## Setup

1. Copy `.env.example` to `.env` and fill in Twitter API credentials:
   
```sh
cp .env.example .env
```

2. Install dependencies:

```sh
npm install
```

3. Run:

```sh
node index.js
```

## Customization

- Adjust schedule times in `index.js`
- Implement `monitorTrends`, `generateDeepDive`, `fetchMetrics`, `generatePerformanceNote`
