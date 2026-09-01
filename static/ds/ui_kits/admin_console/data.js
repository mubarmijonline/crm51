window.KIT = {
  user: { name: 'Ahmed Diab', email: 'ahmed@acme.com', role: 'Owner' },
  org: 'Acme Inc',
  kpis: [
    { label: 'MRR', value: '$48,210', delta: '+6.2%', icon: 'dollar-sign', caption: 'vs. previous 30 days', series: [22,25,24,28,27,31,30,34,36,35,39,42] },
    { label: 'Active customers', value: '248', delta: '+12', icon: 'users', caption: '12 added this month', series: [180,190,196,205,210,214,220,228,231,238,242,248] },
    { label: 'Failed payments', value: '9', delta: '+3', deltaTone: 'danger', icon: 'credit-card', caption: 'Needs attention', series: [2,3,2,4,5,4,6,5,7,6,8,9] },
    { label: 'Net churn', value: '1.8%', delta: '-0.4%', deltaTone: 'success', icon: 'user-minus', caption: 'Rolling 90 days', series: [3.1,2.9,2.8,2.6,2.5,2.4,2.2,2.1,2.0,1.9,1.9,1.8] },
  ],
  customers: [
    { id: 'cus_4Kd91', name: 'Acme Inc', contact: 'billing@acme.com', plan: 'Enterprise', seats: 120, mrr: '$4,200', status: 'Active', tone: 'success', created: '12 Mar 2024', owner: 'Ahmed Diab' },
    { id: 'cus_7Pq22', name: 'Northwind Traders', contact: 'ap@northwind.co', plan: 'Growth', seats: 34, mrr: '$980', status: 'Past due', tone: 'warning', created: '02 Jun 2024', owner: 'Sara Nour' },
    { id: 'cus_9Zt04', name: 'Globex Corporation', contact: 'finance@globex.com', plan: 'Growth', seats: 28, mrr: '$860', status: 'Active', tone: 'success', created: '19 Jan 2025', owner: 'Sara Nour' },
    { id: 'cus_2Lm77', name: 'Initech', contact: 'ops@initech.io', plan: 'Free', seats: 4, mrr: '$0', status: 'Churned', tone: 'neutral', created: '28 Feb 2025', owner: 'Omar Fathy' },
    { id: 'cus_5Rb18', name: 'Umbrella Health', contact: 'billing@umbrella.health', plan: 'Enterprise', seats: 210, mrr: '$6,400', status: 'Active', tone: 'success', created: '05 Sep 2024', owner: 'Ahmed Diab' },
    { id: 'cus_8Wq31', name: 'Soylent Foods', contact: 'accounts@soylent.co', plan: 'Growth', seats: 41, mrr: '$1,120', status: 'Trialing', tone: 'info', created: '30 Jul 2026', owner: 'Omar Fathy' },
    { id: 'cus_1Xy59', name: 'Stark Industries', contact: 'ap@stark.com', plan: 'Enterprise', seats: 320, mrr: '$9,800', status: 'Active', tone: 'success', created: '14 Nov 2023', owner: 'Ahmed Diab' },
    { id: 'cus_3Vn66', name: 'Wayne Logistics', contact: 'billing@wayne.co', plan: 'Growth', seats: 22, mrr: '$740', status: 'Past due', tone: 'warning', created: '08 Apr 2025', owner: 'Sara Nour' },
  ],
  activity: [
    { icon: 'credit-card', text: 'Payment of $4,200 received from Acme Inc', time: '12 min ago' },
    { icon: 'user-plus', text: 'Soylent Foods started a 14-day trial', time: '1 hr ago' },
    { icon: 'triangle-alert', text: 'Card declined for Northwind Traders', time: '3 hrs ago' },
    { icon: 'file-text', text: 'Invoice INV-2043 sent to Globex Corporation', time: 'Yesterday' },
    { icon: 'user-cog', text: 'Sara Nour changed the plan for Wayne Logistics', time: 'Yesterday' },
  ],
  invoices: [
    { id: 'INV-2043', customer: 'Globex Corporation', amount: '$860.00', due: '14 Aug 2026', status: 'Open', tone: 'info' },
    { id: 'INV-2042', customer: 'Northwind Traders', amount: '$980.00', due: '02 Aug 2026', status: 'Past due', tone: 'danger' },
    { id: 'INV-2041', customer: 'Acme Inc', amount: '$4,200.00', due: '01 Aug 2026', status: 'Paid', tone: 'success' },
    { id: 'INV-2040', customer: 'Stark Industries', amount: '$9,800.00', due: '28 Jul 2026', status: 'Paid', tone: 'success' },
  ],
  team: [
    { name: 'Ahmed Diab', email: 'ahmed@acme.com', role: 'Owner', status: 'Active' },
    { name: 'Sara Nour', email: 'sara@acme.com', role: 'Admin', status: 'Active' },
    { name: 'Omar Fathy', email: 'omar@acme.com', role: 'Support', status: 'Active' },
    { name: 'Layla Hassan', email: 'layla@acme.com', role: 'Billing', status: 'Invited' },
  ],
};
