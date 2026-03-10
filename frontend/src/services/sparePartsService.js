import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const fetchSparePartsByMachine = async (machineId) => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('spare_parts_checklist')
    .select('*')
    .eq('machine_id', machineId)
    .order('part_name');
  if (error) {
    console.error('Error fetching spare parts:', error);
    return [];
  }
  return data;
};

export const fetchAllSpareParts = async () => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('spare_parts_checklist')
    .select('*')
    .order('machine_id, part_name');
  if (error) {
    console.error('Error fetching all spare parts:', error);
    return [];
  }
  return data;
};

export const addSparePart = async (part) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('spare_parts_checklist')
    .insert([{
      machine_id: part.machineId,
      part_name: part.partName,
      part_number: part.partNumber || null,
      is_available: part.isAvailable !== undefined ? part.isAvailable : true,
      quantity: part.quantity || 0,
      min_quantity: part.minQuantity || 0,
      last_replaced: part.lastReplaced || null,
      next_replacement: part.nextReplacement || null,
      checked_by: part.checkedBy || null,
      notes: part.notes || null,
    }])
    .select()
    .single();
  if (error) {
    console.error('Error adding spare part:', error);
    throw error;
  }
  return data;
};

export const updateSparePart = async (id, updates) => {
  if (!isSupabaseConfigured()) return null;
  const dbUpdates = {};
  if (updates.partName !== undefined) dbUpdates.part_name = updates.partName;
  if (updates.partNumber !== undefined) dbUpdates.part_number = updates.partNumber;
  if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.minQuantity !== undefined) dbUpdates.min_quantity = updates.minQuantity;
  if (updates.lastReplaced !== undefined) dbUpdates.last_replaced = updates.lastReplaced;
  if (updates.nextReplacement !== undefined) dbUpdates.next_replacement = updates.nextReplacement;
  if (updates.checkedBy !== undefined) dbUpdates.checked_by = updates.checkedBy;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('spare_parts_checklist')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating spare part:', error);
    throw error;
  }
  return data;
};

export const deleteSparePart = async (id) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase
    .from('spare_parts_checklist')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('Error deleting spare part:', error);
    throw error;
  }
  return true;
};
