export const referralStats = {
  referralRequests: 142,
  referralLeads: 96,
  qualifiedReferrals: 54,
  appointments: 28,
  soldReferrals: 11,
}

export const REFERRAL_STATUSES = [
  'REQUESTED',
  'RECEIVED',
  'QUALIFYING',
  'QUALIFIED',
  'APPOINTMENT',
  'SOLD',
  'NOT CONVERTED',
]

const REFERRERS = [
  'Sarah Johnson',
  'Robert Hayes',
  'Chloe Bennett',
  'Brian Foster',
  'Priya Patel',
  'Marcus Lee',
  'Elena Vargas',
  'Emily Chen',
  'Natalie Gomez',
  'Hannah Kim',
  'Tony Ricci',
  'Sofia Morales',
  'Lucas Rivera',
  'Olivia Brooks',
  'Noah Patel',
]

const REFERRED = [
  'Daniel Park',
  'Rachel Adams',
  'Chris Nguyen',
  'Megan Scott',
  'Kevin Ortiz',
  'Laura Benson',
  'Peter Shaw',
  'Nina Alvarez',
  'George Kim',
  'Holly Grant',
  'Ian Brooks',
  'Julia West',
  'Kyle Morgan',
  'Lisa Tran',
  'Matt Cooper',
]

export const initialReferrals = REFERRERS.map((referrer, i) => ({
  id: `ref_${String(i + 1).padStart(3, '0')}`,
  referrer,
  referredPerson: REFERRED[i],
  source: ['Customer Conversation', 'Post-Sale Follow-Up', 'DM', 'Email'][i % 4],
  date: `Aug ${3 + (i % 12)}, 2026`,
  status: REFERRAL_STATUSES[i % REFERRAL_STATUSES.length],
  lead: i % 3 === 0 ? `LEAD-${2100 + i}` : '—',
  appointment: ['APPOINTMENT', 'SOLD'].includes(REFERRAL_STATUSES[i % REFERRAL_STATUSES.length])
    ? `apt_ref_${i + 1}`
    : '—',
  sale: REFERRAL_STATUSES[i % REFERRAL_STATUSES.length] === 'SOLD' ? 'Yes' : '—',
  message: 'Do you know someone who may be looking for a vehicle?',
  dealership: 'Miami Luxury Motors',
}))

export const eligibleReferralCustomers = [
  { id: 'el_01', customerName: 'Sarah Johnson', status: 'Eligible' },
  { id: 'el_02', customerName: 'Robert Hayes', status: 'Eligible' },
  { id: 'el_03', customerName: 'Chloe Bennett', status: 'Eligible' },
  { id: 'el_04', customerName: 'Brian Foster', status: 'Eligible' },
  { id: 'el_05', customerName: 'Priya Patel', status: 'Eligible' },
]
