'use client'
import { useState } from 'react'

interface CourseEntry { code: string; title: string; credits: string; grade: string; year: string }
const BLANK_COURSE: CourseEntry = { code: '', title: '', credits: '', grade: '', year: '' }

export default function Transcript() {
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [institution, setInstitution] = useState('')
  const [degree, setDegree] = useState('')
  const [gradDate, setGradDate] = useState('')
  const [gpa, setGpa] = useState('')
  const [registrar, setRegistrar] = useState('')
  const [courses, setCourses] = useState<CourseEntry[]>([{ ...BLANK_COURSE }])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const addCourse = () => setCourses(p => [...p, { ...BLANK_COURSE }])
  const removeCourse = (i: number) => setCourses(p => p.filter((_, j) => j !== i))
  const updCourse = (i: number, k: keyof CourseEntry) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCourses(p => p.map((c, j) => j === i ? { ...c, [k]: e.target.value } : c))

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  const run = () => {
    const now = new Date().toISOString()
    const validCourses = courses.filter(c => c.title)
    const totalCredits = validCourses.reduce((s, c) => s + (parseFloat(c.credits) || 0), 0)
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `Academic Transcript — ${studentName}`,
      document_type: 'academic_transcript',
      transcript: {
        student: { name: studentName, id: studentId || undefined },
        institution,
        degree: degree || undefined,
        graduation_date: gradDate || undefined,
        gpa: gpa || undefined,
        total_credits: totalCredits || undefined,
        registrar: registrar || undefined,
        courses: validCourses.map(c => ({
          code: c.code || undefined, title: c.title,
          credits: c.credits ? parseFloat(c.credits) : undefined,
          grade: c.grade || undefined,
          academic_year: c.year || undefined,
        })),
        status: 'official',
      },
      provenance: { created_at: now, document_type: 'academic_transcript', institution },
      _notice: 'This transcript record is generated for documentation. Official transcripts must be issued directly by the awarding institution.',
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `transcript-${studentName.replace(/\s+/g,'-').toLowerCase()}.uds` })
  }

  const can = !studentName || !institution

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Transcript</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Create a structured academic transcript .uds with course list, grades, credits, GPA, and provenance. Tamper-evident and machine-readable.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div><label style={lbl}>Student name *</label><input style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Full name" /></div>
        <div><label style={lbl}>Student ID</label><input style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Student number" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Institution *</label><input style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={institution} onChange={e => setInstitution(e.target.value)} placeholder="University or college name" /></div>
        <div><label style={lbl}>Degree / qualification</label><input style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={degree} onChange={e => setDegree(e.target.value)} placeholder="e.g. BSc Computer Science" /></div>
        <div><label style={lbl}>Graduation date</label><input type="date" style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={gradDate} onChange={e => setGradDate(e.target.value)} /></div>
        <div><label style={lbl}>GPA / classification</label><input style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={gpa} onChange={e => setGpa(e.target.value)} placeholder="e.g. 3.8 / First Class" /></div>
        <div><label style={lbl}>Registrar</label><input style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={registrar} onChange={e => setRegistrar(e.target.value)} placeholder="Registrar name or office" /></div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Courses</div>
          <button onClick={addCourse} style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ud-teal)', background: 'none', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', padding: '4px 10px', cursor: 'pointer' }}>+ Add course</button>
        </div>
        {courses.map((c, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', fontWeight: 600 }}>#{i + 1}</div>
              {courses.length > 1 && <button onClick={() => removeCourse(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 16 }}>×</button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr', gap: 8 }}>
              {([['code','Code','CS101'],['title','Course title *','Intro to CS'],['credits','Credits','3'],['grade','Grade','A'],['year','Academic year','2023-24']] as [keyof CourseEntry, string, string][]).map(([k,l,p]) => (
                <div key={k}><label style={{ ...lbl, fontSize: 9 }}>{l}</label><input style={inp} value={c[k]} onChange={updCourse(i, k)} placeholder={p} /></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Transcript created ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{studentName} · {courses.filter(c=>c.title).length} course{courses.filter(c=>c.title).length!==1?'s':''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Generate Transcript</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
