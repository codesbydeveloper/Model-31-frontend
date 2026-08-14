import { initialLeads } from './leads'

export const customers = initialLeads.map((lead) => ({
  id: `cust_${lead.id}`,
  leadId: lead.id,
  name: lead.customerName,
  phone: lead.phone,
  email: lead.email,
  city: lead.city,
  state: lead.state,
  language: lead.language,
  source: lead.source,
}))
