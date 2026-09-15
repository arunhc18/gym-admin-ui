import { Injectable } from '@angular/core';

export type VisitorStatus = 'Checked in' | 'Checked out';

export interface Visitor {
  visitorId: number;
  name: string;
  phone: string;
  purpose: string;
  host: string;
  visitDate: string;
  checkInTime: string;
  checkOutTime: string;
  status: VisitorStatus;
}

export type CreateVisitor = Omit<Visitor, 'visitorId' | 'status'> &
  Partial<Pick<Visitor, 'status'>>;

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private visitors: Visitor[] = this.createVisitors();

  getVisitors(): Visitor[] {
    return this.visitors.map(visitor => ({ ...visitor }));
  }

  createVisitor(visitor: CreateVisitor): Visitor {
    const created: Visitor = {
      ...visitor,
      visitorId: this.visitors.length
        ? Math.max(...this.visitors.map(item => item.visitorId)) + 1
        : 1,
      status: visitor.status ?? 'Checked in'
    };

    this.visitors.unshift(created);
    return { ...created };
  }

  checkOutVisitor(id: number): Visitor | undefined {
    const visitor = this.visitors.find(item => item.visitorId === id);
    if (!visitor || visitor.status === 'Checked out') {
      return visitor ? { ...visitor } : undefined;
    }

    visitor.status = 'Checked out';
    visitor.checkOutTime = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());

    return { ...visitor };
  }

  private createVisitors(): Visitor[] {
    const names = ['Aarav Mehta', 'Diya Shah', 'Kabir Rao', 'Meera Nair', 'Rohan Das', 'Isha Kapoor'];
    const purposes = ['Guest pass', 'Member meeting', 'Vendor visit', 'Trial session'];
    const hosts = ['Front desk', 'Priya Menon', 'Arjun Singh', 'Fitness team'];

    return Array.from({ length: 24 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (index % 14));
      const visitDate = date.toISOString().slice(0, 10);
      const checkedIn = index % 3 !== 0;

      return {
        visitorId: index + 1,
        name: names[index % names.length],
        phone: `98${String(76543210 + index).slice(-8)}`,
        purpose: purposes[index % purposes.length],
        host: hosts[index % hosts.length],
        visitDate,
        checkInTime: `${String(8 + (index % 9)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`,
        checkOutTime: checkedIn ? '' : `${String(10 + (index % 7)).padStart(2, '0')}:45`,
        status: checkedIn ? 'Checked in' : 'Checked out'
      };
    });
  }
}
