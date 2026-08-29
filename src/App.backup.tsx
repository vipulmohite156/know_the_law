import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';

type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

type ClauseAnalysis = {
  section: string;
  title: string;
  content: string;
};

type AnalysisResult = {
  lawTitle: string;
  issuingAuthority: string;
  importantDates: string[];
  effectiveDate: string;
  applicability: string;
  keyRequirements: string[];
  obligations: string[];
  penalties: string[];
  importantClauses: string[];
  clauseBreakdown: ClauseAnalysis[];
  complianceActions: string[];
  affectedDepartments: string[];
  priority: RiskLevel;
  summary: string;
  sourceLabel: string;
};

type AnalysisEntry = {
  id: string;
  createdAt: string;
  title: string;
  authority: string;
  priority: RiskLevel;
  source: string;
  summary: string;
  result: AnalysisResult;
};

type ToastState = {
  type: 'success' | 'error' | 'info';
  message: string;
};

const STORAGE_KEY = 'law-analyzer-history-v1';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/analyzer', label: 'Law Analyzer' },
  { to: '/upload', label: 'Upload Document' },
  { to: '/results', label: 'Analysis Results' },
  { to: '/history', label: 'Search & History' },
  { to: '/settings', label: 'Settings & About' },
];

const overviewStats = [
  { label: 'Documents processed', value: '148', change: '+12.4%', accent: '#2e6fb5' },
  { label: 'High-risk findings', value: '23', change: '+4 this week', accent: '#c7634a' },
  { label: 'Compliance score', value: '89%', change: '+6 pts', accent: '#2d836a' },
  { label: 'Pending review', value: '7', change: '3 urgent', accent: '#8a6bd3' },
];

const watchlist = [
  { title: 'RBI circular on digital lending disclosures', regulator: 'RBI', risk: 'High', owner: 'Compliance' },
  { title: 'SEBI updated cyber resilience norms', regulator: 'SEBI', risk: 'Medium', owner: 'Risk' },
  { title: 'IRDAI claims handling amendments', regulator: 'IRDAI', risk: 'Low', owner: 'Operations' },
  { title: 'Data privacy advisory on third-party contracts', regulator: 'DPDP', risk: 'High', owner: 'Legal' },
];

const recentDocuments = [
  { name: 'RBI_Digital_Lending_Notice_2026.pdf', type: 'Circular', updated: '2h ago', status: 'Ready for review' },
  { name: 'SEBI_Cyber_Resilience_Amendment.pdf', type: 'Regulation', updated: 'Today', status: 'Reviewed' },
  { name: 'IRDAI_Claims_SLA_Advisory.docx', type: 'Notification', updated: 'Yesterday', status: 'Needs approval' },
];

const documentLibrary = [
  { name: 'RBI Circular on Digital Lending', author: 'Reserve Bank of India', tags: ['Digital Lending', 'Disclosure', 'Consumer'], size: '2.1 MB' },
  { name: 'SEBI Cyber Resilience Framework', author: 'Securities and Exchange Board', tags: ['Cyber', 'Resilience', 'Technology'], size: '1.4 MB' },
  { name: 'IRDAI Claims Handling Advisory', author: 'Insurance Regulator', tags: ['Claims', 'Operational Risk', 'SLA'], size: '980 KB' },
];

const sampleDocuments = [
  {
    id: 'rbi-sample',
    label: 'RBI digital lending notice',
    fileName: 'rbi-digital-lending-notice.txt',
    description: 'Sample RBI banking compliance text',
    text: `The Reserve Bank of India requires regulated entities to provide clear borrower disclosures before onboarding digital lending customers, maintain auditable records of customer consent, and ensure that all digital lending partners are subject to documented due diligence with periodic review. Entities must also monitor consumer complaints, preserve logs of approval decisions, and report material incidents to the appropriate oversight function. The regulation applies to lenders, fintech partners, and technology-enabled service providers engaged in digital lending activities. Effective obligations include disclosures, consent records, complaint escalation, and third-party oversight.`,
  },
  {
    id: 'sebi-sample',
    label: 'SEBI cyber resilience advisory',
    fileName: 'sebi-cyber-resilience.txt',
    description: 'Sample cyber governance text',
    text: `Securities and Exchange Board of India requires regulated entities to maintain documented cyber resilience controls, test incident response plans, and report material cyber events to oversight functions. Entities must monitor third-party technology dependencies, maintain service continuity testing records, and review vendor risk with evidence of control validation. These obligations apply to market intermediaries, listed entities, and technology service providers with material operational dependency.`,
  },
  {
    id: 'irdai-sample',
    label: 'IRDAI claims advisory',
    fileName: 'irdai-claims-advisory.txt',
    description: 'Sample insurance control text',
    text: `Insurance Regulatory and Development Authority of India expects insurers and intermediaries to document claims handling controls, review turnaround time obligations, and maintain service evidence for customer complaint and settlement workflows. Entities must assess outsourced claims processing providers, retain service logs, and monitor SLA deviations with remediation plans. Applicable obligations include fair treatment, service capacity, and escalation monitoring for material processing failures.`,
  },
];

const defaultSettings = {
  localFirst: true,
  autoScan: true,
  deadlineAlerts: true,
  aiHighlights: false,
  auditTrail: true,
};

const defaultLawText = sampleDocuments[0].text;

function loadHistoryFromStorage(): AnalysisEntry[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function inferAnalysis(text: string): AnalysisResult {
  const lower = text.toLowerCase();

  const authority = lower.includes('rbi')
    ? 'Reserve Bank of India (RBI)'
    : lower.includes('sebi')
      ? 'Securities and Exchange Board of India (SEBI)'
      : lower.includes('irdai')
        ? 'Insurance Regulatory and Development Authority of India (IRDAI)'
        : lower.includes('dpdp') || lower.includes('privacy')
          ? 'Digital Personal Data Protection / Data Privacy Authority'
          : 'Regulatory Authority';

  const lawTitle = authority.includes('RBI')
    ? 'RBI Digital Lending Disclosure and Partner Oversight Standards'
    : authority.includes('SEBI')
      ? 'SEBI Cyber Resilience and Governance Framework'
      : authority.includes('IRDAI')
        ? 'IRDAI Claims Handling and Service Standards Advisory'
        : 'Data Protection and Operational Risk Advisory';

  const importantDates = [
    'Notice issued: 12 Aug 2026',
    'Review window closes: 28 Sep 2026',
    'Implementation review: 15 Oct 2026',
  ];

  const effectiveDate = '01 Oct 2026';

  const applicability = authority.includes('RBI')
    ? 'All regulated banks, NBFCs, digital lending platforms, fintech partners, and outsourced servicing providers involved in customer onboarding and credit delivery.'
    : authority.includes('SEBI')
      ? 'All market intermediaries, regulated entities, and technology service providers subject to cyber-resilience and governance obligations.'
      : authority.includes('IRDAI')
        ? 'All insurers, intermediaries, and claims handling service providers within the insurance distribution ecosystem.'
        : 'Entities processing personal data or operating customer-facing digital services subject to privacy and operational controls.';

  const keyRequirements = [
    'Provide clear disclosures and plain-language notices before onboarding or loan activation.',
    'Maintain evidence of customer consent and operational records for audit review.',
    'Ensure due diligence and monitoring of third-party technology and service arrangements.',
    'Escalate customer complaints and incidents through defined governance channels.',
  ];

  const obligations = [
    'Implement and document disclosure controls for digital customer journeys.',
    'Maintain retention logs for consent, service activity, and operational approvals.',
    'Assess partner risk and review control exceptions on a defined schedule.',
    'Prepare escalation and board-level reporting for material compliance breaches.',
  ];

  const penalties = [
    'Monetary penalties for non-compliance with disclosure and consent requirements.',
    'Regulatory action for weak third-party monitoring or evidence gaps.',
    'Operational restrictions and remediation demands for material control failures.',
  ];

  const importantClauses = [
    'Mandatory plain-language disclosures before digital onboarding and credit activation.',
    'Customer consent and evidence retention obligations for audit and complaint review.',
    'Third-party due diligence, vendor risk review, and remediation timelines.',
  ];

  const complianceActions = [
    'Update onboarding and disclosure templates to include clear borrower obligations.',
    'Implement evidence logging for consent, approval, and service activity checkpoints.',
    'Review vendor contracts and control accountability for digital lending operations.',
    'Prepare a remediation tracker for legal, compliance, and operations owners.',
  ];

  const affectedDepartments = [
    'Legal & Compliance',
    'Customer Operations',
    'Risk & Controls',
    'Information Security',
    'Vendor Management',
  ];

  const priority: RiskLevel = lower.includes('severe') || lower.includes('critical') || lower.includes('penalty')
    ? 'Critical'
    : lower.includes('risk') || lower.includes('oversight') || lower.includes('due diligence')
      ? 'High'
      : lower.includes('review')
        ? 'Medium'
        : 'Low';

  const summary = `This directive introduces material governance obligations for regulated entities. The primary concerns are borrower clarity, evidence retention, and accountability across third-party digital operating models. Teams should prioritize disclosure updates, consent controls, and periodic due-diligence reviews to reduce regulatory exposure.`;

  const clauseBreakdown: ClauseAnalysis[] = [
    {
      section: 'Clause 3.1',
      title: 'Mandatory borrower disclosures',
      content: 'Financial entities must provide clear disclosure statements before onboarding and during any changes in product or pricing terms.',
    },
    {
      section: 'Clause 4.2',
      title: 'Consent and evidence retention',
      content: 'Customer consent must be auditable and retained alongside servicing records for dispute, audit, and inspection readiness.',
    },
    {
      section: 'Clause 5.4',
      title: 'Third-party oversight',
      content: 'Digital lending partners and technology vendors must be subject to periodic control reviews, risk assessments, and remediation follow-up.',
    },
  ];

  return {
    lawTitle,
    issuingAuthority: authority,
    importantDates,
    effectiveDate,
    applicability,
    keyRequirements,
    obligations,
    penalties,
    importantClauses,
    clauseBreakdown,
    complianceActions,
    affectedDepartments,
    priority,
    summary,
    sourceLabel: 'Demo sample source: RBI circular / internal legal review pack',
  };
}

function AppShell() {
  const navigate = useNavigate();
  const [sourceText, setSourceText] = useState(defaultLawText);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisEntry[]>(() => loadHistoryFromStorage());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = window.setInterval(() => {
      setProgress((current) => (current >= 100 ? 100 : current + 12));
    }, 180);

    return () => window.clearInterval(interval);
  }, [isAnalyzing]);

  const canAnalyze = useMemo(() => sourceText.trim().length > 0, [sourceText]);

  const handleAnalyze = (textOverride?: string) => {
    const nextText = (textOverride ?? sourceText).trim();
    if (!nextText) {
      setToast({ type: 'error', message: 'Paste some legal text before running the analysis.' });
      return;
    }

    setIsAnalyzing(true);
    setProgress(8);

    window.setTimeout(() => {
      const result = inferAnalysis(nextText);
      const historyEntry: AnalysisEntry = {
        id: `analysis-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: result.lawTitle,
        authority: result.issuingAuthority,
        priority: result.priority,
        source: selectedFileName ?? 'Manual input',
        summary: result.summary,
        result,
      };

      setAnalysisResult(result);
      setHistory((current) => [historyEntry, ...current.filter((item) => item.id !== historyEntry.id)].slice(0, 8));
      setProgress(100);
      setToast({ type: 'success', message: 'Analysis complete. Review the risk summary and obligations below.' });

      window.setTimeout(() => setIsAnalyzing(false), 450);
    }, 1400);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const acceptableExtensions = /\.(txt|md|csv|json|html|rtf)$/i;
    if (file.type.startsWith('text/') || acceptableExtensions.test(file.name)) {
      const text = await file.text();
      setSourceText(text.trim() || defaultLawText);
      setToast({ type: 'success', message: `Loaded ${file.name}. The content is ready for analysis.` });
      navigate('/analyzer');
      return;
    }

    setSourceText(`${file.name} was uploaded successfully. For the hackathon prototype, the document was recognized at the file container level. Paste the legal text directly to run the full local analysis preview.`);
    setToast({ type: 'info', message: 'File selected. Text-based preview is ready for analysis.' });
    navigate('/analyzer');
  };

  const handleLoadSample = (sample: (typeof sampleDocuments)[number]) => {
    setSourceText(sample.text);
    setSelectedFileName(sample.fileName);
    setAnalysisResult(null);
    setToast({ type: 'info', message: `${sample.label} loaded into the analysis workspace.` });
    navigate('/analyzer');
  };

  const handleUseResult = (entry: AnalysisEntry) => {
    setSourceText(entry.result.summary);
    setAnalysisResult(entry.result);
    setSelectedFileName(entry.source);
    setToast({ type: 'success', message: `Loaded previous analysis: ${entry.title}` });
    navigate('/results');
  };

  const handleClear = () => {
    setSourceText('');
    setSelectedFileName(null);
    setAnalysisResult(null);
    setToast({ type: 'info', message: 'Workspace cleared. Paste a new legal text to begin again.' });
  };

  const handleResetHistory = () => {
    setHistory([]);
    setToast({ type: 'info', message: 'Analysis history cleared.' });
  };

  const handleAnalyzeNew = () => {
    setSourceText('');
    setSelectedFileName(null);
    setAnalysisResult(null);
    navigate('/analyzer');
  };

  const handleExport = () => {
    if (!analysisResult) {
      setToast({ type: 'error', message: 'Run an analysis before exporting results.' });
      return;
    }

    const blob = new Blob([JSON.stringify(analysisResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'law-analyzer-result.json';
    link.click();
    URL.revokeObjectURL(url);
    setToast({ type: 'success', message: 'Analysis results exported as JSON.' });
  };

  const filteredHistory = history.filter((item) => {
    const query = searchTerm.toLowerCase();
    if (!query) return true;
    return item.title.toLowerCase().includes(query) || item.authority.toLowerCase().includes(query) || item.source.toLowerCase().includes(query);
  });

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">LA</div>
          <div>
            <p className="eyebrow">LEGAL INTELLIGENCE</p>
            <h1>Law Analyzer</h1>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">SYSTEM STATUS</p>
          <strong>Local-first mode</strong>
          <span>All analysis remains on-device</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-toggle"
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              ☰
            </button>
            <div>
              <p className="eyebrow">LAW ANALYSIS WORKSPACE</p>
              <h2>Legal review and regulatory intelligence</h2>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" type="button" onClick={handleExport}>Export</button>
            <NavLink to="/analyzer" className="primary-button action-button">New analysis</NavLink>
          </div>
        </header>

        {toast && (
          <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
            {toast.message}
          </div>
        )}

        <Routes>
          <Route path="/" element={<DashboardPage onLoadSample={handleLoadSample} />} />
          <Route
            path="/analyzer"
            element={
              <AnalyzerPage
                sourceText={sourceText}
                onTextChange={setSourceText}
                onAnalyze={() => handleAnalyze()}
                onClear={handleClear}
                canAnalyze={canAnalyze}
                isAnalyzing={isAnalyzing}
                progress={progress}
                selectedFileName={selectedFileName}
                onFileSelect={handleFileSelect}
                analysisResult={analysisResult}
                onLoadSample={handleLoadSample}
                samples={sampleDocuments}
              />
            }
          />
          <Route path="/upload" element={<UploadPage onFileSelect={handleFileSelect} onLoadSample={handleLoadSample} samples={sampleDocuments} />} />
          <Route path="/results" element={<ResultsPage analysisResult={analysisResult} onAnalyzeNew={handleAnalyzeNew} />} />
          <Route path="/history" element={<HistoryPage history={filteredHistory} searchTerm={searchTerm} onSearchChange={setSearchTerm} onView={handleUseResult} onClearHistory={handleResetHistory} />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function DashboardPage({ onLoadSample }: { onLoadSample: (sample: (typeof sampleDocuments)[number]) => void }) {
  return (
    <>
      <section className="hero-panel panel">
        <div>
          <p className="eyebrow secondary">AI-POWERED LEGAL REVIEW</p>
          <h3>Turn legal text into a clear action plan</h3>
          <p className="helper-copy">Review RBI, SEBI, and insurance updates in one local-first workspace built for fast demo delivery and stakeholder communication.</p>
        </div>
        <div className="hero-actions">
          <NavLink to="/analyzer" className="primary-button action-button">Analyze a document</NavLink>
          <button className="ghost-button" type="button" onClick={() => onLoadSample(sampleDocuments[0])}>Load sample RBI notice</button>
        </div>
      </section>

      <section className="stats-grid">
        {overviewStats.map((stat) => (
          <article key={stat.label} className="stats-card" style={{ borderTop: `4px solid ${stat.accent}` }}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.change}</small>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">REGULATORY WATCHLIST</p>
              <h3>High-priority updates</h3>
            </div>
            <span className="badge neutral">Live watch</span>
          </div>

          <div className="watchlist">
            {watchlist.map((row) => (
              <div key={row.title} className="watch-row">
                <div>
                  <strong>{row.title}</strong>
                  <div className="meta-row">
                    <span>{row.regulator}</span>
                    <span>•</span>
                    <span>{row.owner}</span>
                  </div>
                </div>
                <span className={`risk-badge ${row.risk.toLowerCase()}`}>{row.risk}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">WORKFLOW</p>
              <h3>Action queue</h3>
            </div>
            <span className="badge accent">3 tasks</span>
          </div>

          <ul className="task-list">
            <li>
              <span>Review updated disclosure obligations</span>
              <span className="priority high">High</span>
            </li>
            <li>
              <span>Validate KYC process changes</span>
              <span className="priority medium">Medium</span>
            </li>
            <li>
              <span>Prepare memo for vendor due diligence</span>
              <span className="priority low">Low</span>
            </li>
          </ul>
        </article>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">DOCUMENTS</p>
            <h3>Recent uploads</h3>
          </div>
          <button className="ghost-button small" type="button" onClick={() => onLoadSample(sampleDocuments[0])}>View sample</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentDocuments.map((doc) => (
              <tr key={doc.name}>
                <td><strong>{doc.name}</strong></td>
                <td>{doc.type}</td>
                <td>{doc.updated}</td>
                <td><span className="status-pill review">{doc.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

type AnalyzerPageProps = {
  sourceText: string;
  onTextChange: (value: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  canAnalyze: boolean;
  isAnalyzing: boolean;
  progress: number;
  selectedFileName: string | null;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  analysisResult: AnalysisResult | null;
  onLoadSample: (sample: (typeof sampleDocuments)[number]) => void;
  samples: typeof sampleDocuments;
};

function AnalyzerPage({
  sourceText,
  onTextChange,
  onAnalyze,
  onClear,
  canAnalyze,
  isAnalyzing,
  progress,
  selectedFileName,
  onFileSelect,
  analysisResult,
  onLoadSample,
  samples,
}: AnalyzerPageProps) {
  return (
    <>
      <section className="page-hero panel">
        <div>
          <p className="eyebrow secondary">LAW ANALYZER</p>
          <h3>Analyze a regulation, circular, or legal notification</h3>
          <p className="helper-copy">Paste text, upload a document, or pull from a saved file to assess obligations, compliance gaps, and operational impact.</p>
        </div>
        <div className="action-stack-inline">
          <button className="primary-button" type="button" onClick={onAnalyze} disabled={!canAnalyze || isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Law'}
          </button>
          <button className="ghost-button" type="button" onClick={onClear}>Clear</button>
        </div>
      </section>

      {isAnalyzing && (
        <section className="panel loading-panel">
          <div className="loading-head">
            <div>
              <p className="eyebrow secondary">Processing</p>
              <h3>Running local legal analysis</h3>
            </div>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
        </section>
      )}

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">INPUT</p>
              <h3>Source text</h3>
            </div>
            <span className="badge soft">Draft version</span>
          </div>

          <label className="upload-label">
            <input type="file" accept=".txt,.md,.csv,.json,.html,.rtf,.doc,.docx" onChange={onFileSelect} />
            <span>{selectedFileName ? `Loaded: ${selectedFileName}` : 'Upload text document'}</span>
          </label>

          <textarea
            className="analysis-textarea"
            value={sourceText}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Paste a law, circular, notification, or legal document here..."
          />
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">DETECTION</p>
              <h3>Detected signals</h3>
            </div>
          </div>

          <div className="signal-stack">
            <div className="signal-card">
              <span className="signal-label">Risk level</span>
              <strong>{analysisResult?.priority ?? 'Pending'}</strong>
            </div>
            <div className="signal-card">
              <span className="signal-label">Issuing authority</span>
              <strong>{analysisResult?.issuingAuthority ?? 'Awaiting review'}</strong>
            </div>
            <div className="signal-card">
              <span className="signal-label">Processing status</span>
              <strong>{isAnalyzing ? 'Scanning document' : 'Ready'}</strong>
            </div>
          </div>

          <div className="sample-list">
            {samples.map((sample) => (
              <button key={sample.id} type="button" className="sample-button" onClick={() => onLoadSample(sample)}>
                {sample.label}
              </button>
            ))}
          </div>
        </article>
      </section>

      {!analysisResult && !isAnalyzing && (
        <section className="panel empty-state-panel">
          <h3>No analysis results yet</h3>
          <p>Paste a document or load a sample notice to generate a structured compliance summary.</p>
          <div className="empty-actions">
            <button type="button" className="primary-button" onClick={() => onLoadSample(samples[0])}>Load sample RBI document</button>
            <button type="button" className="ghost-button" onClick={() => onTextChange(defaultLawText)}>Use default sample text</button>
          </div>
        </section>
      )}

      {analysisResult && (
        <section className="results-section">
          <section className="panel result-summary">
            <div className="summary-header">
              <div>
                <p className="eyebrow secondary">ANALYSIS RESULTS</p>
                <h3>{analysisResult.lawTitle}</h3>
              </div>
              <span className={`badge ${analysisResult.priority === 'Critical' ? 'danger' : analysisResult.priority === 'High' ? 'danger' : 'neutral'}`}>
                {analysisResult.priority} risk
              </span>
            </div>

            <div className="score-row">
              <div className="score-ring">
                <strong>{analysisResult.priority === 'Critical' ? '92' : analysisResult.priority === 'High' ? '87' : analysisResult.priority === 'Medium' ? '72' : '58'}</strong>
                <span>Risk score</span>
              </div>
              <div className="summary-metrics">
                <div>
                  <span>Authority</span>
                  <strong>{analysisResult.issuingAuthority}</strong>
                </div>
                <div>
                  <span>Effective</span>
                  <strong>{analysisResult.effectiveDate}</strong>
                </div>
                <div>
                  <span>Actions</span>
                  <strong>{analysisResult.complianceActions.length}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="content-grid results-grid">
            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow secondary">SUMMARY</p>
                  <h3>Plain-English overview</h3>
                </div>
              </div>
              <p className="plain-summary">{analysisResult.summary}</p>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow secondary">DETAILS</p>
                  <h3>Framework overview</h3>
                </div>
              </div>
              <div className="detail-list">
                <div><span>Issuing authority</span><strong>{analysisResult.issuingAuthority}</strong></div>
                <div><span>Applicability</span><strong>{analysisResult.applicability}</strong></div>
                <div><span>Effective date</span><strong>{analysisResult.effectiveDate}</strong></div>
              </div>
            </article>
          </section>

          <section className="panel panel-large">
            <div className="panel-header">
              <div>
                <p className="eyebrow secondary">STRUCTURED FINDINGS</p>
                <h3>Law analysis output</h3>
              </div>
            </div>

            <div className="analysis-grid">
              <div className="analysis-card">
                <h4>Important dates</h4>
                <ul>
                  {analysisResult.importantDates.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="analysis-card">
                <h4>Key requirements</h4>
                <ul>
                  {analysisResult.keyRequirements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="analysis-card">
                <h4>Obligations</h4>
                <ul>
                  {analysisResult.obligations.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="analysis-card">
                <h4>Penalties / Risks</h4>
                <ul>
                  {analysisResult.penalties.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="analysis-card">
                <h4>Important clauses</h4>
                <ul>
                  {analysisResult.importantClauses.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="analysis-card">
                <h4>Compliance actions</h4>
                <ul>
                  {analysisResult.complianceActions.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="analysis-card full-span">
                <h4>Affected departments</h4>
                <div className="tag-row">
                  {analysisResult.affectedDepartments.map((item) => (
                    <span key={item} className="tag">{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </section>
      )}
    </>
  );
}

function UploadPage({ onFileSelect, onLoadSample, samples }: { onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void; onLoadSample: (sample: (typeof sampleDocuments)[number]) => void; samples: typeof sampleDocuments }) {
  return (
    <>
      <section className="panel upload-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">UPLOAD</p>
            <h3>Law document intake</h3>
          </div>
          <button className="ghost-button small" type="button" onClick={() => document.getElementById('upload-document-input')?.click()}>Import from saved files</button>
        </div>

        <label className="upload-box">
          <input id="upload-document-input" type="file" accept=".txt,.md,.csv,.json,.html,.rtf,.doc,.docx" onChange={onFileSelect} />
          <div className="upload-inner">
            <span className="upload-icon">⇪</span>
            <strong>Drag and drop a regulation, notification, or circular</strong>
            <p>Text-based local files supported for frontend analysis</p>
          </div>
        </label>
      </section>

      <section className="content-grid">
        {samples.map((doc) => (
          <article key={doc.id} className="panel doc-card">
            <div className="doc-head">
              <div>
                <p className="eyebrow secondary">{doc.description}</p>
                <h4>{doc.label}</h4>
              </div>
              <span className="badge neutral">demo</span>
            </div>
            <div className="tag-row">
              <span className="tag">RBI</span>
              <span className="tag">Compliance</span>
              <span className="tag">Local</span>
            </div>
            <button type="button" className="primary-button small-button" onClick={() => onLoadSample(doc)}>Load sample</button>
          </article>
        ))}
      </section>
    </>
  );
}

function ResultsPage({ analysisResult, onAnalyzeNew }: { analysisResult: AnalysisResult | null; onAnalyzeNew: () => void }) {
  const result = analysisResult ?? inferAnalysis(defaultLawText);
  const score = result.priority === 'Critical' ? 92 : result.priority === 'High' ? 87 : result.priority === 'Medium' ? 72 : 58;

  return (
    <div className="results-dashboard">
      <section className="panel result-summary">
        <div className="summary-header">
          <div>
            <p className="eyebrow secondary">DEMO SAMPLE DATA</p>
            <h3>{result.lawTitle}</h3>
          </div>
          <div className="result-header-actions">
            <span className={`severity-pill ${result.priority.toLowerCase()}`}>{result.priority} risk</span>
          </div>
        </div>

        <div className="overview-grid">
          <div className="score-card panel-soft">
            <span className="mini-label">Overall compliance score</span>
            <div className="score-wrap">
              <div className="score-ring large" style={{ background: `conic-gradient(#d14f4f 0 ${score}%, #edf1f7 ${score}% 100%)` }}>
                <strong>{score}</strong>
              </div>
              <div className="score-copy">
                <p>Risk level</p>
                <strong>{result.priority}</strong>
                <small>Sample RBI demo review</small>
              </div>
            </div>
          </div>

          <div className="kpi-panel panel-soft">
            <div className="kpi-row">
              <span>Authority</span>
              <strong>{result.issuingAuthority}</strong>
            </div>
            <div className="kpi-row">
              <span>Effective date</span>
              <strong>{result.effectiveDate}</strong>
            </div>
            <div className="kpi-row">
              <span>Applicable entities</span>
              <strong>Banking & fintech</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="content-grid results-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">EXECUTIVE SUMMARY</p>
              <h3>What matters most</h3>
            </div>
          </div>
          <div className="summary-block">
            <p>{result.summary}</p>
          </div>
          <div className="progress-group">
            <div className="progress-label-row">
              <span>Disclosure readiness</span>
              <strong>78%</strong>
            </div>
            <div className="progress-bar"><span style={{ width: '78%' }} /></div>
          </div>
          <div className="progress-group">
            <div className="progress-label-row">
              <span>Consent compliance</span>
              <strong>84%</strong>
            </div>
            <div className="progress-bar"><span style={{ width: '84%', background: '#2d836a' }} /></div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">KEY REQUIREMENTS</p>
              <h3>Regulatory essentials</h3>
            </div>
          </div>
          <ul className="info-list compact">
            {result.keyRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="content-grid results-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">IMPORTANT DEADLINES</p>
              <h3>Action timeline</h3>
            </div>
          </div>
          <ul className="timeline-list">
            {result.importantDates.map((item) => (
              <li key={item}>
                <span className="timeline-dot" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">AFFECTED BUSINESS AREAS</p>
              <h3>Impact map</h3>
            </div>
          </div>
          <div className="impact-list compact">
            <div><span>Consumer lending</span><strong>High</strong></div>
            <div><span>Operations</span><strong>Medium</strong></div>
            <div><span>Vendor risk</span><strong>High</strong></div>
            <div><span>Legal review</span><strong>{result.priority}</strong></div>
          </div>
        </article>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">OBLIGATIONS & RISKS</p>
            <h3>Operational impact</h3>
          </div>
        </div>

        <div className="split-grid">
          <div>
            <h4>Obligations</h4>
            <ul className="data-list">
              {result.obligations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h4>Risks and penalties</h4>
            <ul className="data-list warn-list">
              {result.penalties.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">RECOMMENDED ACTIONS</p>
            <h3>Priority remediation plan</h3>
          </div>
        </div>

        <div className="action-grid">
          {result.complianceActions.map((item, index) => (
            <div className="action-item" key={item}>
              <span className={`bullet ${index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'amber' : 'green'}`} />
              <div>
                <strong>{['Update disclosures', 'Strengthen consent controls', 'Review vendor controls', 'Track remediation'][index % 4]}</strong>
                <p>{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">CLAUSE-BY-CLAUSE</p>
            <h3>Detailed legal review</h3>
          </div>
        </div>

        <table className="data-table clause-table">
          <thead>
            <tr>
              <th>Clause</th>
              <th>Theme</th>
              <th>Operational interpretation</th>
            </tr>
          </thead>
          <tbody>
            {(result.clauseBreakdown ?? []).map((clause) => (
              <tr key={clause.section}>
                <td><strong>{clause.section}</strong></td>
                <td>{clause.title}</td>
                <td>{clause.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="panel panel-large source-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">SOURCE / DOCUMENT</p>
            <h3>Reference information</h3>
          </div>
        </div>

        <div className="source-grid">
          <div className="source-item">
            <span>Document</span>
            <strong>RBI Digital Lending Disclosure Notice (demo)</strong>
          </div>
          <div className="source-item">
            <span>Source label</span>
            <strong>{result.sourceLabel}</strong>
          </div>
          <div className="source-item">
            <span>Applicability</span>
            <strong>{result.applicability}</strong>
          </div>
        </div>
      </section>

      <div className="result-actions">
        <button type="button" className="primary-button action-button" onClick={onAnalyzeNew}>Analyze Another Document</button>
        <NavLink to="/" className="ghost-button action-button">Back to Dashboard</NavLink>
      </div>
    </div>
  );
}

function HistoryPage({ history, searchTerm, onSearchChange, onView, onClearHistory }: { history: AnalysisEntry[]; searchTerm: string; onSearchChange: (value: string) => void; onView: (entry: AnalysisEntry) => void; onClearHistory: () => void }) {
  return (
    <>
      <section className="panel search-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">SEARCH</p>
            <h3>Analysis history</h3>
          </div>
        </div>

        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input type="text" value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Filter documents, authorities, or keywords" aria-label="Filter analysis history" />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">RECENT</p>
            <h3>Saved analysis</h3>
          </div>
          <button className="ghost-button small" type="button" onClick={onClearHistory}>Clear history</button>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <h4>No saved analysis yet</h4>
            <p>Run a legal review and it will appear here for quick reuse.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div key={entry.id} className="history-row history-row-clickable">
                <div>
                  <strong>{entry.title}</strong>
                  <span>{entry.authority}</span>
                  <small>{entry.source} • {new Date(entry.createdAt).toLocaleDateString()}</small>
                </div>
                <div className="history-actions">
                  <span className={`risk-badge ${entry.priority.toLowerCase()}`}>{entry.priority}</span>
                  <button type="button" className="ghost-button small" onClick={() => onView(entry)}>View</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <>
      <section className="settings-grid">
        <article className="panel settings-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">PREFERENCES</p>
              <h3>Workspace settings</h3>
            </div>
          </div>

          <div className="settings-list">
            {Object.entries({
              localFirst: 'Local-first processing',
              autoScan: 'Auto-scan incoming documents',
              deadlineAlerts: 'Deadline reminders',
              aiHighlights: 'AI highlights',
              auditTrail: 'Audit trail logging',
            }).map(([key, label]) => (
              <div key={key} className="setting-row">
                <div>
                  <strong>{label}</strong>
                  <p>Keep your legal review workflow aligned with current operating requirements.</p>
                </div>
                <button
                  className={`toggle ${settings[key as keyof typeof settings] ? 'on' : 'off'}`}
                  onClick={() => toggleSetting(key as keyof typeof settings)}
                  type="button"
                >
                  {settings[key as keyof typeof settings] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel about-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">ABOUT</p>
              <h3>Law Analyzer</h3>
            </div>
          </div>

          <div className="about-copy">
            <p>Law Analyzer is a lightweight legal-tech workspace for reviewing regulatory notices, statutes, notifications, and circulars in a structured format.</p>
            <p>Built for local-first analysis with a professional SaaS experience suitable for hackathon demos and early-stage product validation.</p>
          </div>

          <div className="about-meta">
            <div><span>Version</span><strong>0.1.0</strong></div>
            <div><span>Mode</span><strong>Frontend demo</strong></div>
            <div><span>Data</span><strong>Local only</strong></div>
          </div>
        </article>
      </section>
    </>
  );
}

export default function App() {
  return <AppShell />;
}
