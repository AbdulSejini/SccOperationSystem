import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ======================== TEMPLATES ========================

export const fetchTemplatesByMachine = async (machineId) => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('pm_checklist_templates')
    .select('*')
    .eq('machine_id', machineId)
    .order('list_type, equipment_no, sort_order');
  if (error) { console.error('Error fetching templates:', error); return []; }
  return data;
};

export const addTemplate = async (template) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('pm_checklist_templates')
    .insert([template])
    .select()
    .single();
  if (error) { console.error('Error adding template:', error); throw error; }
  return data;
};

export const addTemplateBatch = async (templates) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('pm_checklist_templates')
    .insert(templates)
    .select();
  if (error) { console.error('Error adding templates batch:', error); throw error; }
  return data;
};

export const deleteTemplate = async (id) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.from('pm_checklist_templates').delete().eq('id', id);
  if (error) { console.error('Error deleting template:', error); throw error; }
  return true;
};

export const deleteTemplatesByMachine = async (machineId) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.from('pm_checklist_templates').delete().eq('machine_id', machineId);
  if (error) { console.error('Error deleting templates:', error); throw error; }
  return true;
};

// ======================== SESSIONS ========================

export const fetchSessions = async (filters = {}) => {
  if (!isSupabaseConfigured()) return [];
  let query = supabase
    .from('pm_checklist_sessions')
    .select('*, machines(id, name, type)')
    .order('created_at', { ascending: false });

  if (filters.machineId) query = query.eq('machine_id', filters.machineId);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.dateFrom) query = query.gte('checklist_date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('checklist_date', filters.dateTo);

  const { data, error } = await query;
  if (error) { console.error('Error fetching sessions:', error); return []; }
  return data;
};

export const fetchSessionById = async (sessionId) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('pm_checklist_sessions')
    .select('*, machines(id, name, type)')
    .eq('id', sessionId)
    .single();
  if (error) { console.error('Error fetching session:', error); return null; }
  return data;
};

export const createSession = async (session) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('pm_checklist_sessions')
    .insert([{
      machine_id: session.machineId,
      order_no: session.orderNo || null,
      notification_no: session.notificationNo || null,
      checklist_date: session.date || new Date().toISOString().split('T')[0],
      prepared_by: session.preparedBy || null,
      status: 'in_progress',
      notes: session.notes || null,
    }])
    .select()
    .single();
  if (error) { console.error('Error creating session:', error); throw error; }
  return data;
};

export const updateSession = async (id, updates) => {
  if (!isSupabaseConfigured()) return null;
  const dbUpdates = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.preparedBy !== undefined) dbUpdates.prepared_by = updates.preparedBy;
  if (updates.orderNo !== undefined) dbUpdates.order_no = updates.orderNo;
  if (updates.notificationNo !== undefined) dbUpdates.notification_no = updates.notificationNo;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { data, error } = await supabase
    .from('pm_checklist_sessions')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('Error updating session:', error); throw error; }
  return data;
};

export const deleteSession = async (id) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.from('pm_checklist_sessions').delete().eq('id', id);
  if (error) { console.error('Error deleting session:', error); throw error; }
  return true;
};

// ======================== CHECKLIST ITEMS ========================

export const fetchItemsBySession = async (sessionId) => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('pm_checklist_items')
    .select('*')
    .eq('session_id', sessionId)
    .order('list_type, equipment_no, created_at');
  if (error) { console.error('Error fetching items:', error); return []; }
  return data;
};

export const createItemsBatch = async (items) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('pm_checklist_items')
    .insert(items)
    .select();
  if (error) { console.error('Error creating items batch:', error); throw error; }
  return data;
};

export const updateItem = async (id, updates) => {
  if (!isSupabaseConfigured()) return null;
  const dbUpdates = {};
  if (updates.actionTaken !== undefined) dbUpdates.action_taken = updates.actionTaken;
  if (updates.sparePartsUsed !== undefined) dbUpdates.spare_parts_used = updates.sparePartsUsed;
  if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.checkedBy !== undefined) dbUpdates.checked_by = updates.checkedBy;
  if (updates.status === 'checked_ok' || updates.status === 'replaced' || updates.status === 'needs_repair') {
    dbUpdates.checked_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('pm_checklist_items')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('Error updating item:', error); throw error; }
  return data;
};

// ======================== HELPER: Create session from template ========================

export const createSessionFromTemplate = async (machineId, sessionData) => {
  // 1. Create the session
  const session = await createSession({ machineId, ...sessionData });
  if (!session) return null;

  // 2. Get templates for this machine
  const templates = await fetchTemplatesByMachine(machineId);

  if (templates.length > 0) {
    // 3. Create checklist items from templates
    const items = templates.map(t => ({
      session_id: session.id,
      template_id: t.id,
      list_type: t.list_type,
      equipment_no: t.equipment_no,
      equipment_name: t.equipment_name,
      part_name: t.part_name,
      essential_care: t.essential_care,
      status: 'pending',
    }));
    await createItemsBatch(items);
  }

  return session;
};
