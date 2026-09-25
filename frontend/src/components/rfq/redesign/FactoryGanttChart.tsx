"use client";

import React, { useState, useMemo, useRef } from 'react';
import { ToolItem, ExistingFactoryJob } from '@/types/rfq-job.types';
import { DEFAULT_EXISTING_JOBS } from '@/services/rfq-job-calculator.service';
import { 
  Calendar, 
  Layers, 
  Cpu, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';

interface FactoryGanttChartProps {
  startingDate: string;
  tools: ToolItem[];
  existingJobs?: ExistingFactoryJob[];
  requiredCompletionDate?: string;
  factoryEstimatedCompletion: string;
}

interface DayCellInfo {
  dateStr: string;
  dayNum: number;
  dayName: string;
  monthName: string;
  year: number;
  isWeekend: boolean;
}

function getDayCellInfo(dateStr: string): DayCellInfo {
  const d = new Date(dateStr);
  const dayNum = d.getDate();
  const dayOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = dayOfWeekNames[d.getDay()];
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return { dateStr, dayNum, dayName, monthName, year, isWeekend };
}

export default function FactoryGanttChart({
  startingDate,
  tools,
  existingJobs = DEFAULT_EXISTING_JOBS,
  requiredCompletionDate,
  factoryEstimatedCompletion
}: FactoryGanttChartProps) {
  // Zoom mode: 'COMPACT' (38px), 'STANDARD' (52px), 'EXPANDED' (72px)
  const [zoomMode, setZoomMode] = useState<'COMPACT' | 'STANDARD' | 'EXPANDED'>('STANDARD');
  const [hoveredJobTooltip, setHoveredJobTooltip] = useState<{
    job: ExistingFactoryJob;
    x: number;
    y: number;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const cellWidth = useMemo(() => {
    switch (zoomMode) {
      case 'COMPACT': return 38;
      case 'STANDARD': return 52;
      case 'EXPANDED': return 72;
    }
  }, [zoomMode]);

  // Derive full date range list (every single day)
  const { minDate, maxDate, datesList, dayInfos } = useMemo(() => {
    const allDates: string[] = [
      startingDate || '2026-09-15',
      factoryEstimatedCompletion || '2026-10-25',
      ...(requiredCompletionDate ? [requiredCompletionDate] : []),
      ...existingJobs.flatMap(j => [j.startDate, j.endDate]),
      ...tools.flatMap(t => [t.scheduledStartDate, t.scheduledEndDate].filter(Boolean))
    ];

    let start = allDates.reduce((min, d) => (d < min ? d : min), allDates[0]);
    let end = allDates.reduce((max, d) => (d > max ? d : max), allDates[0]);

    // Padding: 2 days before start, 4 days after end
    const startDateObj = new Date(start);
    startDateObj.setDate(startDateObj.getDate() - 2);
    const minD = startDateObj.toISOString().split('T')[0];

    const endDateObj = new Date(end);
    endDateObj.setDate(endDateObj.getDate() + 4);
    const maxD = endDateObj.toISOString().split('T')[0];

    // Generate EVERY SINGLE DAY
    const list: string[] = [];
    const infos: DayCellInfo[] = [];
    const cur = new Date(minD);
    const targetEnd = new Date(maxD);

    while (cur <= targetEnd) {
      const dStr = cur.toISOString().split('T')[0];
      list.push(dStr);
      infos.push(getDayCellInfo(dStr));
      cur.setDate(cur.getDate() + 1);
    }

    return {
      minDate: minD,
      maxDate: maxD,
      datesList: list,
      dayInfos: infos
    };
  }, [startingDate, tools, existingJobs, requiredCompletionDate, factoryEstimatedCompletion]);

  // Group consecutive days by Month for Tier 1 Header
  const monthGroups = useMemo(() => {
    const groups: { label: string; count: number }[] = [];
    datesList.forEach((dStr) => {
      const info = getDayCellInfo(dStr);
      const label = `${info.monthName} ${info.year}`;
      if (groups.length > 0 && groups[groups.length - 1].label === label) {
        groups[groups.length - 1].count++;
      } else {
        groups.push({ label, count: 1 });
      }
    });
    return groups;
  }, [datesList]);

  // Offset index calculation for Gantt bars
  const getDayOffset = (dateStr: string) => {
    if (!dateStr || datesList.length === 0) return 0;
    const idx = datesList.indexOf(dateStr);
    if (idx !== -1) return idx;

    const startMs = new Date(minDate).getTime();
    const targetMs = new Date(dateStr).getTime();
    const diffDays = Math.round((targetMs - startMs) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(datesList.length - 1, diffDays));
  };

  const ENTITY_COL_WIDTH = 240;
  const trackTotalWidth = datesList.length * cellWidth;
  const fullGridWidth = ENTITY_COL_WIDTH + trackTotalWidth;

  const scrollToStart = () => {
    if (scrollContainerRef.current) {
      const startIdx = getDayOffset(startingDate);
      const scrollPos = Math.max(0, startIdx * cellWidth - 50);
      scrollContainerRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  };

  return (
    <div 
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #E2E8F0)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
        marginBottom: '24px'
      }}
    >
      {/* Section Header */}
      <div 
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color, #E2E8F0)',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px'
            }}
          >
            5
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary, #0F172A)' }}>
              FACTORY GANTT TIMELINE & CAPACITY SLOTTING
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary, #64748B)' }}>
              Scrollable daily shopfloor timeline ({datesList.length} days visible, {cellWidth}px/day)
            </span>
          </div>
        </div>

        {/* Legend & Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#E2E8F0', padding: '3px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', padding: '0 6px' }}>Zoom:</span>
            <button
              type="button"
              onClick={() => setZoomMode('COMPACT')}
              style={{
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: zoomMode === 'COMPACT' ? '#FFFFFF' : 'transparent',
                color: zoomMode === 'COMPACT' ? '#0F172A' : '#64748B',
                boxShadow: zoomMode === 'COMPACT' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setZoomMode('STANDARD')}
              style={{
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: zoomMode === 'STANDARD' ? '#FFFFFF' : 'transparent',
                color: zoomMode === 'STANDARD' ? '#0F172A' : '#64748B',
                boxShadow: zoomMode === 'STANDARD' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Daily Standard
            </button>
            <button
              type="button"
              onClick={() => setZoomMode('EXPANDED')}
              style={{
                border: 'none',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: zoomMode === 'EXPANDED' ? '#FFFFFF' : 'transparent',
                color: zoomMode === 'EXPANDED' ? '#0F172A' : '#64748B',
                boxShadow: zoomMode === 'EXPANDED' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Expanded
            </button>
          </div>

          <button
            type="button"
            onClick={scrollToStart}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#2563EB',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Calendar size={13} />
            <span>Jump to RFQ Start</span>
          </button>

          {/* Legend Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#475569' }} />
              <span style={{ color: '#475569', fontWeight: 600 }}>Committed Jobs</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#2563EB' }} />
              <span style={{ color: '#1E40AF', fontWeight: 700 }}>New RFQ Tools</span>
            </div>
            {requiredCompletionDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '8px', height: '10px', borderRight: '2px dashed #DC2626' }} />
                <span style={{ color: '#DC2626', fontWeight: 700 }}>Customer Deadline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Scrollable Outer Container */}
        <div 
          ref={scrollContainerRef}
          style={{
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            overflowX: 'auto',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            maxHeight: '600px'
          }}
        >
          {/* Entire Gantt Grid Canvas with fixed calculated width */}
          <div style={{ minWidth: `${fullGridWidth}px`, width: `${fullGridWidth}px`, position: 'relative' }}>
            
            {/* 2-TIER CALENDAR HEADER */}
            <div 
              style={{
                display: 'flex',
                borderBottom: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                position: 'sticky',
                top: 0,
                zIndex: 30
              }}
            >
              {/* Sticky Entity Sidebar Header */}
              <div 
                style={{
                  width: `${ENTITY_COL_WIDTH}px`,
                  minWidth: `${ENTITY_COL_WIDTH}px`,
                  padding: '12px 16px',
                  fontWeight: 800,
                  fontSize: '12px',
                  color: '#1E293B',
                  backgroundColor: '#F8FAFC',
                  borderRight: '2px solid #CBD5E1',
                  position: 'sticky',
                  left: 0,
                  zIndex: 40,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '2px 0 6px rgba(0,0,0,0.04)'
                }}
              >
                JOB / TOOL ENTITY
              </div>

              {/* Timeline Header Track (Tier 1 Month + Tier 2 Daily Days) */}
              <div style={{ width: `${trackTotalWidth}px`, display: 'flex', flexDirection: 'column' }}>
                {/* Tier 1: Month Groups */}
                <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F1F5F9' }}>
                  {monthGroups.map((mg, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${mg.count * cellWidth}px`,
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#334155',
                        borderRight: '1px solid #CBD5E1',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {mg.label}
                    </div>
                  ))}
                </div>

                {/* Tier 2: Daily Cells Header */}
                <div style={{ display: 'flex' }}>
                  {dayInfos.map((info) => (
                    <div
                      key={info.dateStr}
                      style={{
                        width: `${cellWidth}px`,
                        minWidth: `${cellWidth}px`,
                        padding: '6px 2px',
                        fontSize: '10px',
                        textAlign: 'center',
                        borderRight: '1px solid #E2E8F0',
                        backgroundColor: info.isWeekend ? '#E2E8F0' : '#FFFFFF',
                        color: info.isWeekend ? '#64748B' : '#0F172A'
                      }}
                      title={`${info.dayName}, ${info.monthName} ${info.dayNum}, ${info.year}${info.isWeekend ? ' (Weekend)' : ''}`}
                    >
                      <div style={{ fontWeight: 800, fontSize: '11px' }}>{info.dayNum}</div>
                      <div style={{ fontSize: '9px', fontWeight: info.isWeekend ? 700 : 500, color: info.isWeekend ? '#475569' : '#64748B' }}>
                        {info.dayName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GROUP 1: COMMITTED FACTORY WORKLOAD */}
            <div 
              style={{
                backgroundColor: '#FAF5FF',
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#6B21A8',
                letterSpacing: '0.5px',
                borderBottom: '1px solid #E9D5FF',
                position: 'sticky',
                left: 0,
                zIndex: 25
              }}
            >
              COMMITTED FACTORY WORKLOAD
            </div>

            {existingJobs.map((job) => {
              const startIdx = getDayOffset(job.startDate);
              const endIdx = getDayOffset(job.endDate);
              const durationDays = Math.max(1, endIdx - startIdx + 1);

              const barLeftPx = startIdx * cellWidth;
              const barWidthPx = durationDays * cellWidth;

              return (
                <div 
                  key={job.jobId}
                  style={{
                    display: 'flex',
                    borderBottom: '1px solid #F1F5F9',
                    alignItems: 'center',
                    minHeight: '44px',
                    position: 'relative'
                  }}
                >
                  {/* Left Sticky Label Column */}
                  <div 
                    style={{
                      width: `${ENTITY_COL_WIDTH}px`,
                      minWidth: `${ENTITY_COL_WIDTH}px`,
                      padding: '8px 16px',
                      borderRight: '2px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      position: 'sticky',
                      left: 0,
                      zIndex: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '2px 0 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '12px', color: '#1E293B' }}>
                      {job.jobId}
                    </div>
                    <span 
                      style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} 
                      title={job.jobName}
                    >
                      {job.customerName}
                    </span>
                  </div>

                  {/* Daily Track Grid Canvas */}
                  <div style={{ width: `${trackTotalWidth}px`, position: 'relative', height: '44px', display: 'flex' }}>
                    {/* Background Vertical Grid Columns for Every Day */}
                    {dayInfos.map((info) => (
                      <div
                        key={info.dateStr}
                        style={{
                          width: `${cellWidth}px`,
                          minWidth: `${cellWidth}px`,
                          height: '100%',
                          borderRight: '1px solid #F1F5F9',
                          backgroundColor: info.isWeekend ? '#F8FAFC' : 'transparent'
                        }}
                      />
                    ))}

                    {/* Gantt Bar Overlay */}
                    <div 
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredJobTooltip({
                          job,
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredJobTooltip({
                          job,
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                      onMouseLeave={() => setHoveredJobTooltip(null)}
                      style={{
                        position: 'absolute',
                        left: `${barLeftPx}px`,
                        width: `${barWidthPx}px`,
                        top: '8px',
                        height: '28px',
                        backgroundColor: '#475569',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 10px',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        cursor: 'pointer'
                      }}
                      title={`${job.jobId}: ${job.startDate} to ${job.endDate} (${job.departmentFocus})`}
                    >
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{job.jobId}: {job.jobName}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* GROUP 2: NEW RFQ PROSPECTIVE SLOTS */}
            <div 
              style={{
                backgroundColor: '#EFF6FF',
                padding: '6px 16px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#1E40AF',
                letterSpacing: '0.5px',
                borderBottom: '1px solid #BFDBFE',
                borderTop: '2px solid #CBD5E1',
                position: 'sticky',
                left: 0,
                zIndex: 25
              }}
            >
              NEW RFQ PROSPECTIVE SLOTS
            </div>

            {tools.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                Add tools to this Job to calculate schedule slots on the daily factory timeline.
              </div>
            ) : (
              tools.map((tool) => {
                const sDate = tool.scheduledStartDate || startingDate;
                const eDate = tool.scheduledEndDate || factoryEstimatedCompletion;

                const startIdx = getDayOffset(sDate);
                const endIdx = getDayOffset(eDate);
                const durationDays = Math.max(1, endIdx - startIdx + 1);

                const barLeftPx = startIdx * cellWidth;
                const barWidthPx = durationDays * cellWidth;
                const isBottleneck = tool.feasibilityStatus !== 'FEASIBLE';

                return (
                  <div 
                    key={tool.id}
                    style={{
                      display: 'flex',
                      borderBottom: '1px solid #F1F5F9',
                      alignItems: 'center',
                      minHeight: '48px',
                      backgroundColor: '#FAFCFF',
                      position: 'relative'
                    }}
                  >
                    {/* Left Sticky Label Column */}
                    <div 
                      style={{
                        width: `${ENTITY_COL_WIDTH}px`,
                        minWidth: `${ENTITY_COL_WIDTH}px`,
                        padding: '8px 16px',
                        borderRight: '2px solid #CBD5E1',
                        backgroundColor: '#FAFCFF',
                        position: 'sticky',
                        left: 0,
                        zIndex: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '2px 0 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, fontSize: '12px', color: '#1D4ED8' }}>
                          {tool.toolNumber}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                          {tool.totalMachiningHours.toFixed(1)}h
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tool.partName}
                      </div>
                    </div>

                    {/* Daily Track Grid Canvas */}
                    <div style={{ width: `${trackTotalWidth}px`, position: 'relative', height: '48px', display: 'flex' }}>
                      {/* Background Vertical Grid Columns for Every Day */}
                      {dayInfos.map((info) => (
                        <div
                          key={info.dateStr}
                          style={{
                            width: `${cellWidth}px`,
                            minWidth: `${cellWidth}px`,
                            height: '100%',
                            borderRight: '1px solid #F1F5F9',
                            backgroundColor: info.isWeekend ? '#EFF6FF' : 'transparent'
                          }}
                        />
                      ))}

                      {/* Gantt Bar Overlay */}
                      <div 
                        style={{
                          position: 'absolute',
                          left: `${barLeftPx}px`,
                          width: `${barWidthPx}px`,
                          top: '9px',
                          height: '30px',
                          backgroundColor: isBottleneck ? '#EA580C' : '#2563EB',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 10px',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          zIndex: 10
                        }}
                        title={`${tool.toolNumber}: ${sDate} to ${eDate} (${tool.totalMachiningHours.toFixed(1)} hrs)`}
                      >
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{tool.toolNumber}: {tool.partName}</span>
                        <span style={{ fontSize: '10px', opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px', flexShrink: 0 }}>
                          {tool.leadTimeWorkingDays || durationDays} Days
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Customer Required Deadline Vertical Line Marker */}
            {requiredCompletionDate && (() => {
              const reqIdx = getDayOffset(requiredCompletionDate);
              const reqLeftPx = ENTITY_COL_WIDTH + (reqIdx * cellWidth) + (cellWidth / 2);
              return (
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${reqLeftPx}px`,
                    width: '2px',
                    backgroundColor: '#DC2626',
                    borderLeft: '2px dashed #DC2626',
                    zIndex: 35,
                    pointerEvents: 'none'
                  }}
                >
                  <div 
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '4px',
                      backgroundColor: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    Req Deadline: {requiredCompletionDate}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>

        {/* Scheduling Logic Insight Note */}
        <div 
          style={{
            marginTop: '16px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '12px',
            color: '#475569'
          }}
        >
          <Cpu size={16} style={{ color: '#2563EB', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#0F172A' }}>Daily Gantt Slotting Logic: </strong>
            Calculates earliest available daily slot via <em>Tool Estimated Hours + Department Shift Capacity + Committed Workload</em>.
            Processes run in phased parallel streams (Design CAD/CAM → Rough Milling/CNC → Wire Cut EDM/Grinding → Die Assembly) with weekends highlighted.
          </div>
        </div>
      </div>

      {/* Floating Hover Card for Committed Job Machine Usage Breakdown */}
      {hoveredJobTooltip && (
        <div 
          style={{
            position: 'fixed',
            left: `${hoveredJobTooltip.x}px`,
            top: `${hoveredJobTooltip.y - 12}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            borderRadius: '12px',
            padding: '14px 16px',
            boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.2), 0 8px 12px -6px rgba(15, 23, 42, 0.1)',
            border: '1px solid #CBD5E1',
            zIndex: 9999,
            pointerEvents: 'none',
            minWidth: '290px',
            maxWidth: '340px'
          }}
        >
          {/* Header info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: 800, fontSize: '13px', color: '#2563EB' }}>
              {hoveredJobTooltip.job.jobId}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px', border: '1px solid #86EFAC' }}>
              {hoveredJobTooltip.job.status} ({hoveredJobTooltip.job.progressPercent}%)
            </span>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
            {hoveredJobTooltip.job.jobName}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px' }}>
            Client: {hoveredJobTooltip.job.customerName} • {hoveredJobTooltip.job.startDate} to {hoveredJobTooltip.job.endDate}
          </div>

          {/* Department Machine Breakdown Header */}
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Department Machines Deployed:
            </span>
            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>{hoveredJobTooltip.job.departmentFocus}</span>
          </div>

          {/* 4 Machine Cards: CNC, Milling, Grinding, Wire Cut */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {/* CNC */}
            <div style={{ backgroundColor: '#EFF6FF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #BFDBFE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>CNC:</span>
              <strong style={{ fontSize: '13px', color: '#1D4ED8', fontWeight: 800 }}>
                {hoveredJobTooltip.job.machineUsage?.cnc ?? 4} Machines
              </strong>
            </div>

            {/* Milling */}
            <div style={{ backgroundColor: '#F0FDF4', padding: '8px 10px', borderRadius: '6px', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: 600 }}>Milling:</span>
              <strong style={{ fontSize: '13px', color: '#15803D', fontWeight: 800 }}>
                {hoveredJobTooltip.job.machineUsage?.milling ?? 2} Machines
              </strong>
            </div>

            {/* Grinding */}
            <div style={{ backgroundColor: '#FFFBEB', padding: '8px 10px', borderRadius: '6px', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>Grinding:</span>
              <strong style={{ fontSize: '13px', color: '#B45309', fontWeight: 800 }}>
                {hoveredJobTooltip.job.machineUsage?.grinding ?? 1} Machines
              </strong>
            </div>

            {/* Wire Cut */}
            <div style={{ backgroundColor: '#FDF2F8', padding: '8px 10px', borderRadius: '6px', border: '1px solid #FBCFE8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9D174D', fontWeight: 600 }}>Wire Cut:</span>
              <strong style={{ fontSize: '13px', color: '#BE185D', fontWeight: 800 }}>
                {hoveredJobTooltip.job.machineUsage?.wireCut ?? 3} Machines
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
