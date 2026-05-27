import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;
const apiBase = 'https://marketplace.api.healthcare.gov/api/v1';
const cmsApiKey = process.env.MARKETPLACE_API_KEY || process.env.VITE_MARKETPLACE_API_KEY;

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
  if (incomeRange.startsWith('Under')) return 18000;
  if (incomeRange.endsWith('+')) return 110000;
  const numbers = incomeRange.match(/\d[\d,]*/g)?.map((value) => Number(value.replace(/,/g, ''))) ?? [];
  if (numbers.length >= 2) return Math.round((numbers[0] + numbers[1]) / 2);
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
  return {
    id: plan.id || plan.plan_id || `plan-${index}`,
    name: plan.name || plan.marketing_name || 'Marketplace Plan',
    issuer: plan.issuer?.name || plan.issuer_name || 'CMS Marketplace',
    metalLevel: plan.metal_level || plan.metalLevel || 'Marketplace',
    type: plan.type || plan.plan_type || 'Plan',
    premium: Number.isFinite(premium) ? Math.round(premium) : 0,
    deductible: Number.isFinite(deductible) ? Math.round(deductible) : 0,
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
  const lead = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...req.body };
  const file = path.join(__dirname, 'leads.json');
  let leads = [];
  try {
    leads = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    leads = [];
  }
  leads.unshift(lead);
  await fs.writeFile(file, JSON.stringify(leads.slice(0, 500), null, 2));
  res.status(201).json({ ok: true, lead });
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Health coverage calculator running on port ${port}`);
});
