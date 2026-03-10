import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ==================== PM Schedule Config ====================

export const fetchConfigs = async (year = 2025) => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pm_schedule_config')
      .select('*')
      .eq('year', year)
      .order('machine_id');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching PM configs:', err);
    return [];
  }
};

export const upsertConfig = async (config) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('pm_schedule_config')
      .upsert({
        machine_id: config.machine_id,
        pm_frequency: config.pm_frequency,
        start_month: config.start_month || 1,
        pm_duration_weeks: config.pm_duration_weeks || 1,
        year: config.year || 2025,
        notes: config.notes || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'machine_id,year' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error upserting PM config:', err);
    return null;
  }
};

export const deleteConfig = async (id) => {
  if (!isSupabaseConfigured() || !supabase) return false;
  try {
    const { error } = await supabase
      .from('pm_schedule_config')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting PM config:', err);
    return false;
  }
};

export const bulkUpsertConfigs = async (configs) => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const records = configs.map(c => ({
      machine_id: c.machine_id,
      pm_frequency: c.pm_frequency,
      start_month: c.start_month || 1,
      pm_duration_weeks: c.pm_duration_weeks || 1,
      year: c.year || 2025,
      notes: c.notes || null,
      updated_at: new Date().toISOString(),
    }));
    const { data, error } = await supabase
      .from('pm_schedule_config')
      .upsert(records, { onConflict: 'machine_id,year' })
      .select();
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error bulk upserting PM configs:', err);
    return [];
  }
};

// ==================== PM Schedule Entries ====================

export const fetchEntries = async (year = 2025) => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pm_schedule_entries')
      .select('*')
      .eq('year', year)
      .order('machine_id');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching PM entries:', err);
    return [];
  }
};

export const upsertEntry = async (entry) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('pm_schedule_entries')
      .upsert({
        machine_id: entry.machine_id,
        year: entry.year,
        month: entry.month,
        week: entry.week,
        status: entry.status || 'planned',
        assigned_to: entry.assigned_to || null,
        completed_at: entry.completed_at || null,
        notes: entry.notes || null,
        config_id: entry.config_id || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'machine_id,year,month,week' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error upserting PM entry:', err);
    return null;
  }
};
