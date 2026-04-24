import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  dueDate: string;
  daysOverdue: number;
  dunningStep: string;
  lastAction: string;
  lastActionDate: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  invoices = signal<Invoice[]>([]);
  activeTab = signal<'all' | 'pre_due' | 'active' | 'collections'>('all');
  loading = signal(true);

  totalOutstanding = signal(0);
  overdueCount = signal(0);
  recoveredThisWeek = signal(0);
  avgDaysOverdue = signal(0);
  activeSequences = signal(0);

  ngOnInit(): void {
    const now = new Date();
    const mockInvoices: Invoice[] = [
      { id: '1', invoiceNumber: 'INV-2024-001', customerName: 'TechCorp Solutions', customerEmail: 'ap@techcorp.com', amount: 4250.00, currency: 'USD', dueDate: new Date(now.getTime() + 2 * 86400000).toISOString(), daysOverdue: -2, dunningStep: 'pre_due', lastAction: 'Pre-due reminder scheduled', lastActionDate: new Date(now.getTime() - 3600000).toISOString() },
      { id: '2', invoiceNumber: 'INV-2024-015', customerName: 'Acme Office Supplies', customerEmail: 'billing@acme.com', amount: 1372.25, currency: 'USD', dueDate: new Date(now.getTime() - 86400000).toISOString(), daysOverdue: 1, dunningStep: 'day_1', lastAction: 'Past-due email sent', lastActionDate: new Date(now.getTime() - 7200000).toISOString() },
      { id: '3', invoiceNumber: 'INV-2024-022', customerName: 'Global Printing Co', customerEmail: 'finance@globalprint.com', amount: 890.50, currency: 'USD', dueDate: new Date(now.getTime() - 3 * 86400000).toISOString(), daysOverdue: 3, dunningStep: 'day_3', lastAction: 'Email + SMS sent', lastActionDate: new Date(now.getTime() - 14400000).toISOString() },
      { id: '4', invoiceNumber: 'INV-2024-031', customerName: 'Nexus Technologies', customerEmail: 'accounts@nexus.io', amount: 12890.00, currency: 'USD', dueDate: new Date(now.getTime() - 7 * 86400000).toISOString(), daysOverdue: 7, dunningStep: 'day_7', lastAction: 'Final notice email + SMS', lastActionDate: new Date(now.getTime() - 28800000).toISOString() },
      { id: '5', invoiceNumber: 'INV-2024-038', customerName: 'Summit Analytics', customerEmail: 'pay@summit.dev', amount: 2150.00, currency: 'USD', dueDate: new Date(now.getTime() - 14 * 86400000).toISOString(), daysOverdue: 14, dunningStep: 'day_14', lastAction: 'Account manager notified', lastActionDate: new Date(now.getTime() - 86400000).toISOString() },
      { id: '6', invoiceNumber: 'INV-2024-005', customerName: 'BlueBind Logistics', customerEmail: 'invoices@bluebind.com', amount: 3450.00, currency: 'USD', dueDate: new Date(now.getTime() - 35 * 86400000).toISOString(), daysOverdue: 35, dunningStep: 'day_30', lastAction: 'Collections flag raised', lastActionDate: new Date(now.getTime() - 5 * 86400000).toISOString() },
      { id: '7', invoiceNumber: 'INV-2024-042', customerName: 'Pinnacle Hardware', customerEmail: 'ap@pinnacle.co', amount: 678.40, currency: 'USD', dueDate: new Date(now.getTime() - 2 * 86400000).toISOString(), daysOverdue: 2, dunningStep: 'day_3', lastAction: 'Email + SMS sent', lastActionDate: new Date(now.getTime() - 43200000).toISOString() },
      { id: '8', invoiceNumber: 'INV-2024-048', customerName: 'Metro Services', customerEmail: 'billing@metro.com', amount: 5100.00, currency: 'USD', dueDate: new Date(now.getTime() - 10 * 86400000).toISOString(), daysOverdue: 10, dunningStep: 'day_7', lastAction: 'Final notice sent', lastActionDate: new Date(now.getTime() - 3 * 86400000).toISOString() },
    ];

    this.invoices.set(mockInvoices);
    this.totalOutstanding.set(mockInvoices.reduce((s, i) => s + i.amount, 0));
    this.overdueCount.set(mockInvoices.filter(i => i.daysOverdue > 0).length);
    this.recoveredThisWeek.set(3);
    this.avgDaysOverdue.set(Math.round(mockInvoices.filter(i => i.daysOverdue > 0).reduce((s, i) => s + i.daysOverdue, 0) / mockInvoices.filter(i => i.daysOverdue > 0).length));
    this.activeSequences.set(mockInvoices.filter(i => i.daysOverdue > 0).length);
    this.loading.set(false);
  }

  filteredInvoices(): Invoice[] {
    const tab = this.activeTab();
    if (tab === 'all') return this.invoices();
    if (tab === 'pre_due') return this.invoices().filter(i => i.dunningStep === 'pre_due');
    if (tab === 'active') return this.invoices().filter(i => ['day_1', 'day_3', 'day_7', 'day_14'].includes(i.dunningStep));
    return this.invoices().filter(i => i.dunningStep === 'day_30');
  }

  setTab(tab: 'all' | 'pre_due' | 'active' | 'collections'): void {
    this.activeTab.set(tab);
  }

  getStepBadge(step: string): string {
    switch (step) {
      case 'pre_due': return 'bg-blue-500/20 text-blue-400';
      case 'day_1': return 'bg-amber-500/20 text-amber-400';
      case 'day_3': return 'bg-orange-500/20 text-orange-400';
      case 'day_7': return 'bg-red-500/20 text-red-400';
      case 'day_14': return 'bg-red-600/20 text-red-300';
      case 'day_30': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  getStepLabel(step: string): string {
    switch (step) {
      case 'pre_due': return 'Pre-Due';
      case 'day_1': return 'Day 1 — Email';
      case 'day_3': return 'Day 3 — Email + SMS';
      case 'day_7': return 'Day 7 — Final Notice';
      case 'day_14': return 'Day 14 — Manager';
      case 'day_30': return 'Day 30 — Collections';
      default: return step;
    }
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  formatTimeAgo(timestamp: string): string {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
