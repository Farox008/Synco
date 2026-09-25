"use client";

import React, { useState } from 'react';
import { Layers, Target, Activity, CheckCircle, Clock } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { ToolStats, ToolFilterBar, ToolTable } from '@/components/tools/ToolModules';
import { useDatabase } from '@/context/DatabaseContext';
import { Modal } from '@/components/ui/Modal';
import { ToolForm } from '@/components/tools/ToolForm';
import { parseMockBOM } from '@/utils/bomParser';

export default function JobsPage() {
  const { getAllJobs, getJobOrderById, updateJobOrder, addJobOrder } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [displayCount, setDisplayCount] = useState(20);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploadData, setUploadData] = useState<any>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  const allJobs = getAllJobs();
  
  // Filter tools based on search and other filters
  const filteredJobs = allJobs.filter(tool => {
    const matchesSearch = (
      (tool.id && tool.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tool.name && tool.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tool.parentJobOrder && tool.parentJobOrder.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tool.designBy && tool.designBy.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    const matchesDept = filterDept === 'All' || (tool.processes && tool.processes[filterDept]);
    
    return matchesSearch && matchesDept;
  }).sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (sortBy === 'jobOrder') {
      valA = a.parentJobOrder || '';
      valB = b.parentJobOrder || '';
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const visibleJobs = filteredJobs.slice(0, displayCount);

  // Infinite Scroll Logic
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filteredJobs.length) {
          // Simulate loading delay
          setTimeout(() => {
            setDisplayCount(prev => prev + 20);
          }, 500);
        }
      },
      { threshold: 1.0 }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => observer.disconnect();
  }, [displayCount, filteredJobs.length]);

  const jobMetrics = [
    { title: 'Total Tools', value: allJobs.length.toString(), sub: '+12%', trend: 'up' },
    { title: 'Active (In Production)', value: allJobs.filter(j => j.status === 'Running' || j.status === 'In Progress').length.toString(), sub: '+5%', trend: 'up' },
    { title: 'Completed Today', value: allJobs.filter(j => j.status === 'Completed').length.toString(), sub: '-2%', trend: 'down' },
    { title: 'Avg. Lead Time', value: '4.2 Days', sub: '+0.5d', trend: 'down' },
  ];

  return (
    <>
      <Header 
        title="Tools" 
        tabs={[
          { label: 'All Tools', icon: <Layers size={16} />, active: true },
          { label: 'Assigned to Me', icon: <Target size={16} /> },
          { label: 'Critical Path', icon: <Activity size={16} /> },
        ]}
      />

      <div className="content-scroll" style={{ flexDirection: 'column', gap: '0px', padding: '0 32px 32px 32px' }}>
        <div style={{ padding: '24px 0' }}>
          <ToolStats metrics={jobMetrics as any} />
        </div>

        <ToolFilterBar 
          onSearch={setSearchTerm} 
          onCreateTool={() => {
            setUploadData(null);
            setIsFormOpen(true);
          }}
          onUploadBOM={async (file) => {
            try {
              const extracted = await parseMockBOM(file);
              setUploadData(extracted);
              setIsFormOpen(true);
            } catch (err) {
              alert('Failed to parse BOM file');
            }
          }}
          filterDept={filterDept}
          setFilterDept={setFilterDept}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <ToolTable tools={visibleJobs} sortBy={sortBy} setSortBy={setSortBy} sortOrder={sortOrder} setSortOrder={setSortOrder} />
          
          {/* Scroll Target & Loading Indicator */}
          {displayCount < filteredJobs.length && (
            <div 
              ref={scrollRef} 
              style={{ 
                padding: '32px 0', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '12px',
                color: 'var(--text-tertiary)',
                background: 'white'
              }}
            >
              <div className="loading-spinner-simple" style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid var(--border-color)', 
                borderTopColor: 'var(--accent-red)', 
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Indexing factory throughput...</span>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title="Create New Tool"
        width="900px"
      >
        <ToolForm 
          initialData={uploadData}
          onSubmit={(data) => {
            // Check for duplicate part number
            const partExists = allJobs.some((t: any) => t.partNo === data.partNo || t.id === data.partNo);
            if (partExists) {
              alert('Error: A tool with this Part No already exists. Every Tool Number must be unique.');
              return;
            }
            
            // Check if job exists
            const existingJob = getJobOrderById(data.jobNo);
            
            const newTool = {
              ...data,
              status: 'Submitted', // Set status to Submitted
            };

            if (existingJob) {
              updateJobOrder(data.jobNo, {
                ...existingJob,
                tools: [...(existingJob.tools || []), newTool]
              });
            } else {
              // Create new job with this tool
              addJobOrder({
                id: data.jobNo || `WO-${Math.floor(1000 + Math.random() * 9000)}`,
                customer: 'New Customer',
                priority: data.priority || 'Medium',
                dueDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
                progress: 0,
                tools: [newTool]
              });
            }
            
            // Notify Purchaser
            alert('Purchaser has been notified that a new BOM has been submitted.');
            
            setIsFormOpen(false);
          }} 
          onCancel={() => setIsFormOpen(false)} 
        />
      </Modal>
    </>
  );
}
