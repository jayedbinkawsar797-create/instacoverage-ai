import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resend } from 'resend';
import { initSchema, query as dbQuery } from './src/lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const apiBase = 'https://marketplace.api.healthcare.gov/api/v1';
const cmsApiKey = process.env.MARKETPLACE_API_KEY || process.env.VITE_MARKETPLACE_API_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_dLNWzWsB_JrJ56aJB5JocXgvQmXnCDujG';
const NOTIFICATION_TO = 'Ramsayjeanjacques@rjhealthsolutions.com';
const NOTIFICATION_FROM = 'InstaCoverage Leads <noreply@instacoveragequote.com>';
const resend = new Resend(RESEND_API_KEY);

async function sendLeadNotification(lead, body) {
  const agentName = body.agentName || body.agent?.name || 'None selected (unlocked results page)';
  try {
    console.log(`[Resend] Attempting to send lead email for "${body.fullName || body.name || 'Unknown'}" from noreply@instacoveragequote.com to ${NOTIFICATION_TO}...`);
    const data = await resend.emails.send({
      from: NOTIFICATION_FROM,
      to: [NOTIFICATION_TO],
      subject: `🔔 New Lead: ${body.fullName || body.name || 'Unknown'} — InstaCoverage`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#16a34a;margin-bottom:4px;">New Lead Received</h2>
          <p style="color:#6b7280;margin-top:0;">InstaCoverage AI Calculator</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Name</td><td style="padding:8px 0;color:#111827;">${body.fullName || body.name || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Phone</td><td style="padding:8px 0;color:#111827;">${body.phone || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Email</td><td style="padding:8px 0;color:#111827;">${body.email || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Assigned Agent</td><td style="padding:8px 0;color:#2563eb;font-weight:600;">${agentName}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">ZIP Code</td><td style="padding:8px 0;color:#111827;">${body.zipCode || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">State</td><td style="padding:8px 0;color:#111827;">${body.state || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Income Range</td><td style="padding:8px 0;color:#111827;">${body.incomeRange || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Household Size</td><td style="padding:8px 0;color:#111827;">${body.householdSize || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Situation</td><td style="padding:8px 0;color:#111827;">${body.situation || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Plan Preference</td><td style="padding:8px 0;color:#111827;">${body.planPreference || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Urgency</td><td style="padding:8px 0;color:#111827;">${body.urgency || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">SMS Consent</td><td style="padding:8px 0;color:#111827;">${body.smsConsent ? 'Yes' : 'No'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Call Consent</td><td style="padding:8px 0;color:#111827;">${body.callConsent ? 'Yes' : 'No'}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Lead ID</td><td style="padding:8px 0;color:#6b7280;font-size:12px;">${lead.id}</td></tr>
            <tr><td style="padding:8px 0;color:#374151;font-weight:600;">Received At</td><td style="padding:8px 0;color:#6b7280;">${new Date(lead.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
          <p style="color:#9ca3af;font-size:12px;">Sent by InstaCoverage AI &mdash; Do not reply to this email.</p>
        </div>
      `,
    });
    console.log('[Resend] Email sent successfully. Response:', JSON.stringify(data));
  } catch (err) {
    console.error('[Resend] Lead notification email failed:', err.message);
  }
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

function parseAgeFromBirthYear(birthYear) {
  const year = Number(birthYear);
  const currentYear = new Date().getFullYear();
  if (!Number.isFinite(year) || year < 1900 || year > currentYear) return 35;
  return Math.max(0, currentYear - year);
}

function parseIncome(incomeRange, householdSize = 1) {
  if (!incomeRange || incomeRange === 'Prefer not to say') return 42000 + (householdSize - 1) * 9000;
  if (incomeRange.startsWith('Under')) return 20000;
  if (incomeRange.endsWith('+')) return 110000;
  const numbers = incomeRange.match(/\d[\d,]*/g)?.map((value) => Number(value.replace(/,/g, ''))) ?? [];
  if (numbers.length >= 2) return Math.max(numbers[0], numbers[1]);
  return numbers[0] || 42000;
}

async function marketplaceFetch(pathname, options = {}) {
  if (!cmsApiKey) throw new Error('Missing MARKETPLACE_API_KEY');
  const joiner = pathname.includes('?') ? '&' : '?';
  const response = await fetch(`${apiBase}${pathname}${joiner}apikey=${cmsApiKey}`, options);
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const error = new Error(`CMS Marketplace API ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function normalizePlan(plan, index) {
  const premium = Number(plan.premium ?? plan.premium_w_credit ?? 0);
  const deductible = Number(
    plan.deductibles?.[0]?.amount ??
    plan.deductible ??
    plan.medical_deductible ??
    0
  );
  const rawPremiumWithCredit = plan.premium_w_credit !== undefined ? Number(plan.premium_w_credit) : undefined;
  return {
    id: plan.id || plan.plan_id || `plan-${index}`,
    name: plan.name || plan.marketing_name || 'Marketplace Plan',
    issuer: plan.issuer?.name || plan.issuer_name || 'CMS Marketplace',
    metalLevel: plan.metal_level || plan.metalLevel || 'Marketplace',
    type: plan.type || plan.plan_type || 'Plan',
    premium: Number.isFinite(premium) ? Math.round(premium) : 0,
    deductible: Number.isFinite(deductible) ? Math.round(deductible) : 0,
    ...(rawPremiumWithCredit !== undefined && Number.isFinite(rawPremiumWithCredit)
      ? { premiumWithCredit: Math.max(0, Math.round(rawPremiumWithCredit)) }
      : {}),
  };
}

function fallbackPlans() {
  return [
    { id: 'fallback-1', issuer: 'Aetna', metalLevel: 'Bronze', name: 'Bronze HMO Saver', premium: 347, deductible: 6000, type: 'HMO' },
    { id: 'fallback-2', issuer: 'Blue Cross', metalLevel: 'Bronze', name: 'Bronze Standard PPO', premium: 396, deductible: 5500, type: 'PPO' },
    { id: 'fallback-3', issuer: 'UnitedHealth', metalLevel: 'Silver', name: 'Silver HMO Value', premium: 470, deductible: 3500, type: 'HMO' },
    { id: 'fallback-4', issuer: 'Blue Cross', metalLevel: 'Silver', name: 'Silver PPO Choice', premium: 495, deductible: 2500, type: 'PPO' },
    { id: 'fallback-5', issuer: 'Kaiser Permanente', metalLevel: 'Gold', name: 'Gold HMO Premier', premium: 594, deductible: 1000, type: 'HMO' },
    { id: 'fallback-6', issuer: 'Cigna', metalLevel: 'Gold', name: 'Gold PPO Advantage', premium: 668, deductible: 750, type: 'PPO' },
    { id: 'fallback-7', issuer: 'UnitedHealth', metalLevel: 'Platinum', name: 'Platinum HMO Elite', premium: 767, deductible: 250, type: 'HMO' },
  ];
}

app.post('/api/marketplace/results', async (req, res) => {
  const inputs = req.body || {};
  const householdSize = Number(inputs.householdSize || 1);
  const zipCode = String(inputs.zipCode || '').slice(0, 5);

  try {
    const countyData = await marketplaceFetch(`/counties/by/zip/${zipCode}`);
    const county = (Array.isArray(countyData?.counties) ? countyData.counties : countyData)?.[0];
    if (!county?.fips) throw new Error('No county found');

    const people = Array.from({ length: householdSize }, (_, index) => ({
      age: index === 0 ? parseAgeFromBirthYear(inputs.birthYear) : 35,
      aptc_eligible: true,
      gender: 'Female',
      uses_tobacco: false,
    }));

    const planData = await marketplaceFetch('/plans/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        household: { income: parseIncome(inputs.incomeRange, householdSize), people },
        market: 'Individual',
        place: { countyfips: county.fips, state: county.state || inputs.state, zipcode: zipCode },
        year: new Date().getFullYear(),
      }),
    });

    const plans = (planData.plans || [])
      .map(normalizePlan)
      .filter((plan) => plan.premium > 0)
      .sort((a, b) => a.premium - b.premium)
      .slice(0, 7);

    res.json({
      source: plans.length ? 'cms-marketplace' : 'fallback',
      zipCode,
      countyName: county.name,
      validThrough: new Date().getFullYear(),
      plans: plans.length ? plans : fallbackPlans(),
    });
  } catch (error) {
    res.json({
      source: 'fallback',
      zipCode,
      validThrough: new Date().getFullYear(),
      plans: fallbackPlans(),
    });
  }
});

app.post('/api/leads', async (req, res) => {
  const body = req.body || {};
  const lead = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...body };

  // Persist to PostgreSQL when available
  const dbResult = await dbQuery(
    `INSERT INTO leads
       (id, run_id, full_name, phone, email, sms_consent, call_consent,
        zip_code, state, income_range, household_size, situation, plan_preference, urgency, agent_name)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     ON CONFLICT (id) DO NOTHING`,
    [
      lead.id,
      body.runId ?? null,
      body.fullName ?? body.name ?? null,
      body.phone ?? null,
      body.email ?? null,
      body.smsConsent ?? false,
      body.callConsent ?? false,
      body.zipCode ?? null,
      body.state ?? null,
      body.incomeRange ?? null,
      body.householdSize ? Number(body.householdSize) : null,
      body.situation ?? null,
      body.planPreference ?? null,
      body.urgency ?? null,
      body.agentName ?? body.agent?.name ?? null,
    ]
  );

  // Fall back to JSON file store when no database is configured
  if (!dbResult) {
    const file = path.join(__dirname, 'leads.json');
    let leads = [];
    try {
      leads = JSON.parse(await fs.readFile(file, 'utf8'));
    } catch {
      leads = [];
    }
    leads.unshift(lead);
    await fs.writeFile(file, JSON.stringify(leads.slice(0, 500), null, 2));
  }

  res.status(201).json({ ok: true, lead });
  // Fire-and-forget email notification
  sendLeadNotification(lead, body);
});

// Generic user-input submission endpoint
app.post('/api/submit', async (req, res) => {
  const body = req.body || {};
  const content = body.content ?? body.data ?? JSON.stringify(body);

  if (!content || String(content).trim().length === 0) {
    return res.status(400).json({ ok: false, error: 'content is required' });
  }

  const id = crypto.randomUUID();
  const submission = { id, content: String(content).trim(), source: body.source ?? 'web', createdAt: new Date().toISOString() };

  const dbResult = await dbQuery(
    `INSERT INTO submissions (id, content, source) VALUES ($1, $2, $3)`,
    [submission.id, submission.content, submission.source]
  );

  if (!dbResult) {
    // No database — acknowledge without persisting (or extend JSON fallback here if needed)
    console.warn('Submission received but DATABASE_URL is not set; data not persisted.');
  }

  res.status(201).json({ ok: true, submission });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialise DB schema then start listening
initSchema().catch((err) => console.error('Schema init error:', err.message));

app.listen(port, () => {
  console.log(`Health coverage calculator running on port ${port}`);
});
