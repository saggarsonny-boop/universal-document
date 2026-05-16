"use client";

import React, { useState } from 'react';
import { Terminal, FileSpreadsheet, FileText, Database, ShieldAlert } from 'lucide-react';

export default function EnterpriseSandbox() {
  const [activeLog, setActiveLog] = useState<string>("SYSTEM READY. WAITING FOR DATA INGESTION...");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInject = async (documentType: string) => {
    setIsProcessing(true);
    setActiveLog(`[UPLOADING] Encrypting and transmitting ${documentType}...`);
    
    try {
      const res = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType })
      });
      const data = await res.json();
      
      if (data.error) {
        setActiveLog(`[ERROR] ${data.error}`);
      } else {
        // Simulate a slight processing delay for dramatic effect
        setTimeout(() => {
          setActiveLog(`[MOH PIPELINE COMPLETE]\n\n${data.result}`);
          setIsProcessing(false);
        }, 1500);
        return;
      }
    } catch (e) {
      setActiveLog("[ERROR] Connection to Substrate failed.");
    }
    setIsProcessing(false);
  };

  return (
    <div style={{ backgroundColor: '#0A0A0C', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', overflow: 'hidden', maxWidth: '900px', margin: '4rem auto' }}>
      <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Terminal size={20} color="#D4AF37" />
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#D4AF37', letterSpacing: '0.05em' }}>MOH DATA INGESTION SANDBOX</h3>
      </div>
      
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => handleInject('Financial Q3 Report')}
            disabled={isProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', color: '#fff', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'background 0.2s', textAlign: 'left' }}
            onMouseOver={e=>!isProcessing && (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.08)')}
            onMouseOut={e=>!isProcessing && (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.03)')}
          >
            <FileSpreadsheet size={24} color="#10b981" />
            <div>
              <div style={{ fontWeight: 'bold' }}>Inject Financial Q3 Report</div>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>CSV / 14,000 Rows</div>
            </div>
          </button>

          <button 
            onClick={() => handleInject('HR Payroll Schema')}
            disabled={isProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', color: '#fff', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'background 0.2s', textAlign: 'left' }}
            onMouseOver={e=>!isProcessing && (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.08)')}
            onMouseOut={e=>!isProcessing && (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.03)')}
          >
            <Database size={24} color="#eab308" />
            <div>
              <div style={{ fontWeight: 'bold' }}>Inject HR Payroll Schema</div>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>SQL Dump / 500 Employees</div>
            </div>
          </button>

          <button 
            onClick={() => handleInject('Lean Six Sigma SOP')}
            disabled={isProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', color: '#fff', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'background 0.2s', textAlign: 'left' }}
            onMouseOver={e=>!isProcessing && (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.08)')}
            onMouseOut={e=>!isProcessing && (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.03)')}
          >
            <FileText size={24} color="#3b82f6" />
            <div>
              <div style={{ fontWeight: 'bold' }}>Inject Lean Six Sigma SOP</div>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>PDF / 142 Pages</div>
            </div>
          </button>

          <button 
            onClick={() => handleInject('Clinical Billing Codes')}
            disabled={isProcessing}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', color: '#fff', cursor: isProcessing ? 'not-allowed' : 'pointer', transition: 'background 0.2s', textAlign: 'left' }}
            onMouseOver={e=>!isProcessing && (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.08)')}
            onMouseOut={e=>!isProcessing && (e.currentTarget.style.backgroundColor='rgba(255,255,255,0.03)')}
          >
            <ShieldAlert size={24} color="#ef4444" />
            <div>
              <div style={{ fontWeight: 'bold' }}>Inject Clinical Billing Codes</div>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>XML / ICD-10</div>
            </div>
          </button>
        </div>

        {/* Terminal Output */}
        <div style={{ backgroundColor: '#000', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '10px', right: '15px', display: 'flex', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
          </div>
          <pre style={{ fontFamily: 'monospace', color: '#10b981', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', marginTop: '1rem' }}>
            {activeLog}
            {isProcessing && <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>}
          </pre>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes blink { 50% { opacity: 0; } }
          `}} />
        </div>
      </div>
    </div>
  );
}
