import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';

type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

type ClauseAnalysis = {
  section: string;
  title: string;
  content: string;
};

type ComplianceFinding = {
  title: string;
  description: string;
  probability: number;
  severity: RiskLevel;
  action: string;
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
  confidence: number;
  complianceScore: number;
  summary: string;
  sourceLabel: string;
  findings: ComplianceFinding[];
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

type WatchlistItem = {
  title: string;
  regulator: string;
  risk: RiskLevel;
  owner: string;
  confidence: number;
  effectiveDate: string;
  impact: string;
  changes: string[];
  actions: string[];
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

const watchlist: WatchlistItem[] = [
  {
    title: 'RBI circular on digital lending disclosures',
    regulator: 'RBI',
    risk: 'High',
    owner: 'Compliance',
    confidence: 92,
    effectiveDate: '01 Oct 2026',
    impact:
      'Digital lending onboarding, borrower disclosures, consent records, complaint handling, and third-party oversight.',
    changes: [
      'Clear borrower disclosures must be provided before digital onboarding.',
      'Customer consent must be recorded and retained for audit.',
      'Digital lending partners require documented due diligence and periodic review.',
      'Material complaints and incidents must follow defined escalation channels.',
    ],
    actions: [
      'Update digital lending disclosure templates.',
      'Strengthen consent and evidence-retention controls.',
      'Review fintech and technology partner contracts.',
      'Create a remediation tracker for compliance owners.',
    ],
  },
  {
    title: 'SEBI updated cyber resilience norms',
    regulator: 'SEBI',
    risk: 'Medium',
    owner: 'Risk',
    confidence: 84,
    effectiveDate: '15 Oct 2026',
    impact:
      'Cyber governance, incident response, vendor technology risk, and business continuity.',
    changes: [
      'Cyber resilience controls must be documented.',
      'Incident response plans require periodic testing.',
      'Material cyber incidents require defined reporting.',
      'Third-party technology dependencies require monitoring.',
    ],
    actions: [
      'Review cyber resilience controls.',
      'Test the incident response plan.',
      'Assess critical technology vendors.',
      'Maintain evidence of control validation.',
    ],
  },
  {
    title: 'IRDAI claims handling amendments',
    regulator: 'IRDAI',
    risk: 'Low',
    owner: 'Operations',
    confidence: 78,
    effectiveDate: '20 Oct 2026',
    impact:
      'Claims processing, service-level monitoring, customer complaints, and outsourced claims operations.',
    changes: [
      'Claims handling controls should be documented.',
      'Turnaround-time obligations require monitoring.',
      'Customer complaint workflows require service evidence.',
      'Outsourced claims providers require periodic assessment.',
    ],
    actions: [
      'Review claims SLA controls.',
      'Monitor SLA deviations.',
      'Assess outsourced claims providers.',
      'Create remediation plans for material failures.',
    ],
  },
  {
    title: 'Data privacy advisory on third-party contracts',
    regulator: 'DPDP',
    risk: 'High',
    owner: 'Legal',
    confidence: 89,
    effectiveDate: '05 Nov 2026',
    impact:
      'Third-party data processing, privacy contracts, data handling, and vendor governance.',
    changes: [
      'Third-party data processing responsibilities must be documented.',
      'Vendor contracts should define privacy obligations.',
      'Data handling activities require appropriate records.',
      'Material privacy risks should be escalated.',
    ],
    actions: [
      'Review third-party privacy clauses.',
      'Map vendor data-processing activities.',
      'Strengthen privacy accountability.',
      'Track remediation of identified gaps.',
    ],
  },
];

const recentDocuments = [
  {
    name: 'RBI_Digital_Lending_Notice_2026.pdf',
    type: 'Circular',
    updated: '2h ago',
    status: 'Ready for review',
  },
  {
    name: 'SEBI_Cyber_Resilience_Amendment.pdf',
    type: 'Regulation',
    updated: 'Today',
    status: 'Reviewed',
  },
  {
    name: 'IRDAI_Claims_SLA_Advisory.docx',
    type: 'Notification',
    updated: 'Yesterday',
    status: 'Needs approval',
  },
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
  aiHighlights: true,
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

  const isRBI = authority.includes('RBI');
  const isSEBI = authority.includes('SEBI');
  const isIRDAI = authority.includes('IRDAI');

  const lawTitle = isRBI
    ? 'RBI Digital Lending Disclosure and Partner Oversight Standards'
    : isSEBI
      ? 'SEBI Cyber Resilience and Governance Framework'
      : isIRDAI
        ? 'IRDAI Claims Handling and Service Standards Advisory'
        : 'Data Protection and Operational Risk Advisory';

  const importantDates = [
    'Notice issued: 12 Aug 2026',
    'Review window closes: 28 Sep 2026',
    'Implementation review: 15 Oct 2026',
  ];

  const effectiveDate = isRBI
    ? '01 Oct 2026'
    : isSEBI
      ? '15 Oct 2026'
      : isIRDAI
        ? '20 Oct 2026'
        : '05 Nov 2026';

  const applicability = isRBI
    ? 'Regulated banks, NBFCs, digital lending platforms, fintech partners, and outsourced servicing providers involved in customer onboarding and credit delivery.'
    : isSEBI
      ? 'Market intermediaries, regulated entities, and technology service providers subject to cyber-resilience and governance obligations.'
      : isIRDAI
        ? 'Insurers, intermediaries, and claims handling service providers within the insurance distribution ecosystem.'
        : 'Entities processing personal data or operating customer-facing digital services subject to privacy and operational controls.';

  const keyRequirements = isSEBI
    ? [
        'Maintain documented cyber resilience controls.',
        'Test incident response and business continuity plans.',
        'Report material cyber incidents through defined channels.',
        'Monitor third-party technology dependencies.',
      ]
    : isIRDAI
      ? [
          'Document claims handling controls.',
          'Monitor turnaround-time obligations.',
          'Maintain evidence for complaints and settlements.',
          'Assess outsourced claims processing providers.',
        ]
      : [
          'Provide clear disclosures before onboarding or activation.',
          'Maintain evidence of customer consent and operational records.',
          'Ensure due diligence and monitoring of third-party arrangements.',
          'Escalate customer complaints and incidents through governance channels.',
        ];

  const obligations = [
    'Implement and document regulatory controls across affected customer journeys.',
    'Maintain evidence and retention logs for audit and inspection readiness.',
    'Assess partner and vendor risk on a defined review schedule.',
    'Prepare escalation and management reporting for material compliance breaches.',
  ];

  const penalties = [
    'Monetary penalties or regulatory action for material non-compliance.',
    'Regulatory remediation demands where control evidence is insufficient.',
    'Operational restrictions where significant compliance failures remain unresolved.',
  ];

  const importantClauses = [
    'Mandatory regulatory controls and disclosure requirements.',
    'Evidence retention and audit-readiness obligations.',
    'Third-party due diligence, monitoring, and remediation requirements.',
  ];

  const complianceActions = [
    'Update affected policies, procedures, and customer-facing disclosures.',
    'Strengthen evidence logging and control monitoring.',
    'Review vendor contracts and accountability arrangements.',
    'Create a remediation tracker with named compliance owners.',
  ];

  const affectedDepartments = isSEBI
    ? ['Legal & Compliance', 'Risk & Controls', 'Information Security', 'Technology', 'Vendor Management']
    : isIRDAI
      ? ['Legal & Compliance', 'Claims Operations', 'Customer Service', 'Risk & Controls', 'Vendor Management']
      : ['Legal & Compliance', 'Customer Operations', 'Risk & Controls', 'Information Security', 'Vendor Management'];

  const priority: RiskLevel =
    lower.includes('severe') || lower.includes('critical')
      ? 'Critical'
      : lower.includes('risk') ||
          lower.includes('oversight') ||
          lower.includes('due diligence') ||
          lower.includes('penalty')
        ? 'High'
        : lower.includes('review')
          ? 'Medium'
          : 'Low';

  const confidence =
    priority === 'Critical'
      ? 95
      : priority === 'High'
        ? 91
        : priority === 'Medium'
          ? 84
          : 76;

  const complianceScore =
    priority === 'Critical'
      ? 61
      : priority === 'High'
        ? 72
        : priority === 'Medium'
          ? 84
          : 91;

  const findings: ComplianceFinding[] = isSEBI
    ? [
        {
          title: 'Cyber resilience control documentation',
          description: 'The regulation requires documented controls that can be demonstrated during compliance review.',
          probability: 91,
          severity: 'High',
          action: 'Map existing cyber controls and attach evidence.',
        },
        {
          title: 'Incident response testing',
          description: 'Incident response plans should be periodically tested and supported by evidence.',
          probability: 86,
          severity: 'High',
          action: 'Schedule and document an incident response exercise.',
        },
        {
          title: 'Third-party technology risk',
          description: 'Material technology dependencies require ongoing monitoring and vendor risk assessment.',
          probability: 82,
          severity: 'Medium',
          action: 'Review critical technology vendors and contracts.',
        },
      ]
    : isIRDAI
      ? [
          {
            title: 'Claims SLA monitoring gap',
            description: 'Claims turnaround obligations require measurable monitoring and remediation.',
            probability: 88,
            severity: 'High',
            action: 'Create an SLA monitoring dashboard and escalation workflow.',
          },
          {
            title: 'Outsourced claims oversight',
            description: 'Third-party claims processors should have documented controls and periodic assessments.',
            probability: 83,
            severity: 'Medium',
            action: 'Perform a vendor control review.',
          },
          {
            title: 'Complaint evidence retention',
            description: 'Customer complaint and settlement workflows require service evidence.',
            probability: 79,
            severity: 'Medium',
            action: 'Strengthen complaint evidence retention.',
          },
        ]
      : [
          {
            title: 'Borrower disclosure control gap',
            description: 'Customer-facing digital lending journeys must provide clear disclosures before onboarding.',
            probability: 92,
            severity: 'High',
            action: 'Update onboarding and disclosure templates.',
          },
          {
            title: 'Customer consent evidence gap',
            description: 'Consent records must remain auditable and available for regulatory inspection.',
            probability: 87,
            severity: 'High',
            action: 'Strengthen consent logging and retention controls.',
          },
          {
            title: 'Third-party due diligence gap',
            description: 'Digital lending and technology partners require documented risk assessment and periodic review.',
            probability: 81,
            severity: 'Medium',
            action: 'Review vendor contracts and due-diligence records.',
          },
          {
            title: 'Complaint escalation risk',
            description: 'Material customer complaints should follow a defined escalation process.',
            probability: 74,
            severity: 'Medium',
            action: 'Validate complaint escalation and reporting workflows.',
          },
        ];

  const summary = `The local legal-intelligence engine identified ${findings.length} potential compliance findings with an overall ${confidence}% confidence level. The primary areas of concern are regulatory control implementation, evidence retention, and accountability across affected business functions.`;

  const clauseBreakdown: ClauseAnalysis[] = [
    {
      section: 'Clause 3.1',
      title: 'Mandatory regulatory controls',
      content:
        'Affected entities must implement clear, documented controls and maintain evidence demonstrating compliance.',
    },
    {
      section: 'Clause 4.2',
      title: 'Evidence and retention',
      content:
        'Relevant records should be auditable and retained for dispute resolution, regulatory inspection, and internal review.',
    },
    {
      section: 'Clause 5.4',
      title: 'Third-party oversight',
      content:
        'Partners and technology vendors should be subject to periodic control reviews, risk assessments, and remediation follow-up.',
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
    confidence,
    complianceScore,
    summary,
    sourceLabel: 'Demo sample source: regulatory circular / internal legal review pack',
    findings,
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
  const [selectedWatchlistItem, setSelectedWatchlistItem] =
    useState<WatchlistItem | null>(null);

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

  const canAnalyze = useMemo(
    () => sourceText.trim().length > 0,
    [sourceText],
  );

  const handleAnalyze = (textOverride?: string) => {
    const nextText = (textOverride ?? sourceText).trim();

    if (!nextText) {
      setToast({
        type: 'error',
        message: 'Paste some legal text before running the analysis.',
      });
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
      setHistory((current) =>
        [historyEntry, ...current.filter((item) => item.id !== historyEntry.id)].slice(
          0,
          8,
        ),
      );

      setProgress(100);

      setToast({
        type: 'success',
        message: `Analysis complete. ${result.findings.length} potential compliance findings detected.`,
      });

      window.setTimeout(() => setIsAnalyzing(false), 450);
    }, 1400);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFileName(file.name);

    const acceptableExtensions = /\.(txt|md|csv|json|html|rtf)$/i;

    if (file.type.startsWith('text/') || acceptableExtensions.test(file.name)) {
      const text = await file.text();

      setSourceText(text.trim() || defaultLawText);

      setToast({
        type: 'success',
        message: `${file.name} loaded. The content is ready for analysis.`,
      });

      navigate('/analyzer');
      return;
    }

    setSourceText(
      `${file.name} was uploaded successfully. For this hackathon prototype, the document was recognized at the file-container level. Paste the legal text directly to run the local analysis preview.`,
    );

    setToast({
      type: 'info',
      message: 'File selected. Text-based preview is ready for analysis.',
    });

    navigate('/analyzer');
  };

  const handleLoadSample = (
    sample: (typeof sampleDocuments)[number],
  ) => {
    setSourceText(sample.text);
    setSelectedFileName(sample.fileName);
    setAnalysisResult(null);

    setToast({
      type: 'info',
      message: `${sample.label} loaded into the analysis workspace.`,
    });

    navigate('/analyzer');
  };

  const handleAnalyzeWatchlist = (item: WatchlistItem) => {
    const matchingSample =
      item.regulator === 'RBI'
        ? sampleDocuments[0]
        : item.regulator === 'SEBI'
          ? sampleDocuments[1]
          : item.regulator === 'IRDAI'
            ? sampleDocuments[2]
            : sampleDocuments[0];

    setSourceText(matchingSample.text);
    setSelectedFileName(matchingSample.fileName);
    setSelectedWatchlistItem(null);
    navigate('/analyzer');

    window.setTimeout(() => {
      handleAnalyze(matchingSample.text);
    }, 150);
  };

  const handleUseResult = (entry: AnalysisEntry) => {
    setSourceText(entry.result.summary);
    setAnalysisResult(entry.result);
    setSelectedFileName(entry.source);

    setToast({
      type: 'success',
      message: `Loaded previous analysis: ${entry.title}`,
    });

    navigate('/results');
  };

  const handleClear = () => {
    setSourceText('');
    setSelectedFileName(null);
    setAnalysisResult(null);

    setToast({
      type: 'info',
      message: 'Workspace cleared. Paste new legal text to begin.',
    });
  };

  const handleResetHistory = () => {
    setHistory([]);

    setToast({
      type: 'info',
      message: 'Analysis history cleared.',
    });
  };

  const handleAnalyzeNew = () => {
    setSourceText('');
    setSelectedFileName(null);
    setAnalysisResult(null);
    navigate('/analyzer');
  };

  const handleExport = () => {
    if (!analysisResult) {
      setToast({
        type: 'error',
        message: 'Run an analysis before exporting results.',
      });
      return;
    }

    const blob = new Blob(
      [JSON.stringify(analysisResult, null, 2)],
      { type: 'application/json' },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'law-analyzer-result.json';
    link.click();

    URL.revokeObjectURL(url);

    setToast({
      type: 'success',
      message: 'Analysis results exported as JSON.',
    });
  };

  const filteredHistory = history.filter((item) => {
    const query = searchTerm.toLowerCase();

    if (!query) return true;

    return (
      item.title.toLowerCase().includes(query) ||
      item.authority.toLowerCase().includes(query) ||
      item.source.toLowerCase().includes(query)
    );
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
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
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
            <button
              className="ghost-button"
              type="button"
              onClick={handleExport}
            >
              Export
            </button>

            <NavLink
              to="/analyzer"
              className="primary-button action-button"
            >
              New analysis
            </NavLink>
          </div>
        </header>

        {toast && (
          <div
            className={`toast toast-${toast.type}`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                onLoadSample={handleLoadSample}
                onSelectWatchlist={setSelectedWatchlistItem}
                selectedWatchlistItem={selectedWatchlistItem}
                onAnalyzeWatchlist={handleAnalyzeWatchlist}
              />
            }
          />

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

          <Route
            path="/upload"
            element={
              <UploadPage
                onFileSelect={handleFileSelect}
                onLoadSample={handleLoadSample}
                samples={sampleDocuments}
              />
            }
          />

          <Route
            path="/results"
            element={
              <ResultsPage
                analysisResult={analysisResult}
                onAnalyzeNew={handleAnalyzeNew}
              />
            }
          />

          <Route
            path="/history"
            element={
              <HistoryPage
                history={filteredHistory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onView={handleUseResult}
                onClearHistory={handleResetHistory}
              />
            }
          />

          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

function DashboardPage({
  onLoadSample,
  onSelectWatchlist,
  selectedWatchlistItem,
  onAnalyzeWatchlist,
}: {
  onLoadSample: (sample: (typeof sampleDocuments)[number]) => void;
  onSelectWatchlist: (item: WatchlistItem) => void;
  selectedWatchlistItem: WatchlistItem | null;
  onAnalyzeWatchlist: (item: WatchlistItem) => void;
}) {
  return (
    <>
      <section className="hero-panel panel">
        <div>
          <p className="eyebrow secondary">AI-POWERED LEGAL REVIEW</p>

          <h3>Turn legal text into a clear action plan</h3>

          <p className="helper-copy">
            Review RBI, SEBI, and insurance updates in one local-first
            workspace built for fast demo delivery and stakeholder
            communication.
          </p>
        </div>

        <div className="hero-actions">
          <NavLink
            to="/analyzer"
            className="primary-button action-button"
          >
            Analyze a document
          </NavLink>

          <button
            className="ghost-button"
            type="button"
            onClick={() => onLoadSample(sampleDocuments[0])}
          >
            Load sample RBI notice
          </button>
        </div>
      </section>

      <section className="stats-grid">
        {overviewStats.map((stat) => (
          <article
            key={stat.label}
            className="stats-card"
            style={{ borderTop: `4px solid ${stat.accent}` }}
          >
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
              <button
                key={row.title}
                type="button"
                className="watch-row watch-row-button"
                onClick={() => onSelectWatchlist(row)}
              >
                <div>
                  <strong>{row.title}</strong>

                  <div className="meta-row">
                    <span>{row.regulator}</span>
                    <span>•</span>
                    <span>{row.owner}</span>
                  </div>
                </div>

                <div className="watch-right">
                  <span
                    className={`risk-badge ${row.risk.toLowerCase()}`}
                  >
                    {row.risk}
                  </span>

                  <span className="confidence-mini">
                    {row.confidence}% AI
                  </span>
                </div>
              </button>
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

      {selectedWatchlistItem && (
        <section className="panel watch-detail-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow secondary">REGULATORY INTELLIGENCE</p>
              <h3>{selectedWatchlistItem.title}</h3>
            </div>

            <button
              type="button"
              className="ghost-button small"
              onClick={() => onSelectWatchlist(null as never)}
            >
              Close
            </button>
          </div>

          <div className="watch-detail-top">
            <div className="watch-detail-risk">
              <span className="mini-label">AI risk assessment</span>

              <strong>{selectedWatchlistItem.risk}</strong>

              <span>
                {selectedWatchlistItem.confidence}% confidence
              </span>
            </div>

            <div className="watch-detail-kpi">
              <span>Regulator</span>
              <strong>{selectedWatchlistItem.regulator}</strong>
            </div>

            <div className="watch-detail-kpi">
              <span>Owner</span>
              <strong>{selectedWatchlistItem.owner}</strong>
            </div>

            <div className="watch-detail-kpi">
              <span>Effective</span>
              <strong>{selectedWatchlistItem.effectiveDate}</strong>
            </div>
          </div>

          <div className="watch-detail-grid">
            <div>
              <h4>Compliance impact</h4>
              <p>{selectedWatchlistItem.impact}</p>
            </div>

            <div>
              <h4>Detected regulatory changes</h4>

              <ul className="info-list compact">
                {selectedWatchlistItem.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Recommended actions</h4>

              <ul className="info-list compact">
                {selectedWatchlistItem.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="watch-detail-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onAnalyzeWatchlist(selectedWatchlistItem)}
            >
              Run AI Analysis
            </button>

            <NavLink
              to="/analyzer"
              className="ghost-button"
            >
              Open Analyzer
            </NavLink>
          </div>
        </section>
      )}

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">DOCUMENTS</p>
            <h3>Recent uploads</h3>
          </div>

          <button
            className="ghost-button small"
            type="button"
            onClick={() => onLoadSample(sampleDocuments[0])}
          >
            View sample
          </button>
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
                <td>
                  <strong>{doc.name}</strong>
                </td>

                <td>{doc.type}</td>
                <td>{doc.updated}</td>

                <td>
                  <span className="status-pill review">
                    {doc.status}
                  </span>
                </td>
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

          <p className="helper-copy">
            Paste text, upload a document, or load a saved sample to assess
            obligations, compliance gaps, probability, and operational impact.
          </p>
        </div>

        <div className="action-stack-inline">
          <button
            className="primary-button"
            type="button"
            onClick={onAnalyze}
            disabled={!canAnalyze || isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Law'}
          </button>

          <button
            className="ghost-button"
            type="button"
            onClick={onClear}
          >
            Clear
          </button>
        </div>
      </section>

      {isAnalyzing && (
        <section className="panel loading-panel">
          <div className="loading-head">
            <div>
              <p className="eyebrow secondary">AI PROCESSING</p>
              <h3>Scanning legal text for compliance signals</h3>
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

            <span className="badge soft">Local processing</span>
          </div>

          <label className="upload-label">
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.html,.rtf,.doc,.docx"
              onChange={onFileSelect}
            />

            <span>
              {selectedFileName
                ? `Loaded: ${selectedFileName}`
                : 'Upload text document'}
            </span>
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
              <p className="eyebrow secondary">AI DETECTION</p>
              <h3>Detected signals</h3>
            </div>
          </div>

          <div className="signal-stack">
            <div className="signal-card">
              <span className="signal-label">Risk level</span>
              <strong>
                {analysisResult?.priority ?? 'Pending'}
              </strong>
            </div>

            <div className="signal-card">
              <span className="signal-label">AI confidence</span>
              <strong>
                {analysisResult
                  ? `${analysisResult.confidence}%`
                  : 'Pending'}
              </strong>
            </div>

            <div className="signal-card">
              <span className="signal-label">Compliance score</span>
              <strong>
                {analysisResult
                  ? `${analysisResult.complianceScore}%`
                  : 'Pending'}
              </strong>
            </div>

            <div className="signal-card">
              <span className="signal-label">Potential gaps</span>
              <strong>
                {analysisResult
                  ? analysisResult.findings.length
                  : 'Pending'}
              </strong>
            </div>
          </div>

          <div className="sample-list">
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className="sample-button"
                onClick={() => onLoadSample(sample)}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </article>
      </section>

      {!analysisResult && !isAnalyzing && (
        <section className="panel empty-state-panel">
          <h3>Ready for AI legal analysis</h3>

          <p>
            Load a sample notice or paste legal text. The local analysis
            engine will identify regulatory signals, risk level, confidence,
            compliance gaps, and recommended actions.
          </p>

          <div className="empty-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => onLoadSample(samples[0])}
            >
              Load sample RBI document
            </button>

            <button
              type="button"
              className="ghost-button"
              onClick={() => onTextChange(defaultLawText)}
            >
              Use default sample text
            </button>
          </div>
        </section>
      )}

      {analysisResult && (
        <section className="results-section">
          <section className="panel result-summary">
            <div className="summary-header">
              <div>
                <p className="eyebrow secondary">AI ANALYSIS RESULTS</p>
                <h3>{analysisResult.lawTitle}</h3>
              </div>

              <span
                className={`badge ${
                  analysisResult.priority === 'Critical' ||
                  analysisResult.priority === 'High'
                    ? 'danger'
                    : 'neutral'
                }`}
              >
                {analysisResult.priority} risk
              </span>
            </div>

            <div className="score-row">
              <div className="score-ring">
                <strong>{analysisResult.confidence}</strong>
                <span>AI confidence</span>
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
                  <span>Findings</span>
                  <strong>{analysisResult.findings.length}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="panel panel-large">
            <div className="panel-header">
              <div>
                <p className="eyebrow secondary">AI RISK ENGINE</p>
                <h3>Potential compliance problems</h3>
              </div>

              <span className="badge danger">
                {analysisResult.findings.length} detected
              </span>
            </div>

            <div className="findings-list">
              {analysisResult.findings.map((finding, index) => (
                <article
                  className="finding-card"
                  key={finding.title}
                >
                  <div className="finding-number">
                    {index + 1}
                  </div>

                  <div className="finding-content">
                    <div className="finding-heading">
                      <div>
                        <span className="mini-label">
                          {finding.severity} severity
                        </span>

                        <h4>{finding.title}</h4>
                      </div>

                      <strong>{finding.probability}%</strong>
                    </div>

                    <div className="probability-bar">
                      <span
                        style={{
                          width: `${finding.probability}%`,
                        }}
                      />
                    </div>

                    <p>{finding.description}</p>

                    <div className="finding-action">
                      <span>Recommended action</span>
                      <strong>{finding.action}</strong>
                    </div>
                  </div>
                </article>
              ))}
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

              <p className="plain-summary">
                {analysisResult.summary}
              </p>
            </article>

            <article className="panel">
              <div className="panel-header">
                <div>
                  <p className="eyebrow secondary">FRAMEWORK</p>
                  <h3>Regulatory overview</h3>
                </div>
              </div>

              <div className="detail-list">
                <div>
                  <span>Issuing authority</span>
                  <strong>{analysisResult.issuingAuthority}</strong>
                </div>

                <div>
                  <span>Applicability</span>
                  <strong>{analysisResult.applicability}</strong>
                </div>

                <div>
                  <span>Effective date</span>
                  <strong>{analysisResult.effectiveDate}</strong>
                </div>

                <div>
                  <span>AI confidence</span>
                  <strong>{analysisResult.confidence}%</strong>
                </div>
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
                  {analysisResult.importantDates.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-card">
                <h4>Key requirements</h4>

                <ul>
                  {analysisResult.keyRequirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-card">
                <h4>Obligations</h4>

                <ul>
                  {analysisResult.obligations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-card">
                <h4>Penalties / risks</h4>

                <ul>
                  {analysisResult.penalties.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-card">
                <h4>Important clauses</h4>

                <ul>
                  {analysisResult.importantClauses.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-card">
                <h4>Compliance actions</h4>

                <ul>
                  {analysisResult.complianceActions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="analysis-card full-span">
                <h4>Affected departments</h4>

                <div className="tag-row">
                  {analysisResult.affectedDepartments.map((item) => (
                    <span key={item} className="tag">
                      {item}
                    </span>
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

function UploadPage({
  onFileSelect,
  onLoadSample,
  samples,
}: {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadSample: (sample: (typeof sampleDocuments)[number]) => void;
  samples: typeof sampleDocuments;
}) {
  return (
    <>
      <section className="panel upload-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">UPLOAD</p>
            <h3>Law document intake</h3>
          </div>
        </div>

        <label className="upload-box">
          <input
            id="upload-document-input"
            type="file"
            accept=".txt,.md,.csv,.json,.html,.rtf,.doc,.docx"
            onChange={onFileSelect}
          />

          <div className="upload-inner">
            <span className="upload-icon">⇪</span>

            <strong>
              Drag and drop a regulation, notification, or circular
            </strong>

            <p>Text-based local files supported for frontend analysis</p>
          </div>
        </label>
      </section>

      <section className="content-grid">
        {samples.map((doc) => (
          <article key={doc.id} className="panel doc-card">
            <div className="doc-head">
              <div>
                <p className="eyebrow secondary">
                  {doc.description}
                </p>

                <h4>{doc.label}</h4>
              </div>

              <span className="badge neutral">demo</span>
            </div>

            <div className="tag-row">
              <span className="tag">Regulatory</span>
              <span className="tag">Compliance</span>
              <span className="tag">Local</span>
            </div>

            <button
              type="button"
              className="primary-button small-button"
              onClick={() => onLoadSample(doc)}
            >
              Load sample
            </button>
          </article>
        ))}
      </section>
    </>
  );
}

function ResultsPage({
  analysisResult,
  onAnalyzeNew,
}: {
  analysisResult: AnalysisResult | null;
  onAnalyzeNew: () => void;
}) {
  const result = analysisResult ?? inferAnalysis(defaultLawText);

  return (
    <div className="results-dashboard">
      <section className="panel result-summary">
        <div className="summary-header">
          <div>
            <p className="eyebrow secondary">
              AI LEGAL INTELLIGENCE
            </p>

            <h3>{result.lawTitle}</h3>
          </div>

          <span
            className={`severity-pill ${result.priority.toLowerCase()}`}
          >
            {result.priority} risk
          </span>
        </div>

        <div className="overview-grid">
          <div className="score-card panel-soft">
            <span className="mini-label">
              AI confidence
            </span>

            <div className="score-wrap">
              <div
                className="score-ring large"
                style={{
                  background: `conic-gradient(#d14f4f 0 ${result.confidence}%, #edf1f7 ${result.confidence}% 100%)`,
                }}
              >
                <strong>{result.confidence}</strong>
              </div>

              <div className="score-copy">
                <p>Confidence</p>
                <strong>{result.confidence}%</strong>
                <small>Local analysis engine</small>
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
              <span>Compliance score</span>
              <strong>{result.complianceScore}%</strong>
            </div>

            <div className="kpi-row">
              <span>Potential gaps</span>
              <strong>{result.findings.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">PROBABILITY ASSESSMENT</p>
            <h3>Potential compliance problems</h3>
          </div>
        </div>

        <div className="findings-list">
          {result.findings.map((finding, index) => (
            <article
              className="finding-card"
              key={finding.title}
            >
              <div className="finding-number">
                {index + 1}
              </div>

              <div className="finding-content">
                <div className="finding-heading">
                  <div>
                    <span className="mini-label">
                      {finding.severity} severity
                    </span>

                    <h4>{finding.title}</h4>
                  </div>

                  <strong>{finding.probability}%</strong>
                </div>

                <div className="probability-bar">
                  <span
                    style={{
                      width: `${finding.probability}%`,
                    }}
                  />
                </div>

                <p>{finding.description}</p>

                <div className="finding-action">
                  <span>Recommended action</span>
                  <strong>{finding.action}</strong>
                </div>
              </div>
            </article>
          ))}
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
              <span>Compliance readiness</span>
              <strong>{result.complianceScore}%</strong>
            </div>

            <div className="progress-bar">
              <span
                style={{
                  width: `${result.complianceScore}%`,
                }}
              />
            </div>
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
              <p className="eyebrow secondary">
                IMPORTANT DEADLINES
              </p>
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
              <p className="eyebrow secondary">
                AFFECTED BUSINESS AREAS
              </p>
              <h3>Impact map</h3>
            </div>
          </div>

          <div className="impact-list compact">
            {result.affectedDepartments.map((department) => (
              <div key={department}>
                <span>{department}</span>
                <strong>{result.priority}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">
              OBLIGATIONS & RISKS
            </p>

            <h3>Operational impact</h3>
          </div>
        </div>

        <div className="split-grid">
          <div>
            <h4>Obligations</h4>

            <ul className="data-list">
              {result.obligations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Risks and penalties</h4>

            <ul className="data-list warn-list">
              {result.penalties.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">
              RECOMMENDED ACTIONS
            </p>

            <h3>Priority remediation plan</h3>
          </div>
        </div>

        <div className="action-grid">
          {result.complianceActions.map((item, index) => (
            <div className="action-item" key={item}>
              <span className="bullet" />

              <div>
                <strong>
                  {
                    [
                      'Update policies',
                      'Strengthen controls',
                      'Review vendors',
                      'Track remediation',
                    ][index % 4]
                  }
                </strong>

                <p>{item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel panel-large">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">
              CLAUSE-BY-CLAUSE
            </p>

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
            {result.clauseBreakdown.map((clause) => (
              <tr key={clause.section}>
                <td>
                  <strong>{clause.section}</strong>
                </td>

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
            <p className="eyebrow secondary">
              SOURCE / DOCUMENT
            </p>

            <h3>Reference information</h3>
          </div>
        </div>

        <div className="source-grid">
          <div className="source-item">
            <span>Source</span>
            <strong>{result.sourceLabel}</strong>
          </div>

          <div className="source-item">
            <span>Applicability</span>
            <strong>{result.applicability}</strong>
          </div>

          <div className="source-item">
            <span>AI confidence</span>
            <strong>{result.confidence}%</strong>
          </div>
        </div>
      </section>

      <div className="result-actions">
        <button
          type="button"
          className="primary-button action-button"
          onClick={onAnalyzeNew}
        >
          Analyze Another Document
        </button>

        <NavLink
          to="/"
          className="ghost-button action-button"
        >
          Back to Dashboard
        </NavLink>
      </div>
    </div>
  );
}

function HistoryPage({
  history,
  searchTerm,
  onSearchChange,
  onView,
  onClearHistory,
}: {
  history: AnalysisEntry[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onView: (entry: AnalysisEntry) => void;
  onClearHistory: () => void;
}) {
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

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Filter documents, authorities, or keywords"
            aria-label="Filter analysis history"
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow secondary">RECENT</p>
            <h3>Saved analysis</h3>
          </div>

          <button
            className="ghost-button small"
            type="button"
            onClick={onClearHistory}
          >
            Clear history
          </button>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <h4>No saved analysis yet</h4>

            <p>
              Run a legal review and it will appear here.
            </p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="history-row history-row-clickable"
              >
                <div>
                  <strong>{entry.title}</strong>

                  <span>{entry.authority}</span>

                  <small>
                    {entry.source} •{' '}
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <div className="history-actions">
                  <span
                    className={`risk-badge ${entry.priority.toLowerCase()}`}
                  >
                    {entry.priority}
                  </span>

                  <button
                    type="button"
                    className="ghost-button small"
                    onClick={() => onView(entry)}
                  >
                    View
                  </button>
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

  const toggleSetting = (
    key: keyof typeof settings,
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key],
    }));
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

                  <p>
                    Keep your legal review workflow aligned with
                    current operating requirements.
                  </p>
                </div>

                <button
                  className={`toggle ${
                    settings[key as keyof typeof settings]
                      ? 'on'
                      : 'off'
                  }`}
                  onClick={() =>
                    toggleSetting(
                      key as keyof typeof settings,
                    )
                  }
                  type="button"
                >
                  {settings[key as keyof typeof settings]
                    ? 'On'
                    : 'Off'}
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
            <p>
              Law Analyzer is a lightweight legal-tech workspace
              for reviewing regulatory notices, statutes,
              notifications, and circulars in a structured format.
            </p>

            <p>
              Built for local-first analysis with a professional
              SaaS experience suitable for hackathon demos and
              early-stage product validation.
            </p>
          </div>

          <div className="about-meta">
            <div>
              <span>Version</span>
              <strong>0.2.0</strong>
            </div>

            <div>
              <span>Mode</span>
              <strong>Local AI prototype</strong>
            </div>

            <div>
              <span>Data</span>
              <strong>Local only</strong>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

export default function App() {
  return <AppShell />;
}	