import { type ElementType } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ElementType;
  subtitle?: string;
  delay?: number;
}

export function StatsCard({ title, value, icon: Icon, subtitle, delay = 0 }: StatsCardProps) {
  return (
    <div
      className="stat-card bg-white rounded-xl border border-forest-border p-6 shadow-card hover:shadow-card-hover transition-shadow duration-300 opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-forest-muted uppercase tracking-widest mb-2">{title}</p>
          <p className="text-2xl font-bold text-forest-dark font-display leading-none">{value}</p>
          {subtitle && <p className="text-xs text-forest-muted mt-2 leading-relaxed">{subtitle}</p>}
        </div>
        <div className="flex-shrink-0 ml-3 w-10 h-10 rounded-lg bg-forest-50 flex items-center justify-center border border-forest-100">
          <Icon className="text-forest-600" size={18} />
        </div>
      </div>
      <div className="mt-4 h-0.5 bg-gradient-to-r from-gold to-transparent rounded-full" />
    </div>
  );
}
