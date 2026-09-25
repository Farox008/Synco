// Quotation Service — Data layer for formal manufacturing quotations
// Synchronizes with RFQ and automatically generates linked Job Orders in Synco

import { RfqRecord, RfqService } from './rfq.service';
import { JobRecord } from '@/types/rfq-job.types';
import { dbService } from './db';

export interface QuotationItem {
  id: string;
  toolNumber: string;
  partName: string;
  description: string;
  specifications: string;
  material: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  leadTimeDays: number;
  departmentAllocations?: {
    department: string;
    processCode: string;
    allocatedBudget: number;
    estimatedHours: number | null;
  }[];
}

export interface QuotationFinancials {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
}

export interface QuotationContact {
  contactPerson: string;
  email: string;
  phone: string;
  companyAddress: string;
}

export type QuotationStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Sent' | 'Accepted' | 'Revised';

export interface QuotationRecord {
  id: string; // QT-XXXX
  quotationNo: string;
  rfqId?: string;
  rfqNumber?: string;
  jobOrderId: string; // WO-XXXX
  customer: string;
  customerContact: QuotationContact;
  projectName: string;
  quotationDate: string; // YYYY-MM-DD
  validityDate: string; // YYYY-MM-DD
  deliveryDate: string; // YYYY-MM-DD
  currency: string;
  exchangeRate: number;
  paymentTerms: string;
  deliveryTerms: string;
  status: QuotationStatus;
  items: QuotationItem[];
  financials: QuotationFinancials;
  notes: string;
  termsAndConditions: string[];
  preparedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  history: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
}

const STORAGE_KEY = 'synco_quotations_v1';

// Initial mock quotations
const initialQuotations: QuotationRecord[] = [
  {
    id: 'QT-0088',
    quotationNo: 'QT-0088',
    rfqId: 'rfq-125',
    rfqNumber: 'RFQ-2026-00125',
    jobOrderId: 'WO-9848',
    customer: 'Nexus Robotics',
    customerContact: {
      contactPerson: 'Sarah Jenkins (Procurement Lead)',
      email: 's.jenkins@nexusrobotics.io',
      phone: '+60 3-8821 9901',
      companyAddress: 'Level 14, Tower B, Cyberjaya Tech Park, 63000 Cyberjaya, Malaysia'
    },
    projectName: 'High-Precision Robotics Bracket Assy',
    quotationDate: '2026-09-07',
    validityDate: '2026-10-07',
    deliveryDate: '2026-10-05',
    currency: 'USD',
    exchangeRate: 1.0,
    paymentTerms: '30 Days Net from Delivery',
    deliveryTerms: 'Ex-Works / FOB Port Klang',
    status: 'Pending Approval',
    items: [
      {
        id: 'item-1',
        toolNumber: 'TOOL-001',
        partName: 'Robotics Articulation Bracket',
        description: 'Multi-axis articulated arm mounting bracket with hardened locating pin bores',
        specifications: '450 x 350 x 280 mm | Material: SKD11 / S50C | M/C: 250T',
        material: 'SKD11 Tool Steel',
        quantity: 1,
        unitPrice: 28500,
        totalPrice: 28500,
        leadTimeDays: 18,
        departmentAllocations: [
          { department: 'Design', processCode: 'DSN', allocatedBudget: 4560, estimatedHours: 26 },
          { department: 'CNC Machining', processCode: 'CNC', allocatedBudget: 4275, estimatedHours: 41 },
          { department: 'Wire Cut EDM', processCode: 'WC', allocatedBudget: 5700, estimatedHours: 86 },
          { department: 'Grinding', processCode: 'GR', allocatedBudget: 1995, estimatedHours: 50 },
          { department: 'Assembly', processCode: 'ASSY', allocatedBudget: 1710, estimatedHours: 49 },
        ]
      },
      {
        id: 'item-2',
        toolNumber: 'TOOL-002',
        partName: 'Secondary Stamping Guide Base',
        description: 'Hardened guide rail block with ±0.005mm surface ground parallelism',
        specifications: '320 x 240 x 180 mm | Material: DC53 Die Steel',
        material: 'DC53 Die Steel',
        quantity: 1,
        unitPrice: 20000,
        totalPrice: 20000,
        leadTimeDays: 14,
        departmentAllocations: [
          { department: 'Design', processCode: 'DSN', allocatedBudget: 3200, estimatedHours: 18 },
          { department: 'CNC Machining', processCode: 'CNC', allocatedBudget: 3000, estimatedHours: 28 },
          { department: 'Wire Cut EDM', processCode: 'WC', allocatedBudget: 4000, estimatedHours: 60 },
          { department: 'Grinding', processCode: 'GR', allocatedBudget: 1400, estimatedHours: 35 },
          { department: 'Assembly', processCode: 'ASSY', allocatedBudget: 1200, estimatedHours: 34 },
        ]
      }
    ],
    financials: {
      subtotal: 48500,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      grandTotal: 48500
    },
    notes: 'Quotation prepared based on engineering 3D CAD step files rev 2.1. Tool steel certifications and CMM inspection report will accompany final delivery.',
    termsAndConditions: [
      'Validity: This quotation is valid for 30 calendar days from the date of issue.',
      'Pricing: Prices quoted are net and exclusive of freight, insurance, and local customs duties unless stated otherwise.',
      'Payment: 30 days net upon invoice date, subject to prior credit assessment.',
      'Delivery Schedule: Estimated production lead time commences upon receipt of signed quotation, approved tool design drawings, and confirmed purchase order.',
      'Warranty: Synco warrants all precision components against manufacturing defects and material defects for 12 months from delivery.'
    ],
    preparedBy: 'Alex Wong (Operation Manager)',
    approvedBy: undefined,
    createdAt: '2026-09-07 15:00',
    updatedAt: '2026-09-07 15:00',
    history: [
      {
        id: 'hist-1',
        timestamp: '2026-09-07 15:00',
        actor: 'Alex Wong (Operation Manager)',
        action: 'Quotation Created from RFQ-2026-00125',
        details: 'Initial quotation generated with 2 tooling modules and linked to Job Order WO-9848.'
      }
    ]
  },
  {
    id: 'QT-0087',
    quotationNo: 'QT-0087',
    rfqId: 'rfq-124',
    rfqNumber: 'RFQ-2026-00124',
    jobOrderId: 'WO-9845',
    customer: 'Apex Aerospace',
    customerContact: {
      contactPerson: 'David Miller',
      email: 'd.miller@apexaero.com',
      phone: '+60 3-7890 1234',
      companyAddress: 'Subang Aerospace Park, Selangor, Malaysia'
    },
    projectName: 'Turbine Housing Progressive Stamping Die',
    quotationDate: '2026-09-05',
    validityDate: '2026-10-05',
    deliveryDate: '2026-10-15',
    currency: 'USD',
    exchangeRate: 1.0,
    paymentTerms: '50% Upon PO, 50% Upon First Article Inspection',
    deliveryTerms: 'FOB Port Klang',
    status: 'Sent',
    items: [
      {
        id: 'item-87-1',
        toolNumber: 'DIE-AER-01',
        partName: 'Turbine Casing Blanking Station',
        description: 'Heavy duty high carbide blanking station with guided stripper unit',
        specifications: '600 x 500 x 380 mm | Material: Carbide Insert / D2 Steel',
        material: 'Carbide / D2',
        quantity: 1,
        unitPrice: 65000,
        totalPrice: 65000,
        leadTimeDays: 25
      }
    ],
    financials: {
      subtotal: 65000,
      discountPercent: 0,
      discountAmount: 0,
      taxPercent: 0,
      taxAmount: 0,
      grandTotal: 65000
    },
    notes: 'ITAR controlled aerospace component. Requires full material traceability mill certificates.',
    termsAndConditions: [
      'Validity: 30 days.',
      'Payment: 50% deposit, 50% upon FAI approval.',
      'Tolerance: Strict aerospace compliance ±0.003mm.'
    ],
    preparedBy: 'Alex Wong (Operation Manager)',
    approvedBy: 'Marcus Sterling (Managing Director)',
    createdAt: '2026-09-05 10:30',
    updatedAt: '2026-09-06 09:15',
    history: [
      {
        id: 'hist-87-1',
        timestamp: '2026-09-05 10:30',
        actor: 'Alex Wong',
        action: 'Created',
        details: 'Drafted quotation from RFQ-2026-00124.'
      },
      {
        id: 'hist-87-2',
        timestamp: '2026-09-06 09:15',
        actor: 'Alex Wong',
        action: 'Sent to Customer',
        details: 'Dispatched PDF quotation to David Miller.'
      }
    ]
  }
];

export const QuotationService = {
  getStore(): QuotationRecord[] {
    if (typeof window === 'undefined') return initialQuotations;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialQuotations));
        return initialQuotations;
      }
      return JSON.parse(raw);
    } catch {
      return initialQuotations;
    }
  },

  saveStore(quotations: QuotationRecord[]) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
      } catch (err) {
        console.error('Failed to save quotations store:', err);
      }
    }
  },

  async getAll(): Promise<QuotationRecord[]> {
    return this.getStore();
  },

  async getById(id: string): Promise<QuotationRecord | null> {
    const list = this.getStore();
    return list.find(q => q.id === id || q.quotationNo === id) || null;
  },

  async save(record: QuotationRecord, actor: string = 'Alex Wong (Operation Manager)'): Promise<QuotationRecord> {
    const list = this.getStore();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updated = {
      ...record,
      updatedAt: now
    };

    const idx = list.findIndex(q => q.id === record.id || q.quotationNo === record.quotationNo);
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }

    this.saveStore(list);

    // Synchronize updates with linked Job Order if available
    if (record.jobOrderId) {
      try {
        const existingJob = dbService.getJobOrderById(record.jobOrderId);
        if (existingJob) {
          const currencySymbol = record.currency === 'USD' ? '$' : record.currency === 'RM' || record.currency === 'MYR' ? 'RM ' : record.currency;
          dbService.updateJobOrder(record.jobOrderId, {
            customer: record.customer,
            name: record.projectName,
            dueDate: record.deliveryDate,
            headerMetadata: {
              ...(existingJob.headerMetadata || {}),
              'PO VALUE': `${currencySymbol}${record.financials.grandTotal.toLocaleString()}`,
              'TARGET DATE': record.deliveryDate,
              'QUOTATION REF': record.quotationNo,
              'RFQ REF': record.rfqNumber || existingJob.headerMetadata?.['RFQ REF']
            }
          });
        }
      } catch (e) {
        console.warn('Could not sync quotation updates to Job Order:', e);
      }
    }

    return updated;
  },

  // Transition status
  async updateStatus(
    id: string, 
    status: QuotationStatus, 
    actor: string = 'Alex Wong (Operation Manager)'
  ): Promise<QuotationRecord> {
    const list = this.getStore();
    const quote = list.find(q => q.id === id || q.quotationNo === id);
    if (!quote) throw new Error('Quotation not found');

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    quote.status = status;
    quote.updatedAt = now;
    if (status === 'Approved') {
      quote.approvedBy = actor;
    }
    quote.history.unshift({
      id: `hist-${Date.now()}`,
      timestamp: now,
      actor,
      action: `Status Changed to ${status}`,
      details: `Quotation status updated to ${status} by ${actor}.`
    });

    this.saveStore(list);
    return quote;
  },

  // Convert an RFQ / Job State to a formal Quotation and auto-create the Job Order
  async createFromRfq(
    rfq: RfqRecord, 
    jobState?: JobRecord, 
    actor: string = 'Alex Wong (Operation Manager)'
  ): Promise<{ quotation: QuotationRecord; jobOrder: any }> {
    const list = this.getStore();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const today = new Date().toISOString().split('T')[0];

    // Compute validity date (default 30 days)
    const validDateObj = new Date();
    validDateObj.setDate(validDateObj.getDate() + 30);
    const validityDate = validDateObj.toISOString().split('T')[0];

    // Determine Quotation Number
    const existingQuoteNo = rfq.quotationNo;
    const quotationNo = existingQuoteNo || `QT-${Math.floor(1000 + Math.random() * 9000)}`;

    // Determine Job Order ID (format WO-XXXX)
    const existingJobNo = rfq.jobNo || jobState?.jobNumber;
    const jobOrderId = existingJobNo || `WO-${Math.floor(9800 + Math.random() * 199)}`;

    // Build line items from JobState tools or RFQ items
    let quotationItems: QuotationItem[] = [];
    let subtotal = 0;

    if (jobState && jobState.tools && jobState.tools.length > 0) {
      quotationItems = jobState.tools.map((t, idx) => {
        const itemPrice = t.customerBudget || 0;
        subtotal += itemPrice;
        return {
          id: `item-${idx + 1}-${Date.now()}`,
          toolNumber: t.toolNumber || `TOOL-${String(idx + 1).padStart(3, '0')}`,
          partName: t.partName || `Precision Tool Part ${idx + 1}`,
          description: t.description || `${t.partName} precision tooling for ${jobState.customer}`,
          specifications: `${t.toolingSizeLxbxh || 'Standard'} | M/C: ${t.machineTonnage || 'N/A'} | Type: ${t.typeOfTooling || 'Custom Die'}`,
          material: t.description?.includes('Material') ? t.description : 'SKD11 / MS Steel',
          quantity: 1,
          unitPrice: itemPrice,
          totalPrice: itemPrice,
          leadTimeDays: t.customLeadTimeDays || t.leadTimeWorkingDays || 14,
          departmentAllocations: (t.departmentAllocations || []).map(alloc => ({
            department: alloc.department,
            processCode: alloc.processCode,
            allocatedBudget: alloc.allocatedBudget,
            estimatedHours: alloc.estimatedHours
          }))
        };
      });
    } else if (rfq.items && rfq.items.length > 0) {
      quotationItems = rfq.items.map((item, idx) => {
        const itemPrice = Math.round((rfq.budget?.customerBudget || 10000) / rfq.items.length);
        subtotal += itemPrice;
        return {
          id: `item-${idx + 1}-${Date.now()}`,
          toolNumber: item.partNumber || `TOOL-${String(idx + 1).padStart(3, '0')}`,
          partName: item.partName || 'Tool Part',
          description: item.partDescription || `${item.partName} for ${rfq.customerName}`,
          specifications: `${item.material || 'Tool Steel'} | ${item.specialRequirements || 'Precision Grade'}`,
          material: item.material || 'MS / DC53',
          quantity: item.quantity || 1,
          unitPrice: itemPrice,
          totalPrice: itemPrice * (item.quantity || 1),
          leadTimeDays: 14
        };
      });
    } else {
      // Fallback single item
      const itemPrice = rfq.budget?.customerBudget || 25000;
      subtotal = itemPrice;
      quotationItems = [{
        id: `item-1-${Date.now()}`,
        toolNumber: 'TOOL-001',
        partName: rfq.projectName || 'Machining Package',
        description: `Precision tooling and machining services for ${rfq.customerName}`,
        specifications: 'High-tolerance CNC & Wire EDM manufacturing',
        material: 'MS / SKD11',
        quantity: 1,
        unitPrice: itemPrice,
        totalPrice: itemPrice,
        leadTimeDays: 14
      }];
    }

    const currency = jobState?.currency || rfq.budget?.currency || 'RM';
    const exchangeRate = jobState?.exchangeRate || rfq.budget?.exchangeRate || 1.0;

    const newQuotation: QuotationRecord = {
      id: quotationNo,
      quotationNo,
      rfqId: rfq.id,
      rfqNumber: rfq.rfqNumber,
      jobOrderId,
      customer: jobState?.customer || rfq.customerName || 'Customer',
      customerContact: {
        contactPerson: 'Purchasing & Engineering Dept',
        email: `procurement@${(jobState?.customer || rfq.customerName || 'client').toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        phone: '+60 3-8000 0000',
        companyAddress: 'Precision Manufacturing Facility, Industrial Hub, Malaysia'
      },
      projectName: jobState?.internalReference || rfq.projectName || `${rfq.rfqNumber} Project`,
      quotationDate: today,
      validityDate,
      deliveryDate: jobState?.requiredCompletionDate || jobState?.factoryEstimatedCompletion || rfq.requiredEndDate || validityDate,
      currency,
      exchangeRate,
      paymentTerms: '30 Days Net from Delivery',
      deliveryTerms: 'Ex-Works / FOB Factory',
      status: 'Draft',
      items: quotationItems,
      financials: {
        subtotal,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        grandTotal: subtotal
      },
      notes: rfq.notes || jobState?.notes || 'Quotation generated automatically from RFQ Feasibility analysis. All production stages verified against factory capacity.',
      termsAndConditions: [
        'Validity: This quotation is valid for 30 calendar days from the date of issue.',
        'Payment Terms: 30 days net from invoice date upon satisfactory delivery.',
        'Production Schedule: Production starts upon confirmed PO and tool design approval.',
        'Tolerance Standard: Machining tolerances per DIN ISO 2768-m unless otherwise specified in engineering drawings.'
      ],
      preparedBy: actor,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: `hist-${Date.now()}`,
          timestamp: now,
          actor,
          action: 'Quotation Generated from RFQ',
          details: `Quotation ${quotationNo} generated from ${rfq.rfqNumber}. Created linked Job Order ${jobOrderId}.`
        }
      ]
    };

    // Save quotation in store
    const existingIdx = list.findIndex(q => q.id === quotationNo);
    if (existingIdx >= 0) {
      list[existingIdx] = newQuotation;
    } else {
      list.unshift(newQuotation);
    }
    this.saveStore(list);

    // Build the Job Order to display in the Job Orders Page
    const currencySymbol = currency === 'USD' ? '$' : currency === 'RM' || currency === 'MYR' ? 'RM ' : currency;
    
    // Build sub-tools for the Job Order details page
    const subTools = quotationItems.map((item, idx) => ({
      id: `${jobOrderId}/${idx + 1}`,
      name: item.partName,
      specs: item.specifications,
      processPath: 'M1-C2-W1-G1',
      processes: {
        cnc: { actual: 0, estimated: 20, status: 'Pending', machine: 'VMC-01' },
        milling: { actual: 0, estimated: 15, status: 'Pending', machine: 'M-101' },
        heat: { actual: 0, estimated: 5, status: 'Pending', machine: 'HT-01' },
        grinding: { actual: 0, estimated: 10, status: 'Pending', machine: 'G-01' },
        wiring: { actual: 0, estimated: 25, status: 'Pending', machine: 'W-EDM-A' },
        edm: { actual: 0, estimated: 20, status: 'Pending', machine: 'SINK-X' },
        assembly: { actual: 0, estimated: 10, status: 'Pending', machine: 'BENCH-01' }
      }
    }));

    const newJobOrder = {
      id: jobOrderId,
      customer: newQuotation.customer,
      name: newQuotation.projectName,
      priority: rfq.priority || 'Medium',
      progress: 0,
      items: `0/${quotationItems.length}`,
      dueDate: newQuotation.deliveryDate,
      status: 'Pending',
      activeJob: subTools[0]?.id || 'None',
      tools: subTools,
      headerMetadata: {
        'DRAWING NO': `DWG-${(rfq.rfqNumber || quotationNo).replace(/[^0-9]/g, '').slice(-4) || '1001'}`,
        'REV': 'A',
        'MATERIAL': quotationItems[0]?.material || 'MS / DC53',
        'TARGET DATE': newQuotation.deliveryDate,
        'PO VALUE': `${currencySymbol}${subtotal.toLocaleString()}`,
        'RFQ REF': rfq.rfqNumber,
        'QUOTATION REF': quotationNo
      },
      purchases: [
        {
          id: `MAT-${jobOrderId.replace(/[^0-9]/g, '') || '901'}`,
          name: `${quotationItems[0]?.material || 'Tool Steel'} Raw Billet`,
          specs: quotationItems[0]?.specifications || '450 x 350 x 280 mm',
          suggested: 'Global Metals Co.',
          final: 'Global Metals Co.',
          status: 'Pending Approval',
          date: today
        }
      ]
    };

    // Save to local DB service for Job Orders
    dbService.addJobOrder(newJobOrder);

    // Also link quotationNo and jobNo back to RFQ
    rfq.quotationNo = quotationNo;
    rfq.jobNo = jobOrderId;
    rfq.status = 'ACCEPTED';
    rfq.updatedAt = now;
    rfq.auditHistory.unshift({
      id: `log-${Date.now()}-converted`,
      timestamp: now,
      actor,
      action: 'Converted to Quotation & Job Order',
      details: `Generated Quotation ${quotationNo} and Job Order ${jobOrderId} from RFQ.`
    });

    const rfqs = RfqService.getStore();
    const rfqIdx = rfqs.findIndex(r => r.id === rfq.id);
    if (rfqIdx >= 0) {
      rfqs[rfqIdx] = rfq;
      RfqService.saveStore(rfqs);
    }

    return { quotation: newQuotation, jobOrder: newJobOrder };
  },

  async delete(id: string): Promise<void> {
    const list = this.getStore();
    const filtered = list.filter(q => q.id !== id && q.quotationNo !== id);
    this.saveStore(filtered);
  }
};
