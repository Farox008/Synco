import React, { useState } from 'react';
import { Upload, Barcode, Calendar, Package, Info, FileText, Layers, Maximize } from 'lucide-react';

interface JobOrderFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const JobOrderForm: React.FC<JobOrderFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    customerName: '',
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'Medium',
    tools: [] as { partNumber: string; partName: string; designer: string }[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      id: prev.id || `WO-${Math.floor(1000 + Math.random() * 9000)}`
    }));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAddTool = () => {
    setFormData(prev => ({
      ...prev,
      tools: [...prev.tools, { partNumber: '', partName: '', designer: '' }]
    }));
  };

  const handleToolChange = (index: number, field: string, value: string) => {
    const newTools = [...formData.tools];
    newTools[index] = { ...newTools[index], [field as keyof typeof newTools[0]]: value };
    setFormData({ ...formData, tools: newTools });
  };

  const handleRemoveTool = (index: number) => {
    const newTools = formData.tools.filter((_, i) => i !== index);
    setFormData({ ...formData, tools: newTools });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer Name is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start Date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Expected End Date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="wo-form" onSubmit={handleFormSubmit}>
      <div className="form-sections">
        {/* Basic Info */}
        <div className="form-section">
          <div className="section-header">
            <Info size={16} />
            <h4>Basic Info</h4>
          </div>
          <div className="form-group-row">
            <div className="form-group">
              <label>Job Number</label>
              <input type="text" name="id" value={formData.id} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label style={{ color: errors.customerName ? 'var(--accent-red)' : 'inherit' }}>Customer Name</label>
              <input 
                type="text" 
                name="customerName" 
                value={formData.customerName} 
                onChange={handleChange} 
                placeholder="e.g. Acme Corp" 
                style={errors.customerName ? { borderColor: 'var(--accent-red)' } : {}}
                required 
              />
              {errors.customerName && <span style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>{errors.customerName}</span>}
            </div>
          </div>
          <div className="form-group-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Project Name</label>
              <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="e.g. Project Alpha" required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Optional details..." />
          </div>
        </div>

        {/* Production Info */}
        <div className="form-section">
          <div className="section-header">
            <Calendar size={16} />
            <h4>Production Info</h4>
          </div>
          <div className="form-group-row">
            <div className="form-group">
              <label style={{ color: errors.startDate ? 'var(--accent-red)' : 'inherit' }}>Start Date</label>
              <input 
                type="date" 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                style={errors.startDate ? { borderColor: 'var(--accent-red)' } : {}}
                required 
              />
              {errors.startDate && <span style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>{errors.startDate}</span>}
            </div>
            <div className="form-group">
              <label style={{ color: errors.endDate ? 'var(--accent-red)' : 'inherit' }}>Exp. End Date</label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                style={errors.endDate ? { borderColor: 'var(--accent-red)' } : {}}
                required 
              />
              {errors.endDate && <span style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>{errors.endDate}</span>}
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group-row" style={{ marginTop: '12px', gap: '24px' }}>
          {/* Attachments */}
          <div className="form-section" style={{ flex: 1 }}>
            <div className="section-header">
              <Upload size={16} />
              <h4>Attachments</h4>
            </div>
            <div className="dropzone">
              <Package size={24} opacity={0.3} />
              <span>Drag & Drop design file here</span>
              <button type="button" className="header-tab active" style={{ fontSize: '11px', marginTop: '8px' }}>Or Browse</button>
            </div>
          </div>

          {/* Barcode */}
          <div className="form-section" style={{ flex: 1 }}>
            <div className="section-header">
              <Barcode size={16} />
              <h4>Barcode</h4>
            </div>
            <div className="barcode-placeholder">
              <div className="barcode-bars" />
              <span>{formData.id}</span>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="form-section">
          <div className="section-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} />
              <h4>Tools</h4>
            </div>
            <button type="button" className="header-tab active" onClick={handleAddTool} style={{ padding: '6px 12px', fontSize: '12px' }}>
              + Add Tool
            </button>
          </div>
          {formData.tools.length > 0 && (
            <table className="tools-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px' }}>Part Number</th>
                  <th style={{ padding: '8px' }}>Part Name</th>
                  <th style={{ padding: '8px' }}>Designer</th>
                  <th style={{ padding: '8px', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.tools.map((tool, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '4px' }}><input type="text" value={tool.partNumber} onChange={(e) => handleToolChange(idx, 'partNumber', e.target.value)} placeholder="Part #" /></td>
                    <td style={{ padding: '4px' }}><input type="text" value={tool.partName} onChange={(e) => handleToolChange(idx, 'partName', e.target.value)} placeholder="Name" /></td>
                    <td style={{ padding: '4px' }}><input type="text" value={tool.designer} onChange={(e) => handleToolChange(idx, 'designer', e.target.value)} placeholder="Designer" /></td>
                    <td style={{ padding: '4px', textAlign: 'center' }}>
                      <button type="button" onClick={() => handleRemoveTool(idx)} style={{ color: 'var(--accent-red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>&times;</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="header-tab" onClick={onCancel}>Cancel</button>
        <button type="submit" className="pro-btn" style={{ width: 'auto', background: 'var(--accent-red)', color: 'white' }}>Create Job Order</button>
      </div>

      <style jsx>{`
        .wo-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .form-sections {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }
        .section-header h4 {
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-group-row {
          display: flex;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-tertiary);
        }
        input, select, textarea {
          padding: 10px 12px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--accent-red);
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-with-icon :global(svg) {
          position: absolute;
          left: 12px;
          color: var(--text-tertiary);
          pointer-events: none;
        }
        .input-with-icon input {
          padding-left: 36px;
          width: 100%;
        }
        .dropzone {
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-color);
        }
        .dropzone span {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 8px;
        }
        .barcode-placeholder {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .barcode-bars {
          height: 60px;
          width: 100%;
          background: repeating-linear-gradient(
            90deg,
            #000,
            #000 2px,
            #fff 2px,
            #fff 6px
          );
          opacity: 0.8;
        }
        .barcode-placeholder span {
          font-family: monospace;
          font-size: 14px;
          letter-spacing: 4px;
          font-weight: 700;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
        }
      `}</style>
    </form>
  );
};
