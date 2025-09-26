import React from "react";

type Stat = {
  id: string;
  label: string;
  value: string;
  delta?: string;
};

type Activity = {
  id: string;
  title: string;
  time: string;
};

export default function DashboardPage() {
  const stats: Stat[] = [
    { id: "1", label: "Active Users", value: "1,254", delta: "+4.2%" },
    { id: "2", label: "New Signups", value: "312", delta: "+1.1%" },
    { id: "3", label: "Errors", value: "7", delta: "-18%" },
  ];

  const activities: Activity[] = [
    { id: "a1", title: "User Jane signed up", time: "2h ago" },
    { id: "a2", title: "Backup completed", time: "5h ago" },
    { id: "a3", title: "Payment failed for order #432", time: "1d ago" },
  ];

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Overview of system activity and metrics</p>
        </div>
        <div style={styles.actions}>
          <button style={styles.primaryBtn}>Create report</button>
          <button style={styles.ghostBtn}>Settings</button>
        </div>
      </header>

      <section style={styles.statsRow} aria-label="Key metrics">
        {stats.map((s) => (
          <div key={s.id} style={styles.statCard}>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
            {s.delta && <div style={styles.delta}>{s.delta}</div>}
          </div>
        ))}
      </section>

      <section style={styles.contentRow}>
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Traffic (last 7 days)</h2>
            <div style={styles.chartWrapper}>
              <svg
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                style={styles.chart}
              >
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth={2}
                  points="0,30 10,25 20,20 30,18 40,12 50,15 60,10 70,8 80,6 90,4 100,3"
                />
              </svg>
            </div>
            <p style={styles.cardNote}>Simple sparkline visualization</p>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent activity</h2>
            <ul style={styles.activityList}>
              {activities.map((a) => (
                <li key={a.id} style={styles.activityItem}>
                  <div>{a.title}</div>
                  <div style={styles.activityTime}>{a.time}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside style={styles.rightColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Quick stats</h2>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tdLabel}>CPU</td>
                  <td style={styles.tdValue}>32%</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>Memory</td>
                  <td style={styles.tdValue}>6.8 GB</td>
                </tr>
                <tr>
                  <td style={styles.tdLabel}>DB connections</td>
                  <td style={styles.tdValue}>14</td>
                </tr>
              </tbody>
            </table>
          </div>
        </aside>
      </section>
    </main>
  );
}

const styles: { [k: string]: React.CSSProperties } = {
  page: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    padding: 24,
    maxWidth: 1100,
    margin: "0 auto",
    color: "#0f172a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { margin: 0, fontSize: 24 },
  subtitle: { margin: "4px 0 0", color: "#475569", fontSize: 13 },
  actions: { display: "flex", gap: 8 },
  primaryBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid #cbd5e1",
    padding: "8px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  statsRow: {
    display: "flex",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    background: "#fff",
    border: "1px solid #e6eef8",
    padding: 12,
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(2,6,23,0.04)",
  },
  statValue: { fontSize: 20, fontWeight: 600 },
  statLabel: { color: "#64748b", marginTop: 4, fontSize: 13 },
  delta: { marginTop: 8, color: "#065f46", fontSize: 12 },

  contentRow: { display: "flex", gap: 16 },
  leftColumn: { flex: 2, display: "flex", flexDirection: "column", gap: 12 },
  rightColumn: { width: 260 },

  card: {
    background: "#fff",
    border: "1px solid #e6eef8",
    padding: 12,
    borderRadius: 8,
    boxShadow: "0 1px 2px rgba(2,6,23,0.04)",
  },
  cardTitle: { margin: "0 0 8px 0", fontSize: 16 },
  chartWrapper: {
    height: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chart: { width: "100%", height: "100%" },
  cardNote: { marginTop: 8, color: "#64748b", fontSize: 12 },

  activityList: { listStyle: "none", margin: 0, padding: 0 },
  activityItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px dashed #eef2ff",
    fontSize: 14,
  },
  activityTime: { color: "#94a3b8", fontSize: 13 },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  tdLabel: { padding: "6px 0", color: "#475569" },
  tdValue: { padding: "6px 0", fontWeight: 600, textAlign: "right" },
};
