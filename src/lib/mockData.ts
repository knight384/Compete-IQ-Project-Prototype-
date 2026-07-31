export const OPPORTUNITIES = [
  {
    id: "1",
    title: "Exploit Competitor X API Pricing Change",
    type: "Market Gap • Immediate Action Recommended",
    priority: "P1",
    description: "Competitor X announced a 40% price increase on their enterprise tier. Sentiment analysis shows 62% negative reaction. Launch targeted migration campaign immediately.",
    confidence: "94%",
    roi: "3.5x",
    difficulty: "Low",
    icon: "rocket_launch",
    color: "primary"
  },
  {
    id: "2",
    title: "Feature Gap: Automated Compliance Reporting",
    type: "Product Suggestion • Strategic",
    priority: "P2",
    description: "Our analysis shows 4 of top 5 competitors lack built-in GDPR/CCPA reporting. 15% of recent churn cited this as a missing feature.",
    confidence: "82%",
    roi: "2.1x",
    difficulty: "High",
    icon: "extension",
    color: "secondary"
  }
];

export const SENTIMENT_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'CompetIQ',
      data: [65, 68, 72, 75, 82, 85],
      borderColor: '#004ac6',
      tension: 0.4
    },
    {
      label: 'Synthetix AI',
      data: [82, 80, 75, 71, 68, 65],
      borderColor: '#ba1a1a',
      tension: 0.4
    }
  ]
};

export const FEATURE_GAPS = [
  { id: "1", feature: "Predictive Analytics", us: true, them: false, priority: "High" },
  { id: "2", feature: "Custom Dashboards", us: true, them: true, priority: "Medium" },
  { id: "3", feature: "API Webhooks", us: false, them: true, priority: "Critical" }
];

export const COMPLAINTS = [
  { id: "1", text: "Integration takes too long", severity: "High", frequency: "24%", trend: "Increasing" },
  { id: "2", text: "Poor documentation", severity: "Medium", frequency: "15%", trend: "Stable" }
];
