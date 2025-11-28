export default function Results({ data }) {
  if (!data) return null;

  return (
    <div className="results">
      <h2>📜 Exorcism Report</h2>

      <h3>Static Analysis</h3>
      <pre>{JSON.stringify(data.static_analysis, null, 2)}</pre>

      <h3>AI Analysis</h3>
      <pre>{data.ai_response}</pre>
    </div>
  );
}
