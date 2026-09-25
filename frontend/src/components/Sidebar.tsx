"use client";

import React, { useState } from 'react';
import { 
  FileText, 
  FileCheck,
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  Cpu,
  Wrench,
  ShoppingBag,
  Truck,
  Users,
  UserCheck,
  Building2,
  Layers,
  Clock,
  History,
  BarChart3,
  Shield,
  ShieldCheck,
  CheckCircle2,
  User,
  LogIn,
  PenTool,
  Calendar,
  Gauge,
  Activity,
  Zap,
  Briefcase
} from 'lucide-react';
import { useUI } from '@/context/UIContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isSubItem?: boolean;
}

interface NavGroup {
  sectionTitle: string;
  roleIcon: React.ElementType;
  roleBadge?: string;
  roleBadgeColor?: string;
  defaultExpanded?: boolean;
  items: NavItem[];
}

export default function Sidebar() {
  const { isSidebarCollapsed: isCollapsed, toggleSidebar } = useUI();
  const pathname = usePathname();

  // Navigation sections categorized by roles for manufacturing workflow
  const navGroups: NavGroup[] = [
    {
      sectionTitle: "DASHBOARDS",
      roleIcon: LayoutDashboard,
      defaultExpanded: true,
      items: [
        { label: "Production Dashboard", href: "/dashboard", icon: Activity },
        { label: "Operation Manager Dashboard", href: "/operation-manager", icon: Briefcase },
        { label: "Designer Dashboard", href: "/designer", icon: PenTool },
        { label: "HR Dashboard", href: "/user-management/dashboard", icon: UserCheck },
      ]
    },
    {
      sectionTitle: "OPERATION MANAGER",
      roleIcon: Briefcase,
      roleBadge: "OM",
      roleBadgeColor: "var(--accent-red)",
      defaultExpanded: true,
      items: [
        { label: "Operation Control", href: "/operation-manager", icon: LayoutDashboard },
        { label: "RFQs List", href: "/rfqs", icon: FileText },
        { label: "Quotations", href: "/quotations", icon: FileCheck },
        { label: "Job Orders", href: "/job-orders", icon: ClipboardList },
        { label: "Machine Overview", href: "/machines", icon: Cpu },
        { label: "Production Reports", href: "/reports", icon: BarChart3 },
      ]
    },
    {
      sectionTitle: "DESIGNER",
      roleIcon: PenTool,
      roleBadge: "CAD",
      roleBadgeColor: "#8B5CF6",
      defaultExpanded: true,
      items: [
        { label: "Designer Dashboard", href: "/designer", icon: PenTool },
        { label: "Jobs", href: "/designer/jobs", icon: ClipboardList },
        { label: "Revisions", href: "/designer/revisions", icon: History },
      ]
    },
    {
      sectionTitle: "PURCHASER",
      roleIcon: ShoppingBag,
      roleBadge: "PO",
      roleBadgeColor: "#0284C7",
      defaultExpanded: true,
      items: [
        { label: "Purchases & Procurement", href: "/purchases", icon: ShoppingBag },
        { label: "BOM Import Manager", href: "/purchases", icon: Truck },
      ]
    },
    {
      sectionTitle: "PLANNER",
      roleIcon: Calendar,
      roleBadge: "PLAN",
      roleBadgeColor: "#D97706",
      defaultExpanded: true,
      items: [
        { label: "Production Schedule", href: "/job-orders", icon: Calendar },
        { label: "Capacity & Machines", href: "/machines", icon: Gauge },
        { label: "Feasibility & Lead Times", href: "/rfqs", icon: Clock },
      ]
    },
    {
      sectionTitle: "OPERATORS",
      roleIcon: Cpu,
      roleBadge: "M/C",
      roleBadgeColor: "#059669",
      defaultExpanded: true,
      items: [
        { label: "Milling Operator", href: "/operators/milling", icon: Wrench, isSubItem: true },
        { label: "CNC Operator", href: "/operators/cnc", icon: Cpu, isSubItem: true },
        { label: "Grinding Operator", href: "/operators/grinding", icon: Zap, isSubItem: true },
        { label: "Wire Cut Operator", href: "/operators/wire-cut", icon: Activity, isSubItem: true },
        { label: "Assembly Operator", href: "/operators/assembly", icon: Layers, isSubItem: true },
      ]
    },
    {
      sectionTitle: "QC (QUALITY CONTROL)",
      roleIcon: ShieldCheck,
      roleBadge: "QC",
      roleBadgeColor: "#16A34A",
      defaultExpanded: true,
      items: [
        { label: "Quality Inspection Queue", href: "/job-orders", icon: CheckCircle2 },
        { label: "CMM & Tool Verification", href: "/tools", icon: ShieldCheck },
        { label: "Quality Audit Logs", href: "/audit-logs", icon: Shield },
      ]
    },
    {
      sectionTitle: "USER MANAGEMENT & HR",
      roleIcon: UserCheck,
      defaultExpanded: false,
      items: [
        { label: "HR Dashboard", href: "/user-management/dashboard", icon: UserCheck },
        { label: "Employees", href: "/user-management/employees", icon: Users },
        { label: "Departments", href: "/user-management/departments", icon: Building2 },
        { label: "Activity Log", href: "/user-management/activity-log", icon: History },
      ]
    },
    {
      sectionTitle: "ACCOUNT",
      roleIcon: User,
      defaultExpanded: false,
      items: [
        { label: "My Profile", href: "/profile", icon: User },
        { label: "Login", href: "/login", icon: LogIn },
      ]
    }
  ];

  // State to track collapsed/expanded role sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Helper to check active state
  const isItemActive = (href: string) => {
    if (href === '/rfqs' && pathname === '/rfqs') return true;
    if (href === '/quotations' && pathname.startsWith('/quotations')) return true;
    if (href.startsWith('/operators/') && pathname === href) return true;
    if (href === '/designer' && pathname === '/designer') return true;
    if (href !== '/rfqs' && !href.startsWith('/operators/') && pathname === href) return true;
    return false;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-toggle" 
        onClick={toggleSidebar}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="sidebar-logo">
        <div style={{ color: 'var(--accent-red)', fontSize: '24px' }}>⬢</div> 
        {!isCollapsed && <span style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>Synco</span>}
      </div>
      
      <nav className="nav-menu" style={{ overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px' }}>
        {navGroups.map((group, groupIdx) => {
          const isGroupCollapsed = collapsedSections[group.sectionTitle] ?? false;
          const RoleIcon = group.roleIcon;

          return (
            <div key={groupIdx} style={{ marginBottom: '14px' }}>
              {!isCollapsed && (
                <div 
                  onClick={() => toggleSection(group.sectionTitle)}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10px', 
                    fontWeight: 800, 
                    color: 'var(--text-tertiary)', 
                    letterSpacing: '0.8px', 
                    padding: '6px 12px',
                    marginTop: groupIdx > 0 ? '6px' : '0',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderRadius: '6px',
                    transition: 'background-color 0.15s'
                  }}
                  className="role-header-hover"
                  title="Click to toggle category"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RoleIcon size={12} style={{ opacity: 0.8 }} />
                    <span>{group.sectionTitle}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {group.roleBadge && (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: `${group.roleBadgeColor || 'var(--accent-red)'}18`,
                        color: group.roleBadgeColor || 'var(--accent-red)'
                      }}>
                        {group.roleBadge}
                      </span>
                    )}
                    {isGroupCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  </div>
                </div>
              )}

              {/* Items in Role Group */}
              {(!isGroupCollapsed || isCollapsed) && (
                <div style={{ marginTop: '2px' }}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);

                    return (
                      <Link 
                        key={item.label + item.href}
                        href={item.href} 
                        className={`nav-item ${active ? 'active' : ''}`} 
                        title={item.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: isCollapsed ? '12px' : item.isSubItem ? '7px 12px 7px 22px' : '8px 12px',
                          borderRadius: '8px',
                          marginBottom: '2px',
                          fontSize: item.isSubItem ? '12.5px' : '13px',
                          fontWeight: active ? 700 : 500,
                          textDecoration: 'none',
                          transition: 'all 0.15s ease',
                          color: active ? 'var(--accent-red)' : item.isSubItem ? 'var(--text-secondary)' : 'var(--text-primary)'
                        }}
                      >
                        <Icon size={item.isSubItem ? 15 : 17} style={{ flexShrink: 0, opacity: active ? 1 : 0.85 }} /> 
                        {!isCollapsed && (
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.isSubItem ? `› ${item.label}` : item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
