/**
 * Machine Profile Service
 * Handles CRUD for machine dimension assessments via Supabase
 * Falls back to local localStorage when Supabase is not configured
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { buildMachineProfile, calcOverallScore, scoreToClass, getAllMachineProfiles } from '../data/machineProfileSeedData';

const LOCAL_KEY = 'scc_machine_profiles';

// ─── Local Storage Helpers ────────────────────────────────────────────────────
function getLocalProfiles() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Initialize from seed
  const seed = getAllMachineProfiles();
  const map  = {};
  seed.forEach(p => { map[p.machine_id] = p; });
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  return map;
}

function saveLocalProfiles(map) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
}

// ─── Get All Profiles ─────────────────────────────────────────────────────────
export async function getAllProfiles() {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('machine_dimension_assessments')
        .select('*')
        .order('machine_id');
      if (!error && data) {
        return groupAssessmentsByMachine(data);
      }
    } catch {}
  }
  // Fallback: local
  const map = getLocalProfiles();
  return Object.values(map);
}

// ─── Get Single Profile ───────────────────────────────────────────────────────
export async function getProfile(machineId) {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('machine_dimension_assessments')
        .select('*')
        .eq('machine_id', machineId);
      if (!error && data?.length) {
        return buildProfileFromRows(machineId, data);
      }
    } catch {}
  }
  const map = getLocalProfiles();
  return map[machineId] || buildMachineProfile(machineId);
}

// ─── Save Dimension Assessment ────────────────────────────────────────────────
export async function saveDimension(machineId, dimension, data) {
  const profile = await getProfile(machineId);
  profile.dimensions[dimension] = { ...profile.dimensions[dimension], ...data };

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('machine_dimension_assessments')
        .upsert({
          machine_id: machineId,
          dimension,
          score:    data.score,
          data:     data,
          status:   data.status,
          submitted_by: data.submitted_by,
          submitted_at: data.submitted_at,
          approved_by:  data.approved_by,
          approved_at:  data.approved_at,
          notes:        data.notes,
          updated_at:   new Date().toISOString(),
        }, { onConflict: 'machine_id,dimension' });
      if (!error) return { success: true };
    } catch {}
  }

  // Fallback local
  const map = getLocalProfiles();
  if (!map[machineId]) map[machineId] = buildMachineProfile(machineId);
  map[machineId].dimensions[dimension] = { ...map[machineId].dimensions[dimension], ...data };
  saveLocalProfiles(map);
  return { success: true };
}

// ─── Submit Dimension (Department submits for approval) ───────────────────────
export async function submitDimension(machineId, dimension, formData, submittedBy) {
  return saveDimension(machineId, dimension, {
    ...formData,
    status:       'submitted',
    submitted_by: submittedBy,
    submitted_at: new Date().toISOString(),
  });
}

// ─── Approve Dimension ────────────────────────────────────────────────────────
export async function approveDimension(machineId, dimension, approvedBy) {
  const profile = await getProfile(machineId);
  const dim     = profile.dimensions[dimension];
  return saveDimension(machineId, dimension, {
    ...dim,
    status:      'approved',
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
  });
}

// ─── Reject Dimension ─────────────────────────────────────────────────────────
export async function rejectDimension(machineId, dimension, rejectedBy, reason) {
  const profile = await getProfile(machineId);
  const dim     = profile.dimensions[dimension];
  return saveDimension(machineId, dimension, {
    ...dim,
    status:          'rejected',
    rejected_reason: reason,
    approved_by:     rejectedBy,
    approved_at:     new Date().toISOString(),
  });
}

// ─── Profile Completeness ─────────────────────────────────────────────────────
export function getProfileCompleteness(profile) {
  const primary = ['maintenance', 'finance', 'production', 'hse'];
  const optional = ['quality', 'it_sap'];
  const dims = profile.dimensions || {};

  const primaryApproved  = primary.filter(d => dims[d]?.status === 'approved').length;
  const primarySubmitted = primary.filter(d => ['submitted', 'approved'].includes(dims[d]?.status)).length;
  const optionalApproved = optional.filter(d => dims[d]?.status === 'approved').length;

  const overallScore = calcOverallScore({
    maintenance: dims.maintenance,
    finance:     dims.finance,
    production:  dims.production,
    hse:         dims.hse,
  });

  return {
    primaryTotal:    primary.length,
    primaryApproved,
    primarySubmitted,
    optionalTotal:   optional.length,
    optionalApproved,
    completePct:     Math.round((primaryApproved / primary.length) * 100),
    overall_score:   overallScore,
    overall_class:   scoreToClass(overallScore),
    status:
      primaryApproved === primary.length ? 'complete' :
      primarySubmitted > 0               ? 'in_progress' :
                                           'pending',
  };
}

// ─── Reset Profile (for testing) ─────────────────────────────────────────────
export async function resetProfile(machineId) {
  const fresh = buildMachineProfile(machineId);
  const map   = getLocalProfiles();
  map[machineId] = fresh;
  saveLocalProfiles(map);
  return { success: true };
}

// ─── Supabase Helpers ─────────────────────────────────────────────────────────
function groupAssessmentsByMachine(rows) {
  const machines = {};
  rows.forEach(row => {
    if (!machines[row.machine_id]) {
      machines[row.machine_id] = buildMachineProfile(row.machine_id);
    }
    machines[row.machine_id].dimensions[row.dimension] = {
      ...machines[row.machine_id].dimensions[row.dimension],
      ...row.data,
      score:        row.score,
      status:       row.status,
      submitted_by: row.submitted_by,
      submitted_at: row.submitted_at,
      approved_by:  row.approved_by,
      approved_at:  row.approved_at,
      notes:        row.notes,
    };
  });
  return Object.values(machines);
}

function buildProfileFromRows(machineId, rows) {
  const profile = buildMachineProfile(machineId);
  rows.forEach(row => {
    profile.dimensions[row.dimension] = {
      ...profile.dimensions[row.dimension],
      ...row.data,
      score:        row.score,
      status:       row.status,
      submitted_by: row.submitted_by,
      submitted_at: row.submitted_at,
      approved_by:  row.approved_by,
      approved_at:  row.approved_at,
      notes:        row.notes,
    };
  });
  return profile;
}
