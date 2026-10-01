import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles-landing.css';

const TICKER = ['Registrations open — Batch 2025/26', '128 recruiters on campus', 'Highest offer ₹54 LPA', 'Eligibility: CGPA ≥ 6.0 · 0 active backlogs', 'Drive window: Jan 12 – Feb 28'];
const ROW1 = ['Amazon', 'TCS', 'Deloitte', 'Zoho', 'PayPal', 'Bosch', 'Infosys', 'Accenture', 'Cognizant'];
const ROW2 = ['Wipro', 'HCL Tech', 'L&T', 'Tata Motors', 'Capgemini', 'Hexaware', 'TVS Motor', 'Ashok Leyland', 'Freshworks'];
const STEPS = [
  ['Day 0', 'Register', 'Create your validated student profile — arrears gate enforced automatically.'],
  ['Day 1–2', 'Verify & shortlist', 'The T&P office verifies your profile and maps you to eligible company pools.'],
  ['Week 2', 'Tests & interviews', 'Timed MCQ tests and interview slots — everything tracked on your dashboard.'],
  ['Week 3–6', 'Offer & onboarding', 'Status timeline, officer feedback and your offer letter PDF, all in one place.']
];
const FAQS = [
  ['Can I register with an active backlog?', 'No. The portal only accepts students with zero standing arrears — the rule is enforced on both client and server.'],
  ['How many companies can I apply to?', 'A maximum of 4 out of the 10 active companies, with no duplicate applications.'],
  ['When do I get my offer letter?', 'The moment your status becomes Selected, a downloadable PDF offer letter appears on the application detail page.'],
  ['Who lists the companies and tests?', 'The Placement Officer (Admin) manages companies, MCQ tests and the placement calendar.']
];
const DEADLINE = Date.now() + ((9 * 24 + 14) * 3600 + 22 * 60 + 41) * 1000;
const pad = n => String(n).padStart(2, '0');

function useCountdown() {
  const [ms, setMs] = useState(DEADLINE - Date.now());
  useEffect(() => {
    const iv = setInterval(() => setMs(DEADLINE - Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: pad(Math.floor(s / 86400)), h: pad(Math.floor(s / 3600) % 24), m: pad(Math.floor(s / 60) % 60), s: pad(s % 60) };
}

function Count({ to, dec = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1500;
      const tick = t => {
        const p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * ease).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: .5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, dec]);
  return <span ref={ref}>0</span>;
}

export default function Landing() {
  const { user, loading } = useAuth();
  const cd = useCountdown();
  const [chk, setChk] = useState({ cgpa: '', back: '' });
  const [result, setResult] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  if (loading) return <p style={{ padding: 40, textAlign: 'center' }}>Loading…</p>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;

  const runCheck = () => {
    const c = parseFloat(chk.cgpa), b = parseInt(chk.back, 10);
    if (isNaN(c) || isNaN(b)) return setResult({ type: 'no', title: '✕ Incomplete', items: ['Enter both CGPA and backlogs.'] });
    const issues = [];
    if (c < 6) issues.push(`CGPA ${c.toFixed(2)} is below the 6.0 cut-off`);
    if (b > 0) issues.push(`${b} active backlog(s) must be cleared`);
    if (!issues.length) setResult({ type: 'ok', title: '✓ Eligible', items: [`CGPA ${c.toFixed(2)} with 0 backlogs clears the base criteria.`] });
    else if (c >= 6) setResult({ type: 'cond', title: '◐ Conditionally eligible', items: issues });
    else setResult({ type: 'no', title: '✕ Not eligible yet', items: issues });
  };

  return (
    <div className="landing">
      <div className="l-ticker" aria-hidden="true">
        <div className="l-ticker-track">
          {[0, 1].map(g => <div className="l-ticker-group" key={g}>{TICKER.map((t, i) => <span key={i}>{t}</span>)}</div>)}
        </div>
      </div>

      <header className="l-head">
        <div className="l-wrap l-head-in">
          <span className="l-brand"><b>A</b><span>Aurora Institute<small>Training &amp; Placement Cell</small></span></span>
          <nav className="l-nav">
            <a href="#overview">Overview</a><a href="#process">Process</a><a href="#eligibility">Eligibility</a><a href="#faq">FAQ</a>
          </nav>
          <div className="l-head-cta">
            <Link to="/login" className="l-btn ghost">Student login</Link>
            <Link to="/register" className="l-btn lime">Register →</Link>
          </div>
        </div>
      </header>

      <section className="l-hero" id="overview">
        <span className="l-wm" aria-hidden="true">2025</span>
        <div className="l-wrap l-hero-grid">
          <div>
            <div className="l-eyebrow">AY 2025–26 · Placement Drive</div>
            <h1>One portal for your <em>entire placement season.</em></h1>
            <p className="l-lead">Register once, apply to up to 4 companies, sit timed MCQ tests, track your status on a live timeline and get officer feedback — no paper forms, no spreadsheets.</p>

            <div className="l-deadline">
              <small>● Registrations close in</small>
              <div className="l-cd">
                <div><b>{cd.d}</b><span>Days</span></div>
                <div><b>{cd.h}</b><span>Hrs</span></div>
                <div><b>{cd.m}</b><span>Min</span></div>
                <div><b>{cd.s}</b><span>Sec</span></div>
              </div>
            </div>

            <div className="l-scoreboard">
              <div className="l-sb-head"><span>Season scoreboard · 2025/26</span><i className="l-live">Live</i></div>
              <ul>
                <li><div><span className="l-sb-label">Students registered</span><span className="l-sb-value"><Count to={1284} /></span></div><span className="l-trend">▲ 18% YoY</span></li>
                <li><div><span className="l-sb-label">Recruiters this season</span><span className="l-sb-value"><Count to={128} /></span></div><span className="l-trend">▲ 12 new</span></li>
                <li><div><span className="l-sb-label">Highest offer · 2024</span><span className="l-sb-value">₹<Count to={54} /><small> LPA</small></span></div><span className="l-trend amber">◆ Amazon</span></li>
                <li><div><span className="l-sb-label">Placement rate · CSE/IT</span><span className="l-sb-value"><Count to={94.2} dec={1} /><small>%</small></span></div><span className="l-meter"><i style={{ '--w': '94.2%' }} /></span></li>
              </ul>
            </div>
          </div>

          <aside className="l-cta-card">
            <span className="l-stamp">T&amp;P · VERIFIED PORTAL</span>
            <h2>Get started</h2>
            <p>New students register with 18 validated fields. Returning students log in to reach their dashboard.</p>
            <Link to="/register" className="l-btn lime big">Create student account →</Link>
            <Link to="/login" className="l-btn dark big">I already have an account</Link>
            <ul className="l-perks">
              <li>✓ Zero-arrears eligibility check built in</li>
              <li>✓ Apply to 4 of 10 companies · compare 3 side-by-side</li>
              <li>✓ Timed MCQ tests with instant results</li>
              <li>✓ AI resume feedback + offer letter PDF</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="l-logos">
        <h4>Recruiting on campus this season</h4>
        <div className="l-mq"><div className="l-mq-track">{[...ROW1, ...ROW1].map((n, i) => <span key={i} className={i % 2 ? 'alt' : ''}>{n}</span>)}</div></div>
        <div className="l-mq rev"><div className="l-mq-track">{[...ROW2, ...ROW2].map((n, i) => <span key={i} className={i % 2 ? '' : 'alt'}>{n}</span>)}</div></div>
      </section>

      <section className="l-process" id="process">
        <div className="l-wrap">
          <div className="l-eyebrow">01 / How it works</div>
          <h2>From registration to offer letter</h2>
          <div className="l-steps">
            {STEPS.map(([tag, title, body], i) => (
              <article className="l-step" key={i}><span className="l-tag">{tag}</span><span className="l-num">0{i + 1}</span><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="l-elig" id="eligibility">
        <div className="l-wrap l-elig-grid">
          <div>
            <div className="l-eyebrow light">02 / Eligibility</div>
            <h2>Check before you register</h2>
            <ul className="l-criteria">
              <li><span>CGPA</span>Minimum <b>6.0 / 10</b> aggregate up to the previous semester.</li>
              <li><span>Backlogs</span><b>Zero active backlogs</b> — the portal enforces this at registration.</li>
              <li><span>Applications</span>Maximum <b>4 of 10</b> companies, no duplicates, one-offer rule.</li>
              <li><span>Resume</span>Pasted text, 100–5,000 characters, reviewed by AI + the T&amp;P office.</li>
            </ul>
          </div>
          <div className="l-checker">
            <h3>Quick eligibility check</h3>
            <p>Not sure if you qualify? Run a 10-second self-check.</p>
            <div className="l-chk-row">
              <label>CGPA<input type="number" step="0.01" min="0" max="10" placeholder="e.g. 7.8" value={chk.cgpa} onChange={e => setChk({ ...chk, cgpa: e.target.value })} /></label>
              <label>Active backlogs<input type="number" min="0" step="1" placeholder="0" value={chk.back} onChange={e => setChk({ ...chk, back: e.target.value })} /></label>
            </div>
            <button className="l-btn lime" onClick={runCheck}>Run check</button>
            {result && <div className={`l-result ${result.type}`}><b>{result.title}</b><ul>{result.items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
          </div>
        </div>
      </section>

      <section className="l-faq" id="faq">
        <div className="l-wrap">
          <div className="l-eyebrow">03 / FAQ</div>
          <h2>Common questions</h2>
          {FAQS.map(([q, a], i) => (
            <div className={`l-faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
              <button onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>{q}<span>+</span></button>
              <div className="l-faq-a"><div><p>{a}</p></div></div>
            </div>
          ))}
          <div className="l-final-cta">
            <h2>Ready for the 2025/26 drive?</h2>
            <Link to="/register" className="l-btn lime big">Register now →</Link>
          </div>
        </div>
      </section>

      <footer className="l-foot">
        <div className="l-wrap l-foot-in">
          <span>© 2025 Aurora Institute of Technology · T&amp;P Cell</span>
          <span className="l-mono">placements@aurora.edu · +91 80 4455 2200</span>
        </div>
      </footer>
    </div>
  );
}