import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ======================== MACHINES ========================

export const fetchMachines = async () => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .order('id');
  if (error) {
    console.error('Error fetching machines:', error);
    return null;
  }
  const machinesObj = {};
  data.forEach(m => {
    machinesObj[m.id] = {
      id: m.id,
      name: m.name,
      type: m.type,
      area: m.area,
      section: m.section,
      status: m.status || 'idle',
      speed: m.speed || 0,
      targetSpeed: m.target_speed || 0,
      temperature: m.temperature || 25,
      oee: m.oee || 0,
      operator: m.operator,
      locationX: m.location_x,
      locationY: m.location_y,
      notes: m.notes,
      description: m.description,
      manufacturer: m.manufacturer,
      country_of_origin: m.country_of_origin,
      installed_date: m.installed_date,
    };
  });
  return machinesObj;
};

export const addMachine = async (machine) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('machines')
    .insert([{
      id: machine.id,
      name: machine.name,
      type: machine.type,
      area: machine.area,
      section: machine.section,
      status: machine.status || 'idle',
      speed: machine.speed || 0,
      target_speed: machine.targetSpeed || 0,
      temperature: machine.temperature || 25,
      oee: machine.oee || 0,
      operator: machine.operator || null,
      location_x: machine.locationX || null,
      location_y: machine.locationY || null,
      notes: machine.notes || null,
      description: machine.description || null,
      manufacturer: machine.manufacturer || null,
      country_of_origin: machine.country_of_origin || null,
      installed_date: machine.installed_date || null,
    }])
    .select()
    .single();
  if (error) {
    console.error('Error adding machine:', error);
    throw error;
  }
  return data;
};

export const updateMachine = async (id, updates) => {
  if (!isSupabaseConfigured()) return null;
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.area !== undefined) dbUpdates.area = updates.area;
  if (updates.section !== undefined) dbUpdates.section = updates.section;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.speed !== undefined) dbUpdates.speed = updates.speed;
  if (updates.targetSpeed !== undefined) dbUpdates.target_speed = updates.targetSpeed;
  if (updates.temperature !== undefined) dbUpdates.temperature = updates.temperature;
  if (updates.oee !== undefined) dbUpdates.oee = updates.oee;
  if (updates.operator !== undefined) dbUpdates.operator = updates.operator;
  if (updates.locationX !== undefined) dbUpdates.location_x = updates.locationX;
  if (updates.locationY !== undefined) dbUpdates.location_y = updates.locationY;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.manufacturer !== undefined) dbUpdates.manufacturer = updates.manufacturer;
  if (updates.country_of_origin !== undefined) dbUpdates.country_of_origin = updates.country_of_origin;
  if (updates.installed_date !== undefined) dbUpdates.installed_date = updates.installed_date;
  dbUpdates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('machines')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating machine:', error);
    throw error;
  }
  return data;
};

export const deleteMachine = async (id) => {
  if (!isSupabaseConfigured()) return null;
  // First delete related spare parts
  await supabase.from('spare_parts_checklist').delete().eq('machine_id', id);
  const { error } = await supabase.from('machines').delete().eq('id', id);
  if (error) {
    console.error('Error deleting machine:', error);
    throw error;
  }
  return true;
};

// ======================== MACHINE TYPES ========================

export const fetchMachineTypes = async () => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('machine_types')
    .select('*')
    .order('code');
  if (error) {
    console.error('Error fetching machine types:', error);
    return null;
  }
  return data;
};

export const addMachineType = async (type) => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('machine_types')
    .insert([type])
    .select()
    .single();
  if (error) {
    console.error('Error adding machine type:', error);
    throw error;
  }
  return data;
};
