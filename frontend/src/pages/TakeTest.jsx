import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function TakeTest() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [secs, setSecs] = useState(0);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const submitted = useRef(false);

  const submit = async () => {
    if (submitted.current) return;
    submitted.current = true;
    try {
      const arr = test.questions.map((_, i) => answersRef.current[i] ?? -1);
      const { data } = await api.post(`/student/tests/${id}/submit`, { answers: arr });
      setResult(data);
    } catch (e) { setErr(e.response?.data?.message || 'Submit failed'); }
  };
  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    api.get(`/student/tests/${id}`)
      .then(({ data }) => { setTest(data); setSecs(data.durationMins * 60); })
      .catch(e => setErr(e.response?.data?.message || 'Test unavailable'));
  }, [id]);

  useEffect(() => {
    if (!test) return;
    const iv = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(iv); submitRef.current(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [test]);

  if (err) return <p className="error">{err}</p>;
  if (result) return (
    <div className="card center">
      <h1>Result</h1>
      <p className="stat"><b style={{ fontSize: '2.4rem' }}>{result.score}%</b></p>
      <p className="muted">{result.correct} of {result.total} correct · one attempt used</p>
    </div>
  );
  if (!test) return <p className="muted">Loading test…</p>;

  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <>
      <h1>{test.title} <span className="muted">· {test.company}</span></h1>
      <p className="timer">⏱ {mm}:{ss} remaining</p>
      <div className="card">
        {test.questions.map((q, qi) => (
          <div className="q" key={qi}>
            <p>{qi + 1}. {q.text}</p>
            {q.options.map((op, oi) => (
              <label key={oi}>
                <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers(a => ({ ...a, [qi]: oi }))} />
                {op}
              </label>
            ))}
          </div>
        ))}
        <button className="btn dark" onClick={submit}>Submit test</button>
      </div>
    </>
  );
}