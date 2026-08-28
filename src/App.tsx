// =============================================================================
// MIT License
// Copyright (c) 2026 Aparavi Software AG
// =============================================================================

import React, { useMemo, useState } from 'react';
import type { ShellAppProps } from 'shell';
import {
	AppLayout,
	Banner,
	Button,
	CardDataGrid,
	ContentHeader,
	MiniCard,
	MiniContainer,
	Modal,
	SidebarMenu,
	ToggleGroup,
} from 'shell';
import type { GridColumnDefinition } from 'shell';

type Risk = 'Critical' | 'High' | 'Medium';
type Regulator = 'RBI' | 'SEBI' | 'IRDAI' | 'ALL';
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

type AuditEvent = {
	timestamp: string;
	action: string;
	actor: string;
	status: string;
};

type AiAnalysis = {
	regulatoryRequirement: string;
	businessAreas: string[];
	internalPolicies: string[];
	controls: string[];
	risk: Risk;
	recommendedActions: string[];
	recommendedOwner: string;
	evidence: string[];
	suggestedDeadline: string;
	confidence: string;
};

type ActionTicket = {
	id: string;
	changeId: string;
	regulatoryChange: string;
	requiredAction: string;
	owner: string;
	priority: Risk;
	dueDate: string;
	status: 'Open';
};

type Change = {
	id: string;
	title: string;
	regulator: string;
	jurisdiction: string;
	affectedPolicy: string;
	control: string;
	deadline: string;
	risk: Risk;
	status: 'Needs review' | 'In progress' | 'Approved' | 'Rejected' | 'Ready';
	owner: string;
	action: string;
	approval: string;
	auditTrail: string;
	updated: string;
	auditEvents?: AuditEvent[];
	complianceApproved?: boolean;
};

const changes: Change[] = [
	{
		id: 'RBI-KYC-MOCK-001',
		title: 'KYC / Customer Due Diligence update',
		regulator: 'Reserve Bank of India (RBI)',
		jurisdiction: 'India / KYC and AML',
		affectedPolicy: 'Customer Acceptance and KYC Policy',
		control: 'Periodic KYC refresh and beneficial-owner review',
		deadline: '18 Sep 2026',
		risk: 'Critical',
		status: 'Needs review',
		owner: 'KYC / AML',
		action: 'Confirm risk-based CDD changes and branch rollout plan',
		approval: 'Pending Compliance approval',
		auditTrail: '27 Aug 2026 - Intake logged; policy mapping pending',
		updated: '18 min ago',
	},
	{
		id: 'RBI-DL-MOCK-002',
		title: 'Digital Lending requirements review',
		regulator: 'Reserve Bank of India (RBI)',
		jurisdiction: 'India / Digital Lending',
		affectedPolicy: 'Digital Lending and Outsourcing Policy',
		control: 'LSP due diligence and borrower disclosure checklist',
		deadline: '04 Oct 2026',
		risk: 'High',
		status: 'In progress',
		owner: 'Risk',
		action: 'Validate lending-partner inventory and key fact statement evidence',
		approval: 'Risk Committee review scheduled',
		auditTrail: '26 Aug 2026 - Control owner assigned; evidence request open',
		updated: '2 hr ago',
	},
	{
		id: 'RBI-CYBER-MOCK-003',
		title: 'Cyber Security / IT Risk requirements',
		regulator: 'Reserve Bank of India (RBI)',
		jurisdiction: 'India / IT and Cyber Risk',
		affectedPolicy: 'Information Security and IT Risk Policy',
		control: 'Critical asset monitoring and cyber incident escalation',
		deadline: '22 Oct 2026',
		risk: 'High',
		status: 'Needs review',
		owner: 'Information Security',
		action: 'Gap-assess SOC monitoring, incident playbooks, and board reporting',
		approval: 'Pending CISO sign-off',
		auditTrail: '25 Aug 2026 - Evidence pack requested from IT',
		updated: 'Yesterday',
	},
	{
		id: 'RBI-UPI-MOCK-004',
		title: 'Payment Systems / UPI control review',
		regulator: 'Reserve Bank of India (RBI)',
		jurisdiction: 'India / Payments and UPI',
		affectedPolicy: 'Payments Operations and UPI Policy',
		control: 'UPI transaction monitoring and customer dispute handling',
		deadline: '09 Nov 2026',
		risk: 'Medium',
		status: 'Ready',
		owner: 'Payments',
		action: 'Publish updated exception matrix and reconcile dispute SLAs',
		approval: 'Approved by Payments Operations',
		auditTrail: '24 Aug 2026 - Control test passed; closure evidence attached',
		updated: '2 days ago',
		complianceApproved: true,
	},
	{
		id: 'SEBI-MF-MOCK-001',
		title: 'Mutual Fund Investor Disclosure Refresh',
		regulator: 'Securities and Exchange Board of India (SEBI)',
		jurisdiction: 'India / Investment Disclosures',
		affectedPolicy: 'Investment Product Governance Policy',
		control: 'Investor disclosure review and product communication approval',
		deadline: '15 Sep 2026',
		risk: 'High',
		status: 'Needs review',
		owner: 'Legal',
		action: 'Review investor disclosures and update product communication controls',
		approval: 'Pending Legal review',
		auditTrail: '25 Aug 2026 - Disclosure pack requested from Legal',
		updated: 'Yesterday',
	},
	{
		id: 'SEBI-CYBER-MOCK-002',
		title: 'Market Intermediary Cyber Resilience Review',
		regulator: 'Securities and Exchange Board of India (SEBI)',
		jurisdiction: 'India / Securities Cyber Risk',
		affectedPolicy: 'Third-Party Risk and Information Security Policy',
		control: 'Intermediary cyber-risk assessment and resilience monitoring',
		deadline: '06 Oct 2026',
		risk: 'Critical',
		status: 'In progress',
		owner: 'Information Security',
		action: 'Assess intermediary cyber controls and update resilience evidence',
		approval: 'Risk Committee review scheduled',
		auditTrail: '24 Aug 2026 - Resilience evidence pack in progress',
		updated: '2 days ago',
	},
	{
		id: 'IRDAI-CLAIMS-MOCK-001',
		title: 'Insurance Claims Service-Level Review',
		regulator: 'Insurance Regulatory and Development Authority of India (IRDAI)',
		jurisdiction: 'India / Insurance Claims',
		affectedPolicy: 'Claims Handling and Customer Service Policy',
		control: 'Claims turnaround monitoring and service-level escalation',
		deadline: '28 Sep 2026',
		risk: 'High',
		status: 'Needs review',
		owner: 'Operations',
		action: 'Review claims SLA controls and establish escalation monitoring',
		approval: 'Pending Operations sign-off',
		auditTrail: '23 Aug 2026 - SLA data pull requested from Operations',
		updated: '3 days ago',
	},
	{
		id: 'IRDAI-DATA-MOCK-002',
		title: 'Insurance Customer Data Governance Review',
		regulator: 'Insurance Regulatory and Development Authority of India (IRDAI)',
		jurisdiction: 'India / Insurance Data Governance',
		affectedPolicy: 'Data Governance and Privacy Policy',
		control: 'Policyholder data access review and retention evidence',
		deadline: '19 Oct 2026',
		risk: 'Medium',
		status: 'Ready',
		owner: 'Compliance',
		action: 'Validate data-retention inventory and access review records',
		approval: 'Approved by Compliance',
		auditTrail: '22 Aug 2026 - Retention inventory validated',
		updated: '4 days ago',
		complianceApproved: true,
	},
];

const ownerOptions = ['Compliance', 'KYC / AML', 'Risk', 'Information Security', 'IT', 'Payments', 'Legal', 'Operations'];
const regulatorValues: Record<string, string[]> = {
	RBI: ['RESERVE BANK OF INDIA (RBI)', 'RBI'],
	SEBI: ['SECURITIES AND EXCHANGE BOARD OF INDIA (SEBI)', 'SEBI'],
	IRDAI: ['INSURANCE REGULATORY AND DEVELOPMENT AUTHORITY OF INDIA (IRDAI)', 'IRDAI'],
};

const columns: GridColumnDefinition[] = [
	{ title: 'Regulatory change', field: 'title', rrType: 'string', rrDefault: true, rrDescription: 'The regulatory change requiring review.' },
	{ title: 'Regulator', field: 'regulator', rrType: 'string', rrDefault: true, rrDescription: 'Authority that issued the change.' },
	{ title: 'Jurisdiction', field: 'jurisdiction', rrType: 'string', rrDefault: true, rrDescription: 'Market and regulatory domain.' },
	{ title: 'Affected policy', field: 'affectedPolicy', rrType: 'string', rrDefault: true, rrDescription: 'Bank policy mapped to the regulatory obligation.' },
	{ title: 'Control', field: 'control', rrType: 'string', rrDefault: true, rrDescription: 'Control used to address the obligation.' },
	{ title: 'Risk', field: 'risk', rrType: 'enum', rrOptions: ['Critical', 'High', 'Medium'], rrDefault: true, rrDescription: 'Initial impact assessment.' },
	{ title: 'Due', field: 'deadline', rrType: 'date', rrDefault: true, rrDescription: 'Expected implementation deadline.' },
	{ title: 'Owner', field: 'owner', rrType: 'string', rrDefault: true, rrDescription: 'Person accountable for the review.' },
	{ title: 'Action', field: 'action', rrType: 'string', rrDefault: true, rrDescription: 'Next action required to close the review.' },
	{ title: 'Approval', field: 'approval', rrType: 'string', rrDefault: true, rrDescription: 'Current approval gate or decision.' },
	{ title: 'Audit trail', field: 'auditTrail', rrType: 'string', rrDefault: true, rrDescription: 'Latest traceable review activity.' },
	{ title: 'Status', field: 'status', rrType: 'enum', rrOptions: ['Needs review', 'In progress', 'Approved', 'Rejected', 'Ready'], rrDefault: true, rrDescription: 'Current review state.' },
];

const ticketColumns: GridColumnDefinition[] = [
	{ title: 'Ticket ID', field: 'id', rrType: 'string', rrDefault: true, rrDescription: 'Unique identifier for the action ticket.' },
	{ title: 'Regulatory change', field: 'regulatoryChange', rrType: 'string', rrDefault: true, rrDescription: 'Related regulatory change.' },
	{ title: 'Required action', field: 'requiredAction', rrType: 'string', rrDefault: true, rrDescription: 'Action required to close the ticket.' },
	{ title: 'Owner', field: 'owner', rrType: 'string', rrDefault: true, rrDescription: 'Person or team accountable.' },
	{ title: 'Priority', field: 'priority', rrType: 'enum', rrOptions: ['Critical', 'High', 'Medium'], rrDefault: true, rrDescription: 'Ticket priority.' },
	{ title: 'Due date', field: 'dueDate', rrType: 'date', rrDefault: true, rrDescription: 'Ticket due date.' },
	{ title: 'Status', field: 'status', rrType: 'enum', rrOptions: ['Open'], rrDefault: true, rrDescription: 'Ticket status.' },
];

const styles: Record<string, React.CSSProperties> = {
	page: { minHeight: '100%', height: 'auto', overflowY: 'visible', padding: '28px clamp(18px, 4vw, 54px) 46px', color: '#172536', background: '#f3f5f7' },
	content: { maxWidth: 1440, margin: '0 auto' },
	toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 22, paddingBottom: 18, borderBottom: '1px solid #d7dde3', flexWrap: 'wrap' },
	quiet: { fontSize: 11, color: '#536476', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 },
	metrics: { margin: '20px 0 28px', background: '#fff', border: '1px solid #d7dde3', borderRadius: 3, padding: 12, boxShadow: '0 2px 7px rgba(20, 39, 58, .05)' },
	meta: { color: '#536476', fontSize: 12, marginTop: 5 },
	headerMeta: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 8, color: '#536476', fontSize: 12 },
	activeStatus: { display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1e6b4d', fontWeight: 700 },
	activeDot: { width: 7, height: 7, borderRadius: '50%', background: '#2d8a63' },
	section: { marginTop: 24 },
	sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
	sectionTitle: { margin: 0, color: '#172536', fontSize: 16, fontWeight: 700 },
	filterBar: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
	filterButton: { minHeight: 30, padding: '0 12px', border: '1px solid #c6d0da', borderRadius: 3, background: '#fff', color: '#405166', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
	filterButtonActive: { background: '#17324d', border: '1px solid #17324d', color: '#fff' },
	detail: { display: 'grid', gap: 18, color: '#172536' },
	detailMeta: { display: 'flex', flexWrap: 'wrap', gap: 8, color: '#536476', fontSize: 12 },
	detailGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 },
	detailItem: { padding: 12, background: '#f7f9fb', border: '1px solid #d7dde3', borderRadius: 3 },
	detailLabel: { color: '#536476', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5, fontWeight: 700 },
	detailValue: { fontSize: 14, lineHeight: 1.45 },
	impact: { display: 'grid', gridTemplateColumns: '1fr', alignItems: 'stretch', gap: 0, border: '1px solid #cbd5df', background: '#fff' },
	impactItem: { padding: 12, background: '#fff', borderBottom: '1px solid #d7dde3' },
	impactArrow: { display: 'block', padding: '3px 0', textAlign: 'center', color: '#6b7d8f', fontSize: 16, lineHeight: 1 },
	audit: { display: 'grid', gap: 0, borderLeft: '2px solid #b8c5d1', paddingLeft: 14 },
	auditRow: { position: 'relative', display: 'grid', gridTemplateColumns: '130px 1fr', gap: 10, padding: '10px 0', borderBottom: '1px solid #e1e6eb', fontSize: 12 },
	auditMeta: { color: '#536476' },
	actions: { display: 'flex', flexWrap: 'wrap', gap: 8 },
	blocked: { margin: 0, color: '#9b671d', fontSize: 12 },
	aiButton: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: 14, background: '#f7f9fb', border: '1px solid #9fb5c9', borderLeft: '4px solid #173f62', borderRadius: 3 },
	aiLabel: { color: '#285578', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 },
	aiPanel: { display: 'grid', gap: 14, padding: 16, background: '#eef4f8', border: '1px solid #9fb5c9', borderRadius: 3 },
	aiHeader: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
	aiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 },
	aiItem: { padding: 11, background: '#fff', border: '1px solid #d0dbe4', borderRadius: 3 },
	aiList: { margin: 0, paddingLeft: 17, lineHeight: 1.55 },
	ticketPanel: { display: 'grid', gap: 12, padding: 16, background: '#f8f5ee', border: '1px solid #cbb98f', borderLeft: '4px solid #9b762c', borderRadius: 3 },
	approvalPanel: { padding: 14, background: '#f7f9fb', border: '1px solid #cbd5df', borderLeft: '4px solid #2d6d58', borderRadius: 3 },
	ownerPicker: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: 12, background: '#f7f9fb', border: '1px solid #cbd5df', borderRadius: 3 },
	select: { minHeight: 34, padding: '0 10px', color: '#172536', background: '#fff', border: '1px solid #9aaaba', borderRadius: 3, font: 'inherit' },
	detailScroll: { maxHeight: 'calc(100vh - 190px)', overflowY: 'auto', overscrollBehavior: 'contain', paddingRight: 6 },
	linkButton: { border: 0, background: 'none', padding: 0, color: '#17324d', fontWeight: 700, fontSize: 13, textDecoration: 'underline', cursor: 'pointer', textAlign: 'left' },
	settingRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 4px', borderBottom: '1px solid #e1e6eb', flexWrap: 'wrap' },
	settingText: { maxWidth: 520 },
	settingTitle: { fontSize: 13, fontWeight: 700, margin: '0 0 3px' },
	settingDesc: { fontSize: 12, color: '#536476', margin: 0 },
	bar: { display: 'grid', gridTemplateColumns: '150px 1fr 40px', alignItems: 'center', gap: 10, padding: '9px 0' },
	barTrack: { height: 9, background: '#e4e9ee', borderRadius: 5, overflow: 'hidden' },
	barFill: { height: '100%', borderRadius: 5 },
};

const getAiAnalysis = (change: Change): AiAnalysis => {
	if (change.id === 'RBI-KYC-MOCK-001') {
		return {
			regulatoryRequirement: 'Risk-based Customer Due Diligence, KYC refresh, and beneficial-owner verification require policy and branch process review.',
			businessAreas: ['Retail Banking', 'Branch Operations', 'Onboarding', 'Financial Crime Compliance'],
			internalPolicies: ['Customer Acceptance and KYC Policy'],
			controls: ['Periodic KYC refresh and beneficial-owner review'],
			risk: 'Critical',
			recommendedActions: ['Confirm risk-based CDD changes and branch rollout plan'],
			recommendedOwner: 'KYC / AML',
			evidence: ['Updated KYC policy', 'Branch communication', 'Control-test evidence'],
			suggestedDeadline: '18 Sep 2026',
			confidence: '94%',
		};
	}

	return {
		regulatoryRequirement: `Mock requirement identified for ${change.jurisdiction.toLowerCase()}, requiring documented impact assessment and control evidence.`,
		businessAreas: [change.owner, 'Compliance', 'Operations'],
		internalPolicies: [change.affectedPolicy],
		controls: [change.control],
		risk: change.risk,
		recommendedActions: [change.action],
		recommendedOwner: change.owner,
		evidence: ['Updated internal policy', 'Control operating evidence', 'Owner sign-off'],
		suggestedDeadline: change.deadline,
		confidence: change.risk === 'Critical' ? '91%' : change.risk === 'High' ? '88%' : '84%',
	};
};

const riskColor = (risk: Risk) => (risk === 'Critical' ? '#a94c4c' : risk === 'High' ? '#b57a26' : '#35627e');

const App: React.FC<ShellAppProps> = ({ isConnected, ...rest }) => {
	const [page, setPage] = useState<Page>('dashboard');
	const [range, setRange] = useState('30d');
	const [selectedRegulator, setSelectedRegulator] = useState<Regulator>('ALL');
	const [liveChanges, setLiveChanges] = useState<Change[]>(() => (Array.isArray(changes) ? changes : []));
	const [tickets, setTickets] = useState<ActionTicket[]>([]);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [showAiAnalysis, setShowAiAnalysis] = useState(false);
	const [showOwnerPicker, setShowOwnerPicker] = useState(false);
	const [pendingOwner, setPendingOwner] = useState('');
	const [settingsState, setSettingsState] = useState<Record<string, 'on' | 'off'>>({
		monitoring: 'on',
		aiAnalysis: 'on',
		criticalAlerts: 'on',
		auditLogging: 'on',
		regulatorSources: 'on',
	});

	const regulatoryChanges = Array.isArray(liveChanges) ? liveChanges : [];
	const selectedChange = regulatoryChanges.find((change) => change?.id === selectedId) ?? null;
	const aiAnalysis = selectedChange ? getAiAnalysis(selectedChange) : null;

	const filteredChanges = selectedRegulator === 'ALL' ? regulatoryChanges : regulatoryChanges.filter((change) => {
		const regulator = typeof change?.regulator === 'string' ? change.regulator.toUpperCase() : '';
		return (regulatorValues[selectedRegulator] ?? []).includes(regulator);
	});

	const openSignals = filteredChanges.filter((change) => change?.status !== 'Ready').length;
	const needReview = filteredChanges.filter((change) => change?.status === 'Needs review').length;
	const critical = filteredChanges.filter((change) => change?.risk === 'Critical').length;
	const dueWithin30 = filteredChanges.filter((change) => {
		const deadline = typeof change?.deadline === 'string' ? new Date(change.deadline).getTime() : NaN;
		const days = (deadline - Date.now()) / (1000 * 60 * 60 * 24);
		return Number.isFinite(deadline) && days >= 0 && days < 30;
	}).length;

	const now = () => new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

	const updateChange = (id: string, action: string, update: Partial<Change>, status = update.status, auditStatus?: string) => {
		setLiveChanges((current) => current.map((change) => {
			if (change.id !== id) return change;
			const nextStatus = status ?? change.status;
			const event: AuditEvent = { timestamp: now(), action, actor: 'Compliance Officer', status: auditStatus ?? `${change.status} \u2192 ${nextStatus}` };
			return { ...change, ...update, updated: 'just now', auditEvents: [...(change.auditEvents ?? []), event] };
		}));
	};

	const reviewChange = (change: Change) => updateChange(change.id, 'Review Change', { status: 'In progress' });
	const approveChange = (change: Change) => updateChange(change.id, 'Approved by Compliance Officer', { status: 'Approved', approval: 'Approved by Compliance Officer', complianceApproved: true });
	const rejectChange = (change: Change) => updateChange(change.id, 'Rejected by Compliance Officer', { status: 'Rejected', approval: 'Rejected by Compliance Officer', complianceApproved: false });

	const assignOwner = (change: Change) => {
		setPendingOwner(change.owner);
		setShowOwnerPicker(true);
	};

	const saveOwner = () => {
		if (!selectedChange || !pendingOwner || pendingOwner === selectedChange.owner) {
			setShowOwnerPicker(false);
			return;
		}
		updateChange(selectedChange.id, `Owner assigned: ${selectedChange.owner} \u2192 ${pendingOwner}`, { owner: pendingOwner }, undefined, `${selectedChange.status} \u2192 ${selectedChange.status}`);
		setShowOwnerPicker(false);
	};

	const createTicket = (change: Change) => {
		const ticketId = `CCR-${String(tickets.length + 1).padStart(3, '0')}`;
		setTickets((current) => [...current, {
			id: ticketId,
			changeId: change.id,
			regulatoryChange: change.title,
			requiredAction: change.action,
			owner: change.owner,
			priority: change.risk,
			dueDate: change.deadline,
			status: 'Open',
		}]);
		updateChange(change.id, 'Action / ticket created', { action: `Ticket ${ticketId} created: ${change.action}` }, undefined, 'No ticket \u2192 Open');
	};

	const markReady = (change: Change) => {
		if (!change.complianceApproved) return;
		updateChange(change.id, 'Marked Ready', { status: 'Ready' });
	};

	const openChangeDetail = (id: string) => {
		setSelectedId(id);
		setShowAiAnalysis(false);
		setShowOwnerPicker(false);
	};

	const closeDetails = () => {
		setSelectedId(null);
		setShowAiAnalysis(false);
		setShowOwnerPicker(false);
	};

	const auditEvents = (change: Change): AuditEvent[] => change.auditEvents ?? [{
		timestamp: change.updated,
		action: change.auditTrail,
		actor: change.owner,
		status: change.status,
	}];

	const selectedTickets = selectedChange ? tickets.filter((ticket) => ticket.changeId === selectedChange.id) : [];

	const policySummaries = useMemo(() => {
		const map = new Map<string, { policy: string; changesFor: Change[]; controls: Set<string> }>();
		regulatoryChanges.forEach((change) => {
			const key = change.affectedPolicy;
			if (!map.has(key)) map.set(key, { policy: key, changesFor: [], controls: new Set() });
			const entry = map.get(key)!;
			entry.changesFor.push(change);
			entry.controls.add(change.control);
		});
		return Array.from(map.values());
	}, [regulatoryChanges]);

	const controlSummaries = useMemo(() => {
		const map = new Map<string, { control: string; owner: string; changesFor: Change[] }>();
		regulatoryChanges.forEach((change) => {
			const key = change.control;
			if (!map.has(key)) map.set(key, { control: key, owner: change.owner, changesFor: [] });
			map.get(key)!.changesFor.push(change);
		});
		return Array.from(map.values());
	}, [regulatoryChanges]);

	const allAuditEvents = useMemo(() => {
		const rows = regulatoryChanges.flatMap((change) => auditEvents(change).map((event) => ({ ...event, changeTitle: change.title, changeId: change.id })));
		return rows.slice().reverse();
	}, [regulatoryChanges]);

	const regulatorBreakdown = (['RBI', 'SEBI', 'IRDAI'] as const).map((key) => ({
		key,
		count: regulatoryChanges.filter((change) => (regulatorValues[key] ?? []).includes(change.regulator.toUpperCase())).length,
	}));

	const riskBreakdown = (['Critical', 'High', 'Medium'] as const).map((key) => ({
		key,
		count: regulatoryChanges.filter((change) => change.risk === key).length,
	}));

	const maxRegulatorCount = Math.max(1, ...regulatorBreakdown.map((row) => row.count));
	const maxRiskCount = Math.max(1, ...riskBreakdown.map((row) => row.count));

	const menu = useMemo(() => ({
		entries: [
			{ id: 'dashboard', label: 'Dashboard' },
			{ id: 'regulatory', label: 'Regulatory Changes', count: regulatoryChanges.length },
			{ id: 'policies', label: 'Policies' },
			{ id: 'controls', label: 'Controls' },
			{ id: 'tickets', label: 'Tickets', count: tickets.length },
			{ id: 'audit', label: 'Audit Trail' },
			{ id: 'reports', label: 'Reports' },
			{ id: 'profile', label: 'Profile' },
			{ id: 'settings', label: 'Settings' },
		],
	}), [regulatoryChanges.length, tickets.length]);

	const sidebar = (
		<SidebarMenu
			menu={menu}
			activeId={page}
			onSelect={(id: string) => setPage(id as Page)}
			sectionLabel="COMPLIANCE OPERATIONS"
		/>
	);

	const globalStyleTag = <style>{`html, body, #root { min-height: 100%; height: auto; overflow-y: auto; } @media (max-width: 700px) { .radar-page { padding: 20px 14px 34px !important; } }`}</style>;

	if (selectedChange) {
		return (
			<AppLayout sidebar={sidebar} showStatus>
				<div style={styles.page}>
					{globalStyleTag}
					<div style={styles.content} className="radar-page">
						<Button variant="ghost" onClick={closeDetails}>Back</Button>
						<Modal title="Regulatory Change Details" onClose={closeDetails} width={920} ariaLabel="Regulatory change details">
							<div style={styles.detailScroll}>
								<div style={styles.detail}>
									<div>
										<div style={styles.quiet}>Demo / Mock Data</div>
										<h2 style={{ margin: '6px 0 8px' }}>{selectedChange.title}</h2>
										<div style={styles.detailMeta}><span>{selectedChange.regulator}</span><span>{selectedChange.id}</span><span>{selectedChange.jurisdiction}</span></div>
									</div>
									<div style={styles.aiButton}>
										<div><div style={styles.aiLabel}>Simulated local analysis</div><strong>AI Impact Analysis</strong></div>
										<Button onClick={() => { setShowAiAnalysis(true); updateChange(selectedChange.id, 'AI Impact Analysis run', {}, undefined, 'No analysis \u2192 Analysis available'); }}>Run AI Impact Analysis</Button>
									</div>
									{showAiAnalysis && aiAnalysis && <div style={styles.aiPanel} aria-label="AI-generated impact analysis">
										<div style={styles.aiHeader}><h3 style={{ margin: 0 }}>AI IMPACT ANALYSIS</h3><span style={styles.aiLabel}>AI-generated analysis - Demo</span></div>
										<div style={styles.detailItem}><div style={styles.detailLabel}>Regulatory requirement identified</div><div style={styles.detailValue}>{aiAnalysis.regulatoryRequirement}</div></div>
										<div style={styles.aiGrid}>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Affected business areas</div><ul style={styles.aiList}>{aiAnalysis.businessAreas.map((area) => <li key={area}>{area}</li>)}</ul></div>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Affected internal policies</div><ul style={styles.aiList}>{aiAnalysis.internalPolicies.map((policy) => <li key={policy}>{policy}</li>)}</ul></div>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Affected controls</div><ul style={styles.aiList}>{aiAnalysis.controls.map((control) => <li key={control}>{control}</li>)}</ul></div>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Risk level</div><div style={styles.detailValue}>{aiAnalysis.risk}</div></div>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Recommended owner/team</div><div style={styles.detailValue}>{aiAnalysis.recommendedOwner}</div></div>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Suggested deadline</div><div style={styles.detailValue}>{aiAnalysis.suggestedDeadline}</div></div>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Confidence score</div><div style={styles.detailValue}>{aiAnalysis.confidence}</div></div>
										</div>
										<div style={styles.aiGrid}>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Recommended actions</div><ul style={styles.aiList}>{aiAnalysis.recommendedActions.map((action) => <li key={action}>{action}</li>)}</ul></div>
											<div style={styles.aiItem}><div style={styles.detailLabel}>Evidence required</div><ul style={styles.aiList}>{aiAnalysis.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul></div>
										</div>
									</div>}
									{selectedTickets.map((ticket) => <div style={styles.ticketPanel} key={ticket.id} aria-label={`Action ticket ${ticket.id}`}>
										{showOwnerPicker && <div style={styles.ownerPicker} aria-label="Assign control owner">
											<label htmlFor="owner-select"><strong>Assign owner/team</strong></label>
											<select id="owner-select" style={styles.select} value={pendingOwner} onChange={(event) => setPendingOwner(event.target.value)}>{ownerOptions.map((owner) => <option key={owner} value={owner}>{owner}</option>)}</select>
											<Button onClick={saveOwner}>Save Owner</Button>
											<Button variant="ghost" onClick={() => setShowOwnerPicker(false)}>Cancel</Button>
										</div>}
										<div style={styles.aiHeader}><h3 style={{ margin: 0 }}>Action / Ticket</h3><strong>{ticket.id}</strong></div>
										<div style={styles.detailGrid}>
											<div style={styles.detailItem}><div style={styles.detailLabel}>Ticket ID</div><div style={styles.detailValue}>{ticket.id}</div></div>
											<div style={styles.detailItem}><div style={styles.detailLabel}>Regulatory change</div><div style={styles.detailValue}>{ticket.regulatoryChange}</div></div>
											<div style={styles.detailItem}><div style={styles.detailLabel}>Required action</div><div style={styles.detailValue}>{ticket.requiredAction}</div></div>
											<div style={styles.detailItem}><div style={styles.detailLabel}>Assigned owner/team</div><div style={styles.detailValue}>{ticket.owner}</div></div>
											<div style={styles.detailItem}><div style={styles.detailLabel}>Priority</div><div style={styles.detailValue}>{ticket.priority}</div></div>
											<div style={styles.detailItem}><div style={styles.detailLabel}>Due date</div><div style={styles.detailValue}>{ticket.dueDate}</div></div>
											<div style={styles.detailItem}><div style={styles.detailLabel}>Ticket status</div><div style={styles.detailValue}>{ticket.status}</div></div>
										</div>
									</div>)}
									{!showOwnerPicker ? null : selectedTickets.length > 0 ? null : <div style={styles.ownerPicker} aria-label="Assign control owner">
										<label htmlFor="owner-select-2"><strong>Assign owner/team</strong></label>
										<select id="owner-select-2" style={styles.select} value={pendingOwner} onChange={(event) => setPendingOwner(event.target.value)}>{ownerOptions.map((owner) => <option key={owner} value={owner}>{owner}</option>)}</select>
										<Button onClick={saveOwner}>Save Owner</Button>
										<Button variant="ghost" onClick={() => setShowOwnerPicker(false)}>Cancel</Button>
									</div>}
									<div style={styles.detailGrid}>
										<div style={styles.detailItem}><div style={styles.detailLabel}>Summary</div><div style={styles.detailValue}>Illustrative obligation requiring the bank to review its {selectedChange.affectedPolicy.toLowerCase()} and evidence implementation through the mapped control.</div></div>
										<div style={styles.detailItem}><div style={styles.detailLabel}>Severity</div><div style={styles.detailValue}>{selectedChange.risk}</div></div>
										<div style={styles.detailItem}><div style={styles.detailLabel}>Effective / deadline</div><div style={styles.detailValue}>{selectedChange.deadline}</div></div>
										<div style={styles.detailItem}><div style={styles.detailLabel}>Current status</div><div style={styles.detailValue}>{selectedChange.status}</div></div>
									</div>
									<div>
										<h3 style={{ margin: '0 0 10px' }}>Impact Analysis</h3>
										<div style={styles.impact} aria-label="Regulatory change impact analysis">
											<div style={styles.impactItem}><div style={styles.detailLabel}>Regulatory Change</div><div style={styles.detailValue}>{selectedChange.title}</div></div><div style={styles.impactArrow}>{'\u2193'}</div>
											<div style={styles.impactItem}><div style={styles.detailLabel}>Affected Policy</div><div style={styles.detailValue}>{selectedChange.affectedPolicy}</div></div><div style={styles.impactArrow}>{'\u2193'}</div>
											<div style={styles.impactItem}><div style={styles.detailLabel}>Control</div><div style={styles.detailValue}>{selectedChange.control}</div></div><div style={styles.impactArrow}>{'\u2193'}</div>
											<div style={styles.impactItem}><div style={styles.detailLabel}>Owner</div><div style={styles.detailValue}>{selectedChange.owner}</div></div><div style={styles.impactArrow}>{'\u2193'}</div>
											<div style={styles.impactItem}><div style={styles.detailLabel}>Action</div><div style={styles.detailValue}>{selectedChange.action}</div></div>
										</div>
									</div>
									<div style={styles.approvalPanel}>
										<h3 style={{ margin: '0 0 10px' }}>Approval</h3>
										<div style={styles.detailMeta}>{selectedChange.approval} <span>|</span> Ready requires Compliance Officer approval</div>
										{!selectedChange.complianceApproved && <p style={styles.blocked}>Mark Ready is unavailable until Approve is completed by a Compliance Officer.</p>}
									</div>
									<div style={styles.actions} aria-label="Regulatory change actions">
										<Button onClick={() => reviewChange(selectedChange)}>Review Change</Button>
										<Button variant="secondary" onClick={() => approveChange(selectedChange)}>Approve</Button>
										<Button variant="danger" onClick={() => rejectChange(selectedChange)}>Reject</Button>
										<Button variant="secondary" onClick={() => assignOwner(selectedChange)}>Assign Owner</Button>
										<Button variant="secondary" onClick={() => createTicket(selectedChange)}>Create Action/Ticket</Button>
										<Button onClick={() => markReady(selectedChange)} disabled={!selectedChange.complianceApproved}>Mark Ready</Button>
									</div>
									<div>
										<h3 style={{ margin: '0 0 8px' }}>Audit Trail</h3>
										<div style={styles.audit}>{auditEvents(selectedChange).map((event, index) => <div style={styles.auditRow} key={`${event.timestamp}-${index}`}><div style={styles.auditMeta}>{event.timestamp}</div><div><strong>{event.action} | {event.status}</strong><div style={styles.auditMeta}>{event.actor}</div></div></div>)}</div>
									</div>
								</div>
							</div>
						</Modal>
					</div>
				</div>
			</AppLayout>
		);
	}

	return (
		<AppLayout sidebar={sidebar} showStatus>
			<div style={styles.page}>
				{globalStyleTag}
				<div style={styles.content} className="radar-page">

					{page === 'dashboard' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Regulatory intelligence / morning brief</div>
									<ContentHeader title="Compliance Change Radar" subtitle="Regulatory Intelligence & Compliance Operations" />
									<div style={styles.headerMeta}><span>SBI-style banking environment • India</span><span style={styles.activeStatus}><span style={styles.activeDot} />Monitoring status: Active</span></div>
								</div>
								<ToggleGroup options={[{ id: '7d', label: '7 days' }, { id: '30d', label: '30 days' }, { id: '90d', label: '90 days' }]} value={range} onChange={setRange} />
							</div>

							<Banner variant="info">Demo / Mock Data - Illustrative SBI-style bank records only; displayed changes are not real current regulator notifications.{!isConnected && ' Connect RocketRide to sync a live regulatory feed.'}</Banner>

							<div style={styles.metrics} aria-label="Dashboard statistics">
								<MiniContainer>
									<MiniCard value={String(openSignals)} label="Open signals" color="#d75b4b" />
									<MiniCard value={String(needReview)} label="Need review" color="#b57a26" />
									<MiniCard value={String(critical)} label="Critical" color="#a94c4c" />
									<MiniCard value={String(dueWithin30)} label="Due < 30 days" color="#8a6a2d" />
									<MiniCard value="92%" label="Compliance coverage" color="#2d6d58" />
								</MiniContainer>
							</div>

							<div style={styles.section}>
								<div style={styles.sectionHeader}>
									<div><div style={styles.quiet}>Command center</div><h2 style={styles.sectionTitle}>Regulatory Intelligence</h2></div>
									<div style={styles.filterBar} aria-label="Regulator filters">
										<span style={styles.meta}>Regulator</span>
										{([{ value: 'RBI', label: 'RBI' }, { value: 'SEBI', label: 'SEBI' }, { value: 'IRDAI', label: 'IRDAI' }, { value: 'ALL', label: 'All' }] as const).map(({ value, label }) => <button type="button" key={value} style={{ ...styles.filterButton, ...(selectedRegulator === value ? styles.filterButtonActive : {}) }} onClick={() => setSelectedRegulator(value)}>{label}</button>)}
									</div>
								</div>
								{filteredChanges.length > 0 ? <CardDataGrid title="Regulatory changes" tableId="compliance-change-radar" columns={columns} data={filteredChanges} onRowClick={(row) => openChangeDetail(row.id)} pageSizes={[4, 10, 25]} emptyTitle="No regulatory changes" emptyDescription="No regulatory signals available for this regulator (Demo / Mock Data)." /> : <Banner variant="info">No regulatory signals available for this regulator (Demo / Mock Data).</Banner>}
							</div>
							<footer style={{ marginTop: 26, paddingTop: 14, borderTop: '1px solid #d7dde3', color: '#536476', fontSize: 11 }}>Demo / Mock Data — Illustrative SBI-style banking records. Not real current regulator notifications.</footer>
						</>
					)}

					{page === 'regulatory' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Compliance register</div>
									<ContentHeader title="Regulatory Changes" subtitle="Full register of detected regulatory signals across RBI, SEBI and IRDAI." />
								</div>
							</div>
							<div style={styles.sectionHeader}>
								<div style={styles.filterBar} aria-label="Regulator filters">
									<span style={styles.meta}>Regulator</span>
									{([{ value: 'RBI', label: 'RBI' }, { value: 'SEBI', label: 'SEBI' }, { value: 'IRDAI', label: 'IRDAI' }, { value: 'ALL', label: 'All' }] as const).map(({ value, label }) => <button type="button" key={value} style={{ ...styles.filterButton, ...(selectedRegulator === value ? styles.filterButtonActive : {}) }} onClick={() => setSelectedRegulator(value)}>{label}</button>)}
								</div>
							</div>
							{filteredChanges.length > 0 ? <CardDataGrid title="Regulatory changes" tableId="compliance-change-radar-full" columns={columns} data={filteredChanges} onRowClick={(row) => openChangeDetail(row.id)} pageSizes={[10, 25, 50]} emptyTitle="No regulatory changes" emptyDescription="No regulatory signals available for this regulator (Demo / Mock Data)." /> : <Banner variant="info">No regulatory signals available for this regulator (Demo / Mock Data).</Banner>}
						</>
					)}

					{page === 'policies' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Policy register</div>
									<ContentHeader title="Policies" subtitle="Internal policies mapped to regulatory obligations." />
								</div>
							</div>
							<div style={styles.detailGrid}>
								{policySummaries.map((summary) => (
									<div style={styles.detailItem} key={summary.policy}>
										<div style={styles.detailLabel}>Policy</div>
										<div style={{ ...styles.detailValue, fontWeight: 700, marginBottom: 8 }}>{summary.policy}</div>
										<div style={styles.detailLabel}>Related controls</div>
										<ul style={styles.aiList}>{Array.from(summary.controls).map((control) => <li key={control}>{control}</li>)}</ul>
										<div style={{ ...styles.detailLabel, marginTop: 8 }}>Related regulatory changes</div>
										<div style={{ display: 'grid', gap: 4, marginTop: 4 }}>
											{summary.changesFor.map((change) => (
												<button type="button" key={change.id} style={styles.linkButton} onClick={() => openChangeDetail(change.id)}>{change.title}</button>
											))}
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{page === 'controls' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Control library</div>
									<ContentHeader title="Controls" subtitle="Compliance controls used to demonstrate regulatory coverage." />
								</div>
							</div>
							<div style={styles.detailGrid}>
								{controlSummaries.map((summary) => (
									<div style={styles.detailItem} key={summary.control}>
										<div style={styles.detailLabel}>Control</div>
										<div style={{ ...styles.detailValue, fontWeight: 700, marginBottom: 8 }}>{summary.control}</div>
										<div style={styles.detailLabel}>Owner</div>
										<div style={styles.detailValue}>{summary.owner}</div>
										<div style={{ ...styles.detailLabel, marginTop: 8 }}>Related regulatory changes</div>
										<div style={{ display: 'grid', gap: 4, marginTop: 4 }}>
											{summary.changesFor.map((change) => (
												<button type="button" key={change.id} style={styles.linkButton} onClick={() => openChangeDetail(change.id)}>{change.title}</button>
											))}
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{page === 'tickets' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Compliance workflow</div>
									<ContentHeader title="Action Tickets" subtitle="Track work created from regulatory changes through to completion." />
								</div>
							</div>
							{tickets.length > 0 ? <CardDataGrid title="Action tickets" tableId="compliance-change-radar-tickets" columns={ticketColumns} data={tickets} onRowClick={(row) => openChangeDetail(row.changeId)} pageSizes={[10, 25, 50]} emptyTitle="No action tickets" emptyDescription="Create a ticket from a regulatory change to see it here." /> : <Banner variant="info">No action tickets yet. Open a regulatory change and select "Create Action/Ticket".</Banner>}
						</>
					)}

					{page === 'audit' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Governance record</div>
									<ContentHeader title="Audit Trail" subtitle="Chronological record of compliance decisions and workflow actions." />
								</div>
							</div>
							<div style={styles.audit}>
								{allAuditEvents.map((event, index) => (
									<div style={styles.auditRow} key={`${event.changeId}-${event.timestamp}-${index}`}>
										<div style={styles.auditMeta}>{event.timestamp}</div>
										<div>
											<strong>{event.action} | {event.status}</strong>
											<div style={styles.auditMeta}>{event.actor}</div>
											<button type="button" style={{ ...styles.linkButton, fontSize: 12 }} onClick={() => openChangeDetail(event.changeId)}>{event.changeTitle}</button>
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{page === 'reports' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Executive summary</div>
									<ContentHeader title="Compliance Reports" subtitle="Regulatory exposure, remediation progress and coverage." />
								</div>
							</div>
							<div style={styles.metrics} aria-label="Report statistics">
								<MiniContainer>
									<MiniCard value="92%" label="Compliance coverage" color="#2d6d58" />
									<MiniCard value={String(regulatoryChanges.length)} label="Total regulatory changes" color="#17324d" />
									<MiniCard value={String(critical)} label="Critical changes" color="#a94c4c" />
									<MiniCard value={String(tickets.length)} label="Tickets created" color="#8a6a2d" />
								</MiniContainer>
							</div>
							<div style={styles.detailGrid}>
								<div style={styles.detailItem}>
									<div style={styles.detailLabel}>Changes by regulator</div>
									{regulatorBreakdown.map((row) => (
										<div style={styles.bar} key={row.key}>
											<span style={{ fontSize: 12, fontWeight: 700 }}>{row.key}</span>
											<div style={styles.barTrack}><div style={{ ...styles.barFill, width: `${(row.count / maxRegulatorCount) * 100}%`, background: '#17324d' }} /></div>
											<span style={{ fontSize: 12, textAlign: 'right' }}>{row.count}</span>
										</div>
									))}
								</div>
								<div style={styles.detailItem}>
									<div style={styles.detailLabel}>Changes by severity</div>
									{riskBreakdown.map((row) => (
										<div style={styles.bar} key={row.key}>
											<span style={{ fontSize: 12, fontWeight: 700 }}>{row.key}</span>
											<div style={styles.barTrack}><div style={{ ...styles.barFill, width: `${(row.count / maxRiskCount) * 100}%`, background: riskColor(row.key) }} /></div>
											<span style={{ fontSize: 12, textAlign: 'right' }}>{row.count}</span>
										</div>
									))}
								</div>
							</div>
						</>
					)}

					{page === 'profile' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Account</div>
									<ContentHeader title="Profile" subtitle="Compliance officer account and organisation information." />
								</div>
							</div>
							<div style={styles.detailGrid}>
								<div style={styles.detailItem}><div style={styles.detailLabel}>Name</div><div style={styles.detailValue}>Compliance Officer (Demo)</div></div>
								<div style={styles.detailItem}><div style={styles.detailLabel}>Role</div><div style={styles.detailValue}>Head of Compliance</div></div>
								<div style={styles.detailItem}><div style={styles.detailLabel}>Organisation</div><div style={styles.detailValue}>SBI-style Demo Bank</div></div>
								<div style={styles.detailItem}><div style={styles.detailLabel}>Region</div><div style={styles.detailValue}>India</div></div>
							</div>
						</>
					)}

					{page === 'settings' && (
						<>
							<div style={styles.toolbar}>
								<div>
									<div style={styles.quiet}>Configuration</div>
									<ContentHeader title="Settings" subtitle="Application configuration and monitoring preferences." />
								</div>
							</div>
							{[
								{ key: 'monitoring', title: 'Regulatory monitoring', desc: 'Continuously watch RBI, SEBI and IRDAI sources for new changes.' },
								{ key: 'aiAnalysis', title: 'AI impact analysis', desc: 'Automatically suggest affected policies, controls and owners.' },
								{ key: 'criticalAlerts', title: 'Critical change alerts', desc: 'Notify the compliance team when a critical-risk change is detected.' },
								{ key: 'auditLogging', title: 'Audit logging', desc: 'Record every workflow action to the audit trail.' },
								{ key: 'regulatorSources', title: 'Regulator sources', desc: 'Include RBI, SEBI and IRDAI as monitored regulators.' },
							].map((setting) => (
								<div style={styles.settingRow} key={setting.key}>
									<div style={styles.settingText}>
										<p style={styles.settingTitle}>{setting.title}</p>
										<p style={styles.settingDesc}>{setting.desc}</p>
									</div>
									<ToggleGroup
										options={[{ id: 'on', label: 'On' }, { id: 'off', label: 'Off' }]}
										value={settingsState[setting.key]}
										onChange={(value: string) => setSettingsState((current) => ({ ...current, [setting.key]: value as 'on' | 'off' }))}
									/>
								</div>
							))}
						</>
					)}

				</div>
			</div>
		</AppLayout>
	);
};

export default App;
