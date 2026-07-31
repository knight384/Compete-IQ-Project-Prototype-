export const AUDIT_LOGS = [
  { id: "1", action: "Updated Workspace Settings", user: "Jane Doe", role: "Admin", date: "Oct 24, 2023, 14:32", ip: "192.168.1.42" },
  { id: "2", action: "Deleted Competitor Profile (ApexCorp)", user: "John Smith", role: "Manager", date: "Oct 24, 2023, 09:15", ip: "192.168.1.15" },
  { id: "3", action: "Exported Q3 Report", user: "System AI", role: "System", date: "Oct 23, 2023, 18:00", ip: "Internal" },
  { id: "4", action: "Login Success", user: "Jane Doe", role: "Admin", date: "Oct 23, 2023, 08:30", ip: "192.168.1.42" }
];

export const ALERTS = [
  { id: "1", type: "Security", message: "New login from unrecognized IP address.", timestamp: "10 mins ago", read: false },
  { id: "2", type: "System", message: "Weekly scheduled report generation failed.", timestamp: "2 hours ago", read: false },
  { id: "3", type: "Intelligence", message: "Significant pricing change detected for Synthetix AI.", timestamp: "Yesterday", read: true },
  { id: "4", type: "Billing", message: "Your subscription will renew in 3 days.", timestamp: "3 days ago", read: true }
];

export const USER_PROFILE = {
  name: "Jane Doe",
  role: "Lead Analyst",
  email: "jane.doe@acmecorp.com",
  department: "Market Intelligence",
  timezone: "UTC-5 (EST)",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuD53e5lFBPZjvENf1EMJjvBB9c7tora6zrWjCw1NE6RtTm0xUkMv9xJVsc_HOD67kYinNcYQCBpD-L2nEcIYXksOfzXzMu9ZJYixypTMg6dsl7kYJGw9IXrpgQpmDSjLOKLypbVokvaQf_6z-vujtg0gs3FuQlinkIf68I9_y_63M6gjBPFeBnVNt5SD6IqLlbGAtG7sXDo1HJtUXOGSXQidm0aHNiPctqdVle8QOBeogfUFduyn1cGwA"
};
