export default function StatusTimeline({ app }) {
  const reached = s => app.history?.some(h => h.status === s);
  const dateOf = s => app.history?.find(h => h.status === s)?.at;
  const finalNode = app.status === 'Rejected' ? 'Rejected' : 'Selected';
  const nodes = ['Applied', 'Shortlisted', finalNode];

  return (
    <div className="timeline">
      {nodes.map((s, i) => (
        <div key={i} className={`t-node ${reached(s) ? 'on' : ''} ${s === 'Rejected' && reached(s) ? 'bad' : ''}`}>
          <span className="dot" />
          <span className="t-label">{s}</span>
          <small>{dateOf(s) ? new Date(dateOf(s)).toLocaleDateString() : '—'}</small>
        </div>
      ))}
    </div>
  );
}