import React from 'react';
import { Card } from '../ui/Card';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface Purchase {
  id: string;
  vendor: string;
  item: string;
  amount: string;
  date: string;
  status: string;
}

interface RecentPurchasesCardProps {
  purchases: Purchase[];
}

export const RecentPurchasesCard: React.FC<RecentPurchasesCardProps> = ({ purchases }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'var(--success-green)';
      case 'approved': return '#1976D2';
      case 'processing': return 'var(--warning-orange)';
      case 'ordered': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <Card title="Recent Purchases" subtitle="Inventory & Supplies" extra={<ShoppingCart size={16} color="var(--text-tertiary)" />}>
      <div className="compact-list">
        {purchases.slice(0, 8).map(purchase => (
          <div key={purchase.id} className="compact-item" style={{ padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{purchase.id}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>• {purchase.date}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{purchase.vendor}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{purchase.item}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{purchase.amount}</span>
                <span style={{ 
                  fontSize: '10px', 
                  fontWeight: 700, 
                  color: getStatusColor(purchase.status),
                  backgroundColor: `${getStatusColor(purchase.status)}15`,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {purchase.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ 
        marginTop: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '8px',
        color: 'var(--text-tertiary)',
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer'
      }}>
        View Purchase History <ExternalLink size={12} />
      </div>
    </Card>
  );
};
