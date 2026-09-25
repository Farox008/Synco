import React, { useState } from 'react';
import { Barcode, Info, Layers, Package, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';

interface TableRow {
  no: number;
  description: string;
  finishingSize: string;
  type: string;
  quantity: string;
  remark: string;
}

interface ToolFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ToolForm: React.FC<ToolFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const { getAllJobs } = useDatabase();
  const [formData, setFormData] = useState({
    id: '',
    jobNo: '',
    toolingSize: '',
    partName: '',
    mcTonnage: '',
    partNo: '',
    typeOfTooling: '',
    designBy: '',
    strip: '',
    issuedDate: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    description: '',
    material: false,
    stdPart: false,
    others: false,
    tableRows: [] as TableRow[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    } else {
      setFormData(prev => ({
        ...prev,
        id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
        designBy: user?.username || ''
      }));
    }
  }, [user, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAddRow = () => {
    setFormData(prev => ({
      ...prev,
      tableRows: [...prev.tableRows, { no: prev.tableRows.length + 1, description: '', finishingSize: '', type: '', quantity: '', remark: '' }]
    }));
  };

  const handleRowChange = (index: number, field: keyof TableRow, value: string) => {
    const newRows = [...formData.tableRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setFormData({ ...formData, tableRows: newRows });
  };

  const handleRemoveRow = (index: number) => {
    const newRows = formData.tableRows.filter((_, i) => i !== index);
    newRows.forEach((row, i) => { row.no = i + 1; });
    setFormData({ ...formData, tableRows: newRows });
  };

  const isPartNoEmpty = !formData.partNo.trim();
  const isPartNoUnique = isPartNoEmpty ? null : !getAllJobs().some((t: any) => t.partNo === formData.partNo || t.id === formData.partNo);

  const [submitError, setSubmitError] = useState<{ title: string; message: React.ReactNode } | null>(null);
  const [duplicateConfirm, setDuplicateConfirm] = useState<(() => void) | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setDuplicateConfirm(null);
    const newErrors: Record<string, string> = {};
    
    // Required fields check
    const missingFields: string[] = [];
    if (!formData.partNo.trim()) missingFields.push('Part Number');
    if (!formData.jobNo.trim()) missingFields.push('Job Number');
    if (!formData.partName?.trim()) missingFields.push('Part Name');
    if (!formData.designBy?.trim()) missingFields.push('Design By');
    if (formData.tableRows.length === 0) missingFields.push('At least one BOM Component');

    if (missingFields.length > 0) {
      setSubmitError({
        title: 'Required Information Missing',
        message: (
          <>
            <p style={{ marginBottom: '8px' }}>The following fields are required:</p>
            <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
              {missingFields.map(f => <li key={f}>• {f}</li>)}
            </ul>
            <p>Please complete these fields before submitting.</p>
          </>
        )
      });
      return;
    }

    // Uniqueness check
    if (isPartNoUnique === false) {
      setSubmitError({
        title: 'Tool Number Already Exists',
        message: (
          <>
            <p>The Tool Number <strong>"{formData.partNo}"</strong> already exists in the system.</p>
            <p>Every Tool Number must be globally unique.</p>
            <p>Please enter a different Tool Number before continuing.</p>
          </>
        )
      });
      return;
    }

    // Component validation
    for (let i = 0; i < formData.tableRows.length; i++) {
      const row = formData.tableRows[i];
      const qty = parseFloat(row.quantity);
      if (!row.description.trim()) {
         setSubmitError({
           title: 'Invalid BOM Component',
           message: <p>Component #{i + 1} is missing a description.</p>
         });
         return;
      }
      if (isNaN(qty) || qty <= 0) {
         setSubmitError({
           title: 'Invalid BOM Component',
           message: (
             <>
               <p>Component #{i + 1} contains an invalid quantity.</p>
               <p>Quantity must be greater than zero.</p>
             </>
           )
         });
         return;
      }
    }

    // Duplicate components check
    const descriptions = new Set();
    let hasDuplicates = false;
    for (const row of formData.tableRows) {
      if (descriptions.has(row.description)) {
        hasDuplicates = true;
        break;
      }
      descriptions.add(row.description);
    }

    if (hasDuplicates) {
      setDuplicateConfirm(() => () => onSubmit(formData));
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="wo-form" onSubmit={handleFormSubmit}>
      <div className="form-sections">
        <div className="form-group-row" style={{ gap: '24px' }}>
          <div className="form-section" style={{ flex: 2 }}>
             <div className="section-header">
                <Info size={16} />
                <h4>Tool Info</h4>
             </div>
             <div className="form-group-row">
               <div className="form-group">
                 <label style={{ color: errors.partNo || isPartNoUnique === false ? 'var(--accent-red)' : 'inherit' }}>Part No</label>
                 <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                   <input type="text" name="partNo" value={formData.partNo} onChange={handleChange} style={{ ...(errors.partNo || isPartNoUnique === false ? { borderColor: 'var(--accent-red)' } : {}), paddingRight: '32px' }} required />
                   {!isPartNoEmpty && (
                     <div style={{ position: 'absolute', right: '10px', display: 'flex', alignItems: 'center' }}>
                       {isPartNoUnique ? <CheckCircle2 size={16} color="var(--accent-green, #10b981)" /> : <XCircle size={16} color="var(--accent-red)" />}
                     </div>
                   )}
                 </div>
                 {errors.partNo && <span style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>{errors.partNo}</span>}
                 {!errors.partNo && isPartNoUnique === false && <span style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>Part No already exists</span>}
               </div>
               <div className="form-group">
                 <label style={{ color: errors.jobNo ? 'var(--accent-red)' : 'inherit' }}>Job No</label>
                 <input type="text" name="jobNo" value={formData.jobNo} onChange={handleChange} style={errors.jobNo ? { borderColor: 'var(--accent-red)' } : {}} required />
                 {errors.jobNo && <span style={{ color: 'var(--accent-red)', fontSize: '11px', marginTop: '2px', fontWeight: 600 }}>{errors.jobNo}</span>}
               </div>
               <div className="form-group">
                 <label>Tooling Size</label>
                 <input type="text" name="toolingSize" value={formData.toolingSize} onChange={handleChange} />
               </div>
             </div>
             <div className="form-group-row">
               <div className="form-group">
                 <label>Part Name</label>
                 <input type="text" name="partName" value={formData.partName} onChange={handleChange} />
               </div>
               <div className="form-group">
                 <label>M/C Tonnage</label>
                 <input type="text" name="mcTonnage" value={formData.mcTonnage} onChange={handleChange} />
               </div>
               <div className="form-group">
                 <label>Type of Tooling</label>
                 <input type="text" name="typeOfTooling" value={formData.typeOfTooling} onChange={handleChange} />
               </div>
             </div>
             <div className="form-group-row">
               <div className="form-group">
                 <label>Design By</label>
                 <input type="text" name="designBy" value={formData.designBy} onChange={handleChange} />
               </div>
               <div className="form-group">
                 <label>Strip</label>
                 <input type="text" name="strip" value={formData.strip} onChange={handleChange} />
               </div>
             </div>
             <div className="form-group-row">
               <div className="form-group">
                 <label>Issued Date</label>
                 <input type="date" name="issuedDate" value={formData.issuedDate} onChange={handleChange} />
               </div>
               <div className="form-group">
                 <label>Start Date</label>
                 <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
               </div>
               <div className="form-group">
                 <label>End Date</label>
                 <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
               </div>
             </div>
          </div>
          
          <div className="form-section" style={{ flex: 1, minWidth: '200px' }}>
            <div className="section-header">
              <Barcode size={16} />
              <h4>Barcode</h4>
            </div>
            <div className="barcode-placeholder">
              <div className="barcode-bars" />
              <span>{formData.partNo || 'P-XXXX'}</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Optional details..." />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <Layers size={16} />
            <h4>Requirements</h4>
          </div>
          <div className="form-group-row" style={{ alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <input type="checkbox" name="material" checked={formData.material} onChange={handleChange} style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }} />
              Material
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <input type="checkbox" name="stdPart" checked={formData.stdPart} onChange={handleChange} style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }} />
              STD part
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <input type="checkbox" name="others" checked={formData.others} onChange={handleChange} style={{ width: '16px', height: '16px', margin: 0, cursor: 'pointer' }} />
              Others
            </label>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} />
              <h4 style={{ color: errors.tableRows ? 'var(--accent-red)' : 'inherit' }}>Components</h4>
              {errors.tableRows && <span style={{ color: 'var(--accent-red)', fontSize: '12px', fontWeight: 600, marginLeft: '8px' }}>{errors.tableRows}</span>}
            </div>
            <button type="button" className="header-tab active" onClick={handleAddRow} style={{ padding: '6px 12px', fontSize: '12px' }}>
              + Add Row
            </button>
          </div>
          
          {formData.tableRows.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="tools-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '8px', width: '40px' }}>No</th>
                    <th style={{ padding: '8px' }}>Description</th>
                    <th style={{ padding: '8px' }}>Finishing Size</th>
                    <th style={{ padding: '8px' }}>Type</th>
                    <th style={{ padding: '8px', width: '80px' }}>Quantity</th>
                    <th style={{ padding: '8px' }}>Remark</th>
                    <th style={{ padding: '8px', width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.tableRows.map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '4px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{row.no}</td>
                      <td style={{ padding: '4px' }}><input type="text" value={row.description} onChange={(e) => handleRowChange(idx, 'description', e.target.value)} /></td>
                      <td style={{ padding: '4px' }}><input type="text" value={row.finishingSize} onChange={(e) => handleRowChange(idx, 'finishingSize', e.target.value)} /></td>
                      <td style={{ padding: '4px' }}><input type="text" value={row.type} onChange={(e) => handleRowChange(idx, 'type', e.target.value)} /></td>
                      <td style={{ padding: '4px' }}><input type="text" value={row.quantity} onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)} /></td>
                      <td style={{ padding: '4px' }}><input type="text" value={row.remark} onChange={(e) => handleRowChange(idx, 'remark', e.target.value)} /></td>
                      <td style={{ padding: '4px', textAlign: 'center' }}>
                        <button type="button" onClick={() => handleRemoveRow(idx)} style={{ color: 'var(--accent-red)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="header-tab" onClick={onCancel}>Cancel</button>
        <button type="submit" className="pro-btn" style={{ width: 'auto', background: 'var(--accent-red)', color: 'white' }}>Create Tool</button>
      </div>

      <style jsx>{`
        .wo-form { display: flex; flex-direction: column; gap: 24px; }
        .form-sections { display: flex; flex-direction: column; gap: 24px; }
        .form-section { display: flex; flex-direction: column; gap: 12px; }
        .section-header { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
        .section-header h4 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
        .form-group-row { display: flex; gap: 16px; flex-wrap: wrap; }
        .form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 120px; }
        .form-group label { font-size: 12px; font-weight: 600; color: var(--text-tertiary); }
        input, select, textarea {
          padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 8px;
          font-size: 14px; outline: none; transition: border-color 0.2s; width: 100%; box-sizing: border-box;
        }
        input:focus, select:focus, textarea:focus { border-color: var(--accent-red); }
        .barcode-placeholder {
          background: white; border: 1px solid var(--border-color); border-radius: 12px;
          padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 12px; height: 100%; justify-content: center; min-height: 120px;
        }
        .barcode-bars {
          height: 60px; width: 100%; max-width: 200px;
          background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 6px); opacity: 0.8;
        }
        .barcode-placeholder span { font-family: monospace; font-size: 14px; letter-spacing: 4px; font-weight: 700; }
        .form-actions {
          display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;
          padding-top: 24px; border-top: 1px solid var(--border-color);
        }
      `}</style>
    </form>
  );
};
