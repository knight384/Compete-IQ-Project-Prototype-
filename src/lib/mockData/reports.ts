export const REPORTS = [
  { id: "1", title: "Executive Summary: Top 5 Competitors", schedule: "Weekly", lastRun: "Today, 08:00 AM", status: "Ready" },
  { id: "2", title: "Feature Gap Analysis", schedule: "Monthly", lastRun: "Oct 1, 2023", status: "Ready" },
  { id: "3", title: "Sentiment Shift Alerts", schedule: "Daily", lastRun: "Yesterday, 06:00 PM", status: "Processing" },
  { id: "4", title: "Pricing Changes Matrix", schedule: "On-Demand", lastRun: "Sep 28, 2023", status: "Ready" }
];

export const REPORT_HISTORY = [
  { id: "1", reportId: "1", runDate: "Oct 24, 2023, 08:00 AM", runTime: "45s", status: "Success" },
  { id: "2", reportId: "1", runDate: "Oct 17, 2023, 08:00 AM", runTime: "42s", status: "Success" },
  { id: "3", reportId: "3", runDate: "Oct 23, 2023, 06:00 PM", runTime: "1m 12s", status: "Failed" },
  { id: "4", reportId: "2", runDate: "Oct 1, 2023, 12:00 PM", runTime: "2m 05s", status: "Success" }
];
