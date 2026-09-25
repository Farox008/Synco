"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Activity, Database, Users } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Card } from '@/components/ui/Card';
import { api } from '@/context/AuthContext';

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/data/audit-logs')
      .then(r => setAuditLogs(r.data))
      .catch(e => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredLogs = auditLogs.filter(log => 
    log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Header 
        title="Audit Logs" 
        tabs={[
          { label: 'System History', icon: <Database size={16} />, active: true },
          { label: 'User Activity', icon: <Users size={16} /> },
        ]}
      />

      <div className="content-scroll" style={{ padding: '32px' }}>
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ 
              flex: 1, 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              padding: '8px 16px',
              border: '1px solid var(--border-primary)'
            }}>
              <Search size={18} style={{ color: 'var(--text-tertiary)', marginRight: '12px' }} />
              <input 
                type="text" 
                placeholder="Search audit logs by user or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  width: '100%',
                  fontSize: '14px',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <button className="header-tab" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
              <Filter size={16} /> Filter by Entity
            </button>
            <button className="header-tab" style={{ padding: '8px 16px', borderRadius: '8px', display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
              <Calendar size={16} /> Export CSV
            </button>
          </div>
        </Card>

        <Card style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Action</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Timestamp</th>
                <th style={{ padding: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-tertiary)' }}>Loading audit logs...</td></tr>
              ) : filteredLogs.map((log, index) => (
                <tr key={log.id ?? index} style={{ borderBottom: index !== filteredLogs.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '16px',
                        backgroundColor: 'var(--bg-secondary)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 600, color: 'var(--accent-red)'
                      }}>
                        {(log.userName ?? 'S')[0]}
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{log.userName ?? 'System'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--accent-red)' }}><Activity size={14} /></span>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{log.action}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button style={{ color: 'var(--text-tertiary)', cursor: 'pointer', border: 'none', background: 'none' }}>
                      <Activity size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No logs found matching your criteria.
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
