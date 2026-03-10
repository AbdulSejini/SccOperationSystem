import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

// Factory layout data based on actual factory floor plan (layout.pdf)
// Layout: PCP-3 (far left) → PCP-2 (center) → PCP-1 (right) → CV-Line (upper center) → PVC/ROD-MILL (far right)
const factoryAreas = {
  'PCP-3': {
    id: 'PCP-3',
    name: 'PCP-3 (Finishing)',
    color: '#F59E0B',
    x: 1,
    y: 25,
    width: 18,
    height: 50,
    machines: ['SLT'],
    zones: [
      { id: 'flange', name: 'Flange Board Line', x: 1, y: 2, w: 16, h: 6 },
      { id: 'nailing', name: 'Nailing Line', x: 1, y: 9, w: 16, h: 5 },
      { id: 'assembly', name: 'Reel Assembly', x: 1, y: 15, w: 16, h: 6 },
      { id: 'painting', name: 'Painting Area', x: 1, y: 22, w: 16, h: 5 },
      { id: 'qclab', name: 'QC Lab', x: 1, y: 28, w: 8, h: 5 },
      { id: 'store', name: 'Store Room', x: 10, y: 28, w: 7, h: 5 },
      { id: 'emptyreel', name: 'Empty Reel Area', x: 1, y: 38, w: 16, h: 10 },
    ]
  },
  'PCP-2': {
    id: 'PCP-2',
    name: 'PCP-2 (LV Cable)',
    color: '#10B981',
    x: 20,
    y: 25,
    width: 30,
    height: 50,
    machines: ['XL-1', 'XL-2', 'XL-4', 'XT-1', 'XT-3', 'XT-4', 'XT-6', 'XT-7', 'XT-9', 'XT-10', 'XT-11', 'XT-12', 'XT-13', 'AR-2', 'AR-3', 'BC-1', 'BC-2', 'DT-1', 'DT-2', 'DT-4', 'DT-5', 'DT-8', 'DT-9', 'PS-1', 'PS-2', 'PS-3', 'PS-4', 'TWI-1', 'TWI-2', 'CAB-2', 'CAB-4', 'CAB-5', 'DTU', 'DTA', 'ARM-4', 'JKT-4', 'TAP-2', 'TAP-3', 'TAP-4', 'TAP-5', 'MT-1'],
    zones: []
  },
  'PCP-1': {
    id: 'PCP-1',
    name: 'PCP-1 (Drawing & Stranding)',
    color: '#3B82F6',
    x: 51,
    y: 25,
    width: 24,
    height: 50,
    machines: ['IW-5', 'IW-6', 'CW-2', 'CW-3', 'CW-4', 'CW-5', 'CW-6', 'CW-7', 'ST-1', 'ST-3', 'ST-4', 'ST-5', 'ST-6', 'TU-1', 'CL-3', 'CL-4', 'CL-5', 'BN-7', 'BN-8', 'BN-9', 'BN-10', 'BN-11', 'BN-12', 'TP-1', 'DRW-1', 'DT6', 'XT2'],
    zones: [
      { id: 'scrapyard', name: 'Scrap Yard', x: 1, y: 40, w: 22, h: 8 },
    ]
  },
  'CV-Line': {
    id: 'CV-Line',
    name: 'CV-Line (MV/HV)',
    color: '#06B6D4',
    x: 28,
    y: 2,
    width: 38,
    height: 22,
    machines: ['CV-1', 'CV-2', 'CV-3', 'DT-7', 'XT-8', 'LX-2', 'LX-3', 'SC-2', 'D-GASSING', 'HVRW'],
    zones: [
      { id: 'cvtower1', name: 'CV-1 Tower', x: 2, y: 3, w: 5, h: 14 },
      { id: 'cvtower2', name: 'CV-2 Tower', x: 9, y: 3, w: 5, h: 14 },
      { id: 'cvtower3', name: 'CV-3 Tower', x: 16, y: 3, w: 5, h: 14 },
      { id: 'degassing', name: 'Degassing Area', x: 23, y: 3, w: 13, h: 10 },
    ]
  },
  'PVC-Plant': {
    id: 'PVC-Plant',
    name: 'PVC Plant',
    color: '#8B5CF6',
    x: 76,
    y: 2,
    width: 11,
    height: 35,
    machines: ['PVC-L1', 'PVC-L2', 'SILO-1', 'SILO-2'],
    zones: [
      { id: 'silos', name: 'PVC Silos', x: 1, y: 2, w: 9, h: 10 },
    ]
  },
  'ROD-MILL': {
    id: 'ROD-MILL',
    name: 'Rod Mill',
    color: '#EF4444',
    x: 88,
    y: 2,
    width: 11,
    height: 35,
    machines: ['ROD-MILL'],
    zones: []
  },
  'Support': {
    id: 'Support',
    name: 'Support (Rewinding)',
    color: '#6B7280',
    x: 76,
    y: 40,
    width: 23,
    height: 35,
    machines: ['BWR-1', 'BWR-2', 'BWR-3', 'RW-1', 'RW-2', 'RW-3', 'RW-4', 'RW-5', 'RW-10', 'RW-11', 'RW-12', 'REW-1', 'REW-2', 'REW-4', 'REW-5', 'REW-10'],
    zones: [
      { id: 'reelstore', name: 'Reel Storage', x: 1, y: 22, w: 21, h: 11 },
    ]
  }
};

// Machine positions within areas (relative to area coordinates)
const machinePositions = {
  // === PCP-3 (Finishing) ===
  'SLT': { x: 4, y: 34, w: 10, h: 4 },

  // === PCP-2 (LV Cable) - Extrusion lines ===
  'XL-1': { x: 1, y: 2, w: 5, h: 3 },
  'XL-2': { x: 7, y: 2, w: 5, h: 3 },
  'XL-4': { x: 13, y: 2, w: 5, h: 3 },
  'XT-1': { x: 19, y: 2, w: 5, h: 3 },
  'XT-3': { x: 25, y: 2, w: 4, h: 3 },
  'XT-4': { x: 1, y: 6, w: 4, h: 3 },
  'XT-6': { x: 6, y: 6, w: 4, h: 3 },
  'XT-7': { x: 11, y: 6, w: 4, h: 3 },
  'XT-9': { x: 16, y: 6, w: 4, h: 3 },
  'XT-10': { x: 21, y: 6, w: 4, h: 3 },
  'XT-11': { x: 26, y: 6, w: 4, h: 3 },
  'XT-12': { x: 1, y: 10, w: 4, h: 3 },
  'XT-13': { x: 6, y: 10, w: 4, h: 3 },
  // Assembly & Armoring
  'DT-1': { x: 1, y: 14, w: 4, h: 3 },
  'DT-2': { x: 6, y: 14, w: 4, h: 3 },
  'DT-4': { x: 11, y: 14, w: 4, h: 3 },
  'DT-5': { x: 16, y: 14, w: 4, h: 3 },
  'DT-8': { x: 21, y: 14, w: 4, h: 3 },
  'DT-9': { x: 26, y: 14, w: 4, h: 3 },
  'BC-1': { x: 1, y: 18, w: 4, h: 3 },
  'BC-2': { x: 6, y: 18, w: 4, h: 3 },
  'AR-2': { x: 11, y: 18, w: 4, h: 3 },
  'AR-3': { x: 16, y: 18, w: 4, h: 3 },
  'ARM-4': { x: 21, y: 18, w: 4, h: 3 },
  // Cutting lines
  'PS-1': { x: 1, y: 22, w: 3, h: 3 },
  'PS-2': { x: 5, y: 22, w: 3, h: 3 },
  'PS-3': { x: 9, y: 22, w: 3, h: 3 },
  'PS-4': { x: 13, y: 22, w: 3, h: 3 },
  // TCP lines
  'TWI-1': { x: 1, y: 26, w: 4, h: 3 },
  'TWI-2': { x: 6, y: 26, w: 4, h: 3 },
  'CAB-2': { x: 11, y: 26, w: 4, h: 3 },
  'CAB-4': { x: 16, y: 26, w: 4, h: 3 },
  'CAB-5': { x: 21, y: 26, w: 4, h: 3 },
  'DTU': { x: 1, y: 30, w: 4, h: 3 },
  'DTA': { x: 6, y: 30, w: 4, h: 3 },
  'JKT-4': { x: 11, y: 30, w: 4, h: 3 },
  // Taping
  'TAP-2': { x: 1, y: 34, w: 3, h: 3 },
  'TAP-3': { x: 5, y: 34, w: 3, h: 3 },
  'TAP-4': { x: 9, y: 34, w: 3, h: 3 },
  'TAP-5': { x: 13, y: 34, w: 3, h: 3 },
  'MT-1': { x: 17, y: 34, w: 3, h: 3 },

  // === PCP-1 (Drawing & Stranding) ===
  // Drawing machines
  'CW-2': { x: 1, y: 2, w: 4, h: 3 },
  'CW-3': { x: 6, y: 2, w: 4, h: 3 },
  'CW-4': { x: 11, y: 2, w: 4, h: 3 },
  'CW-5': { x: 16, y: 2, w: 4, h: 3 },
  'CW-6': { x: 1, y: 6, w: 4, h: 3 },
  'CW-7': { x: 6, y: 6, w: 4, h: 3 },
  'IW-5': { x: 11, y: 6, w: 4, h: 3 },
  'IW-6': { x: 16, y: 6, w: 4, h: 3 },
  'DRW-1': { x: 1, y: 10, w: 4, h: 3 },
  'TP-1': { x: 6, y: 10, w: 4, h: 3 },
  // Stranding machines
  'ST-1': { x: 1, y: 14, w: 4, h: 3 },
  'ST-3': { x: 6, y: 14, w: 4, h: 3 },
  'ST-4': { x: 11, y: 14, w: 4, h: 3 },
  'ST-5': { x: 16, y: 14, w: 4, h: 3 },
  'ST-6': { x: 1, y: 18, w: 4, h: 3 },
  'TU-1': { x: 6, y: 18, w: 4, h: 3 },
  'CL-3': { x: 11, y: 18, w: 4, h: 3 },
  'CL-4': { x: 16, y: 18, w: 4, h: 3 },
  'CL-5': { x: 1, y: 22, w: 4, h: 3 },
  // Bunching
  'BN-7': { x: 1, y: 26, w: 3, h: 3 },
  'BN-8': { x: 5, y: 26, w: 3, h: 3 },
  'BN-9': { x: 9, y: 26, w: 3, h: 3 },
  'BN-10': { x: 13, y: 26, w: 3, h: 3 },
  'BN-11': { x: 17, y: 26, w: 3, h: 3 },
  'BN-12': { x: 1, y: 30, w: 3, h: 3 },
  'DT6': { x: 11, y: 10, w: 4, h: 3 },
  'XT2': { x: 16, y: 10, w: 4, h: 3 },

  // === CV-Line (MV/HV) ===
  'CV-1': { x: 2, y: 4, w: 5, h: 12 },
  'CV-2': { x: 9, y: 4, w: 5, h: 12 },
  'CV-3': { x: 16, y: 4, w: 5, h: 12 },
  'DT-7': { x: 23, y: 14, w: 5, h: 4 },
  'XT-8': { x: 29, y: 14, w: 5, h: 4 },
  'LX-2': { x: 23, y: 4, w: 4, h: 3 },
  'LX-3': { x: 28, y: 4, w: 4, h: 3 },
  'SC-2': { x: 33, y: 4, w: 4, h: 3 },
  'D-GASSING': { x: 23, y: 8, w: 10, h: 4 },
  'HVRW': { x: 34, y: 14, w: 3, h: 4 },

  // === PVC Plant ===
  'PVC-L1': { x: 2, y: 14, w: 7, h: 4 },
  'PVC-L2': { x: 2, y: 20, w: 7, h: 4 },
  'SILO-1': { x: 2, y: 26, w: 4, h: 4 },
  'SILO-2': { x: 6, y: 26, w: 4, h: 4 },

  // === ROD-MILL ===
  'ROD-MILL': { x: 2, y: 10, w: 7, h: 15 },

  // === Support (Rewinding) ===
  'BWR-1': { x: 1, y: 2, w: 4, h: 3 },
  'BWR-2': { x: 6, y: 2, w: 4, h: 3 },
  'BWR-3': { x: 11, y: 2, w: 4, h: 3 },
  'RW-1': { x: 1, y: 6, w: 3, h: 3 },
  'RW-2': { x: 5, y: 6, w: 3, h: 3 },
  'RW-3': { x: 9, y: 6, w: 3, h: 3 },
  'RW-4': { x: 13, y: 6, w: 3, h: 3 },
  'RW-5': { x: 17, y: 6, w: 3, h: 3 },
  'RW-10': { x: 1, y: 10, w: 3, h: 3 },
  'RW-11': { x: 5, y: 10, w: 3, h: 3 },
  'RW-12': { x: 9, y: 10, w: 3, h: 3 },
  'REW-1': { x: 1, y: 14, w: 3, h: 3 },
  'REW-2': { x: 5, y: 14, w: 3, h: 3 },
  'REW-4': { x: 9, y: 14, w: 3, h: 3 },
  'REW-5': { x: 13, y: 14, w: 3, h: 3 },
  'REW-10': { x: 17, y: 14, w: 3, h: 3 },
};

const FactoryLayout = ({ onMachineClick }) => {
  const { machines } = useData();
  const { t } = useLanguage();
  const { isDark, colors } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [selectedArea, setSelectedArea] = useState(null);
  const [showMachines, setShowMachines] = useState(true);
  const [hoveredMachine, setHoveredMachine] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return '#10B981';
      case 'idle': return '#F59E0B';
      case 'stopped': return '#EF4444';
      case 'maintenance': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => setZoom(1);

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          className="p-2 rounded-lg transition-colors"
          style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}` }}
        >
          <ZoomIn className="w-5 h-5" style={{ color: colors.textSecondary }} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          className="p-2 rounded-lg transition-colors"
          style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}` }}
        >
          <ZoomOut className="w-5 h-5" style={{ color: colors.textSecondary }} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          className="p-2 rounded-lg transition-colors"
          style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}` }}
        >
          <Maximize2 className="w-5 h-5" style={{ color: colors.textSecondary }} />
        </motion.button>
        <div className="h-6 w-px mx-2" style={{ background: colors.border }} />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMachines(!showMachines)}
          className="p-2 rounded-lg transition-colors"
          style={{ background: colors.bgTertiary, border: `1px solid ${colors.border}` }}
        >
          {showMachines ? <Eye className="w-5 h-5" style={{ color: colors.textSecondary }} /> : <EyeOff className="w-5 h-5" style={{ color: colors.textSecondary }} />}
        </motion.button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 z-20 rounded-xl p-4" style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h4 className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>Status Legend</h4>
        <div className="space-y-2">
          {[
            { status: 'running', label: 'Running' },
            { status: 'idle', label: 'Idle' },
            { status: 'stopped', label: 'Stopped' },
            { status: 'maintenance', label: 'Maintenance' }
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(status) }}
              />
              <span className="text-xs" style={{ color: colors.textSecondary }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Factory SVG Layout */}
      <motion.div
        className="p-8 overflow-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-auto min-h-[600px]"
          style={{ minWidth: '1200px' }}
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(46,45,44,0.08)"} strokeWidth="0.1" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Factory Areas */}
          {Object.values(factoryAreas).map((area) => (
            <g key={area.id}>
              {/* Area Background */}
              <motion.rect
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                fill={`${area.color}15`}
                stroke={area.color}
                strokeWidth="0.3"
                rx="1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ fill: `${area.color}25` }}
                onClick={() => setSelectedArea(area.id === selectedArea ? null : area.id)}
                style={{ cursor: 'pointer' }}
              />

              {/* Area Label */}
              <text
                x={area.x + 1}
                y={area.y + 2}
                fill={area.color}
                fontSize="1.5"
                fontWeight="bold"
              >
                {area.name}
              </text>

              {/* Zones within area */}
              {area.zones?.map((zone) => (
                <g key={zone.id}>
                  <rect
                    x={area.x + zone.x}
                    y={area.y + zone.y}
                    width={zone.w}
                    height={zone.h}
                    fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(46,45,44,0.05)"}
                    stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(46,45,44,0.15)"}
                    strokeWidth="0.15"
                    rx="0.5"
                  />
                  <text
                    x={area.x + zone.x + zone.w / 2}
                    y={area.y + zone.y + zone.h / 2}
                    fill={isDark ? "rgba(255,255,255,0.6)" : "rgba(46,45,44,0.6)"}
                    fontSize="0.8"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {zone.name}
                  </text>
                </g>
              ))}

              {/* Machines */}
              {showMachines && area.machines?.map((machineId) => {
                const machine = machines[machineId];
                const pos = machinePositions[machineId];
                if (!machine || !pos) return null;

                return (
                  <g key={machineId}>
                    <motion.rect
                      x={area.x + pos.x}
                      y={area.y + pos.y}
                      width={pos.w}
                      height={pos.h}
                      fill={getStatusColor(machine.status)}
                      rx="0.3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      onHoverStart={() => setHoveredMachine(machineId)}
                      onHoverEnd={() => setHoveredMachine(null)}
                      onClick={() => onMachineClick?.(machine)}
                      style={{ cursor: 'pointer' }}
                      className={machine.status === 'running' ? 'status-running' : ''}
                    />
                    <text
                      x={area.x + pos.x + pos.w / 2}
                      y={area.y + pos.y + pos.h / 2}
                      fill="white"
                      fontSize="0.6"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      pointerEvents="none"
                    >
                      {machineId}
                    </text>

                    {/* Pulse effect for running machines */}
                    {machine.status === 'running' && (
                      <motion.rect
                        x={area.x + pos.x}
                        y={area.y + pos.y}
                        width={pos.w}
                        height={pos.h}
                        fill="none"
                        stroke={getStatusColor(machine.status)}
                        strokeWidth="0.2"
                        rx="0.3"
                        animate={{
                          opacity: [0.5, 0, 0.5],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Machine Info Tooltip */}
      <AnimatePresence>
        {hoveredMachine && machines[hoveredMachine] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 z-20 rounded-xl p-4 min-w-[200px]"
            style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusColor(machines[hoveredMachine].status) }}
              />
              <span className="font-semibold" style={{ color: colors.textPrimary }}>{hoveredMachine}</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Speed:</span>
                <span style={{ color: colors.textPrimary }}>{machines[hoveredMachine].speed.toFixed(1)} m/s</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>OEE:</span>
                <span style={{ color: colors.textPrimary }}>{machines[hoveredMachine].oee}%</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.textSecondary }}>Operator:</span>
                <span style={{ color: colors.textPrimary }}>{machines[hoveredMachine].operator || '-'}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FactoryLayout;
