import { Department, ProductionLine, EmploymentType, Shift, Employee, ActivityLog } from '../types';

export const mockDepartments: Department[] = [
  { id: 'D-01', name: 'Production', description: 'Manufacturing operations', employeeCount: 145, status: 'Active' },
  { id: 'D-02', name: 'Administration', description: 'General administration', employeeCount: 12, status: 'Active' },
  { id: 'D-03', name: 'Design', description: 'Product design and engineering', employeeCount: 8, status: 'Active' },
  { id: 'D-04', name: 'Planning', description: 'Production planning', employeeCount: 5, status: 'Active' },
  { id: 'D-05', name: 'Purchasing', description: 'Procurement and purchasing', employeeCount: 4, status: 'Active' },
  { id: 'D-06', name: 'Accounting', description: 'Finance and accounting', employeeCount: 3, status: 'Active' },
  { id: 'D-07', name: 'Warehouse', description: 'Inventory and logistics', employeeCount: 15, status: 'Active' },
  { id: 'D-08', name: 'Maintenance', description: 'Equipment maintenance', employeeCount: 10, status: 'Active' }
];

export const mockProductionLines: ProductionLine[] = [
  { id: 'PL-01', name: 'CNC', description: 'Computer Numerical Control machining', employeeCount: 45, status: 'Active' },
  { id: 'PL-02', name: 'Milling', description: 'Milling operations', employeeCount: 30, status: 'Active' },
  { id: 'PL-02-1', name: 'Manual Milling', parentId: 'PL-02', description: 'Manual milling machines', employeeCount: 10, status: 'Active' },
  { id: 'PL-02-2', name: 'CNC Milling', parentId: 'PL-02', description: 'CNC milling centers', employeeCount: 20, status: 'Active' },
  { id: 'PL-03', name: 'Grinding', description: 'Surface finishing', employeeCount: 25, status: 'Active' },
  { id: 'PL-03-1', name: 'Grinding', parentId: 'PL-03', description: 'Standard grinding', employeeCount: 15, status: 'Active' },
  { id: 'PL-03-2', name: 'Polishing', parentId: 'PL-03', description: 'Final polishing', employeeCount: 10, status: 'Active' },
  { id: 'PL-04', name: 'Wire EDM', description: 'Electrical Discharge Machining', employeeCount: 15, status: 'Active' },
  { id: 'PL-05', name: 'Assembly', description: 'Final product assembly', employeeCount: 30, status: 'Active' }
];

export const mockEmploymentTypes: EmploymentType[] = [
  { id: 'ET-01', name: 'Full Time', description: 'Standard 40 hours/week', status: 'Active' },
  { id: 'ET-02', name: 'Part Time', description: 'Less than 40 hours/week', status: 'Active' },
  { id: 'ET-03', name: 'Contract', description: 'Fixed-term contract', status: 'Active' },
  { id: 'ET-04', name: 'Temporary', description: 'Temporary assignment', status: 'Active' },
  { id: 'ET-05', name: 'Intern', description: 'Internship program', status: 'Active' }
];

export const mockShifts: Shift[] = [
  { id: 'S-01', name: 'Morning', startTime: '06:00', endTime: '14:00', breakDuration: 45, status: 'Active' },
  { id: 'S-02', name: 'Afternoon', startTime: '14:00', endTime: '22:00', breakDuration: 45, status: 'Active' },
  { id: 'S-03', name: 'Night', startTime: '22:00', endTime: '06:00', breakDuration: 45, status: 'Active' }
];

export const mockEmployees: Employee[] = [
  {
    id: 'EMP-001',
    firstName: 'Marcus',
    lastName: 'Chen',
    preferredName: 'Marc',
    gender: 'Male',
    dateOfBirth: '1985-04-12',
    nationality: 'Singaporean',
    profilePicture: 'https://i.pravatar.cc/150?img=11',
    departmentId: 'D-01', // Production
    productionLineId: 'PL-01', // CNC
    designation: 'Senior CNC Machinist',
    employmentTypeId: 'ET-01',
    joiningDate: '2019-02-15',
    shiftId: 'S-01',
    employmentStatus: 'Active',
    email: 'm.chen@synco.app',
    phoneNumber: '+65 9123 4567',
    address: 'Block 123, Ang Mo Kio Ave 3, #04-123',
    emergencyContactName: 'Sarah Chen',
    emergencyContactPhone: '+65 9876 5432',
    skills: [{ id: 'SK-1', name: 'CNC Programming' }, { id: 'SK-2', name: 'Machine Setup' }]
  },
  {
    id: 'EMP-002',
    firstName: 'Elena',
    lastName: 'Rodriguez',
    gender: 'Female',
    dateOfBirth: '1990-08-22',
    nationality: 'Spanish',
    profilePicture: 'https://i.pravatar.cc/150?img=5',
    departmentId: 'D-03', // Design
    designation: 'CAD Engineer',
    employmentTypeId: 'ET-01',
    joiningDate: '2021-06-01',
    shiftId: 'S-01',
    employmentStatus: 'Active',
    email: 'e.rodriguez@synco.app',
    phoneNumber: '+65 8123 4567',
    address: 'Condo 45, Orchard Road, #12-45',
    emergencyContactName: 'David Rodriguez',
    emergencyContactPhone: '+65 8765 4321',
    skills: [{ id: 'SK-3', name: 'AutoCAD' }, { id: 'SK-4', name: 'SolidWorks' }]
  },
  {
    id: 'EMP-003',
    firstName: 'Wei Ting',
    lastName: 'Tan',
    gender: 'Female',
    dateOfBirth: '1995-11-30',
    nationality: 'Singaporean',
    departmentId: 'D-01', // Production
    productionLineId: 'PL-05', // Assembly
    designation: 'Assembly Technician',
    employmentTypeId: 'ET-02',
    joiningDate: '2023-01-10',
    shiftId: 'S-02',
    employmentStatus: 'Active',
    email: 'wt.tan@synco.app',
    phoneNumber: '+65 9345 6789',
    address: 'Block 456, Yishun Ring Road, #08-456',
    emergencyContactName: 'Tan Ah Boon',
    emergencyContactPhone: '+65 9111 2222',
    skills: [{ id: 'SK-5', name: 'Assembly' }, { id: 'SK-6', name: 'Safety Certified' }]
  }
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 'AL-1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: 'Admin', action: 'Employee Created', details: 'Added new employee EMP-004' },
  { id: 'AL-2', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user: 'Admin', action: 'Shift Updated', details: 'Changed start time for Night shift' },
  { id: 'AL-3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: 'HR Manager', action: 'Employee Updated', details: 'Updated contact info for EMP-001' },
  { id: 'AL-4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), user: 'Admin', action: 'Department Created', details: 'Added QA Department' }
];
