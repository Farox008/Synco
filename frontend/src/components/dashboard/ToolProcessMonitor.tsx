import React from 'react';
import { Card } from '../ui/Card';
import { MiniProgress } from '../ui/ProgressBar';

interface ProcessJob {
  id: string;
  name: string;
  cnc: number;
  milling: number;
  heat: number;
  grinding: number;
  edm: number;
}

interface ToolProcessMonitorProps {
  tools: ProcessJob[];
}

export const ToolProcessMonitor: React.FC<ToolProcessMonitorProps> = ({ tools }) => {
  return (
    <Card title="Tool Process Monitor" subtitle="Active Priority Tools">
      <div className="scrollable-content" style={{ maxHeight: '480px' }}>
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ minWidth: '160px' }}>Tool Info</th>
              <th>CNC</th>
              <th>Milling</th>
              <th>Heat Treat</th>
              <th>Grinding</th>
              <th>EDM</th>
            </tr>
          </thead>
          <tbody>
            {tools.map(tool => (
              <tr key={tool.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{tool.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>#{tool.id}</span>
                  </div>
                </td>
                <td><MiniProgress progress={tool.cnc} type="cnc" /></td>
                <td><MiniProgress progress={tool.milling} type="milling" /></td>
                <td><MiniProgress progress={tool.heat} type="heat" /></td>
                <td><MiniProgress progress={tool.grinding} type="grinding" /></td>
                <td><MiniProgress progress={tool.edm} type="edm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
