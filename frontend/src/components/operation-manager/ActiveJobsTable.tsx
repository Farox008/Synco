"use client";

import React, { useState } from 'react';
import { Search, Layers } from 'lucide-react';
import { ActiveJob } from '@/services/operation-manager.service';

interface ActiveJobsTableProps {
  jobs: ActiveJob[];
  onViewJob: (jobNo: string) => void;
  selectedStageFilter?: string;
  onClearStageFilter?: () => void;
}

export const ActiveJobsTable: React.FC<ActiveJobsTableProps> = ({ 
  jobs, 
  onViewJob,
  selectedStageFilter,
  onClearStageFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'jobNo' | 'priority' | 'progress' | 'plannedCompletion'>('plannedCompletion');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.jobNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.project.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = selectedStageFilter 
      ? (selectedStageFilter === 'Production' ? job.stage.startsWith('Production') : job.stage === selectedStageFilter) 
      : true;
    const matchesPriority = priorityFilter === 'ALL' ? true : job.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' ? true : job.status === statusFilter;

    return matchesSearch && matchesStage && matchesPriority && matchesStatus;
  }).sort((a, b) => {
    let valA: any = a[sortBy];
    let valB: any = b[sortBy];

    if (sortBy === 'priority') {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      valA = priorityOrder[a.priority];
      valB = priorityOrder[b.priority];
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getPriorityBadge = (priority: ActiveJob['priority']) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#FEE2E2',
            color: '#B91C1C',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#FFEDD5',
            color: '#C2410C',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#FEF3C7',
            color: '#B45309',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            MEDIUM
          </span>
        );
      case 'LOW':
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: '#F1F5F9',
            color: '#475569',
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: ActiveJob['status']) => {
    switch (status) {
      case 'Delayed':
        return <span style={{ color: 'var(--accent-red)', fontWeight: 700, fontSize: '12px' }}>Delayed</span>;
      case 'At Risk':
        return <span style={{ color: 'var(--warning-orange)', fontWeight: 700, fontSize: '12px' }}>At Risk</span>;
      case 'Blocked':
        return <span style={{ color: '#475569', fontWeight: 700, fontSize: '12px' }}>Blocked</span>;
      case 'Completed':
        return <span style={{ color: 'var(--success-green)', fontWeight: 700, fontSize: '12px' }}>Completed</span>;
      case 'On Track':
      default:
        return <span style={{ color: '#1976D2', fontWeight: 700, fontSize: '12px' }}>On Track</span>;
    }
  };

  return (
    <div className="card table-card" style={{ background: 'white' }}>
      {/* Header & Filters */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Active Jobs
            </h2>
            <span style={{
              background: '#F1F5F9',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {filteredJobs.length}
            </span>
            {selectedStageFilter && (
              <span style={{
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Stage: {selectedStageFilter}
                {onClearStageFilter && (
                  <button 
                    onClick={onClearStageFilter}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1D4ED8', fontWeight: 800, padding: 0 }}
                  >
                    ×
                  </button>
                )}
              </span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Real-time monitoring of operational stage, calculated task progress, and delivery targets.
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input
              type="text"
              placeholder="Filter by job, client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '13px',
                outline: 'none',
                background: 'white'
              }}
            />
          </div>

          {/* Priority Select */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'white',
              outline: 'none'
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'white',
              outline: 'none'
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="On Track">On Track</option>
            <option value="At Risk">At Risk</option>
            <option value="Delayed">Delayed</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      {filteredJobs.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                borderBottom: '1px solid var(--border-color)',
                textAlign: 'left',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                background: '#FAFBFB'
              }}>
                <th style={{ padding: '12px 20px', width: '110px' }}>Job No.</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Project / Part</th>
                <th style={{ padding: '12px 16px', width: '90px' }}>Priority</th>
                <th style={{ padding: '12px 16px', width: '120px' }}>Current Stage</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>Progress</th>
                <th style={{ padding: '12px 16px', width: '130px' }}>Planned Completion</th>
                <th style={{ padding: '12px 16px', width: '100px' }}>Status</th>
                <th style={{ padding: '12px 20px', width: '80px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.jobNo}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                  onMouseOut={e => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '14px 20px', fontWeight: 800, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {job.jobNo}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {job.customer}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {job.project}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getPriorityBadge(job.priority)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      {job.stage}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="progress-container" style={{ flex: 1, height: '6px' }}>
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${job.progress}%`,
                            background: job.status === 'Delayed' ? 'var(--accent-red)' : '#1976D2'
                          }} 
                        />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, width: '32px', textAlign: 'right' }}>
                        {job.progress}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {job.plannedCompletion}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(job.status)}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => onViewJob(job.jobNo)}
                      style={{
                        padding: '5px 12px',
                        background: 'white',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-color)'}
                      onMouseOut={e => e.currentTarget.style.background = 'white'}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Layers size={36} color="var(--text-tertiary)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No matching active jobs
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Try adjusting your search query, priority filter, or stage selection.
          </p>
        </div>
      )}
    </div>
  );
};
