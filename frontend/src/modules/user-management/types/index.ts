export type EmploymentStatus = 'Active' | 'Inactive';

export interface Department {
  id: string;
  name: string;
  description: string;
  headId?: string; // Reference to an Employee
  employeeCount: number;
  status: EmploymentStatus;
}

export interface ProductionLine {
  id: string;
  name: string;
  parentId?: string; // Self-referencing for hierarchical lines
  description: string;
  employeeCount: number;
  status: EmploymentStatus;
}

export interface EmploymentType {
  id: string;
  name: string;
  description: string;
  status: EmploymentStatus;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // e.g., '08:00'
  endTime: string;   // e.g., '16:00'
  breakDuration: number; // in minutes
  status: EmploymentStatus;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface EmployeeSkill {
  id: string;
  name: string;
}

export interface Employee {
  // General
  id: string; // e.g., 'EMP-001'
  firstName: string;
  lastName: string;
  preferredName?: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string;
  profilePicture?: string;

  // Employment
  departmentId: string;
  productionLineId?: string; // Only for Production department
  designation: string;
  employmentTypeId: string;
  joiningDate: string; // YYYY-MM-DD
  shiftId: string;
  supervisorId?: string;
  employmentStatus: EmploymentStatus;

  // Contact
  email: string;
  phoneNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Skills & Notes
  skills: EmployeeSkill[];
  notes?: string;
}
