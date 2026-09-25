"use client";

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Briefcase, Phone, BookOpen, FileText, FileSignature, Edit } from 'lucide-react';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { mockEmployees, mockDepartments, mockProductionLines, mockEmploymentTypes, mockShifts } from '@/modules/user-management/data/mockData';

export default function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const employee = mockEmployees.find(e => e.id === id) || mockEmployees[0];
  
  const department = mockDepartments.find(d => d.id === employee.departmentId);
  const prodLine = mockProductionLines.find(p => p.id === employee.productionLineId);
  const empType = mockEmploymentTypes.find(t => t.id === employee.employmentTypeId);
  const shift = mockShifts.find(s => s.id === employee.shiftId);

  // General Tab
  const GeneralTab = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Employee ID</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.id}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">First Name</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.firstName}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Last Name</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.lastName}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Preferred Name</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.preferredName || '-'}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Gender</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.gender}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date of Birth</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.dateOfBirth}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Nationality</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.nationality}</div>
      </div>
    </div>
  );

  // Employment Tab (Enforces Production Line logic visually)
  const EmploymentTab = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Department</label>
        <div className="text-sm font-medium text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{department?.name}</div>
      </div>
      
      {/* Business Rule: Only employees in Production have a Production Line */}
      {department?.name === 'Production' ? (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Production Line</label>
          <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{prodLine?.name || 'Unassigned'}</div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Production Line</label>
          <div className="text-sm text-[var(--text-tertiary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)] italic">Not applicable for {department?.name}</div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Designation</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.designation}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Employment Type</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{empType?.name}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Joining Date</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.joiningDate}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Shift</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{shift?.name} ({shift?.startTime} - {shift?.endTime})</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Supervisor</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.supervisorId || 'None'}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Status</label>
        <div className="p-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            employee.employmentStatus === 'Active' 
              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {employee.employmentStatus}
          </span>
        </div>
      </div>
    </div>
  );

  // Contact Tab
  const ContactTab = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
      <div className="md:col-span-2">
        <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">Primary Contact</h4>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Email Address</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.email}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Phone Number</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.phoneNumber}</div>
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Residential Address</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)] min-h-[60px]">{employee.address}</div>
      </div>

      <div className="md:col-span-2 mt-4">
        <h4 className="text-sm font-semibold mb-4 text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2">Emergency Contact</h4>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Contact Name</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.emergencyContactName}</div>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Contact Phone</label>
        <div className="text-sm text-[var(--text-primary)] p-2 bg-[var(--bg-color)] rounded border border-[var(--border-color)]">{employee.emergencyContactPhone}</div>
      </div>
    </div>
  );

  // Skills Tab
  const SkillsTab = (
    <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Verified Skills</h3>
        <button className="text-xs bg-[var(--bg-color)] border border-[var(--border-color)] px-3 py-1.5 rounded hover:bg-[var(--border-color)] transition-colors">Add Skill</button>
      </div>
      {employee.skills && employee.skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {employee.skills.map(skill => (
            <span key={skill.id} className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-sm">
              {skill.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-secondary)] italic">No skills recorded yet.</p>
      )}
    </div>
  );

  // Documents Tab
  const DocumentsTab = (
    <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Employee Documents</h3>
      <div className="space-y-3">
        {['Employment Letter', 'Identity Card', 'Safety Certification'].map((doc, i) => (
          <div key={i} className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-color)] hover:border-[var(--accent-red)] transition-colors group cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-[var(--text-secondary)] group-hover:text-[var(--accent-red)]" />
              <span className="text-sm text-[var(--text-primary)]">{doc}</span>
            </div>
            <button className="text-xs text-[var(--accent-red)] opacity-0 group-hover:opacity-100 transition-opacity">View</button>
          </div>
        ))}
      </div>
    </div>
  );

  // Notes Tab
  const NotesTab = (
    <div className="bg-[var(--card-bg)] p-6 rounded-xl border border-[var(--border-color)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Administrative Notes</h3>
        <button className="text-xs bg-[var(--accent-red)] text-white px-3 py-1.5 rounded shadow hover:bg-[var(--accent-red-hover)] transition-colors">Add Note</button>
      </div>
      <div className="p-4 bg-[var(--bg-color)] rounded-lg border border-[var(--border-color)]">
        <p className="text-sm text-[var(--text-secondary)]">{employee.notes || 'No administrative notes have been added for this employee.'}</p>
      </div>
    </div>
  );

  const tabs: TabItem[] = [
    { id: 'general', label: 'General', content: GeneralTab },
    { id: 'employment', label: 'Employment', content: EmploymentTab },
    { id: 'contact', label: 'Contact', content: ContactTab },
    { id: 'skills', label: 'Skills', content: SkillsTab },
    { id: 'documents', label: 'Documents', content: DocumentsTab },
    { id: 'notes', label: 'Notes', content: NotesTab }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/user-management/employees')}
            className="p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded hover:bg-[var(--bg-color)] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="flex items-center gap-4">
            {employee.profilePicture ? (
              <img src={employee.profilePicture} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border-color)]" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[var(--bg-color)] border border-[var(--border-color)] flex items-center justify-center text-xl font-bold">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                {employee.firstName} {employee.lastName}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                  employee.employmentStatus === 'Active' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {employee.employmentStatus}
                </span>
              </h2>
              <p className="text-[var(--text-secondary)] text-sm">{employee.designation} • {department?.name}</p>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-primary)] px-4 py-2 rounded-lg hover:border-[var(--text-primary)] transition-colors text-sm font-medium">
          <Edit size={16} /> Edit Profile
        </button>
      </div>

      <div className="mt-8">
        <Tabs tabs={tabs} defaultTab="general" />
      </div>
    </div>
  );
}
