import React, { useState } from 'react';
import type { ShellAppProps } from 'shell';
import { AppLayout } from 'shell';

type Page =
  | 'dashboard'
  | 'regulatory'
  | 'policies'
  | 'controls'
  | 'tickets'
  | 'audit'
  | 'reports'
  | 'profile'
  | 'settings';

type Risk = 'Critical' | 'High' | 'Medium';
type Status = 'Needs review' | 'In progress' | 'Approved' | 'Rejected' | 'Ready';

type AuditEvent = {
  timestamp: string;
  action: string;
  oldStatus: string;
  newStatus: string;
  actor: string;
};

type Change = {
  id: string;
  title: string;
  regulator: string;
  category: string;
  policy: string;
  control: string;
  severity: Risk;
  deadline: string;
  owner: string;
  action: string;
  status: Status;
  complianceApproved?: boolean;
  audit: AuditEvent[];
};

type Ticket = {
  id: string;
  changeId: string;
  title: string;
  owner: string;
  priority: Risk;
  dueDate: string;
  status: 'Open';
  action: string;
};

const initialChanges: Change[] = [
  {
    id: 'RBI-KYC-001',
    title: 'KYC / Customer Due Diligence Update',
    regulator: 'Reserve Bank of India (RBI)',
    category: 'India / KYC and AML',
    policy: 'Customer Acceptance and KYC Policy',
    control: 'Periodic KYC refresh and beneficial-owner review',
    severity: 'Critical',
    deadline: '18 Sep 2026',
    owner: 'KYC / AML',
    action: 'Confirm risk-based CDD changes and branch rollout plan',
    status: 'Needs review',
    audit: [],
  },
  {
    id: 'RBI-DL-002',
    title: 'Digital Lending Requirements Review',
    regulator: 'Reserve Bank of India (RBI)',
    category: 'India / Digital Lending',
    policy: 'Digital Lending and Outsourcing Policy',
    control: 'LSP due diligence and borrower disclosure checklist',
    severity: 'High',
    deadline: '04 Oct 2026',
    owner: 'Risk',
    action: 'Validate lending-partner inventory and key fact statement evidence',
    status: 'In progress',
    audit: [],
  },
  {
    id: 'RBI-CYBER-003',
    title: 'Cyber Security / IT Risk Requirements',
    regulator: 'Reserve Bank of India (RBI)',
    category: 'India / IT and Cyber Risk',
    policy: 'Information Security and IT Risk Policy',
    control: 'Critical asset monitoring and cyber incident escalation',
    severity: 'High',
    deadline: '22 Oct 2026',
    owner: 'Information Security',
    action: 'Gap-assess SOC monitoring, incident playbooks, and board reporting',
    status: 'Needs review',
    audit: [],
  },
  {
    id: 'RBI-UPI-004',
    title: 'Payment Systems / UPI Control Review',
    regulator: 'Reserve Bank of India (RBI)',
    category: 'India / Payments and UPI',
    policy: 'Payments Operations and UPI Policy',
    control: 'UPI transaction monitoring and customer dispute handling',
    severity: 'Medium',
    deadline: '09 Nov 2026',
    owner: 'Payments',
    action: 'Publish updated exception matrix and reconcile dispute SLAs',
    status: 'Ready',
    complianceApproved: true,
    audit: [],
  },
];

const owners = [
  'Compliance',
  'KYC / AML',
  'Risk',
  'Information Security',
  'IT',
  'Payments',
  'Legal',
  'Operations',
];

const policies = [
  'Customer Acceptance and KYC Policy',
  'Digital Lending and Outsourcing Policy',
  'Information Security and IT Risk Policy',
  'Payments Operations and UPI Policy',
];

const css: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    background: '#f3f5f7',
    color: '#172536',
    fontFamily: 'Segoe UI, Arial, sans-serif',
  },

  layout: {
    display: 'flex',
    minHeight: '100vh',
  },

  sidebar: {
    width: 235,
    flexShrink: 0,
    background: '#10263d',
    color: '#dbe6ef',
    padding: 20,
    boxSizing: 'border-box',
  },

  brand: {
    padding: '8px 8px 22px',
    borderBottom: '1px solid rgba(255,255,255,.15)',
    marginBottom: 15,
  },

  brandTitle: {
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '.04em',
  },

  brandSub: {
    display: 'block',
    marginTop: 5,
    color: '#91a9bc',
    fontSize: 11,
  },

  navLabel: {
    color: '#718da5',
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '.12em',
    margin: '18px 8px 7px',
  },

  navButton: {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    marginBottom: 3,
    border: '1px solid transparent',
    borderRadius: 4,
    background: 'transparent',
    color: '#c9d7e2',
    textAlign: 'left',
    font: 'inherit',
    fontSize: 13,
    cursor: 'pointer',
  },

  navActive: {
    background: '#214765',
    borderColor: '#356887',
    color: '#fff',
    fontWeight: 700,
  },

  main: {
    minWidth: 0,
    flex: 1,
  },

  header: {
    height: 65,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    padding: '0 30px',
    background: '#fff',
    borderBottom: '1px solid #d8e0e7',
  },

  search: {
    width: 260,
    padding: '9px 11px',
    border: '1px solid #c4d0da',
    borderRadius: 4,
    font: 'inherit',
  },

  page: {
    maxWidth: 1450,
    margin: '0 auto',
    padding: '32px 35px 60px',
  },

  eyebrow: {
    color: '#536f87',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
  },

  h1: {
    margin: '7px 0 5px',
    fontSize: 29,
    color: '#17324d',
  },

  sub: {
    margin: 0,
    color: '#536476',
    fontSize: 14,
  },

  banner: {
    marginTop: 20,
    padding: 12,
    background: '#edf4f8',
    border: '1px solid #c6d3df',
    borderLeft: '3px solid #315d7d',
    color: '#3e566b',
    fontSize: 12,
  },

  kpis: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(150px, 1fr))',
    gap: 12,
    marginTop: 22,
  },

  card: {
    background: '#fff',
    border: '1px solid #d3dce4',
    borderRadius: 4,
  },

  kpi: {
    padding: 18,
  },

  kpiValue: {
    display: 'block',
    fontSize: 26,
    fontWeight: 800,
    color: '#17324d',
  },

  kpiLabel: {
    display: 'block',
    marginTop: 5,
    color: '#536476',
    fontSize: 10,
    fontWeight: 800,
    textTransform: 'uppercase',
  },

  section: {
    marginTop: 30,
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
    marginBottom: 12,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 18,
    color: '#17324d',
  },

  filters: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },

  filter: {
    padding: '7px 12px',
    background: '#fff',
    border: '1px solid #c4d0da',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 12,
  },

  filterActive: {
    background: '#173f62',
    color: '#fff',
    borderColor: '#173f62',
  },

  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.3fr 1.5fr 90px 110px 120px 110px',
    gap: 10,
    padding: '10px 14px',
    background: '#f7f9fb',
    borderBottom: '1px solid #d3dce4',
    color: '#536476',
    fontSize: 10,
    fontWeight: 800,
    textTransform: 'uppercase',
  },

  row: {
    display: 'grid',
    gridTemplateColumns: '2fr 1.3fr 1.5fr 90px 110px 120px 110px',
    gap: 10,
    alignItems: 'center',
    width: '100%',
    padding: '14px',
    border: 0,
    borderBottom: '1px solid #e2e7eb',
    background: '#fff',
    textAlign: 'left',
    font: 'inherit',
    cursor: 'pointer',
  },

  cell: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 12,
  },

  title: {
    color: '#17324d',
    fontWeight: 800,
    fontSize: 13,
  },

  muted: {
    display: 'block',
    marginTop: 4,
    color: '#718090',
    fontSize: 11,
  },

  badge: {
    display: 'inline-block',
    padding: '4px 7px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 800,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
    marginTop: 18,
  },

  item: {
    padding: 17,
    background: '#fff',
    border: '1px solid #d3dce4',
    borderRadius: 4,
  },

  label: {
    color: '#536476',
    fontSize: 10,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '.07em',
  },

  value: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 1.5,
  },

  button: {
    padding: '9px 13px',
    background: '#173f62',
    color: '#fff',
    border: '1px solid #173f62',
    borderRadius: 4,
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
  },

  secondary: {
    background: '#fff',
    color: '#315d7d',
    borderColor: '#aebdca',
  },

  danger: {
    background: '#fff',
    color: '#9b3e3b',
    borderColor: '#d6aaa8',
  },

  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },

  drawerShade: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(12,27,42,.35)',
  },

  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 'min(700px, 94vw)',
    height: '100%',
    overflowY: 'auto',
    background: '#fff',
    boxShadow: '-8px 0 25px rgba(0,0,0,.2)',
  },

  drawerHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 15,
    padding: 22,
    background: '#17324d',
    color: '#fff',
  },

  drawerBody: {
    padding: 22,
    display: 'grid',
    gap: 18,
  },

  chain: {
    border: '1px solid #cbd5df',
  },

  chainItem: {
    padding: 12,
    background: '#f7f9fb',
    borderBottom: '1px solid #dbe2e8',
  },

  form: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    background: '#f7f9fb',
    border: '1px solid #d3dce4',
  },

  select: {
    padding: '8px 10px',
    border: '1px solid #aebdca',
    borderRadius: 4,
    background: '#fff',
  },

  empty: {
    padding: 35,
    textAlign: 'center',
    color: '#536476',
  },
};

const severityStyle = (risk: Risk): React.CSSProperties => {
  if (risk === 'Critical') {
    return { background: '#f8e8e7', color: '#9b3e3b' };
  }

  if (risk === 'High') {
    return { background: '#fbf1df', color: '#8b651e' };
  }

  return { background: '#e9f1f6', color: '#315d7d' };
};

const statusStyle = (status: Status): React.CSSProperties => {
  if (status === 'Ready') {
    return { background: '#e4f2eb', color: '#22694f' };
  }

  if (status === 'Rejected') {
    return { background: '#f8e8e7', color: '#9b3e3b' };
  }

  if (status === 'Needs review') {
    return { background: '#fbf1df', color: '#8b651e' };
  }

  return { background: '#e8f0f7', color: '#315d7d' };
};

const App: React.FC<ShellAppProps> = () => {
  const [page, setPage] = useState<Page>('dashboard');
  const [changes, setChanges] = useState<Change[]>(initialChanges);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [regulator, setRegulator] = useState('ALL');
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState('');

  const selected =
    changes.find((change) => change.id === selectedId) ?? null;

  const filtered = changes.filter((change) => {
    const matchesRegulator =
      regulator === 'ALL' || change.regulator.includes(regulator);

    const text =
      `${change.title} ${change.category} ${change.policy} ${change.owner}`.toLowerCase();

    return matchesRegulator && text.includes(search.toLowerCase());
  });

  const now = () =>
    new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const updateChange = (
    id: string,
    action: string,
    update: Partial<Change>,
    status?: Status,
  ) => {
    setChanges((current) =>
      current.map((change) => {
        if (change.id !== id) return change;

        const nextStatus = status ?? change.status;

        return {
          ...change,
          ...update,
          status: nextStatus,
          audit: [
            ...change.audit,
            {
              timestamp: now(),
              action,
              oldStatus: change.status,
              newStatus: nextStatus,
              actor: 'Demo Compliance Officer',
            },
          ],
        };
      }),
    );
  };

  const openChange = (id: string) => {
    setSelectedId(id);
    setShowAI(false);
    setOwnerDraft('');
  };

  const closeDrawer = () => {
    setSelectedId(null);
    setShowAI(false);
  };

  const approve = () => {
    if (!selected) return;

    updateChange(
      selected.id,
      'Approve Change',
      { complianceApproved: true },
      'Approved',
    );
  };

  const reject = () => {
    if (!selected) return;

    updateChange(
      selected.id,
      'Reject Change',
      { complianceApproved: false },
      'Rejected',
    );
  };

  const review = () => {
    if (!selected) return;

    updateChange(selected.id, 'Review Change', {}, 'In progress');
  };

  const markReady = () => {
    if (!selected || !selected.complianceApproved) return;

    updateChange(selected.id, 'Mark Ready', {}, 'Ready');
  };

  const runAI = () => {
    setShowAI(true);
    setAiLoading(true);

    window.setTimeout(() => {
      setAiLoading(false);
    }, 700);
  };

  const saveOwner = () => {
    if (!selected || !ownerDraft) return;

    updateChange(
      selected.id,
      'Assign Owner',
      { owner: ownerDraft },
      selected.status,
    );

    setOwnerDraft('');
  };

  const createTicket = () => {
    if (!selected) return;

    const alreadyExists = tickets.some(
      (ticket) => ticket.changeId === selected.id,
    );

    if (alreadyExists) return;

    const ticket: Ticket = {
      id: `CCR-${String(tickets.length + 1).padStart(3, '0')}`,
      changeId: selected.id,
      title: selected.title,
      owner: selected.owner,
      priority: selected.severity,
      dueDate: selected.deadline,
      status: 'Open',
      action: selected.action,
    };

    setTickets((current) => [...current, ticket]);

    updateChange(
      selected.id,
      'Create Action / Ticket',
      {},
      selected.status,
    );
  };

  const navigate = (next: Page) => {
    setPage(next);
    closeDrawer();
  };

  const navigation = [
    {
      group: 'WORKSPACE',
      items: [
        ['dashboard', 'Dashboard'],
        ['regulatory', 'Regulatory Intelligence'],
        ['policies', 'Policies'],
        ['controls', 'Controls'],
        ['tickets', 'Actions & Tickets'],
        ['audit', 'Audit Trail'],
        ['reports', 'Reports'],
      ] as [Page, string][],
    },
    {
      group: 'ACCOUNT',
      items: [
        ['profile', 'Profile'],
        ['settings', 'Settings'],
      ] as [Page, string][],
    },
  ];

  const renderTable = () => {
    if (filtered.length === 0) {
      return (
        <div style={{ ...css.card, ...css.empty }}>
          No regulatory signals found.
        </div>
      );
    }

    return (
      <div style={css.card}>
        <div style={css.tableHeader}>
          <span>Regulatory Change</span>
          <span>Regulator</span>
          <span>Policy</span>
          <span>Severity</span>
          <span>Deadline</span>
          <span>Owner</span>
          <span>Status</span>
        </div>

        {filtered.map((change) => (
          <button
            type="button"
            key={change.id}
            style={css.row}
            onClick={() => openChange(change.id)}
          >
            <span style={{ ...css.cell, ...css.title }}>
              {change.title}
              <span style={css.muted}>{change.id}</span>
            </span>

            <span style={css.cell}>{change.regulator}</span>

            <span style={css.cell}>{change.policy}</span>

            <span style={css.cell}>
              <span
                style={{
                  ...css.badge,
                  ...severityStyle(change.severity),
                }}
              >
                {change.severity}
              </span>
            </span>

            <span style={css.cell}>{change.deadline}</span>

            <span style={css.cell}>{change.owner}</span>

            <span style={css.cell}>
              <span
                style={{
                  ...css.badge,
                  ...statusStyle(change.status),
                }}
              >
                {change.status}
              </span>
            </span>
          </button>
        ))}
      </div>
    );
  };

  const renderDashboard = () => (
    <>
      <div style={css.eyebrow}>India · Demo / Mock Data</div>

      <h1 style={css.h1}>Compliance Change Radar</h1>

      <p style={css.sub}>
        Regulatory Intelligence & Compliance Operations
      </p>

      <div style={css.banner}>
        Demo / Mock Data — Illustrative banking compliance records.
        Not real current RBI notifications.
      </div>

      <div style={css.kpis}>
        <div style={{ ...css.card, ...css.kpi }}>
          <span style={css.kpiValue}>
            {changes.filter((c) => c.status !== 'Ready').length}
          </span>
          <span style={css.kpiLabel}>Open Signals</span>
        </div>

        <div style={{ ...css.card, ...css.kpi }}>
          <span style={css.kpiValue}>
            {changes.filter((c) => c.status === 'Needs review').length}
          </span>
          <span style={css.kpiLabel}>Need Review</span>
        </div>

        <div style={{ ...css.card, ...css.kpi }}>
          <span style={css.kpiValue}>
            {changes.filter((c) => c.severity === 'Critical').length}
          </span>
          <span style={css.kpiLabel}>Critical</span>
        </div>

        <div style={{ ...css.card, ...css.kpi }}>
          <span style={css.kpiValue}>92%</span>
          <span style={css.kpiLabel}>Compliance Coverage</span>
        </div>
      </div>

      <div style={css.section}>
        <div style={css.sectionHeader}>
          <h2 style={css.sectionTitle}>Regulatory Intelligence</h2>

          <div style={css.filters}>
            {['ALL', 'RBI', 'SEBI', 'IRDAI'].map((item) => (
              <button
                type="button"
                key={item}
                style={{
                  ...css.filter,
                  ...(regulator === item ? css.filterActive : {}),
                }}
                onClick={() => setRegulator(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {renderTable()}
      </div>

      <div style={css.grid}>
        <div style={css.item}>
          <div style={css.label}>Upcoming Deadlines</div>

          <div style={css.value}>
            {changes.slice(0, 3).map((change) => (
              <div key={change.id} style={{ marginBottom: 8 }}>
                <strong>{change.deadline}</strong>
                <span style={css.muted}>{change.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={css.item}>
          <div style={css.label}>Recent Activity</div>

          <div style={css.value}>
            Regulatory scan completed
            <span style={css.muted}>
              Demo Compliance Officer · Today
            </span>
          </div>
        </div>

        <div style={css.item}>
          <div style={css.label}>Compliance Health</div>

          <div
            style={{
              ...css.value,
              color: '#22694f',
              fontWeight: 800,
            }}
          >
            Healthy · 92% coverage
          </div>
        </div>
      </div>
    </>
  );

  const renderRegulatory = () => (
    <>
      <div style={css.eyebrow}>Command Center</div>

      <h1 style={css.h1}>Regulatory Intelligence</h1>

      <p style={css.sub}>
        Review regulatory obligations mapped to bank controls.
      </p>

      <div style={{ ...css.filters, marginTop: 20 }}>
        {['ALL', 'RBI', 'SEBI', 'IRDAI'].map((item) => (
          <button
            type="button"
            key={item}
            style={{
              ...css.filter,
              ...(regulator === item ? css.filterActive : {}),
            }}
            onClick={() => setRegulator(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 15 }}>{renderTable()}</div>
    </>
  );

  const renderPolicies = () => (
    <>
      <div style={css.eyebrow}>Governance Library</div>

      <h1 style={css.h1}>Policies</h1>

      <p style={css.sub}>
        Policies currently mapped to regulatory requirements.
      </p>

      <div style={css.grid}>
        {policies.map((policy) => {
          const mapped = changes.filter(
            (change) => change.policy === policy,
          );

          return (
            <button
              type="button"
              key={policy}
              style={{
                ...css.item,
                textAlign: 'left',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (mapped[0]) openChange(mapped[0].id);
              }}
            >
              <div style={css.label}>Policy</div>

              <div style={css.value}>
                {policy}

                <span style={css.muted}>
                  {mapped.length} mapped regulatory change
                  {mapped.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );

  const renderControls = () => (
    <>
      <div style={css.eyebrow}>Control Framework</div>

      <h1 style={css.h1}>Controls</h1>

      <p style={css.sub}>
        Regulatory requirements mapped to operational controls.
      </p>

      <div style={{ ...css.card, marginTop: 20 }}>
        {changes.map((change) => (
          <button
            type="button"
            key={change.id}
            style={{
              ...css.row,
              gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
            }}
            onClick={() => openChange(change.id)}
          >
            <span style={{ ...css.cell, ...css.title }}>
              {change.control}
            </span>

            <span style={css.cell}>{change.owner}</span>

            <span style={css.cell}>{change.policy}</span>

            <span style={css.cell}>
              <span
                style={{
                  ...css.badge,
                  ...statusStyle(change.status),
                }}
              >
                {change.status}
              </span>
            </span>
          </button>
        ))}
      </div>
    </>
  );

  const renderTickets = () => (
    <>
      <div style={css.eyebrow}>Work Queue</div>

      <h1 style={css.h1}>Actions & Tickets</h1>

      <p style={css.sub}>
        Track compliance actions generated from regulatory changes.
      </p>

      <div style={{ marginTop: 20 }}>
        {tickets.length === 0 ? (
          <div style={{ ...css.card, ...css.empty }}>
            No action tickets have been created yet.
            <br />
            Open a regulatory change and click
            <strong> Create Action / Ticket</strong>.
          </div>
        ) : (
          <div style={css.card}>
            {tickets.map((ticket) => (
              <button
                type="button"
                key={ticket.id}
                style={{
                  ...css.row,
                  gridTemplateColumns: '100px 2fr 1fr 100px 120px 100px',
                }}
                onClick={() => openChange(ticket.changeId)}
              >
                <span style={{ ...css.cell, ...css.title }}>
                  {ticket.id}
                </span>

                <span style={css.cell}>{ticket.title}</span>

                <span style={css.cell}>{ticket.owner}</span>

                <span style={css.cell}>{ticket.priority}</span>

                <span style={css.cell}>{ticket.dueDate}</span>

                <span style={css.cell}>{ticket.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderAudit = () => {
    const events = changes.flatMap((change) =>
      change.audit.map((event) => ({
        ...event,
        changeTitle: change.title,
      })),
    );

    return (
      <>
        <div style={css.eyebrow}>Evidence Log</div>

        <h1 style={css.h1}>Audit Trail</h1>

        <p style={css.sub}>
          Every review, approval, assignment and ticket action is recorded.
        </p>

        <div style={{ marginTop: 20 }}>
          {events.length === 0 ? (
            <div style={{ ...css.card, ...css.empty }}>
              No actions recorded yet.
              <br />
              Perform an action on a regulatory change to see it here.
            </div>
          ) : (
            <div style={css.card}>
              {events.map((event, index) => (
                <div
                  key={index}
                  style={{
                    padding: 16,
                    borderBottom: '1px solid #e1e6eb',
                  }}
                >
                  <strong>
                    {event.timestamp} · {event.action}
                  </strong>

                  <span style={css.muted}>
                    {event.changeTitle} · {event.actor} ·{' '}
                    {event.oldStatus} → {event.newStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderReports = () => (
    <>
      <div style={css.eyebrow}>Management View</div>

      <h1 style={css.h1}>Reports</h1>

      <p style={css.sub}>
        High-level compliance management metrics.
      </p>

      <div style={css.grid}>
        <div style={css.item}>
          <div style={css.label}>Compliance Coverage</div>
          <div style={css.value}>
            <strong style={{ fontSize: 28 }}>92%</strong>
          </div>
        </div>

        <div style={css.item}>
          <div style={css.label}>Open Issues</div>
          <div style={css.value}>
            <strong style={{ fontSize: 28 }}>
              {changes.filter((c) => c.status !== 'Ready').length}
            </strong>
          </div>
        </div>

        <div style={css.item}>
          <div style={css.label}>Critical Issues</div>
          <div style={css.value}>
            <strong style={{ fontSize: 28 }}>
              {changes.filter((c) => c.severity === 'Critical').length}
            </strong>
          </div>
        </div>

        <div style={css.item}>
          <div style={css.label}>Open Tickets</div>
          <div style={css.value}>
            <strong style={{ fontSize: 28 }}>{tickets.length}</strong>
          </div>
        </div>
      </div>
    </>
  );

  const renderProfile = () => (
    <>
      <div style={css.eyebrow}>Account</div>

      <h1 style={css.h1}>Profile</h1>

      <div style={css.grid}>
        {[
          ['Name', 'Demo Compliance Officer'],
          ['Role', 'Compliance Operations'],
          ['Team', 'Compliance'],
          ['Location', 'India'],
          ['Email', 'demo.compliance@mockbank.example'],
          ['Permissions', 'Review, approve, assign, report'],
        ].map(([label, value]) => (
          <div style={css.item} key={label}>
            <div style={css.label}>{label}</div>
            <div style={css.value}>{value}</div>
          </div>
        ))}
      </div>
    </>
  );

  const renderSettings = () => (
    <>
      <div style={css.eyebrow}>Workspace Configuration</div>

      <h1 style={css.h1}>Settings</h1>

      <div style={css.grid}>
        {[
          'Regulatory notifications',
          'AI impact analysis',
          'Compliance alerts',
          'Audit logging',
          'Demo data',
        ].map((setting) => (
          <div style={css.item} key={setting}>
            <div style={css.label}>{setting}</div>

            <div style={css.value}>
              <label>
                <input type="checkbox" defaultChecked /> Enabled
              </label>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const content =
    page === 'dashboard'
      ? renderDashboard()
      : page === 'regulatory'
        ? renderRegulatory()
        : page === 'policies'
          ? renderPolicies()
          : page === 'controls'
            ? renderControls()
            : page === 'tickets'
              ? renderTickets()
              : page === 'audit'
                ? renderAudit()
                : page === 'reports'
                  ? renderReports()
                  : page === 'profile'
                    ? renderProfile()
                    : renderSettings();

  const drawer = selected ? (
    <div
      style={css.drawerShade}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeDrawer();
        }
      }}
    >
      <aside style={css.drawer}>
        <div style={css.drawerHeader}>
          <div>
            <div
              style={{
                color: '#a9c1d1',
                fontSize: 10,
                fontWeight: 800,
              }}
            >
              REGULATORY CHANGE DETAILS
            </div>

            <h2 style={{ margin: '7px 0', fontSize: 19 }}>
              {selected.title}
            </h2>

            <div style={{ color: '#c8d6e2', fontSize: 11 }}>
              {selected.regulator} · {selected.id}
            </div>
          </div>

          <button
            type="button"
            style={{ ...css.button, ...css.secondary }}
            onClick={closeDrawer}
          >
            Close
          </button>
        </div>

        <div style={css.drawerBody}>
          <div style={css.item}>
            <div style={css.label}>Regulatory Requirement</div>

            <div style={css.value}>
              {selected.title}

              <span style={css.muted}>
                Illustrative mock requirement for internal review.
              </span>
            </div>
          </div>

          <div>
            <h3 style={css.sectionTitle}>Impact Mapping</h3>

            <div style={css.chain}>
              {[
                ['Regulatory Change', selected.title],
                ['Affected Policy', selected.policy],
                ['Affected Control', selected.control],
                ['Owner', selected.owner],
                ['Required Action', selected.action],
              ].map(([label, value], index) => (
                <div key={label}>
                  <div style={css.chainItem}>
                    <div style={css.label}>{label}</div>
                    <div style={css.value}>{value}</div>
                  </div>

                  {index < 4 && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: 4,
                        color: '#6b7d8f',
                      }}
                    >
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={css.buttonRow}>
            <button
              type="button"
              style={css.button}
              onClick={runAI}
            >
              Run AI Impact Analysis
            </button>

            <button
              type="button"
              style={{ ...css.button, ...css.secondary }}
              onClick={review}
            >
              Review Change
            </button>

            <button
              type="button"
              style={{ ...css.button, ...css.secondary }}
              onClick={approve}
            >
              Approve
            </button>

            <button
              type="button"
              style={{ ...css.button, ...css.danger }}
              onClick={reject}
            >
              Reject
            </button>
          </div>

          {showAI && (
            <div style={css.item}>
              <h3 style={css.sectionTitle}>
                AI Impact Analysis
              </h3>

              {aiLoading ? (
                <div style={css.value}>
                  Analyzing regulatory requirement...
                </div>
              ) : (
                <div style={css.grid}>
                  <div>
                    <div style={css.label}>
                      Affected Business Areas
                    </div>

                    <div style={css.value}>
                      Retail Banking
                      <br />
                      Branch Operations
                      <br />
                      Customer Onboarding
                      <br />
                      Financial Crime Compliance
                    </div>
                  </div>

                  <div>
                    <div style={css.label}>Affected Policy</div>

                    <div style={css.value}>
                      {selected.policy}
                    </div>

                    <div style={css.label}>
                      Affected Control
                    </div>

                    <div style={css.value}>
                      {selected.control}
                    </div>
                  </div>

                  <div>
                    <div style={css.label}>
                      AI Recommendation
                    </div>

                    <div style={css.value}>
                      Owner: KYC / AML
                      <br />
                      Deadline: {selected.deadline}
                      <br />
                      Confidence: <strong>94%</strong>
                    </div>
                  </div>

                  <div>
                    <div style={css.label}>
                      Recommended Action
                    </div>

                    <div style={css.value}>
                      {selected.action}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={css.form}>
            <strong>Assign Owner</strong>

            <select
              aria-label="Select owner"
              style={css.select}
              value={ownerDraft || selected.owner}
              onChange={(event) =>
                setOwnerDraft(event.target.value)
              }
            >
              {owners.map((owner) => (
                <option key={owner}>{owner}</option>
              ))}
            </select>

            <button
              type="button"
              style={css.button}
              onClick={saveOwner}
            >
              Save Owner
            </button>
          </div>

          <div style={css.item}>
            <div style={css.label}>Approval Status</div>

            <div style={css.value}>
              <span
                style={{
                  ...css.badge,
                  ...statusStyle(selected.status),
                }}
              >
                {selected.status}
              </span>

              <span style={css.muted}>
                {selected.complianceApproved
                  ? 'Approved by Compliance Officer'
                  : 'Approval required before marking Ready'}
              </span>
            </div>
          </div>

          <div style={css.buttonRow}>
            <button
              type="button"
              style={{ ...css.button, ...css.secondary }}
              disabled={tickets.some(
                (ticket) => ticket.changeId === selected.id,
              )}
              onClick={createTicket}
            >
              {tickets.some(
                (ticket) => ticket.changeId === selected.id,
              )
                ? 'Ticket Created'
                : 'Create Action / Ticket'}
            </button>

            <button
              type="button"
              style={css.button}
              disabled={!selected.complianceApproved}
              onClick={markReady}
            >
              Mark Ready
            </button>
          </div>

          <div>
            <h3 style={css.sectionTitle}>Audit Trail</h3>

            <div style={css.card}>
              {selected.audit.length === 0 ? (
                <div style={css.empty}>
                  No actions recorded yet.
                </div>
              ) : (
                selected.audit.map((event, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 12,
                      borderBottom:
                        '1px solid #e1e6eb',
                    }}
                  >
                    <strong>
                      {event.timestamp} · {event.action}
                    </strong>

                    <span style={css.muted}>
                      {event.actor} · {event.oldStatus} →{' '}
                      {event.newStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  ) : null;

  return (
    <AppLayout>
      <div style={css.app}>
        <div style={css.layout}>
          <aside style={css.sidebar}>
            <div style={css.brand}>
              <div style={css.brandTitle}>
                COMPLIANCE CHANGE RADAR
              </div>

              <span style={css.brandSub}>
                SBI-style banking environment · India
              </span>
            </div>

            {navigation.map((group) => (
              <div key={group.group}>
                <div style={css.navLabel}>{group.group}</div>

                {group.items.map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    style={{
                      ...css.navButton,
                      ...(page === id ? css.navActive : {}),
                    }}
                    onClick={() => navigate(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ))}
          </aside>

          <main style={css.main}>
            <header style={css.header}>
              <div>
                <div style={css.eyebrow}>
                  Regulatory Operations
                </div>

                <strong>
                  {page === 'dashboard'
                    ? 'Dashboard'
                    : page === 'regulatory'
                      ? 'Regulatory Intelligence'
                      : page === 'policies'
                        ? 'Policies'
                        : page === 'controls'
                          ? 'Controls'
                          : page === 'tickets'
                            ? 'Actions & Tickets'
                            : page === 'audit'
                              ? 'Audit Trail'
                              : page === 'reports'
                                ? 'Reports'
                                : page === 'profile'
                                  ? 'Profile'
                                  : 'Settings'}
                </strong>
              </div>

              <input
                aria-label="Search records"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search records..."
                style={css.search}
              />
            </header>

            <section style={css.page}>{content}</section>
          </main>
        </div>

        {drawer}
      </div>
    </AppLayout>
  );
};

export default App;