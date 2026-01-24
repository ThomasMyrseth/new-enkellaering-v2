import React from "react";

export default function SingletrackSupport() {
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Singletrack Support</h1>

      <p style={styles.text}>
        Singletrack is a mountain biking app focused on ride tracking, trail
        segments, and performance insights for MTB riders.
      </p>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>Need help?</h2>
        <p style={styles.text}>
          If you have questions, feedback, or experience any issues with the
          app, feel free to reach out.
        </p>
        <p style={styles.text}>
          📧 Email:{" "}
          <a href="mailto:support@enkellaering.no" style={styles.link}>
            support@enkellaering.no
          </a>
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.subtitle}>Privacy</h2>
        <p style={styles.text}>
          Singletrack uses location data only during active ride tracking to
          record your route and statistics. Your data is never sold to third
          parties.
        </p>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} Thomas Myrseth
        </p>
      </footer>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "2rem 1rem",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont",
    lineHeight: 1.6,
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1.25rem",
    marginBottom: "0.5rem",
  },
  text: {
    marginBottom: "1rem",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  section: {
    marginTop: "2rem",
  },
  footer: {
    marginTop: "3rem",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
  },
  footerText: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
};