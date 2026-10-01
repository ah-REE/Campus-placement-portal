import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import api from '../api/axios';
import StatusTimeline from '../components/StatusTimeline';
import { useAuth } from '../context/AuthContext';

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

export default function ApplicationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  useEffect(() => { api.get(`/student/applications/${id}`).then(r => setApp(r.data)); }, [id]);
  if (!app) return <p className="muted">Loading…</p>;

  const downloadOffer = () => {
    const c = app.companyId;
    pdfMake.createPdf({
      content: [
        { text: 'AURORA INSTITUTE OF TECHNOLOGY', style: 'head' },
        { text: 'Training & Placement Cell', style: 'sub' },
        { text: 'OFFER LETTER', style: 'title' },
        { text: `Date: ${new Date().toLocaleDateString()}` },
        { text: `\nDear ${user.name} (${user.registerId}),` },
        { text: `\nWe are pleased to inform you that you have been SELECTED for the role of ${c.role} at ${c.name}, ${c.location}, with an annual package of ₹${c.package} LPA.` },
        { text: '\nThis offer is issued through the Campus Placement Portal for the 2025/26 season. Please report to the T&P office for onboarding formalities.' },
        { text: '\n\nCongratulations!', bold: true },
        { text: '\nPlacement Officer', style: 'sub' }
      ],
      styles: {
        head: { fontSize: 16, bold: true }, sub: { fontSize: 10, color: '#555' },
        title: { fontSize: 20, bold: true, margin: [0, 18, 0, 12], decoration: 'underline' }
      }
    }).download(`Offer-Letter-${c.name}.pdf`);
  };

  return (
    <>
      <h1>{app.companyId?.name} — {app.companyId?.role}</h1>
      <p className="muted">Applied on {new Date(app.appliedAt).toLocaleDateString()} · Package ₹{app.companyId?.package} LPA · Test score: {app.testScore ?? '—'}</p>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Status timeline</h2>
        <StatusTimeline app={app} />
        <span className={`badge ${app.status}`}>{app.status}</span>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Placement officer feedback</h2>
        {app.feedback ? <p>{app.feedback}</p> : <p className="muted">No feedback yet.</p>}
      </div>
      {app.status === 'Selected' && <button className="btn dark" onClick={downloadOffer}>⤓ Download offer letter (PDF)</button>}
    </>
  );
}