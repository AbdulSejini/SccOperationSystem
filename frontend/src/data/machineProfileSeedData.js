/**
 * Machine Profile Seed Data
 * Pre-populated from: SCC_Equipment-Criticality-Assessment_v3.xlsx + Machine-Breakdown-KPIs-by-Machine.xlsx + Equipment-Machine-Description-List.xlsx
 * 78 machines — Source: SAP PM Data 2024-2025
 */

// ─── Description / Manufacturer / Country / Section ──────────────────────────
export const machineDescriptions = {
  // DRW/STR Section
  'IW-5':  { desc: 'Copper Intermediate Drawing Line IW-5 (NEIHOFF)', mfr: 'NEIHOFF', country: 'Germany',      installed: 2007, section: 'DRW-STR' },
  'IW-6':  { desc: 'Copper Intermediate Drawing Line IW-6 (NEIHOFF)', mfr: 'NEIHOFF', country: 'Germany',      installed: 2010, section: 'DRW-STR' },
  'CL-3':  { desc: 'Stranding Line CL-3 (SETIC)',                      mfr: 'SETIC',   country: 'France',       installed: 2002, section: 'DRW-STR' },
  'CL-4':  { desc: 'Stranding Line CL-4 (SETIC)',                      mfr: 'SETIC',   country: 'France',       installed: 2012, section: 'DRW-STR' },
  'CL-5':  { desc: 'Stranding Line CL-5 (SETIC)',                      mfr: 'SETIC',   country: 'France',       installed: 2012, section: 'DRW-STR' },
  'BN-7':  { desc: 'Bunching Stranding Line BN-7 (NEIHOFF)',           mfr: 'NEIHOFF', country: 'Germany',      installed: 2010, section: 'DRW-STR' },
  'BN-8':  { desc: 'Bunching Stranding Line BN-8 (NEIHOFF)',           mfr: 'NEIHOFF', country: 'Germany',      installed: 2010, section: 'DRW-STR' },
  'BN-9':  { desc: 'Bunching Stranding Line BN-9 (NEIHOFF)',           mfr: 'NEIHOFF', country: 'Germany',      installed: 2010, section: 'DRW-STR' },
  'BN-10': { desc: 'Bunching Stranding Line BN-10 (NEIHOFF)',          mfr: 'NEIHOFF', country: 'Germany',      installed: 2010, section: 'DRW-STR' },
  'BN-11': { desc: 'Bunching Stranding Line BN-11 (NEIHOFF)',          mfr: 'NEIHOFF', country: 'Germany',      installed: 2010, section: 'DRW-STR' },
  'BN-12': { desc: 'Bunching Stranding Line BN-12 (NEIHOFF)',          mfr: 'NEIHOFF', country: 'Germany',      installed: 2010, section: 'DRW-STR' },
  'CW-2':  { desc: 'Copper and Aluminum Drawing Line CW-2 (NEIHOFF)', mfr: 'NEIHOFF', country: 'Germany',      installed: 1979, section: 'DRW-STR' },
  'CW-3':  { desc: 'Aluminum Drawing Line CW-3 (NEIHOFF)',             mfr: 'NEIHOFF', country: 'Germany',      installed: 1982, section: 'DRW-STR' },
  'CW-4':  { desc: 'Copper and Aluminum Drawing Line CW-4 (NEIHOFF)', mfr: 'NEIHOFF', country: 'Germany',      installed: 1983, section: 'DRW-STR' },
  'CW-5':  { desc: 'Copper Drawing Line CW-5 (NEIHOFF)',               mfr: 'NEIHOFF', country: 'Germany',      installed: 1983, section: 'DRW-STR' },
  'CW-6':  { desc: 'Copper and Aluminum Drawing Line CW-6 (NEIHOFF)', mfr: 'NEIHOFF', country: 'Germany',      installed: 2009, section: 'DRW-STR' },
  'CW-7':  { desc: 'Copper Drawing Line CW-7 (NEIHOFF)',               mfr: 'NEIHOFF', country: 'Germany',      installed: 2010, section: 'DRW-STR' },
  'ST-3':  { desc: 'Stranding Line ST-3 (STOLBERGER)',                  mfr: 'STOLBERGER', country: 'Germany',  installed: 1982, section: 'DRW-STR' },
  'ST-4':  { desc: 'Stranding Line ST-4 (STOLBERGER)',                  mfr: 'STOLBERGER', country: 'Germany',  installed: 1984, section: 'DRW-STR' },
  'ST-5':  { desc: 'Stranding Line ST-5 (SKET)',                        mfr: 'SKET',    country: 'Germany',     installed: 2008, section: 'DRW-STR' },
  'ST-6':  { desc: 'Stranding Line ST-6 (SKET)',                        mfr: 'SKET',    country: 'Germany',     installed: 2011, section: 'DRW-STR' },
  'TU-1':  { desc: 'Stranding Line TU-1 (STOLBERGER)',                  mfr: 'STOLBERGER', country: 'Germany',  installed: 1980, section: 'DRW-STR' },
  // LV Section
  'XL-1':  { desc: 'LV Insulation Line XL-1 (MAILLEFER)',              mfr: 'MAILLEFER', country: 'Finland',   installed: 2005, section: 'LV' },
  'XL-2':  { desc: 'L.V. Insulation Line XL-2 (MAILLEFER)',            mfr: 'MAILLEFER', country: 'Finland',   installed: 1983, section: 'LV' },
  'XL-4':  { desc: 'LV Insulation Line XL-4 (MAILLEFER)',              mfr: 'MAILLEFER', country: 'Finland',   installed: 2011, section: 'LV' },
  'XT-1':  { desc: 'BW Insulation Line XT-1 (JOHN ROYAL)',             mfr: 'JOHN ROYAL', country: 'USA',      installed: 1978, section: 'LV' },
  'XT-2':  { desc: 'LV Insulation Line XT-2',                           mfr: 'JOHN ROYAL', country: 'USA',      installed: 1980, section: 'LV' },
  'XT-3':  { desc: 'L.V. Tandem Line XT-3 (JOHN ROYAL)',               mfr: 'JOHN ROYAL', country: 'USA',      installed: 1982, section: 'LV' },
  'XT-4':  { desc: 'LV Sheathing Line XT-4 (JOHN ROYAL)',              mfr: 'JOHN ROYAL', country: 'USA',      installed: 1981, section: 'LV' },
  'XT-6':  { desc: 'LV Sheathing Line XT-6 (SUPERMAC)',                mfr: 'SUPERMAC',  country: 'India',     installed: 2007, section: 'LV' },
  'XT-7':  { desc: 'LV Sheathing Line XT-7 (SUPERMAC)',                mfr: 'SUPERMAC',  country: 'India',     installed: 2007, section: 'MV-HV' },
  'XT-8':  { desc: 'MVHV Sheathing Line XT-8 (MAILLEFER)',             mfr: 'MAILLEFER', country: 'Finland',   installed: 2008, section: 'MV-HV' },
  'XT-9':  { desc: 'THHN Insulation Line XT-9 (ROSENDAHL)',            mfr: 'ROSENDAHL', country: 'Austria',   installed: 2010, section: 'LV' },
  'XT-10': { desc: 'LV Insulation Line XT-10 (ROSENDAHL)',             mfr: 'ROSENDAHL', country: 'Austria',   installed: 2011, section: 'LV' },
  'XT-11': { desc: 'LV Sheathing Line XT-11 (SUPERMAC)',               mfr: 'SUPERMAC',  country: 'India',     installed: 2012, section: 'LV' },
  'XT-12': { desc: 'LV Tandem Line XT-12 (SUPERMAC)',                  mfr: 'SUPERMAC',  country: 'India',     installed: 2012, section: 'LV' },
  'XT-13': { desc: 'LV Sheathing Line XT-13 (SUPERMAC)',               mfr: 'SUPERMAC',  country: 'India',     installed: 2012, section: 'LV' },
  'AR-2':  { desc: 'L.V. Steel Tape Armoring Line AR-2 (POURTIER)',    mfr: 'POURTIER',  country: 'France',    installed: 1984, section: 'LV' },
  'AR-3':  { desc: 'LV Steel Tape Armoring Line AR-3 (CEECO)',         mfr: 'CEECO',     country: 'USA',       installed: 1996, section: 'LV' },
  'BC-1':  { desc: 'LV Assembly Line BC-1 (EDMUNDS)',                   mfr: 'EDMUNDS',   country: 'USA',       installed: 1978, section: 'LV' },
  'BC-2':  { desc: 'LV Assembly Line BC-2 (LESMO)',                     mfr: 'LESMO',     country: 'Italy',     installed: 2011, section: 'LV' },
  'DT-1':  { desc: 'LV Assembly Line DT-1 (POURTIER)',                  mfr: 'POURTIER',  country: 'France',    installed: 1981, section: 'LV' },
  'DT-2':  { desc: 'L.V. Steel Wire Armoring Line DT-2 (POURTIER)',    mfr: 'POURTIER',  country: 'France',    installed: 1984, section: 'LV' },
  'DT-4':  { desc: 'LV Assembly Line DT-4 (STOLBERGER)',               mfr: 'STOLBERGER', country: 'Germany',  installed: 2000, section: 'LV' },
  'DT-5':  { desc: 'LV Assembly and Steel Wire Armoring Line DT-5 (POURTIER)', mfr: 'POURTIER', country: 'France', installed: 2008, section: 'LV' },
  'DT-7':  { desc: 'MVHV Assembly Line DT-7 (POURTIER)',               mfr: 'POURTIER',  country: 'France',    installed: 2009, section: 'MV-HV' },
  'DT-8':  { desc: 'LV Assembly and Steel Wire Armoring Line DT-8 (POURTIER)', mfr: 'POURTIER', country: 'France', installed: 2012, section: 'LV' },
  'DT-9':  { desc: 'LV Steel Wire Armoring Line DT-9 (POURTIER)',      mfr: 'POURTIER',  country: 'France',    installed: 2012, section: 'LV' },
  'PS-1':  { desc: 'BW Cutting Line PS-1',                              mfr: 'PS',        country: 'Italy',     installed: 2002, section: 'LV' },
  'PS-2':  { desc: 'BW Cutting Line PS-2',                              mfr: 'PS',        country: 'Italy',     installed: 2010, section: 'LV' },
  'PS-3':  { desc: 'BW Cutting Line PS-3',                              mfr: 'PS',        country: 'Italy',     installed: 2010, section: 'LV' },
  'PS-4':  { desc: 'BW Cutting Line PS-4',                              mfr: 'PS',        country: 'Italy',     installed: 2012, section: 'LV' },
  // MV-HV Section
  'CV-1':  { desc: 'HV Insulation Line CV-1 (MAILLEFER)',               mfr: 'MAILLEFER', country: 'Finland',   installed: 1996, section: 'MV-HV' },
  'CV-2':  { desc: 'HV/EHV Insulation Line CV-2 (MAILLEFER)',           mfr: 'MAILLEFER', country: 'Finland',   installed: 2008, section: 'MV-HV' },
  'CV-3':  { desc: 'MV/HV Insulation Line CV-3 (MAILLEFER)',            mfr: 'MAILLEFER', country: 'Finland',   installed: 2010, section: 'MV-HV' },
  'LX-2':  { desc: 'MVHV Lead Line LX-2 (HFSAB)',                       mfr: 'HFSAB',     country: 'Sweden',    installed: 2009, section: 'MV-HV' },
  'LX-3':  { desc: 'MVHV Lead Line LX-3 (HFSAB)',                       mfr: 'HFSAB',     country: 'Sweden',    installed: 2011, section: 'MV-HV' },
  'SC-2':  { desc: 'MVHV Screening Line SC-2 (CORTINOVIS)',             mfr: 'CORTINOVIS', country: 'Italy',    installed: 2008, section: 'MV-HV' },
  // Support Section
  'RW-1':  { desc: 'Rewinding Machine RW-1 (STOLBERGER)',               mfr: 'STOLBERGER', country: 'Germany',  installed: 1984, section: 'Support' },
  'RW-2':  { desc: 'Rewinding Machine RW-2 (STOLBERGER)',               mfr: 'STOLBERGER', country: 'Germany',  installed: 1984, section: 'Support' },
  'RW-4':  { desc: 'Rewinding Machine RW-4 (STOLBERGER)',               mfr: 'STOLBERGER', country: 'Germany',  installed: 1984, section: 'Support' },
  'RW-5':  { desc: 'Rewinding Machine RW-5 (STOLBERGER)',               mfr: 'STOLBERGER', country: 'Germany',  installed: 1984, section: 'Support' },
  'RW-10': { desc: 'Rewinding Machine RW-10 (STOLBERGER)',              mfr: 'STOLBERGER', country: 'Germany',  installed: 1984, section: 'Support' },
  'RW-11': { desc: 'Rewinding Machine RW-11 (STOLBERGER)',              mfr: 'STOLBERGER', country: 'Germany',  installed: 1984, section: 'Support' },
  'RW-12': { desc: 'Rewinding Machine RW-12 (STOLBERGER)',              mfr: 'STOLBERGER', country: 'Germany',  installed: 1984, section: 'Support' },
};

// ─── Criticality Assessment Data (from Assessment Matrix) ────────────────────
// Fields: S(Safety), P(Production), Q(Quality), FF(Failure Freq.), M(Maintainability), R(Redundancy)
//         cm=CM orders, pm=PM orders, bd_hrs=Breakdown Hours, bd_pct=BD%, mtbf=MTBF(hrs), score=Weighted Score
//         op_status=Operational Status, inherent_class, effective_class, pm_strategy
export const criticalityData = {
  'XL-4':  { S:4, P:5, Q:5, FF:5, M:4, R:5, score:4.65, cm:164, pm:2,  bd_hrs:144.1, bd_pct:9.1,  mtbf:9.7,  op_status:'Active',          inherent_class:'A', effective_class:'A', pm_strategy:'Condition-based + Weekly PM' },
  'XT-9':  { S:4, P:5, Q:5, FF:5, M:4, R:4, score:4.55, cm:142, pm:1,  bd_hrs:74.2,  bd_pct:12.8, mtbf:4.1,  op_status:'Active',          inherent_class:'A', effective_class:'A', pm_strategy:'Condition-based + Weekly PM' },
  'XT-6':  { S:4, P:5, Q:5, FF:5, M:4, R:4, score:4.55, cm:127, pm:2,  bd_hrs:15.8,  bd_pct:2.1,  mtbf:5.9,  op_status:'Active',          inherent_class:'A', effective_class:'A', pm_strategy:'Condition-based + Weekly PM' },
  'XT-3':  { S:4, P:5, Q:5, FF:5, M:4, R:4, score:4.55, cm:70,  pm:2,  bd_hrs:5.0,   bd_pct:2.1,  mtbf:3.4,  op_status:'Active',          inherent_class:'A', effective_class:'A', pm_strategy:'Condition-based + Weekly PM' },
  'XT-8':  { S:4, P:5, Q:5, FF:4, M:4, R:4, score:4.40, cm:80,  pm:2,  bd_hrs:1.5,   bd_pct:0.2,  mtbf:8.9,  op_status:'Active',          inherent_class:'A', effective_class:'A', pm_strategy:'Condition-based + Weekly PM' },
  'XT-12': { S:4, P:5, Q:5, FF:4, M:4, R:4, score:4.40, cm:69,  pm:0,  bd_hrs:17.5,  bd_pct:3.6,  mtbf:6.9,  op_status:'Active',          inherent_class:'A', effective_class:'A', pm_strategy:'Condition-based + Weekly PM' },
  'LX-2':  { S:4, P:4, Q:4, FF:4, M:3, R:3, score:3.80, cm:71,  pm:2,  bd_hrs:33.0,  bd_pct:2.6,  mtbf:18.2, op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'TU-1':  { S:3, P:4, Q:4, FF:5, M:3, R:4, score:3.80, cm:68,  pm:1,  bd_hrs:3.2,   bd_pct:1.1,  mtbf:4.4,  op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'DT-1':  { S:3, P:4, Q:3, FF:5, M:4, R:3, score:3.65, cm:112, pm:2,  bd_hrs:72.5,  bd_pct:6.9,  mtbf:9.4,  op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'ST-5':  { S:3, P:4, Q:4, FF:4, M:3, R:3, score:3.55, cm:58,  pm:2,  bd_hrs:23.9,  bd_pct:2.1,  mtbf:19.3, op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'ST-6':  { S:3, P:4, Q:4, FF:4, M:3, R:3, score:3.55, cm:56,  pm:3,  bd_hrs:12.4,  bd_pct:1.0,  mtbf:22.6, op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'SC-2':  { S:3, P:4, Q:4, FF:3, M:3, R:4, score:3.50, cm:24,  pm:1,  bd_hrs:9.6,   bd_pct:2.1,  mtbf:18.7, op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'CV-2':  { S:3, P:4, Q:4, FF:3, M:3, R:3, score:3.40, cm:40,  pm:1,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:17.0, op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'CV-3':  { S:3, P:4, Q:4, FF:3, M:3, R:3, score:3.40, cm:27,  pm:2,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:34.0, op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'DT-8':  { S:3, P:4, Q:3, FF:3, M:3, R:3, score:3.25, cm:48,  pm:0,  bd_hrs:14.3,  bd_pct:2.1,  mtbf:14.4, op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'DT-7':  { S:3, P:4, Q:3, FF:3, M:3, R:3, score:3.25, cm:31,  pm:1,  bd_hrs:22.8,  bd_pct:6.7,  mtbf:11.0, op_status:'Active',          inherent_class:'B', effective_class:'B', pm_strategy:'Monthly PM cycle' },
  'CW-6':  { S:2, P:3, Q:2, FF:4, M:3, R:4, score:2.85, cm:57,  pm:1,  bd_hrs:72.6,  bd_pct:14.1, mtbf:9.0,  op_status:'Active',          inherent_class:'C', effective_class:'C', pm_strategy:'Quarterly PM cycle' },
  'CW-2':  { S:2, P:3, Q:2, FF:4, M:3, R:2, score:2.65, cm:69,  pm:1,  bd_hrs:32.5,  bd_pct:8.1,  mtbf:5.8,  op_status:'Active',          inherent_class:'C', effective_class:'C', pm_strategy:'Quarterly PM cycle' },
  'CW-3':  { S:2, P:3, Q:2, FF:3, M:3, R:2, score:2.50, cm:48,  pm:1,  bd_hrs:19.9,  bd_pct:3.5,  mtbf:11.8, op_status:'Active',          inherent_class:'C', effective_class:'C', pm_strategy:'Quarterly PM cycle' },
  'IW-6':  { S:2, P:2, Q:2, FF:3, M:2, R:2, score:2.15, cm:14,  pm:2,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:16.8, op_status:'Active',          inherent_class:'C', effective_class:'C', pm_strategy:'Quarterly PM cycle' },
  // Low Utilization
  'XT-7':  { S:4, P:5, Q:5, FF:4, M:4, R:4, score:4.40, cm:14,  pm:1,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:8.6,  op_status:'Low Utilization', inherent_class:'A', effective_class:'A', pm_strategy:'Monthly PM (reduced from weekly)' },
  'ST-4':  { S:3, P:4, Q:4, FF:5, M:3, R:3, score:3.70, cm:37,  pm:1,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:1.6,  op_status:'Low Utilization', inherent_class:'B', effective_class:'B', pm_strategy:'Quarterly PM' },
  'DT-5':  { S:3, P:4, Q:3, FF:3, M:3, R:3, score:3.25, cm:10,  pm:1,  bd_hrs:3.0,   bd_pct:2.0,  mtbf:14.7, op_status:'Low Utilization', inherent_class:'B', effective_class:'B', pm_strategy:'Quarterly PM' },
  'CW-4':  { S:2, P:3, Q:2, FF:4, M:2, R:4, score:2.75, cm:23,  pm:0,  bd_hrs:28.1,  bd_pct:18.6, mtbf:6.6,  op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  'PS-1':  { S:2, P:3, Q:2, FF:5, M:2, R:2, score:2.70, cm:26,  pm:0,  bd_hrs:5.1,   bd_pct:6.5,  mtbf:3.0,  op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  'BN-12': { S:2, P:3, Q:3, FF:4, M:2, R:2, score:2.70, cm:25,  pm:0,  bd_hrs:0.6,   bd_pct:0.3,  mtbf:7.4,  op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  'BC-1':  { S:2, P:3, Q:3, FF:4, M:2, R:2, score:2.70, cm:16,  pm:0,  bd_hrs:7.0,   bd_pct:4.5,  mtbf:9.7,  op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  'CW-5':  { S:2, P:3, Q:2, FF:4, M:2, R:2, score:2.55, cm:22,  pm:1,  bd_hrs:7.3,   bd_pct:6.1,  mtbf:5.4,  op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  'PS-2':  { S:2, P:3, Q:2, FF:4, M:2, R:2, score:2.55, cm:21,  pm:1,  bd_hrs:2.0,   bd_pct:1.1,  mtbf:8.3,  op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  'BN-11': { S:2, P:3, Q:3, FF:3, M:2, R:2, score:2.55, cm:11,  pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:15.1, op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  'BN-9':  { S:2, P:3, Q:3, FF:1, M:2, R:2, score:2.25, cm:4,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:42.8, op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  'CL-5':  { S:2, P:3, Q:3, FF:1, M:2, R:2, score:2.25, cm:3,   pm:2,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:20.3, op_status:'Low Utilization', inherent_class:'C', effective_class:'C', pm_strategy:'Semi-annual PM' },
  // Dormant
  'XT-10': { S:4, P:5, Q:5, FF:5, M:4, R:4, score:4.55, cm:64,  pm:0,  bd_hrs:12.0,  bd_pct:46.2, mtbf:0.4,  op_status:'Dormant',         inherent_class:'A', effective_class:'Dormant', pm_strategy:'Assess repair feasibility' },
  'DT-2':  { S:3, P:4, Q:3, FF:5, M:3, R:3, score:3.55, cm:6,   pm:2,  bd_hrs:1.0,   bd_pct:4.5,  mtbf:3.7,  op_status:'Dormant',         inherent_class:'B', effective_class:'Dormant', pm_strategy:'Assess repair feasibility' },
  'AR-3':  { S:3, P:3, Q:3, FF:5, M:3, R:4, score:3.40, cm:10,  pm:1,  bd_hrs:8.2,   bd_pct:34.2, mtbf:2.4,  op_status:'Dormant',         inherent_class:'B', effective_class:'Dormant', pm_strategy:'Assess repair feasibility' },
  'RW-2':  { S:2, P:2, Q:2, FF:3, M:2, R:1, score:2.05, cm:27,  pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Dormant',         inherent_class:'C', effective_class:'Dormant', pm_strategy:'Assess repair feasibility' },
  'RW-10': { S:2, P:2, Q:2, FF:2, M:2, R:1, score:1.90, cm:17,  pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Dormant',         inherent_class:'D', effective_class:'Dormant', pm_strategy:'Assess repair feasibility' },
  'RW-1':  { S:2, P:2, Q:2, FF:2, M:2, R:1, score:1.90, cm:10,  pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Dormant',         inherent_class:'D', effective_class:'Dormant', pm_strategy:'Assess repair feasibility' },
  'RW-11': { S:2, P:2, Q:2, FF:2, M:2, R:1, score:1.90, cm:8,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Dormant',         inherent_class:'D', effective_class:'Dormant', pm_strategy:'Assess repair feasibility' },
  // Standby
  'XL-1':  { S:4, P:5, Q:5, FF:1, M:4, R:5, score:4.05, cm:0,   pm:1,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'A', effective_class:'Standby', pm_strategy:'Preservation only' },
  'XL-2':  { S:4, P:5, Q:5, FF:1, M:4, R:5, score:4.05, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'A', effective_class:'Standby', pm_strategy:'Preservation only' },
  'XT-4':  { S:4, P:5, Q:5, FF:1, M:4, R:4, score:3.95, cm:1,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'B', effective_class:'Standby', pm_strategy:'Preservation only' },
  'XT-11': { S:4, P:5, Q:5, FF:1, M:4, R:4, score:3.95, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'B', effective_class:'Standby', pm_strategy:'Preservation only' },
  'XT-13': { S:4, P:5, Q:5, FF:1, M:4, R:4, score:3.95, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'B', effective_class:'Standby', pm_strategy:'Preservation only' },
  'XT-2':  { S:4, P:5, Q:5, FF:1, M:4, R:4, score:3.95, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'B', effective_class:'Standby', pm_strategy:'Preservation only' },
  'XT-1':  { S:4, P:5, Q:5, FF:1, M:4, R:4, score:3.95, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'B', effective_class:'Standby', pm_strategy:'Preservation only' },
  'LX-3':  { S:4, P:4, Q:4, FF:1, M:3, R:3, score:3.35, cm:0,   pm:1,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'B', effective_class:'Standby', pm_strategy:'Preservation only' },
  'ST-3':  { S:3, P:4, Q:4, FF:1, M:3, R:3, score:3.10, cm:1,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'B', effective_class:'Standby', pm_strategy:'Preservation only' },
  'CV-1':  { S:3, P:4, Q:4, FF:1, M:3, R:3, score:3.10, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'B', effective_class:'Standby', pm_strategy:'Preservation only' },
  'DT-4':  { S:3, P:4, Q:3, FF:1, M:3, R:3, score:2.95, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'DT-9':  { S:3, P:4, Q:3, FF:1, M:3, R:3, score:2.95, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'BN-7':  { S:2, P:3, Q:3, FF:4, M:2, R:2, score:2.70, cm:3,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:9.7,  op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'AR-2':  { S:3, P:3, Q:3, FF:1, M:3, R:3, score:2.70, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'BN-8':  { S:2, P:3, Q:3, FF:1, M:2, R:2, score:2.25, cm:1,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'BN-10': { S:2, P:3, Q:3, FF:1, M:2, R:2, score:2.25, cm:0,   pm:1,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'CL-3':  { S:2, P:3, Q:3, FF:1, M:2, R:2, score:2.25, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'CL-4':  { S:2, P:3, Q:3, FF:1, M:2, R:2, score:2.25, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'BC-2':  { S:2, P:3, Q:3, FF:1, M:2, R:2, score:2.25, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'CW-7':  { S:2, P:3, Q:2, FF:1, M:2, R:2, score:2.10, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'PS-3':  { S:2, P:3, Q:2, FF:1, M:2, R:2, score:2.10, cm:1,   pm:1,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'PS-4':  { S:2, P:3, Q:2, FF:1, M:2, R:2, score:2.10, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'C', effective_class:'Standby', pm_strategy:'Preservation only' },
  'IW-5':  { S:2, P:2, Q:2, FF:1, M:2, R:2, score:1.85, cm:0,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'D', effective_class:'Standby', pm_strategy:'Preservation only' },
  'RW-5':  { S:2, P:2, Q:2, FF:1, M:2, R:1, score:1.75, cm:4,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'D', effective_class:'Standby', pm_strategy:'Preservation only' },
  'RW-12': { S:2, P:2, Q:2, FF:1, M:2, R:1, score:1.75, cm:3,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'D', effective_class:'Standby', pm_strategy:'Preservation only' },
  'RW-4':  { S:2, P:2, Q:2, FF:1, M:2, R:1, score:1.75, cm:1,   pm:0,  bd_hrs:0.0,   bd_pct:0.0,  mtbf:null, op_status:'Standby',         inherent_class:'D', effective_class:'Standby', pm_strategy:'Preservation only' },
};

// ─── Helper: Calculate Maintenance Score from data ───────────────────────────
function calcMaintenanceScore(c) {
  if (!c) return 3;
  const cm = c.cm || 0;
  const bd = c.bd_pct || 0;
  if (cm >= 100 || bd >= 20) return 5;
  if (cm >= 50  || bd >= 10) return 4;
  if (cm >= 20  || bd >= 5)  return 3;
  if (cm >= 5   || bd >= 1)  return 2;
  return 1;
}

// ─── Helper: Calculate Finance Score from asset age ──────────────────────────
function calcFinanceScore(installed) {
  if (!installed) return 3;
  const age = 2026 - installed;
  if (age >= 40) return 5;
  if (age >= 30) return 4;
  if (age >= 20) return 3;
  if (age >= 10) return 2;
  return 1;
}

// ─── Helper: Calculate Overall Score ─────────────────────────────────────────
export function calcOverallScore(dimensions) {
  const { maintenance, finance, production, hse } = dimensions;
  const mScore = maintenance?.score;
  const fScore = finance?.score;
  const pScore = production?.score;
  const hScore = hse?.score;
  const count  = [mScore, fScore, pScore, hScore].filter(Boolean).length;
  if (count === 0) return null;
  const sum = (mScore || 0) * 0.30 + (fScore || 0) * 0.25 + (pScore || 0) * 0.30 + (hScore || 0) * 0.15;
  return parseFloat(sum.toFixed(2));
}

export function scoreToClass(score) {
  if (score === null || score === undefined) return null;
  if (score >= 4.0) return 'A';
  if (score >= 3.0) return 'B';
  if (score >= 2.0) return 'C';
  return 'D';
}

// ─── Build Full Machine Profile Seed ─────────────────────────────────────────
export function buildMachineProfile(machineId) {
  const c    = criticalityData[machineId];
  const d    = machineDescriptions[machineId];
  const age  = d ? 2026 - d.installed : null;
  const sapId = machineId.replace('-', '').replace('/', '');   // e.g. XL-4 → XL4

  const maintScore = calcMaintenanceScore(c);
  const finScore   = calcFinanceScore(d?.installed);
  const prodScore  = c?.P || 3;
  const hseScore   = c?.S || 2;
  const qualScore  = c?.Q || 2;

  return {
    machine_id: machineId,
    sap_functional_loc: `PCP-${sapId}`,
    description:    d?.desc    || machineId,
    manufacturer:   d?.mfr     || '—',
    country:        d?.country || '—',
    installed_year: d?.installed || null,
    asset_age_years: age,
    section:        d?.section  || 'Unknown',
    operational_status: c?.op_status || 'Unknown',
    inherent_class: c?.inherent_class || null,
    effective_class: c?.effective_class || null,
    criticality_score: c?.score || null,

    dimensions: {
      maintenance: {
        score: maintScore,
        status: 'pending',
        // Pre-filled from SAP/Excel
        pm_strategy:       c?.pm_strategy || '—',
        cm_count_annual:   c?.cm || 0,
        pm_count_annual:   c?.pm || 0,
        bd_hours_annual:   c?.bd_hrs || 0,
        bd_pct:            c?.bd_pct || 0,
        mtbf_hrs:          c?.mtbf || null,
        ff_score:          c?.FF || null,
        maintainability_score: c?.M || null,
        // Department fills
        last_pm_date:          null,
        next_pm_date:          null,
        pending_wo_count:      null,
        spare_parts_available: null,
        lube_last_date:        null,
        notes: '',
        submitted_by: null, submitted_at: null,
        approved_by: null,  approved_at: null,
        rejected_reason: null,
      },
      finance: {
        score: finScore,
        status: 'pending',
        // Pre-filled
        asset_age_years:    age,
        installed_year:     d?.installed || null,
        manufacturer:       d?.mfr || '—',
        country_of_origin:  d?.country || '—',
        // Finance dept fills
        replacement_cost_sar:       null,
        annual_maintenance_cost_sar: null,
        spare_parts_value_sar:       null,
        insurance_value_sar:         null,
        depreciation_rate_pct:       null,
        repair_vs_replace:           null,   // 'repair' | 'monitor' | 'replace' | 'dispose'
        capital_budget_needed:       null,
        notes: '',
        submitted_by: null, submitted_at: null,
        approved_by: null,  approved_at: null,
        rejected_reason: null,
      },
      production: {
        score: prodScore,
        status: 'pending',
        // Pre-filled
        operational_status:      c?.op_status || 'Unknown',
        production_impact_score: c?.P || null,
        redundancy_score:        c?.R || null,
        scheduled_hours_annual:  null,
        bd_pct:                  c?.bd_pct || 0,
        // Production dept fills
        shift_assignment:   null,   // 'morning' | 'evening' | 'night' | 'all'
        current_operator:   null,
        oee_pct:            null,
        daily_target_output: null,
        actual_output_last_month: null,
        production_line:    null,
        notes: '',
        submitted_by: null, submitted_at: null,
        approved_by: null,  approved_at: null,
        rejected_reason: null,
      },
      hse: {
        score: hseScore,
        status: 'pending',
        // Pre-filled
        safety_impact_score: c?.S || null,
        // HSE dept fills
        loto_required:           null,
        hazard_categories:       [],   // ['electrical','mechanical','chemical','thermal','height','noise']
        last_safety_incident_date: null,
        safety_incidents_12m:    null,
        ppe_required:            null,
        emergency_stop_location: null,
        risk_rating:             null,  // 'low' | 'medium' | 'high' | 'critical'
        last_safety_audit_date:  null,
        notes: '',
        submitted_by: null, submitted_at: null,
        approved_by: null,  approved_at: null,
        rejected_reason: null,
      },
      quality: {
        score: qualScore,
        status: 'pending',
        // Pre-filled
        quality_impact_score: c?.Q || null,
        // Quality dept fills
        iec_compliance_risk:  null,   // 'low' | 'medium' | 'high' | 'critical'
        ncr_count_12m:        null,
        defect_types:         null,
        calibration_required: null,
        last_quality_audit:   null,
        product_types:        null,
        notes: '',
        submitted_by: null, submitted_at: null,
        approved_by: null,  approved_at: null,
        rejected_reason: null,
      },
      it_sap: {
        score: null,
        status: 'pending',
        // Pre-filled
        sap_functional_location: `PCP-${sapId}`,
        sap_cm_orders_count:     c?.cm || 0,
        sap_pm_orders_count:     c?.pm || 0,
        // IT dept fills
        sap_data_completeness_pct: null,
        last_sap_pm_notification:  null,
        sap_integration_status:    null,   // 'active' | 'inactive' | 'partial'
        digital_twin_available:    null,
        pms_linked:                null,
        notes: '',
        submitted_by: null, submitted_at: null,
        approved_by: null,  approved_at: null,
        rejected_reason: null,
      },
    },
  };
}

// ─── Full seed list for all machines ─────────────────────────────────────────
export const ALL_MACHINE_IDS = Object.keys(criticalityData);

export function getAllMachineProfiles() {
  return ALL_MACHINE_IDS.map(buildMachineProfile);
}
