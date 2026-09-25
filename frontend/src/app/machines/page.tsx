"use client";

import React, { useState } from 'react';
import { Settings, Activity, Gauge, Cpu, X, Wrench, DollarSign, Calendar, Clock, Plus, User, Maximize } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { useDatabase } from '@/context/DatabaseContext';
import { Card } from '@/components/ui/Card';

export default function MachinesPage() {
  const { data, addMachine, isMounted } = useDatabase();
  const machineFleet = data.machines || [];
  
  if (!isMounted) return null; // Or a loader
  const [selectedMachine, setSelectedMachine] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newMachine, setNewMachine] = useState({
    id: '',
    name: '',
    type: 'CNC',
    costRate: 25.00,
    efficiency: 95,
    bedSize: '1000x800x600mm',
    status: 'idle',
    maintenance: {
      worker: '',
      nextScheduled: '',
      period: 'Quarterly'
    }
  });

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    addMachine({
      ...newMachine,
      runtime: '0h',
      lastMaintenance: new Date().toISOString().split('T')[0],
      tool: 'None'
    });
    setIsAddModalOpen(false);
    setNewMachine({
      id: '',
      name: '',
      type: 'CNC',
      costRate: 25.00,
      efficiency: 95,
      bedSize: '1000x800x600mm',
      status: 'idle',
      maintenance: {
        worker: '',
        nextScheduled: '',
        period: 'Quarterly'
      }
    });
  };

  return (
    <>
      <Header 
        title="Machine Management" 
        tabs={[
          { label: 'All Machines', icon: <Settings size={16} />, active: true },
          { label: 'Maintenance Schedule', icon: <Activity size={16} /> },
        ]}
        actions={
          <button 
            className="pro-btn" 
            onClick={() => setIsAddModalOpen(true)}
            style={{ background: 'var(--accent-red)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={18} /> Add New Machine
          </button>
        }
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className="content-scroll" style={{ padding: '32px', flex: 1 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}>
            {Object.entries(
              machineFleet.reduce((acc: any, machine: any) => {
                const type = machine.type || (machine.id && machine.id.includes('-') ? machine.id.split('-')[0] : 'OTHER');
                if (!acc[type]) acc[type] = [];
                acc[type].push(machine);
                return acc;
              }, {} as Record<string, typeof machineFleet>)
            ).map(([type, machines]: [string, any]) => {
            const processNames: Record<string, string> = {
              CNC: 'CNC Machining',
              MIL: 'Milling',
              GRN: 'Grinding',
              EDM: 'Electrical Discharge Machining',
              LAT: 'Lathe / Turning'
            };
            return (
              <div key={type}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  {processNames[type] || type} ({machines.length})
                </h2>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                  gap: '24px' 
                }}>
                  {machines.map((machine: any) => (
            <div key={machine.id} onClick={() => setSelectedMachine(machine)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }} className="machine-card-wrapper">
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--bg-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--accent-red)'
                  }}>
                    <Cpu size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{machine.id}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{machine.name}</p>
                  </div>
                </div>
                <div style={{ 
                  padding: '4px 8px', 
                  borderRadius: '6px', 
                  fontSize: '11px', 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  backgroundColor: machine.status === 'running' ? 'var(--success-green-light)' : 'var(--bg-color)',
                  color: machine.status === 'running' ? 'var(--success-green)' : 'var(--text-secondary)',
                  border: `1px solid ${machine.status === 'running' ? 'var(--success-green)' : 'var(--border-color)'}`
                }}>
                  {machine.status}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>CURRENT JOB</p>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {machine.tool !== 'None' ? machine.tool : '--'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>EFFICIENCY</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-color)', borderRadius: '3px' }}>
                      <div style={{ width: `${machine.efficiency}%`, height: '100%', backgroundColor: 'var(--success-green)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{machine.efficiency}%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Gauge size={14} /> {machine.runtime} Total
                </div>
                <div>Last Maint: {machine.lastMaintenance}</div>
              </div>
            </Card>
            </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMachine && (
        <div 
          style={{ 
            width: '400px', 
            backgroundColor: 'var(--sidebar-bg)', 
            borderLeft: '1px solid var(--border-color)',
            display: 'flex', 
            flexDirection: 'column',
            animation: 'slideInRight 0.3s ease-out forwards',
            flexShrink: 0
          }}
        >
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: 'var(--bg-color)', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>{selectedMachine.id}</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>{selectedMachine.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMachine(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-secondary)', borderRadius: '50%', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <button className="pro-btn" style={{ backgroundColor: 'var(--accent-red)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                View Full Machine Analytics
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <Gauge size={16} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>OEE</span>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success-green)' }}>{selectedMachine.efficiency}%</div>
                </div>
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-color)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <Activity size={16} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Status</span>
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, textTransform: 'capitalize', color: selectedMachine.status === 'running' ? 'var(--success-green)' : 'var(--text-secondary)' }}>
                    {selectedMachine.status}
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Operational Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Clock size={16} /> <span style={{ fontSize: '13px', fontWeight: 500 }}>Total Runtime</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedMachine.runtime}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Settings size={16} /> <span style={{ fontSize: '13px', fontWeight: 500 }}>Current Tool</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: selectedMachine.tool !== 'None' ? 'var(--accent-red)' : 'var(--text-secondary)' }}>{selectedMachine.tool}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <DollarSign size={16} /> <span style={{ fontSize: '13px', fontWeight: 500 }}>Running Cost Rate</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>RM {selectedMachine.costRate || '12.50'} / hr</span>
                  </div>
                  {selectedMachine.bedSize && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Maximize size={16} /> <span style={{ fontSize: '13px', fontWeight: 500 }}>Bed Size (XYZ)</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedMachine.bedSize}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Maintenance Log</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {selectedMachine.maintenance?.worker && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <User size={16} /> <span style={{ fontSize: '13px', fontWeight: 500 }}>Assigned worker</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedMachine.maintenance.worker}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Wrench size={16} /> <span style={{ fontSize: '13px', fontWeight: 500 }}>Last Maintenance</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedMachine.lastMaintenance}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Calendar size={16} /> <span style={{ fontSize: '13px', fontWeight: 500 }}>Next Scheduled</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--warning-orange)' }}>
                      {selectedMachine.maintenance?.nextScheduled || 'In 14 Days'}
                    </span>
                  </div>
                  {selectedMachine.maintenance?.period && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Clock size={16} /> <span style={{ fontSize: '13px', fontWeight: 500 }}>Cycle Period</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{selectedMachine.maintenance.period}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
      )}
      </div>
      {isAddModalOpen && (
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: '20px', width: '600px', maxWidth: '90%', maxHeight: '90%', overflowY: 'auto', padding: '32px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>Add New Machine</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleAddMachine} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Machine ID</label>
                  <input required placeholder="e.g. CNC-26" value={newMachine.id} onChange={e => setNewMachine({...newMachine, id: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Machine Name</label>
                  <input required placeholder="e.g. Haas VM-3" value={newMachine.name} onChange={e => setNewMachine({...newMachine, name: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Machine Type</label>
                  <select value={newMachine.type} onChange={e => setNewMachine({...newMachine, type: e.target.value})}>
                    <option value="CNC">CNC</option>
                    <option value="MIL">Milling</option>
                    <option value="GRN">Grinding</option>
                    <option value="EDM">EDM</option>
                    <option value="LAT">Lathe</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Efficiency (%)</label>
                  <input type="number" step="1" min="0" max="100" value={newMachine.efficiency} onChange={e => setNewMachine({...newMachine, efficiency: parseInt(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Cost Rate ($/hr)</label>
                  <input type="number" step="0.01" value={newMachine.costRate} onChange={e => setNewMachine({...newMachine, costRate: parseFloat(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label>Max Product Bed Size (XYZ)</label>
                <input placeholder="e.g. 1000x800x600mm" value={newMachine.bedSize} onChange={e => setNewMachine({...newMachine, bedSize: e.target.value})} />
              </div>

              <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.05em' }}>Maintenance Configuration</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Assigned Worker</label>
                    <input placeholder="Worker Name" value={newMachine.maintenance.worker} onChange={e => setNewMachine({...newMachine, maintenance: {...newMachine.maintenance, worker: e.target.value}})} />
                  </div>
                  <div className="form-group">
                    <label>Next Scheduled</label>
                    <input type="date" value={newMachine.maintenance.nextScheduled} onChange={e => setNewMachine({...newMachine, maintenance: {...newMachine.maintenance, nextScheduled: e.target.value}})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Maintenance Period</label>
                  <select value={newMachine.maintenance.period} onChange={e => setNewMachine({...newMachine, maintenance: {...newMachine.maintenance, period: e.target.value}})}>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Custom">Custom / On Demand</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="pro-btn" style={{ background: 'var(--accent-red)', color: 'white', padding: '16px', fontSize: '16px', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Register Machine
              </button>
            </form>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); margin-right: -400px; }
          to { transform: translateX(0); margin-right: 0; }
        }
        .machine-card-wrapper:hover {
          transform: translateY(-2px);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 11px;
          font-weight: 800;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }
        .form-group input, .form-group select {
          padding: 10px 14px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          background: white;
          outline: none;
        }
        .form-group input:focus, .form-group select:focus {
          border-color: var(--accent-red);
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }
      `}</style>
    </>
  );
}
