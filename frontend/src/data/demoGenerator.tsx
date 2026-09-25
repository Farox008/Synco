import React from 'react';
import { Activity, Box, UserCheck, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// --- Helper Functions ---
let seed = 12345;
const seededRandom = () => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const BASE_DATE = new Date('2026-06-18T12:00:00Z').getTime();

const randomInt = (min: number, max: number) => Math.floor(seededRandom() * (max - min + 1)) + min;
const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(seededRandom() * arr.length)];
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const customers = ['Aerospace Dynamics', 'Precision Tech', 'BioMedical Systems', 'AutoCore Parts', 'Global Energy', 'Defense Logistics', 'SolarSolutions', 'HeavyHaul Co.', 'AeroJet Tech', 'MedLink Global', 'Nexus Robotics', 'Future Motors', 'Satellite Systems', 'Marine Marine', 'Quantum Power', 'Precision Die', 'Orbital Tech', 'EcoEnergy', 'HyperLoop One', 'Tesla Motors', 'SpaceX Starlink', 'Blue Origin', 'Rivian Auto', 'Lucid Motors', 'Stark Industries'];
const statuses = ['Running', 'Completed', 'Pending', 'Delayed', 'Material Shortage'];
const priorities = ['Low', 'Medium', 'High', 'Critical'];
const users = ['Admin', 'Operator A', 'Operator B', 'Operator C', 'Manager', 'System', 'Lead Engineer'];
const actions = ['Modified Job Order', 'Quality Check Passed', 'Auto-scheduled', 'Approved Maintenance', 'Started JOB', 'Finished JOB', 'Material shortage alert', 'Created new Job Order', 'Daily report generated', 'Updated production schedule'];
const machineTypes = ['CNC', 'MIL', 'GRN', 'EDM', 'LAT'];
const machineStatus = ['running', 'idle', 'setup', 'error', 'maintenance'];

// --- Generator Functions ---

export const generateJobOrders = (count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const id = `WO-${9800 + i}`;
    const progress = randomInt(0, 100);
    const totalItems = randomInt(5, 50);
    const completedItems = Math.floor((progress / 100) * totalItems);
    const status = progress === 100 ? 'Completed' : randomChoice(statuses);
    
    // Generate 3-5 sub-tools for the detail page
    const tools = Array.from({ length: randomInt(3, 6) }).map((_, jidx) => {
      const jobId = `${id}/${jidx + 1}`;
      return {
        id: jobId,
        name: randomChoice(['PUNCH SHOE', 'PUNCH PLATE', 'UPPER DIE BLOCK', 'LOWER PUNCH', 'STRIPPER PLATE', 'DIE HOLDER']),
        processPath: randomChoice(['M1-C2-G1', 'M2-W1-E1-G1', 'CNC-MIL-QC', 'LAT-GRN']),
        processes: {
          cnc: { actual: randomInt(0, 20), estimated: 20, status: randomChoice(['In Progress', 'Completed', 'Pending', 'N/A']), machine: `VMC-${randomInt(1, 10)}` },
          milling: { actual: randomInt(0, 15), estimated: 15, status: randomChoice(['In Progress', 'Completed', 'Pending', 'N/A']), machine: `M-${randomInt(100, 200)}` },
          heat: { actual: randomInt(0, 5), estimated: 5, status: randomChoice(['In Progress', 'Completed', 'Pending', 'N/A']), machine: `HT-${randomInt(1, 5)}` },
          grinding: { actual: randomInt(0, 10), estimated: 10, status: randomChoice(['In Progress', 'Completed', 'Pending', 'N/A']), machine: `G-${randomInt(1, 40)}` },
          wiring: { actual: randomInt(0, 30), estimated: 30, status: randomChoice(['In Progress', 'Completed', 'Pending', 'N/A']), machine: `W-EDM-${randomChoice(['A', 'B', 'C'])}` },
          edm: { actual: randomInt(0, 25), estimated: 25, status: randomChoice(['In Progress', 'Completed', 'Pending', 'N/A']), machine: `SINK-${randomChoice(['X', 'Y', 'Z'])}` },
          assembly: { actual: 0, estimated: 10, status: randomChoice(['Pending', 'N/A']), machine: 'BENCH-01' }
        }
      };
    });

    const headerMetadata = {
      'DRAWING NO': `DWG-${randomInt(1000, 9999)}`,
      'REV': randomChoice(['A', 'B', 'C', '1', '2']),
      'MATERIAL': randomChoice(['MS / DC53', 'Titanium G5', 'Aluminum 6061', 'Stainless 304']),
      'TARGET DATE': formatDate(new Date(BASE_DATE + randomInt(10, 20) * 24 * 60 * 60 * 1000)),
      'PO VALUE': `$${randomInt(500, 5000)}`
    };

    const purchases = [
      { id: "MAT-001", name: "RAW Material Block", specs: randomChoice(['400x500x20mm', '200x300x10mm', '150x150x150mm']), suggested: "Global Metals Co.", final: "Global Metals Co.", status: "Arrived", date: "10 Aug" },
      { id: "TOOL-99", name: "High-Speed End Mill", specs: "Set of 5", suggested: "Industrial Tools", final: "", status: "Ordered", date: "12 Aug" },
      { id: "PO-772", name: "Custom Tooling Kit", specs: "A-590", suggested: "Precision Parts", final: "", status: "Processing", date: "14 Aug" },
    ];

    return {
      id,
      customer: randomChoice(customers),
      priority: randomChoice(priorities),
      progress,
      items: `${completedItems}/${totalItems}`,
      dueDate: formatDate(new Date(BASE_DATE + randomInt(-5, 30) * 24 * 60 * 60 * 1000)),
      status,
      activeJob: progress === 100 ? 'None' : tools[0].id,
      tools,
      headerMetadata,
      purchases,
    };
  });
};

export const generateMachines = (count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const type = randomChoice(machineTypes);
    const id = `${type}-${String(i + 1).padStart(2, '0')}`;
    const status = randomChoice(machineStatus);
    
    return {
      id,
      name: `${type} Precision ${i + 1}`,
      status,
      tool: status === 'running' ? `JOB-${randomInt(1000, 9999)}` : (status === 'setup' ? 'Setup' : 'None'),
      efficiency: randomInt(70, 99),
      runtime: `${randomInt(10, 500)}h`,
      lastMaintenance: formatDate(new Date(BASE_DATE - randomInt(1, 60) * 24 * 60 * 60 * 1000)),
    };
  });
};

export const generateAuditLogs = (count: number) => {
  const icons = [<UserCheck key="uc" size={14}/>, <Activity key="act" size={14}/>, <Box key="box" size={14}/>, <CheckCircle key="cc" size={14}/>, <AlertTriangle key="at" size={14}/>];
  
  return Array.from({ length: count }).map((_, i) => {
    const timeValue = i < 10 ? `${i + 1} mins ago` : (i < 60 ? `${Math.floor(i/2)} hours ago` : `${Math.floor(i/24)} days ago`);
    return {
      user: randomChoice(users),
      action: `${randomChoice(actions)} ${randomChoice(['WO-9802', 'JOB-7721', 'CNC-01', 'PO-7712', 'Material #45', 'QC Pass #909'])}`,
      time: timeValue,
      icon: randomChoice(icons),
    };
  });
};

export const generateRecentJobs = (count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const progress = randomInt(0, 100);
    return {
      id: `${randomInt(10000, 99999)}${randomChoice(['XYZ', 'ABC', 'DEF', 'GHI'])}`,
      company: randomChoice(customers),
      date: formatDate(new Date(BASE_DATE - randomInt(0, 7) * 24 * 60 * 60 * 1000)),
      route: `Line ${randomChoice(['A', 'B', 'C', 'D'])} → ${randomChoice(['Machining', 'Assembly', 'Paint', 'QC', 'Heat Treat'])}`,
      status: progress === 100 ? 'Delivered' : randomChoice(['Transit', 'Out', 'Production']),
      jobOrder: `WO-${randomInt(9800, 9850)}`,
      progress,
      endDate: formatDate(new Date(BASE_DATE + randomInt(0, 10) * 24 * 60 * 60 * 1000)),
    };
  });
};

export const generateProductionStats = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(name => ({
    name,
    Actual: randomInt(2000, 5000),
    Planned: randomInt(2000, 5500),
    RFQ: randomInt(3000, 6000),
  }));
};

export const generatePurchases = (count: number) => {
  const items = ['Titanium Grade 5 Rod', 'Carbide End Mills', 'Hydraulic Seal Kit', 'Stainless Bolts', 'Synthetic Coolant', 'Aluminum Block', 'Steel Plate', 'Copper Wire', 'Machine Oil', 'Safety Gear'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `PO-${7712 + i}`,
    vendor: `${randomChoice(['Steel', 'Global', 'Precision', 'Industrial', 'Alpha'])} ${randomChoice(['Alloys', 'Tools', 'Parts', 'Fasteners', 'Systems'])}`,
    item: randomChoice(items),
    amount: `$${randomInt(100, 5000)}`,
    date: `${randomInt(1, 48)} hours ago`,
    status: randomChoice(['Approved', 'Processing', 'Delivered', 'Ordered']),
  }));
};
