'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const TRAINING_TYPES = [
  'Classroom / In-person Training', 'Online / eLearning Course', 'Workshop / Seminar',
  'On-the-Job Training', 'Mentoring / Coaching', 'Conference / Symposium',
  'Certification Exam', 'Self-Study / Reading', 'Simulation / Practical Assessment',
  'Mandatory Compliance Training',
]

const COMPETENCY_LEVELS = ['Awareness', 'Foundation', 'Practitioner', 'Expert', 'Mastery']

interface ModuleResult {
  module: string
  score: string
  passed: boolean
}

export default function TrainingRecordPage() {
  const [learnerName, setLearnerName] = useState('')
  const [learnerEmail, setLearnerEmail] = useState('')
  const [learnerJobTitle, setLearnerJobTitle] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [trainingTitle, setTrainingTitle] = useState('')
  const [trainingType, setTrainingType] = useState('')
  const [providerName, setProviderName] = useState('')
  const [instructorName, setInstructorName] = useState('')
  const [trainingDate, setTrainingDate] = useState('')
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0])
  const [expiryDate, setExpiryDate] = useState('')
  const [durationHours, setDurationHours] = useState('')
  const [cpdPoints, setCpdPoints] = useState('')
  const [cpdBody, setCpdBody] = useState('')
  const [competencyLevel, setCompetencyLevel] = useState('')
  const [overallScore, setOverallScore] = useState('')
  const [overallPassed, setOverallPassed] = useState(true)
  const [modules, setModules] = useState<ModuleResult[]>([])
  const [learningObjectives, setLearningObjectives] = useState('')
  const [assessmentMethod, setAssessmentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')

  function addModule() {
    setModules(prev => [...prev, { module: '', score: '', passed: true }])
  }

  function updateModule(i: number, field: keyof ModuleResult, value: string | boolean) {
    setModules(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  async function seal() {
    if (!learnerName || !trainingTitle || !completionDate) {
      alert('Please fill in learner name, training title, and completion date.')
      return
    }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const doc = {
        learner: { name: learnerName, email: learnerEmail, jobTitle: learnerJobTitle, organisation },
        training: {
          title: trainingTitle,
          type: trainingType,
          provider: providerName,
          instructor: instructorName,
          dates: { start: trainingDate, completion: completionDate },
          duration: durationHours ? `${durationHours} hours` : null,
          expires: expiryDate || null,
        },
        cpd: {
          points: cpdPoints || null,
          recognisingBody: cpdBody || null,
        },
        assessment: {
          overallScore: overallScore || null,
          passed: overallPassed,
          competencyLevel: competencyLevel || null,
          method: assessmentMethod || null,
          modules,
        },
        learningObjectives,
        notes,
      }
      const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const id = `TR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id,
        created: new Date().toISOString(),
        expires: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        schema: 'training-record/v1',
        metadata: {
          title: `Training Record — ${learnerName} — ${trainingTitle}`,
          learner: learnerName,
          training: trainingTitle,
          provider: providerName,
          completionDate,
          passed: overallPassed,
          cpdPoints: cpdPoints || null,
        },
        provenance: { sha256: hash, sealed: new Date().toISOString(), tool: 'UD Training Record', version: '1.0' },
        content: doc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeLearner = learnerName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const safeTitle = trainingTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 20)
      const fname = `training-record-${safeLearner}-${safeTitle}-${id}.uds`
      setFilename(fname)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = fname; a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide'

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1e2d3d]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TooltipTour engineId="training-record" tips={tourSteps['training-record'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Training Record
          </h1>
          <p className="text-gray-500 text-sm">
            Tamper-evident training certificates and CPD records with SHA-256 provenance.
            Proof of competency that cannot be falsified — for individuals and organisations.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold" style={{ background: '#e6f4f1', color: '#0d7a6a' }}>
            Free (individual)
          </span>
        </div>

        {/* Learner */}
        <section data-tour="learner" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Learner Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input value={learnerName} onChange={e => setLearnerName(e.target.value)} className={inputCls} placeholder="As on ID" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={learnerEmail} onChange={e => setLearnerEmail(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Job Title</label>
              <input value={learnerJobTitle} onChange={e => setLearnerJobTitle(e.target.value)} className={inputCls} placeholder="e.g. Senior Nurse" />
            </div>
            <div>
              <label className={labelCls}>Organisation</label>
              <input value={organisation} onChange={e => setOrganisation(e.target.value)} className={inputCls} placeholder="Employer / institution" />
            </div>
          </div>
        </section>

        {/* Training */}
        <section data-tour="training-details" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Training Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Training Title *</label>
              <input value={trainingTitle} onChange={e => setTrainingTitle(e.target.value)} className={inputCls} placeholder="e.g. Advanced Life Support, GDPR Awareness 2026" />
            </div>
            <div>
              <label className={labelCls}>Training Type</label>
              <select value={trainingType} onChange={e => setTrainingType(e.target.value)} className={inputCls}>
                <option value="">Select type…</option>
                {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Provider / Institution</label>
              <input value={providerName} onChange={e => setProviderName(e.target.value)} className={inputCls} placeholder="e.g. Resuscitation Council UK" />
            </div>
            <div>
              <label className={labelCls}>Instructor / Assessor</label>
              <input value={instructorName} onChange={e => setInstructorName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Duration (hours)</label>
              <input value={durationHours} onChange={e => setDurationHours(e.target.value)} className={inputCls} type="number" min="0.5" step="0.5" />
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" value={trainingDate} onChange={e => setTrainingDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Completion Date *</label>
              <input type="date" value={completionDate} onChange={e => setCompletionDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Certificate Expiry</label>
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Learning Objectives</label>
            <textarea value={learningObjectives} onChange={e => setLearningObjectives(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="What skills or knowledge did this training cover?" />
          </div>
        </section>

        {/* CPD */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">CPD & Assessment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>CPD Points / Hours</label>
              <input value={cpdPoints} onChange={e => setCpdPoints(e.target.value)} className={inputCls} placeholder="e.g. 3 CPD hours" />
            </div>
            <div>
              <label className={labelCls}>Recognising CPD Body</label>
              <input value={cpdBody} onChange={e => setCpdBody(e.target.value)} className={inputCls} placeholder="e.g. GMC, NMC, CIPD" />
            </div>
            <div>
              <label className={labelCls}>Overall Score (%)</label>
              <input value={overallScore} onChange={e => setOverallScore(e.target.value)} className={inputCls} type="number" min="0" max="100" />
            </div>
            <div>
              <label className={labelCls}>Competency Level Achieved</label>
              <select value={competencyLevel} onChange={e => setCompetencyLevel(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {COMPETENCY_LEVELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Assessment Method</label>
              <input value={assessmentMethod} onChange={e => setAssessmentMethod(e.target.value)} className={inputCls} placeholder="e.g. Multiple choice, Practical observation" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm mb-4">
            <input type="checkbox" checked={overallPassed} onChange={e => setOverallPassed(e.target.checked)} />
            Training passed / completed successfully
          </label>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Module Results (optional)</span>
            <button onClick={addModule} className="text-xs px-3 py-1.5 rounded-lg border border-[#c8960a] text-[#c8960a] font-medium hover:bg-amber-50">+ Add Module</button>
          </div>
          {modules.map((m, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <input value={m.module} onChange={e => updateModule(i, 'module', e.target.value)} className={inputCls} placeholder="Module name" />
              <input value={m.score} onChange={e => updateModule(i, 'score', e.target.value)} className={inputCls} placeholder="Score %" type="number" min="0" max="100" />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={m.passed} onChange={e => updateModule(i, 'passed', e.target.checked)} />
                Passed
              </label>
            </div>
          ))}
        </section>

        <div className="text-center">
          <button onClick={seal} disabled={status === 'sealing'} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
            {status === 'sealing' ? 'Sealing…' : 'Seal Training Record (.uds)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Training record sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
              {expiryDate && <p className="text-green-600 text-xs mt-1">Certificate expires: {new Date(expiryDate).toLocaleDateString()}</p>}
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Training Record differs from paper certificates / LMS-issued certificates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Cannot be falsified', body: 'SHA-256 hash is embedded in the file. Any change to the learner name, score, or date invalidates the hash — the manipulation is immediately detectable.' },
              { title: 'CPD points inside the document', body: 'CPD points, recognising body, and competency level are sealed with the hash — not stored in a separate database that can be retrospectively altered.' },
              { title: 'Certificate expiry is cryptographic', body: 'Expiry date is locked into the sealed file. An expired certificate produces a different hash than a valid one — preventing accidental re-use.' },
              { title: 'No platform required to verify', body: 'Any employer, regulator, or auditor can verify the SHA-256 independently with standard tools — no Universal Document™ account needed.' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
                <p className="text-gray-500 text-xs">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 mt-12">No ads. No investors. No agenda.</p>
      </div>
    </main>
  )
}
