import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Fetch all employees with optional filters
export const fetchEmployees = async (filters = {}) => {
  if (!isSupabaseConfigured() || !supabase) return [];
  try {
    let query = supabase
      .from('employees')
      .select('*')
      .order('employee_id');

    if (filters.department) query = query.eq('department', filters.department);
    if (filters.role) query = query.eq('role', filters.role);
    if (filters.section) query = query.eq('section', filters.section);
    if (filters.status) query = query.eq('status', filters.status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching employees:', err);
    return [];
  }
};

// Add a new employee
export const addEmployee = async (employee) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('employees')
    .insert({
      employee_id: employee.employee_id,
      name_en: employee.name_en,
      name_ar: employee.name_ar,
      department: employee.department,
      role: employee.role,
      section: employee.section || null,
      shift: employee.shift || 'morning',
      phone: employee.phone || null,
      status: employee.status || 'active',
      assigned_machine_id: employee.assigned_machine_id || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Update an employee
export const updateEmployee = async (id, updates) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const mapped = {};
  if (updates.employee_id !== undefined) mapped.employee_id = updates.employee_id;
  if (updates.name_en !== undefined) mapped.name_en = updates.name_en;
  if (updates.name_ar !== undefined) mapped.name_ar = updates.name_ar;
  if (updates.department !== undefined) mapped.department = updates.department;
  if (updates.role !== undefined) mapped.role = updates.role;
  if (updates.section !== undefined) mapped.section = updates.section;
  if (updates.shift !== undefined) mapped.shift = updates.shift;
  if (updates.phone !== undefined) mapped.phone = updates.phone;
  if (updates.status !== undefined) mapped.status = updates.status;
  if (updates.assigned_machine_id !== undefined) mapped.assigned_machine_id = updates.assigned_machine_id;
  mapped.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('employees')
    .update(mapped)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete an employee
export const deleteEmployee = async (id) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// Assign employee to a machine
export const assignToMachine = async (employeeId, machineId) => {
  if (!isSupabaseConfigured() || !supabase) return null;
  const { data, error } = await supabase
    .from('employees')
    .update({ assigned_machine_id: machineId, updated_at: new Date().toISOString() })
    .eq('id', employeeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
