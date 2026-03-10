import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchMachines as fetchMachinesFromDB, addMachine as addMachineDB, updateMachine as updateMachineDB, deleteMachine as deleteMachineDB, fetchMachineTypes as fetchTypesDB } from '../services/supabaseMachineService';
import { fetchSparePartsByMachine, addSparePart as addSparePartDB, updateSparePart as updateSparePartDB, deleteSparePart as deleteSparePartDB } from '../services/sparePartsService';
import { fetchEmployees as fetchEmployeesFromDB, addEmployee as addEmployeeDB, updateEmployee as updateEmployeeDB, deleteEmployee as deleteEmployeeDB } from '../services/employeeService';
import { isSupabaseConfigured } from '../lib/supabase';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Initial machine data - Authoritative source: Description of machine.xlsx (91 machines)
const initialMachines = {
  // ========== DRW-STR SECTION (Drawing & Stranding) - 24 machines ==========
  'IW-5': { id: 'IW-5', name: 'Copper Intermediate Drawing Line IW-5', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 28, targetSpeed: 32, temperature: 45, oee: 78, operator: null, description: 'Copper Intermediate Drawing Line IW-5 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2007-11-30' },
  'IW-6': { id: 'IW-6', name: 'Copper Intermediate Drawing Line IW-6', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 27, targetSpeed: 32, temperature: 44, oee: 80, operator: null, description: 'Copper Intermediate Drawing Line IW-6 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2010-09-27' },
  'CL-3': { id: 'CL-3', name: 'Stranding Line CL-3', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 35, targetSpeed: 40, temperature: 38, oee: 75, operator: null, description: 'Stranding Line CL-3 (SETIC)', manufacturer: 'SETIC', country_of_origin: 'France', installed_date: '2002-06-01' },
  'CL-4': { id: 'CL-4', name: 'Stranding Line CL-4', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 36, targetSpeed: 40, temperature: 39, oee: 78, operator: null, description: 'Stranding Line CL-4 (SETIC)', manufacturer: 'SETIC', country_of_origin: 'France', installed_date: '2012-12-30' },
  'CL-5': { id: 'CL-5', name: 'Stranding Line CL-5', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 37, targetSpeed: 40, temperature: 38, oee: 76, operator: null, description: 'Stranding Line CL-5 (SETIC)', manufacturer: 'SETIC', country_of_origin: 'France', installed_date: '2012-12-30' },
  'BN-10': { id: 'BN-10', name: 'Bunching Stranding Line BN-10', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 850, targetSpeed: 900, temperature: 38, oee: 82, operator: null, description: 'Bunching Stranding Line BN-10 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2010-09-27' },
  'BN-11': { id: 'BN-11', name: 'Bunching Stranding Line BN-11', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 840, targetSpeed: 900, temperature: 37, oee: 80, operator: null, description: 'Bunching Stranding Line BN-11 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2010-09-28' },
  'BN-12': { id: 'BN-12', name: 'Bunching Stranding Line BN-12', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 830, targetSpeed: 900, temperature: 36, oee: 79, operator: null, description: 'Bunching Stranding Line BN-12 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2010-09-27' },
  'BN-7': { id: 'BN-7', name: 'Bunching Stranding Line BN-7', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 860, targetSpeed: 900, temperature: 38, oee: 83, operator: null, description: 'Bunching Stranding Line BN-7 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2010-09-27' },
  'BN-8': { id: 'BN-8', name: 'Bunching Stranding Line BN-8', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 845, targetSpeed: 900, temperature: 37, oee: 81, operator: null, description: 'Bunching Stranding Line BN-8 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2010-09-27' },
  'BN-9': { id: 'BN-9', name: 'Bunching Stranding Line BN-9', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 855, targetSpeed: 900, temperature: 38, oee: 82, operator: null, description: 'Bunching Stranding Line BN-9 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2010-09-27' },
  'CW-2': { id: 'CW-2', name: 'Copper and Aluminum Drawing Line CW-2', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 30, targetSpeed: 32, temperature: 43, oee: 78, operator: null, description: 'Copper and Aluminum Drawing Line CW-2 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '1979-02-01' },
  'CW-3': { id: 'CW-3', name: 'Aluminum Drawing Line CW-3', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 29, targetSpeed: 32, temperature: 42, oee: 76, operator: null, description: 'Aluminum Drawing Line CW-3 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '1982-09-01' },
  'CW-4': { id: 'CW-4', name: 'Copper and Aluminum Drawing Line CW-4', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 31, targetSpeed: 32, temperature: 44, oee: 80, operator: null, description: 'Copper and Aluminum Drawing Line CW-4 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '1983-01-01' },
  'CW-5': { id: 'CW-5', name: 'Copper Drawing Line CW-5', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 30, targetSpeed: 32, temperature: 43, oee: 79, operator: null, description: 'Copper Drawing Line CW-5 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '1983-10-01' },
  'CW-6': { id: 'CW-6', name: 'Copper and Aluminum Drawing Line CW-6', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 29, targetSpeed: 32, temperature: 42, oee: 77, operator: null, description: 'Copper and Aluminum Drawing Line CW-6 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2009-08-31' },
  'CW-7': { id: 'CW-7', name: 'Copper Drawing Line CW-7', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 31, targetSpeed: 32, temperature: 44, oee: 82, operator: null, description: 'Copper Drawing Line CW-7 (NEIHOFF)', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2010-09-29' },
  'ST-3': { id: 'ST-3', name: 'Stranding Line ST-3', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 42, targetSpeed: 50, temperature: 36, oee: 78, operator: null, description: 'Stranding Line ST-3 (STOLBERGER)', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-11-01' },
  'ST-4': { id: 'ST-4', name: 'Stranding Line ST-4', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 44, targetSpeed: 50, temperature: 37, oee: 80, operator: null, description: 'Stranding Line ST-4 (STOLBERGER)', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1984-12-01' },
  'ST-5': { id: 'ST-5', name: 'Stranding Line ST-5', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 45, targetSpeed: 50, temperature: 36, oee: 82, operator: null, description: 'Stranding Line ST-5 (SKET)', manufacturer: 'SKET', country_of_origin: 'Germany', installed_date: '2008-08-31' },
  'ST-6': { id: 'ST-6', name: 'Stranding Line ST-6', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 46, targetSpeed: 50, temperature: 37, oee: 83, operator: null, description: 'Stranding Line ST-6 (SKET)', manufacturer: 'SKET', country_of_origin: 'Germany', installed_date: '2011-06-27' },
  'TU-1': { id: 'TU-1', name: 'Stranding Line TU-1', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 43, targetSpeed: 50, temperature: 35, oee: 79, operator: null, description: 'Stranding Line TU-1 (STOLBERGER)', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1980-12-01' },
  'TP-1': { id: 'TP-1', name: 'Electrolytic tin plating Machine', area: 'PCP-1', section: 'DRW-STR', type: 'plating', status: 'running', speed: 20, targetSpeed: 25, temperature: 60, oee: 85, operator: null, description: 'Electrolytic tin plating Machine', manufacturer: 'ATOMEC', country_of_origin: 'Italy', installed_date: '2020-12-31' },
  'DRW-1': { id: 'DRW-1', name: 'Drawing Machine - Niehoff', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'running', speed: 28, targetSpeed: 32, temperature: 45, oee: 76, operator: null, description: 'Drawing Machine - Niehoff', manufacturer: 'NEIHOFF', country_of_origin: 'Germany', installed_date: '2006-12-01' },
  'DT6': { id: 'DT6', name: 'Drawing Unit 6', area: 'PCP-1', section: 'DRW-STR', type: 'drawing', status: 'idle', speed: 0, targetSpeed: 32, temperature: 25, oee: 0, operator: null, description: 'Drawing Unit 6', manufacturer: null, country_of_origin: null, installed_date: null },
  'XT2': { id: 'XT2', name: 'Stranding XT-2', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'idle', speed: 0, targetSpeed: 50, temperature: 25, oee: 0, operator: null, description: 'Stranding XT-2', manufacturer: null, country_of_origin: null, installed_date: null },

  // ========== LV-Cable SECTION - 42 machines ==========
  'TAP-2': { id: 'TAP-2', name: 'TCP MICA Tape Line TAP-2', area: 'PCP-2', section: 'LV-Cable', type: 'taping', status: 'running', speed: 15, targetSpeed: 20, temperature: 50, oee: 78, operator: null, description: 'TCP MICA Tape Line TAP-2 (ALTEC)', manufacturer: 'ALTEC', country_of_origin: 'Italy', installed_date: '2008-11-30' },
  'TAP-3': { id: 'TAP-3', name: 'TCP MICA Tape Line TAP-3', area: 'PCP-2', section: 'LV-Cable', type: 'taping', status: 'running', speed: 15, targetSpeed: 20, temperature: 50, oee: 77, operator: null, description: 'TCP MICA Tape Line TAP-3 (ALTEC)', manufacturer: 'ALTEC', country_of_origin: 'Italy', installed_date: '2008-11-30' },
  'TAP-4': { id: 'TAP-4', name: 'TCP MICA Tape Line TAP-4', area: 'PCP-2', section: 'LV-Cable', type: 'taping', status: 'running', speed: 14, targetSpeed: 20, temperature: 48, oee: 74, operator: null, description: 'TCP MICA Tape Line TAP-4 (ALTEC)', manufacturer: 'ALTEC', country_of_origin: 'Italy', installed_date: '2020-07-31' },
  'TAP-5': { id: 'TAP-5', name: 'TCP MICA Tape Line TAP-5', area: 'PCP-2', section: 'LV-Cable', type: 'taping', status: 'running', speed: 14, targetSpeed: 20, temperature: 48, oee: 75, operator: null, description: 'TCP MICA Tape Line TAP-5 (ALTEC)', manufacturer: 'ALTEC', country_of_origin: 'Italy', installed_date: '2020-07-31' },
  'MT-1': { id: 'MT-1', name: 'MICA Tapping Line MC-1', area: 'PCP-2', section: 'LV-Cable', type: 'taping', status: 'running', speed: 18, targetSpeed: 20, temperature: 45, oee: 80, operator: null, description: 'MICA Tapping Line MC-1 (MSS)', manufacturer: 'MSS', country_of_origin: 'Turkey', installed_date: '2019-04-15' },
  'XL-1': { id: 'XL-1', name: 'LV Insulation Line XL-1', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 120, targetSpeed: 150, temperature: 185, oee: 68, operator: null, description: 'LV Insulation Line XL-1 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '2005-10-01' },
  'XL-2': { id: 'XL-2', name: 'L.V. Insulation Line XL-2', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 145, targetSpeed: 150, temperature: 190, oee: 88, operator: null, description: 'L.V. Insulation Line XL-2 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '1983-10-01' },
  'XL-4': { id: 'XL-4', name: 'LV Insulation Line XL-4', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 130, targetSpeed: 150, temperature: 188, oee: 75, operator: null, description: 'LV Insulation Line XL-4 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '2011-06-27' },
  'XT-1': { id: 'XT-1', name: 'BW Insulation Line XT-1', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 120, targetSpeed: 150, temperature: 180, oee: 80, operator: null, description: 'BW Insulation Line XT-1 (JOHN ROYAL)', manufacturer: 'JOHN ROYAL', country_of_origin: 'USA', installed_date: '1978-07-01' },
  'XT-3': { id: 'XT-3', name: 'L.V. Tandem Line XT-3', area: 'PCP-2', section: 'LV-Cable', type: 'processing', status: 'running', speed: 110, targetSpeed: 150, temperature: 182, oee: 84, operator: null, description: 'L.V. Tandem Line XT-3 (JOHN ROYAL)', manufacturer: 'JOHN ROYAL', country_of_origin: 'USA', installed_date: '1982-07-01' },
  'XT-4': { id: 'XT-4', name: 'LV Sheathing Line XT-4', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 115, targetSpeed: 150, temperature: 178, oee: 78, operator: null, description: 'LV Sheathing Line XT-4 (JOHN ROYAL)', manufacturer: 'JOHN ROYAL', country_of_origin: 'USA', installed_date: '1981-12-01' },
  'XT-6': { id: 'XT-6', name: 'LV Sheathing Line XT-6', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 125, targetSpeed: 150, temperature: 180, oee: 76, operator: null, description: 'LV Sheathing Line XT-6 (SUPERMAC)', manufacturer: 'SUPERMAC', country_of_origin: 'India', installed_date: '2007-11-21' },
  'XT-9': { id: 'XT-9', name: 'THHN Insulation Line XT-9', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 130, targetSpeed: 150, temperature: 185, oee: 80, operator: null, description: 'THHN Insulation Line XT-9 (ROSENDAHL)', manufacturer: 'ROSENDAHL', country_of_origin: 'Austria', installed_date: '2010-09-27' },
  'XT-10': { id: 'XT-10', name: 'LV Insulation Line XT-10', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 135, targetSpeed: 150, temperature: 186, oee: 83, operator: null, description: 'LV Insulation Line XT-10 (ROSENDAHL)', manufacturer: 'ROSENDAHL', country_of_origin: 'Austria', installed_date: '2011-08-01' },
  'XT-11': { id: 'XT-11', name: 'LV Sheathing Line XT-11', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 128, targetSpeed: 150, temperature: 179, oee: 77, operator: null, description: 'LV Sheathing Line XT-11 (SUPERMAC)', manufacturer: 'SUPERMAC', country_of_origin: 'India', installed_date: '2012-12-31' },
  'XT-12': { id: 'XT-12', name: 'LV Tandem Line XT-12', area: 'PCP-2', section: 'LV-Cable', type: 'processing', status: 'running', speed: 118, targetSpeed: 150, temperature: 181, oee: 81, operator: null, description: 'LV Tandem Line XT-12 (SUPERMAC)', manufacturer: 'SUPERMAC', country_of_origin: 'India', installed_date: '2012-12-31' },
  'XT-13': { id: 'XT-13', name: 'LV Sheathing Line XT-13', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 126, targetSpeed: 150, temperature: 180, oee: 78, operator: null, description: 'LV Sheathing Line XT-13 (SUPERMAC)', manufacturer: 'SUPERMAC', country_of_origin: 'India', installed_date: '2012-12-31' },
  'AR-2': { id: 'AR-2', name: 'L.V. Steel Tape Armoring Line AR-2', area: 'PCP-2', section: 'LV-Cable', type: 'armoring', status: 'running', speed: 15.5, targetSpeed: 18, temperature: 42, oee: 71, operator: null, description: 'L.V. Steel Tape Armoring Line AR-2 (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '1984-07-01' },
  'AR-3': { id: 'AR-3', name: 'LV Steel Tape Armoring Line AR-3', area: 'PCP-2', section: 'LV-Cable', type: 'armoring', status: 'running', speed: 17.2, targetSpeed: 18, temperature: 40, oee: 85, operator: null, description: 'LV Steel Tape Armoring Line AR-3 (CEECO)', manufacturer: 'CEECO', country_of_origin: 'USA', installed_date: '1996-12-01' },
  'BC-1': { id: 'BC-1', name: 'LV Assembly Line BC-1', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 35, targetSpeed: 40, temperature: 38, oee: 75, operator: null, description: 'LV Assembly Line BC-1 (EDMUNDS)', manufacturer: 'EDMUNDS', country_of_origin: 'USA', installed_date: '1978-07-01' },
  'BC-2': { id: 'BC-2', name: 'LV Assembly Line BC-2', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 36, targetSpeed: 40, temperature: 37, oee: 78, operator: null, description: 'LV Assembly Line BC-2 (LESMO)', manufacturer: 'LESMO', country_of_origin: 'Italy', installed_date: '2011-11-30' },
  'DT-1': { id: 'DT-1', name: 'LV Assembly Line DT-1', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 28.5, targetSpeed: 32, temperature: 45, oee: 78, operator: null, description: 'LV Assembly Line DT-1 (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '1981-12-01' },
  'DT-2': { id: 'DT-2', name: 'L.V. Steel Wire Armoring Line DT-2', area: 'PCP-2', section: 'LV-Cable', type: 'armoring', status: 'running', speed: 16.5, targetSpeed: 18, temperature: 43, oee: 82, operator: null, description: 'L.V. Steel Wire Armoring Line DT-2 (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '1984-04-01' },
  'DT-4': { id: 'DT-4', name: 'LV Assembly Line DT-4', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 29, targetSpeed: 32, temperature: 44, oee: 76, operator: null, description: 'LV Assembly Line DT-4 (STOLBERGER)', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '2000-07-01' },
  'DT-5': { id: 'DT-5', name: 'LV Assembly and Steel Wire Armoring Line DT-5', area: 'PCP-2', section: 'LV-Cable', type: 'armoring', status: 'running', speed: 16, targetSpeed: 18, temperature: 44, oee: 79, operator: null, description: 'LV Assembly and Steel Wire Armoring Line DT-5 (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '2008-05-24' },
  'DT-8': { id: 'DT-8', name: 'LV Assembly and Steel Wire Armoring Line DT-8', area: 'PCP-2', section: 'LV-Cable', type: 'armoring', status: 'running', speed: 17, targetSpeed: 18, temperature: 42, oee: 86, operator: null, description: 'LV Assembly and Steel Wire Armoring Line DT-8 (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '2012-12-30' },
  'DT-9': { id: 'DT-9', name: 'LV Steel Wire Armoring Line DT-9', area: 'PCP-2', section: 'LV-Cable', type: 'armoring', status: 'running', speed: 16.8, targetSpeed: 18, temperature: 43, oee: 80, operator: null, description: 'LV Steel Wire Armoring Line DT-9 (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '2012-12-30' },
  'PS-1': { id: 'PS-1', name: 'BW Cutting Line PS-1', area: 'PCP-2', section: 'LV-Cable', type: 'cutting', status: 'running', speed: 22, targetSpeed: 25, temperature: 35, oee: 74, operator: null, description: 'BW Cutting Line PS-1 (PS)', manufacturer: 'PS', country_of_origin: 'Italy', installed_date: '2002-07-01' },
  'PS-2': { id: 'PS-2', name: 'BW Cutting Line PS-2', area: 'PCP-2', section: 'LV-Cable', type: 'cutting', status: 'running', speed: 24.5, targetSpeed: 25, temperature: 34, oee: 82, operator: null, description: 'BW Cutting Line PS-2 (PS)', manufacturer: 'PS', country_of_origin: 'Italy', installed_date: '2010-09-27' },
  'PS-3': { id: 'PS-3', name: 'BW Cutting Line PS-3', area: 'PCP-2', section: 'LV-Cable', type: 'cutting', status: 'running', speed: 23, targetSpeed: 25, temperature: 34, oee: 76, operator: null, description: 'BW Cutting Line PS-3 (PS)', manufacturer: 'PS', country_of_origin: 'Italy', installed_date: '2010-09-27' },
  'PS-4': { id: 'PS-4', name: 'BW Cutting Line PS-4', area: 'PCP-2', section: 'LV-Cable', type: 'cutting', status: 'running', speed: 23.8, targetSpeed: 25, temperature: 35, oee: 78, operator: null, description: 'BW Cutting Line PS-4 (PS)', manufacturer: 'PS', country_of_origin: 'Italy', installed_date: '2012-08-31' },
  'TWI-1': { id: 'TWI-1', name: 'TCP Insulation Line TWI-1', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 55, targetSpeed: 60, temperature: 175, oee: 76, operator: null, description: 'TCP Insulation Line TWI-1 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '1990-01-01' },
  'TWI-2': { id: 'TWI-2', name: 'TCP Insulation Line TWI-2', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 58, targetSpeed: 60, temperature: 176, oee: 82, operator: null, description: 'TCP Insulation Line TWI-2 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '1990-01-01' },
  'CAB-2': { id: 'CAB-2', name: 'TCP Pairing Line CAB-2', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 35, targetSpeed: 40, temperature: 38, oee: 79, operator: null, description: 'TCP Pairing Line CAB-2 (SETIC)', manufacturer: 'SETIC', country_of_origin: 'France', installed_date: '2007-11-03' },
  'CAB-4': { id: 'CAB-4', name: 'TCP Pairing Line CAB-4', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 38, targetSpeed: 40, temperature: 39, oee: 85, operator: null, description: 'TCP Pairing Line CAB-4 (SETIC)', manufacturer: 'SETIC', country_of_origin: 'France', installed_date: '2007-11-03' },
  'CAB-5': { id: 'CAB-5', name: 'TCP Pairing Line CAB-5', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 36, targetSpeed: 40, temperature: 38, oee: 80, operator: null, description: 'TCP Pairing Line CAB-5 (SETIC)', manufacturer: 'SETIC', country_of_origin: 'France', installed_date: '2007-11-03' },
  'DTU': { id: 'DTU', name: 'TCP Assembly Lines DTU', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 29.2, targetSpeed: 32, temperature: 44, oee: 78, operator: null, description: 'TCP Assembly Lines DTU (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '1990-01-01' },
  'DTA': { id: 'DTA', name: 'TCP Assembly Lines DTA', area: 'PCP-2', section: 'LV-Cable', type: 'assembly', status: 'running', speed: 30.5, targetSpeed: 32, temperature: 43, oee: 84, operator: null, description: 'TCP Assembly Lines DTA (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '1990-01-01' },
  'ARM-4': { id: 'ARM-4', name: 'TCP Steel Wire Armoring Line AR-4', area: 'PCP-2', section: 'LV-Cable', type: 'armoring', status: 'running', speed: 16.2, targetSpeed: 18, temperature: 41, oee: 77, operator: null, description: 'TCP Steel Wire Armoring Line AR-4 (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '2006-08-01' },
  'JKT-4': { id: 'JKT-4', name: 'TCP Sheathing Line JKT-4', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 18, targetSpeed: 20, temperature: 155, oee: 81, operator: null, description: 'TCP Sheathing Line JKT-4 (ROSENDAHL)', manufacturer: 'ROSENDAHL', country_of_origin: 'Austria', installed_date: '2007-11-22' },
  'SLT': { id: 'SLT', name: 'TCP Slitting Line', area: 'PCP-3', section: 'LV-Cable', type: 'cutting', status: 'running', speed: 20, targetSpeed: 25, temperature: 40, oee: 80, operator: null, description: 'TCP Slitting Line (WYE)', manufacturer: 'WYE', country_of_origin: 'Switzerland', installed_date: '2000-11-01' },
  'XT-7': { id: 'XT-7', name: 'LV Sheathing Line XT-7', area: 'PCP-2', section: 'LV-Cable', type: 'extrusion', status: 'running', speed: 122, targetSpeed: 150, temperature: 179, oee: 76, operator: null, description: 'LV Sheathing Line XT-7 (SUPERMAC)', manufacturer: 'SUPERMAC', country_of_origin: 'India', installed_date: '2007-11-21' },

  // ========== MV-HV SECTION - 8 machines ==========
  'CV-1': { id: 'CV-1', name: 'HV Insulation Line CV-1', area: 'CV-Line', section: 'MV-HV', type: 'extrusion', status: 'running', speed: 8.5, targetSpeed: 10, temperature: 320, oee: 72, operator: null, description: 'HV Insulation Line CV-1 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '1996-06-01' },
  'CV-2': { id: 'CV-2', name: 'HVEHV Insulation Line CV-2', area: 'CV-Line', section: 'MV-HV', type: 'extrusion', status: 'running', speed: 9.2, targetSpeed: 10, temperature: 315, oee: 78, operator: null, description: 'HVEHV Insulation Line CV-2 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '2008-04-30' },
  'CV-3': { id: 'CV-3', name: 'MVHV Insulation Line CV-3', area: 'CV-Line', section: 'MV-HV', type: 'extrusion', status: 'running', speed: 8.8, targetSpeed: 10, temperature: 310, oee: 75, operator: null, description: 'MVHV Insulation Line CV-3 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '2010-02-28' },
  'DT-7': { id: 'DT-7', name: 'MVHV Assembly Line DT-7', area: 'CV-Line', section: 'MV-HV', type: 'assembly', status: 'running', speed: 25, targetSpeed: 30, temperature: 40, oee: 77, operator: null, description: 'MVHV Assembly Line DT-7 (POURTIER)', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '2009-08-31' },
  'XT-8': { id: 'XT-8', name: 'MVHV Sheathing Line XT-8', area: 'CV-Line', section: 'MV-HV', type: 'extrusion', status: 'running', speed: 40, targetSpeed: 50, temperature: 185, oee: 74, operator: null, description: 'MVHV Sheathing Line XT-8 (MAILLEFER)', manufacturer: 'MAILLEFER', country_of_origin: 'Finland', installed_date: '2008-08-31' },
  'LX-2': { id: 'LX-2', name: 'MVHV Lead Line LX-2', area: 'CV-Line', section: 'MV-HV', type: 'processing', status: 'running', speed: 10, targetSpeed: 15, temperature: 200, oee: 70, operator: null, description: 'MVHV Lead Line LX-2 (HFSAB)', manufacturer: 'HFSAB', country_of_origin: 'Sweden', installed_date: '2009-04-30' },
  'LX-3': { id: 'LX-3', name: 'MVHV Lead Line LX-3', area: 'CV-Line', section: 'MV-HV', type: 'processing', status: 'running', speed: 11, targetSpeed: 15, temperature: 195, oee: 72, operator: null, description: 'MVHV Lead Line LX-3 (HFSAB)', manufacturer: 'HFSAB', country_of_origin: 'Sweden', installed_date: '2011-10-31' },
  'SC-2': { id: 'SC-2', name: 'MVHV Screening Line SC-2', area: 'CV-Line', section: 'MV-HV', type: 'processing', status: 'running', speed: 15, targetSpeed: 20, temperature: 45, oee: 73, operator: null, description: 'MVHV Screening Line SC-2 (CORTINOVIS)', manufacturer: 'CORTINOVIS', country_of_origin: 'Italy', installed_date: '2008-04-30' },

  // ========== Support SECTION - 17 machines ==========
  'ST-1': { id: 'ST-1', name: '30W Rigid Strander machine', area: 'PCP-1', section: 'DRW-STR', type: 'stranding', status: 'running', speed: 40, targetSpeed: 50, temperature: 35, oee: 75, operator: null, description: '30W Rigid Strander machine', manufacturer: 'JOHN ROYAL', country_of_origin: 'USA', installed_date: '1978-07-01' },
  'BWR-2': { id: 'BWR-2', name: 'Rewinding BWR-2', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 200, targetSpeed: 250, temperature: 30, oee: 75, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1984-01-01' },
  'BWR-3': { id: 'BWR-3', name: 'Rewinding BWR-3', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 210, targetSpeed: 250, temperature: 31, oee: 77, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1984-01-01' },
  'BWR-1': { id: 'BWR-1', name: 'Rewinding BWR-1', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 195, targetSpeed: 250, temperature: 30, oee: 74, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1984-01-01' },
  'PVC-L1': { id: 'PVC-L1', name: 'Compounding PVC-L1', area: 'PVC-Plant', section: 'Support', type: 'compounding', status: 'running', speed: 50, targetSpeed: 60, temperature: 180, oee: 82, operator: null, description: 'COMPOUNDING', manufacturer: 'BUSS+GOVONI', country_of_origin: 'Italy', installed_date: '1986-07-01' },
  'PVC-L2': { id: 'PVC-L2', name: 'Compounding PVC-L2', area: 'PVC-Plant', section: 'Support', type: 'compounding', status: 'running', speed: 48, targetSpeed: 60, temperature: 178, oee: 80, operator: null, description: 'COMPOUNDING', manufacturer: 'BUSS', country_of_origin: 'Italy', installed_date: '2011-06-27' },
  'RW-3': { id: 'RW-3', name: 'Rewinding RW-3', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 200, targetSpeed: 250, temperature: 30, oee: 75, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-01-01' },
  'RW-4': { id: 'RW-4', name: 'Rewinding RW-4', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 210, targetSpeed: 250, temperature: 31, oee: 77, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-01-01' },
  'RW-2': { id: 'RW-2', name: 'Rewinding RW-2', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 195, targetSpeed: 250, temperature: 30, oee: 74, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-01-01' },
  'RW-1': { id: 'RW-1', name: 'Rewinding RW-1', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 190, targetSpeed: 250, temperature: 30, oee: 73, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-01-01' },
  'RW-11': { id: 'RW-11', name: 'Rewinding RW-11', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 205, targetSpeed: 250, temperature: 31, oee: 76, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-01-01' },
  'RW-12': { id: 'RW-12', name: 'Rewinding RW-12', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 208, targetSpeed: 250, temperature: 31, oee: 77, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-01-01' },
  'HVRW': { id: 'HVRW', name: 'Rewinding HVRW', area: 'CV-Line', section: 'MV-HV', type: 'rewinding', status: 'running', speed: 180, targetSpeed: 200, temperature: 30, oee: 80, operator: null, description: 'REWINDING', manufacturer: 'POURTIER', country_of_origin: 'France', installed_date: '1982-01-01' },
  'RW-10': { id: 'RW-10', name: 'Rewinding RW-10', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 215, targetSpeed: 250, temperature: 31, oee: 78, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-01-01' },
  'RW-5': { id: 'RW-5', name: 'Rewinding RW-5', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 225, targetSpeed: 250, temperature: 31, oee: 80, operator: null, description: 'REWINDING', manufacturer: 'STOLBERGER', country_of_origin: 'Germany', installed_date: '1982-01-01' },
  'D-GASSING': { id: 'D-GASSING', name: 'HEAT TREATMENT', area: 'CV-Line', section: 'MV-HV', type: 'processing', status: 'running', speed: 0, targetSpeed: 0, temperature: 300, oee: 85, operator: null, description: 'HEAT TREATMENT', manufacturer: 'LOCAL', country_of_origin: null, installed_date: '2017-01-01' },
  'ROD-MILL': { id: 'ROD-MILL', name: 'ROLLING MILL', area: 'ROD-MILL', section: 'Support', type: 'processing', status: 'running', speed: 100, targetSpeed: 120, temperature: 600, oee: 78, operator: null, description: 'ROLLING MILL', manufacturer: 'SMS MEER', country_of_origin: 'Germany', installed_date: '1985-12-01' },
  'REW-1': { id: 'REW-1', name: 'Rewinding 1', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 200, targetSpeed: 250, temperature: 30, oee: 75, operator: null, description: 'Rewinding 1', manufacturer: null, country_of_origin: null, installed_date: null },
  'REW-2': { id: 'REW-2', name: 'Rewinding 2', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 195, targetSpeed: 250, temperature: 30, oee: 74, operator: null, description: 'Rewinding 2', manufacturer: null, country_of_origin: null, installed_date: null },
  'REW-4': { id: 'REW-4', name: 'Rewinding 4', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 210, targetSpeed: 250, temperature: 31, oee: 77, operator: null, description: 'Rewinding 4', manufacturer: null, country_of_origin: null, installed_date: null },
  'REW-5': { id: 'REW-5', name: 'Rewinding 5', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 205, targetSpeed: 250, temperature: 31, oee: 76, operator: null, description: 'Rewinding 5', manufacturer: null, country_of_origin: null, installed_date: null },
  'REW-10': { id: 'REW-10', name: 'Rewinding 10', area: 'Support', section: 'Support', type: 'rewinding', status: 'running', speed: 215, targetSpeed: 250, temperature: 31, oee: 78, operator: null, description: 'Rewinding 10', manufacturer: null, country_of_origin: null, installed_date: null },
  'SILO-1': { id: 'SILO-1', name: 'Silo 1', area: 'PVC-Plant', section: 'Support', type: 'storage', status: 'running', speed: 0, targetSpeed: 0, temperature: 25, oee: 95, operator: null, description: 'PVC Storage Silo 1', manufacturer: null, country_of_origin: null, installed_date: null },
  'SILO-2': { id: 'SILO-2', name: 'Silo 2', area: 'PVC-Plant', section: 'Support', type: 'storage', status: 'running', speed: 0, targetSpeed: 0, temperature: 25, oee: 95, operator: null, description: 'PVC Storage Silo 2', manufacturer: null, country_of_origin: null, installed_date: null },
};

// Initial work orders
const initialWorkOrders = [
  { id: 'WO-2024-001', customer: 'Saudi Electricity', product: 'LV Cable 4x70mm', machine: 'XL-1', priority: 'high', status: 'in-progress', progress: 65, dueDate: '2024-02-10', color: 'black' },
  { id: 'WO-2024-002', customer: 'SABIC', product: 'Control Cable 12x2.5mm', machine: 'XL-2', priority: 'medium', status: 'in-progress', progress: 40, dueDate: '2024-02-12', color: 'white' },
  { id: 'WO-2024-003', customer: 'Aramco', product: 'Armored Cable 3x185mm', machine: 'AR-2', priority: 'high', status: 'in-progress', progress: 25, dueDate: '2024-02-08', color: 'red' },
  { id: 'WO-2024-004', customer: 'Ma\'aden', product: 'Instrumentation Cable', machine: 'PS-1', priority: 'low', status: 'pending', progress: 0, dueDate: '2024-02-15', color: 'blue' },
  { id: 'WO-2024-005', customer: 'SWCC', product: 'Submersible Cable', machine: 'CV-1', priority: 'high', status: 'in-progress', progress: 80, dueDate: '2024-02-07', color: 'yellow' },
];

// Initial maintenance data
const initialMaintenance = [
  { id: 'MT-001', machine: 'BC-2', type: 'preventive', description: 'Bearing replacement', status: 'in-progress', assignee: 'Maintenance Team A', startTime: '2024-02-05T08:00', estimatedEnd: '2024-02-05T14:00' },
  { id: 'MT-002', machine: 'XT-11', type: 'corrective', description: 'Motor overheating issue', status: 'in-progress', assignee: 'Electrical Team', startTime: '2024-02-05T09:30', estimatedEnd: '2024-02-05T16:00' },
  { id: 'MT-003', machine: 'XL-4', type: 'predictive', description: 'Vibration anomaly detected', status: 'pending', assignee: 'Maintenance Team B', startTime: null, estimatedEnd: null },
];

// Capacity data - Real Saudi Cable Factory Data (Full Production Capacity)
const capacityData = {
  // LV & BSI Section - 45,000 MT Total
  'LV': { designCapacity: 30000, actualProduction: 5600, unit: 'MT/year', dailyOutput: 42 },
  'BSI': { designCapacity: 7900, actualProduction: 1950, unit: 'MT/year', dailyOutput: 15 },
  'BareCopper': { designCapacity: 7100, actualProduction: 1700, unit: 'MT/year', dailyOutput: 15 },
  'LV-BSI-Total': { designCapacity: 45000, actualProduction: 9250, unit: 'MT/year', category: 'FINAL CABLE' },

  // MV/HV Section - 15,000 MT Total
  'MV': { designCapacity: 8100, actualProduction: 4700, unit: 'MT/year' },
  'HV': { designCapacity: 6900, actualProduction: 1190, unit: 'MT/year' },
  'MV-HV-Total': { designCapacity: 15000, actualProduction: 5890, unit: 'MT/year', category: 'FINAL CABLE' },

  // PVC Plant - 22,000 MT
  'PVC': { designCapacity: 22000, actualProduction: 14680, unit: 'MT/year', dailyOutput: 76, category: 'MATERIAL' },

  // Building Wires
  'BW': { designCapacity: 1700, actualProduction: 400, unit: 'MT/year', dailyOutput: 15 },

  // CV Lines
  'CV-Line': { designCapacity: 5696, actualProduction: 1500, unit: 'MT/year', dailyOutput: 10 },

  // Total Capacity
  'Total': { designCapacity: 27676, actualProduction: 9175, unit: 'MT/year', freeCapacity: '33%' },

  // Legacy compatibility
  'PCP-1': { designCapacity: 21900, actualProduction: 5475, unit: 'MT/year' },
  'PCP-2': { designCapacity: 21900, actualProduction: 5475, unit: 'MT/year' },
  'LV-Cable': { designCapacity: 36000, capacity25: 9000, actualProduction: 9000, unit: 'MT/year', machinesPCP1: 6, machinesPCP2: 14 },
  'BSI-Cable': { designCapacity: 7800, capacity25: 1950, actualProduction: 1950, unit: 'MT/year', machinesPCP1: 8, machinesPCP2: 15 },
};

// Volume Distribution Data (MT) - Business Plan
const volumeDistribution = {
  products: [
    { bpName: 'CU BW', name: 'Building Wire & THHN', y2024: 3597.53, y2025: 3995.00, y2026: 4200.00, y2027: 6000.00 },
    { bpName: 'CU LV', name: 'CU Low Voltage', y2024: 12247.98, y2025: 21600.00, y2026: 27000.00, y2027: 32400.00 },
    { bpName: 'CU MV', name: 'CU Med. Voltage', y2024: 2230.62, y2025: 2005.00, y2026: 2495.00, y2027: 2500.00 },
    { bpName: 'CU HV', name: 'CU High Voltage', y2024: 1561.29, y2025: 3995.00, y2026: 5000.00, y2027: 9000.00 },
    { bpName: 'Instrument', name: 'Instrumentation', y2024: 581.71, y2025: 805.00, y2026: 995.00, y2027: 960.00 },
    { bpName: 'Control & Special', name: 'Control & Speciality Cable', y2024: 300.00, y2025: 500.00, y2026: 600.00, y2027: 600.00 },
    { bpName: 'AL LV', name: 'AL Low Voltage', y2024: 927.21, y2025: 2400.00, y2026: 3000.00, y2027: 1800.00 },
    { bpName: 'AL MV', name: 'AL Med. Voltage', y2024: 4582.65, y2025: 3994.80, y2026: 4999.75, y2027: 4000.00 },
    { bpName: 'AL HV', name: 'AL High Voltage', y2024: 380.73, y2025: 805.00, y2026: 995.00, y2027: 1000.00 },
  ],
  totals: { y2024: 26409.70, y2025: 40099.81, y2026: 49284.76, y2027: 58260.00 }
};

// Actual Transfer Data (Month of October example)
const actualTransferData = {
  month: 'October',
  products: [
    { name: 'Building wires', plan: { cu: 0, al: 0, total: 0 }, actual: { cu: 8.5, al: 0, total: 8.5 }, balance: { cu: 0, al: 0, total: 0 } },
    { name: 'Low Voltage', plan: { cu: 0, al: 0, total: 0 }, actual: { cu: 37.4, al: 16.4, total: 53.8 }, balance: { cu: 0, al: 0, total: 0 } },
    { name: 'Specialty', plan: { cu: 0, al: 0, total: 0 }, actual: { cu: 1.9, al: 0, total: 1.9 }, balance: { cu: 0, al: 0, total: 0 } },
    { name: 'Medium Voltage', plan: { cu: 0, al: 0, total: 0 }, actual: { cu: 4.7, al: 17.0, total: 21.7 }, balance: { cu: 0, al: 0, total: 0 } },
    { name: 'High Voltage', plan: { cu: 0, al: 0, total: 0 }, actual: { cu: 11.9, al: 0, total: 11.9 }, balance: { cu: 0, al: 0, total: 0 } },
    { name: 'Instrumentations', plan: { cu: 0, al: 0, total: 0 }, actual: { cu: 0, al: 0, total: 0 }, balance: { cu: 0, al: 0, total: 0 } },
  ],
  totals: { plan: { cu: 0, al: 0, total: 0 }, actual: { cu: 64.4, al: 33.4, total: 97.8 }, balance: { cu: 0, al: 0, total: 0 } },
  qcTransfer: { cu: 0, al: 0, total: 0 },
  grandTotal: { cu: 0, al: 0, total: 0 }
};

// WIP & Metals Status
const wipMetalsData = {
  workInProcess: {
    aluminum: [
      { product: 'Building wires', mt: 0 },
      { product: 'Low Voltage', mt: 0 },
      { product: 'Speciality', mt: 0 },
      { product: 'Medium Voltage', mt: 140 },
      { product: 'High Voltage', mt: 0 },
      { product: 'Instrumentations', mt: 0 },
    ],
    copper: [
      { product: 'Building wires', mt: 0 },
      { product: 'Low Voltage', mt: 2.6 },
      { product: 'Speciality', mt: 0 },
      { product: 'Medium Voltage', mt: 2.3 },
      { product: 'High Voltage', mt: 3.2 },
      { product: 'Instrumentations', mt: 0 },
    ],
    totals: { aluminum: 140, copper: 8.1 }
  },
  stockOfMetals: { aluminum: 114, copper: 97 },
  metalsReceived: { aluminum: 0, copper: 0 },
  asOfDate: '22/11/2023'
};

// Factory Monthly Output Data
const factoryOutputData = {
  asOf: '05/02/2026',
  mvhv: {
    cv1: { months: ['MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], outputMT: [0, 0, 0, 0, 208, 292, 292, 292, 292, 0], outputKM: [0, 0, 0, 0, 192, 216, 216, 216, 216, 0] },
    cv2: { outputMT: [86, 525, 292, 219, 292, 234, 234, 234, 234, 0], outputKM: [80, 50, 216, 162, 216, 234, 234, 234, 234, 0] },
    cv3: { outputMT: [114, 243, 182, 136, 182, 182, 292, 292, 292, 0], outputKM: [105, 180, 168, 126, 168, 168, 216, 216, 216, 0] },
  },
  pvcPlant: { outputMT: [0, 0, 1835, 1835, 1835, 1835, 1835, 1835, 1835, 1835] },
  lv: { outputMT: [0, 0, 400, 400, 400, 400, 1000, 1000, 1000, 1000] },
  bw: { outputMT: [0, 103, 103, 103, 103, 103, 322, 322, 322, 322] },
  salesOrder: { total: 9175, freeCapacity: '33%' },
  backlog: {
    secOthers: 4082,
    jcc: 1614,
    lvbwItems: 7300,
    potential: 0,
    totalPlan2023: 12996
  },
  potential: [
    { customer: 'L&T', mt: 2000, type: 'Sales Order' },
    { customer: 'New SEC order', mt: 2000, type: 'Sales Order' },
    { customer: 'Nesma', mt: 90, type: 'Sales Order' },
    { customer: 'Riyadh Cable', mt: 980, type: 'Sales Order (Offload)' },
  ],
  requirements: [
    { item: 'SEC 60KM Urgent Batch', req: 5000000, sr: '28.02.2023', by: 'Bank facilities 5MSR' },
    { item: 'Milfer Part', req: 2000000, sr: '15.03.2023', by: '24 MSR Cache' },
    { item: 'Utility', req: 500000, sr: '15.03.2023', by: '24 MSR Cache' },
    { item: 'Souq Items 1000 MT', req: 35000000, sr: '15.03.2023', by: 'Bank facilities 75MSR to arrange Copper' },
    { item: 'SEC & WABRAN Backlog', req: 40000000, sr: '30.03.2023', by: 'Bank facilities 75MSR' },
    { item: 'Raw Material', req: 5000000, sr: '30.03.2023', by: '60 MSR Cache' },
    { item: 'Transportation', req: 3000000, sr: '30.03.2023', by: '60 MSR Cache' },
  ],
  totalRequirements: 90500000
};

// Workforce data - Real Saudi Cable Factory Data
const workforceData = {
  'LV-Cable': {
    direct: { total: 78, vacancies: 55 },
    indirect: { total: 12, vacancies: 0 },
    managers: { total: 4, vacancies: 0 },
    forkLiftDrivers: { total: 6, vacancies: 0 },
    totalHeadcount: 100,
    totalVacancies: 55
  },
  'BSI-Cable': {
    direct: { total: 85, vacancies: 59 },
    indirect: { total: 10, vacancies: 0 },
    managers: { total: 3, vacancies: 0 },
    forkLiftDrivers: { total: 5, vacancies: 0 },
    totalHeadcount: 103,
    totalVacancies: 59
  },
  // Combined for backward compatibility
  'PCP-1': { total: 120, onShift: 85, vacancies: 55 },
  'PCP-2': { total: 80, onShift: 52, vacancies: 59 },
};

// Equipment & Forklifts Data
const equipmentData = {
  forklifts: [
    { id: 'FL-LV-1', section: 'LV-Cable', capacity: '16 TONS', status: 'operational' },
    { id: 'FL-LV-2', section: 'LV-Cable', capacity: '10 TONS', status: 'operational' },
    { id: 'FL-LV-3', section: 'LV-Cable', capacity: '10 TONS', status: 'maintenance' },
    { id: 'FL-LV-4', section: 'LV-Cable', capacity: '16 TONS', status: 'operational' },
    { id: 'FL-BSI-1', section: 'BSI-Cable', capacity: '16 TONS', status: 'operational' },
    { id: 'FL-BSI-2', section: 'BSI-Cable', capacity: '10 TONS', status: 'operational' },
    { id: 'FL-BSI-3', section: 'BSI-Cable', capacity: '10 TONS', status: 'operational' },
  ]
};

// Manpower Data - Real Factory Data (as of 21.11.2023)
const manpowerData = {
  asOfDate: '21.11.2023',
  byDepartment: [
    { department: 'Drawing/Stranding', current: 29, target26K: 39, target40K: 69 },
    { department: 'Low Voltage/BSI', current: 105, target26K: 148, target40K: 169 },
    { department: 'Medium & High Voltage', current: 40, target26K: 84, target40K: 84 },
    { department: 'PVC & Reel Plants', current: 16, target26K: 25, target40K: 26 },
    { department: 'Maintenance & Support', current: 84, target26K: 158, target40K: 160 },
  ],
  totals: { current: 274, target26K: 454, target40K: 508 },
  manufacturing: {
    departments: ['MV/HV/EHV', 'LV/BSI', 'DR/ST', 'PVC/REEL'],
    roles: [
      { role: 'Production Engineer', values: [0, 1, 0, 0] },
      { role: 'Formulation Specialist', values: [0, 0, 0, 0] },
      { role: 'Sr. Supervisor', values: [1, 1, 1, 0] },
      { role: 'Coordinator', values: [1, 1, 0, 1] },
      { role: 'Supervisor', values: [6, 6, 3, 2] },
    ],
    indirectTotal: [8, 9, 4, 3],
    totalManpower: [41, 105, 28, 16],
    percentageEachDept: ['20%', '9%', '14%', '19%'],
    productionTotalIndirect: 24,
    productionTotal: 190,
    percentageOfIndirect: '13%'
  }
};

// Machine Status Data - Real Factory Data
const machineStatusData = {
  categories: ['Still Active', 'Active with B.D.', 'In-Active', 'Write off', 'Sale'],
  bySection: [
    { section: 'DRW/STR', stillActive: 22, activeWithBD: 7, inActive: 1, writeOff: 4, sale: 0, total: 34 },
    { section: 'LV / BSI', stillActive: 24, activeWithBD: 5, inActive: 3, writeOff: 2, sale: 0, total: 34 },
    { section: 'ADD TO LV/BSI FROM TCP', stillActive: 15, activeWithBD: 0, inActive: 0, writeOff: 29, sale: 7, total: 51 },
    { section: 'MV/HV', stillActive: 18, activeWithBD: 1, inActive: 1, writeOff: 2, sale: 0, total: 22 },
    { section: 'SUPPORT PLANT', stillActive: 1, activeWithBD: 1, inActive: 1, writeOff: 0, sale: 0, total: 3 },
  ],
  totals: { stillActive: 80, activeWithBD: 14, inActive: 6, writeOff: 37, sale: 7, total: 144 }
};

// KPI Data - Manufacturing KPIs Year 2023
const kpiData = {
  year: 2023,
  kpis: [
    {
      id: 1,
      name: 'Monthly Transfer',
      unit: '%',
      actual2022: 3,
      target2023: 90,
      criteria: ['Std. Capacity', 'Actual', '%'],
      currentValue: 0,
      status: 'pending'
    },
    {
      id: 2,
      name: 'Scrap (Production)',
      unit: '%',
      actual2022: 2.43,
      target2023: 2.5,
      criteria: ['Scrap', 'Transfer', '%'],
      currentValue: 0,
      status: 'good'
    },
    {
      id: 3,
      name: 'NCR (QC)',
      unit: '%',
      actual2022: 0.75,
      target2023: 2.5,
      criteria: ['NCR', 'Transferred Reels', '%'],
      currentValue: 0,
      status: 'good'
    },
    {
      id: 4,
      name: 'Customers Complaints',
      unit: 'EA',
      actual2022: 10,
      target2023: '-10% of prev.year',
      criteria: ['Number of Customer Complaints'],
      currentValue: 0,
      status: 'pending'
    },
    {
      id: 5,
      name: 'Overtime without CV\'s',
      unit: 'SAR',
      actual2022: 0,
      target2023: '-10%',
      criteria: ['No Budget'],
      currentValue: 0,
      status: 'good'
    },
  ]
};

// Rain Impact Data - Affected Machines due to recent rain
const rainImpactData = {
  affectedArea: 'PCP2',
  reason: 'Post rain water entered inside the plant, removed the water and cleaned entire area',
  rootCause: 'Defective roof',
  affectedMachines: [
    { id: 'DT1', issue: 'Changed hydraulic oil', status: 'resolved', color: '#4A5568' },
    { id: 'DT2', issue: 'Changed hydraulic oil', status: 'resolved', color: '#10B981' },
    { id: 'IW5', issue: 'Water in filter sump', status: 'resolved', color: '#6B7280' },
    { id: 'DT5', issue: 'Motor damaged', status: 'in-progress', color: '#EF4444' },
    { id: 'CW5', issue: 'Trenches overflow', status: 'resolved', color: '#F39200' },
    { id: 'CW2', issue: 'Overflow spooler/trenches', status: 'resolved', color: '#3B82F6' },
  ],
  reportDate: '2023-11-26',
  totalAffected: 6,
  resolved: 5,
  inProgress: 1
};

// Fallback employee data
const initialEmployees = [
  { id: 'local-1', employee_id: 'EMP001', name_en: 'Ahmed Ali', name_ar: 'أحمد علي', department: 'production', role: 'operator', section: 'PCP-1', shift: 'morning', status: 'active', assigned_machine_id: 'DT-1' },
  { id: 'local-2', employee_id: 'EMP002', name_en: 'Mohammed Hassan', name_ar: 'محمد حسن', department: 'production', role: 'operator', section: 'PCP-1', shift: 'morning', status: 'active', assigned_machine_id: 'DT-2' },
  { id: 'local-3', employee_id: 'EMP003', name_en: 'Khalid Omar', name_ar: 'خالد عمر', department: 'production', role: 'operator', section: 'PCP-1', shift: 'morning', status: 'active', assigned_machine_id: 'BC-1' },
  { id: 'local-4', employee_id: 'EMP004', name_en: 'Saeed Ahmed', name_ar: 'سعيد أحمد', department: 'production', role: 'operator', section: 'PCP-1', shift: 'evening', status: 'active', assigned_machine_id: 'AR-2' },
  { id: 'local-5', employee_id: 'EMP005', name_en: 'Faisal Nasser', name_ar: 'فيصل ناصر', department: 'production', role: 'operator', section: 'PCP-2', shift: 'morning', status: 'active', assigned_machine_id: 'AR-3' },
  { id: 'local-6', employee_id: 'EMP009', name_en: 'Ali Supervisor', name_ar: 'علي المشرف', department: 'production', role: 'supervisor', section: 'PCP-1', shift: 'morning', status: 'active', assigned_machine_id: null },
  { id: 'local-7', employee_id: 'EMP011', name_en: 'Ibrahim Tech', name_ar: 'إبراهيم الفني', department: 'maintenance', role: 'technician', section: 'PCP-1', shift: 'morning', status: 'active', assigned_machine_id: null },
  { id: 'local-8', employee_id: 'EMP013', name_en: 'Fahad Engineer', name_ar: 'فهد المهندس', department: 'maintenance', role: 'engineer', section: 'PCP-1', shift: 'morning', status: 'active', assigned_machine_id: null },
  { id: 'local-9', employee_id: 'EMP015', name_en: 'Hassan Maint Sup', name_ar: 'حسن مشرف الصيانة', department: 'maintenance', role: 'supervisor', section: 'PCP-1', shift: 'morning', status: 'active', assigned_machine_id: null },
];

export const DataProvider = ({ children }) => {
  const [machines, setMachines] = useState(initialMachines);
  const [employees, setEmployees] = useState(initialEmployees);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [alerts, setAlerts] = useState([]);
  const [scrapData, setScrapData] = useState([]);
  const [productionLogs, setProductionLogs] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [dbConnected, setDbConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load machines from Supabase on mount (fallback to hardcoded)
  useEffect(() => {
    const loadFromDB = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      try {
        const [dbMachines, dbTypes, dbEmployees] = await Promise.all([
          fetchMachinesFromDB(),
          fetchTypesDB(),
          fetchEmployeesFromDB(),
        ]);
        if (dbMachines && Object.keys(dbMachines).length > 0) {
          setMachines(dbMachines);
          setDbConnected(true);
        }
        if (dbTypes) {
          setMachineTypes(dbTypes);
        }
        if (dbEmployees && dbEmployees.length > 0) {
          setEmployees(dbEmployees);
        }
      } catch (err) {
        console.error('Failed to load from Supabase, using local data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFromDB();
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          if (updated[key].status === 'running') {
            const speedVariation = (Math.random() - 0.5) * 2;
            const tempVariation = (Math.random() - 0.5) * 1;
            updated[key] = {
              ...updated[key],
              speed: Math.max(0, updated[key].speed + speedVariation),
              temperature: Math.max(20, updated[key].temperature + tempVariation),
            };
          }
        });
        return updated;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Add production log
  const addProductionLog = useCallback((log) => {
    setProductionLogs(prev => [{
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...log
    }, ...prev]);
  }, []);

  // Add scrap entry
  const addScrapEntry = useCallback((entry) => {
    setScrapData(prev => [{
      id: `SCRAP-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry
    }, ...prev]);
  }, []);

  // Update machine status
  const updateMachineStatus = useCallback((machineId, updates) => {
    setMachines(prev => ({
      ...prev,
      [machineId]: { ...prev[machineId], ...updates }
    }));
  }, []);

  // Add alert
  const addAlert = useCallback((alert) => {
    const newAlert = {
      id: `ALERT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      ...alert
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  // Calculate OEE for area
  const calculateAreaOEE = useCallback((area) => {
    const areaMachines = Object.values(machines).filter(m => m.area === area && m.status === 'running');
    if (areaMachines.length === 0) return 0;
    return areaMachines.reduce((sum, m) => sum + m.oee, 0) / areaMachines.length;
  }, [machines]);

  // Get machines by area
  const getMachinesByArea = useCallback((area) => {
    return Object.values(machines).filter(m => m.area === area);
  }, [machines]);

  // Get machine statistics
  const getMachineStats = useCallback(() => {
    const all = Object.values(machines);
    return {
      total: all.length,
      running: all.filter(m => m.status === 'running').length,
      idle: all.filter(m => m.status === 'idle').length,
      stopped: all.filter(m => m.status === 'stopped').length,
      maintenance: all.filter(m => m.status === 'maintenance').length,
    };
  }, [machines]);

  // Get machines by section (LV-Cable or BSI-Cable)
  const getMachinesBySection = useCallback((section) => {
    return Object.values(machines).filter(m => m.section === section);
  }, [machines]);

  // Get section statistics
  const getSectionStats = useCallback((section) => {
    const sectionMachines = getMachinesBySection(section);
    return {
      total: sectionMachines.length,
      running: sectionMachines.filter(m => m.status === 'running').length,
      idle: sectionMachines.filter(m => m.status === 'idle').length,
      stopped: sectionMachines.filter(m => m.status === 'stopped').length,
      maintenance: sectionMachines.filter(m => m.status === 'maintenance').length,
      averageOEE: sectionMachines.filter(m => m.status === 'running').reduce((sum, m) => sum + m.oee, 0) /
                  (sectionMachines.filter(m => m.status === 'running').length || 1)
    };
  }, [getMachinesBySection]);

  // ===== CRUD Operations (Supabase-backed) =====

  // Add a new machine
  const addNewMachine = useCallback(async (machine) => {
    if (dbConnected) {
      try {
        await addMachineDB(machine);
      } catch (err) {
        console.error('DB add failed:', err);
        throw err;
      }
    }
    setMachines(prev => ({ ...prev, [machine.id]: machine }));
  }, [dbConnected]);

  // Update a machine
  const updateMachineData = useCallback(async (id, updates) => {
    if (dbConnected) {
      try {
        await updateMachineDB(id, updates);
      } catch (err) {
        console.error('DB update failed:', err);
        throw err;
      }
    }
    setMachines(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  }, [dbConnected]);

  // Delete a machine
  const removeMachine = useCallback(async (id) => {
    if (dbConnected) {
      try {
        await deleteMachineDB(id);
      } catch (err) {
        console.error('DB delete failed:', err);
        throw err;
      }
    }
    setMachines(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  }, [dbConnected]);

  // Spare Parts CRUD
  const getSparePartsForMachine = useCallback(async (machineId) => {
    if (dbConnected) {
      return await fetchSparePartsByMachine(machineId);
    }
    return [];
  }, [dbConnected]);

  const addSparePart = useCallback(async (part) => {
    if (dbConnected) {
      return await addSparePartDB(part);
    }
    return null;
  }, [dbConnected]);

  const updateSparePart = useCallback(async (id, updates) => {
    if (dbConnected) {
      return await updateSparePartDB(id, updates);
    }
    return null;
  }, [dbConnected]);

  const removeSparePart = useCallback(async (id) => {
    if (dbConnected) {
      return await deleteSparePartDB(id);
    }
    return null;
  }, [dbConnected]);

  // ===== Employee CRUD =====
  const addNewEmployee = useCallback(async (employee) => {
    if (dbConnected) {
      try {
        const result = await addEmployeeDB(employee);
        if (result) { setEmployees(prev => [...prev, result]); return result; }
      } catch (err) { console.error('DB add employee failed:', err); throw err; }
    }
    const local = { ...employee, id: `local-${Date.now()}` };
    setEmployees(prev => [...prev, local]);
    return local;
  }, [dbConnected]);

  const updateEmployeeData = useCallback(async (id, updates) => {
    if (dbConnected) {
      try {
        const result = await updateEmployeeDB(id, updates);
        if (result) { setEmployees(prev => prev.map(e => e.id === id ? result : e)); return result; }
      } catch (err) { console.error('DB update employee failed:', err); throw err; }
    }
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, [dbConnected]);

  const removeEmployee = useCallback(async (id) => {
    if (dbConnected) {
      try { await deleteEmployeeDB(id); } catch (err) { console.error('DB delete employee failed:', err); throw err; }
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, [dbConnected]);

  const reloadEmployees = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const dbEmployees = await fetchEmployeesFromDB();
      if (dbEmployees && dbEmployees.length > 0) setEmployees(dbEmployees);
    } catch (err) { console.error('Failed to reload employees:', err); }
  }, []);

  // Reload machines from database
  const reloadMachines = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const dbMachines = await fetchMachinesFromDB();
      if (dbMachines && Object.keys(dbMachines).length > 0) {
        setMachines(dbMachines);
      }
    } catch (err) {
      console.error('Failed to reload machines:', err);
    }
  }, []);

  const value = {
    machines,
    workOrders,
    maintenance,
    alerts,
    scrapData,
    productionLogs,
    capacityData,
    workforceData,
    equipmentData,
    volumeDistribution,
    actualTransferData,
    wipMetalsData,
    factoryOutputData,
    manpowerData,
    machineStatusData,
    kpiData,
    rainImpactData,
    machineTypes,
    dbConnected,
    loading,
    setMachines,
    setWorkOrders,
    setMaintenance,
    setAlerts,
    addProductionLog,
    addScrapEntry,
    updateMachineStatus,
    addAlert,
    calculateAreaOEE,
    getMachinesByArea,
    getMachinesBySection,
    getMachineStats,
    getSectionStats,
    // CRUD operations
    addNewMachine,
    updateMachineData,
    removeMachine,
    getSparePartsForMachine,
    addSparePart,
    updateSparePart,
    removeSparePart,
    reloadMachines,
    // Employee operations
    employees,
    addNewEmployee,
    updateEmployeeData,
    removeEmployee,
    reloadEmployees,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
