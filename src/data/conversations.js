const sarahConversation = [
  {
    id: 'msg_2048_1',
    sender: 'customer',
    text: "Hi, I'm looking for a three-row SUV.",
    timestamp: '10:32 AM',
  },
  {
    id: 'msg_2048_2',
    sender: 'ai',
    text: "Absolutely. I'd be happy to help. Do you have a monthly budget in mind?",
    timestamp: '10:32 AM',
  },
  {
    id: 'msg_2048_3',
    sender: 'customer',
    text: "I'd like to stay around $600 per month.",
    timestamp: '10:33 AM',
  },
  {
    id: 'msg_2048_4',
    sender: 'ai',
    text: 'That gives us several options. Are you looking to lease or finance?',
    timestamp: '10:33 AM',
  },
  {
    id: 'msg_2048_5',
    sender: 'customer',
    text: 'Probably lease.',
    timestamp: '10:34 AM',
  },
  {
    id: 'msg_2048_6',
    sender: 'ai',
    text: 'Great. And when are you hoping to purchase?',
    timestamp: '10:34 AM',
  },
  {
    id: 'msg_2048_7',
    sender: 'customer',
    text: 'This weekend.',
    timestamp: '10:35 AM',
  },
  {
    id: 'msg_2048_8',
    sender: 'ai',
    text: 'Thanks. I can help find matching inventory and connect you with a salesperson.',
    timestamp: '10:35 AM',
  },
]

function genericConversation(leadId, vehicle) {
  return [
    {
      id: `msg_${leadId}_1`,
      sender: 'customer',
      text: `Hi, I'm interested in the ${vehicle}.`,
      timestamp: '9:15 AM',
    },
    {
      id: `msg_${leadId}_2`,
      sender: 'ai',
      text: "Welcome to Model 31. I'd be glad to help. What's your preferred monthly budget?",
      timestamp: '9:15 AM',
    },
    {
      id: `msg_${leadId}_3`,
      sender: 'customer',
      text: 'Something flexible, depending on options.',
      timestamp: '9:16 AM',
    },
    {
      id: `msg_${leadId}_4`,
      sender: 'ai',
      text: 'Understood. Are you planning to lease or finance, and when would you like to visit?',
      timestamp: '9:16 AM',
    },
  ]
}

const AI_REPLY_POOL = [
  'Yes, we currently have several matching options available.',
  'I can check inventory for that preference right away.',
  'Great question — would you like me to connect you with a salesperson?',
  'We have a few vehicles that fit that request. Should I share top matches?',
  'Understood. I can update your preferences and continue qualification.',
  'Yes, we currently have several black SUV options available.',
]

export { AI_REPLY_POOL }

export function buildInitialConversations(leads) {
  const map = {}
  leads.forEach((lead) => {
    map[lead.id] =
      lead.id === 'LEAD-2048'
        ? structuredClone(sarahConversation)
        : genericConversation(lead.id, lead.vehicle)
  })
  return map
}
