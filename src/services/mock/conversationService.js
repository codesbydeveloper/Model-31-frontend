import { delay } from '../../utils/delay'
import { AI_REPLY_POOL, buildInitialConversations } from '../../data/conversations'
import { initialLeads } from '../../data/leads'

let conversations = buildInitialConversations(initialLeads)

function nowStamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function ensureConversation(leadId) {
  if (!conversations[leadId]) {
    conversations[leadId] = []
  }
  return conversations[leadId]
}

export async function getConversation(leadId) {
  await delay(280)
  return structuredClone(ensureConversation(leadId))
}

export async function sendMessage(leadId, text, sender = 'agent') {
  await delay(350)
  const list = ensureConversation(leadId)
  const message = {
    id: `msg_${leadId}_${Date.now()}`,
    sender,
    text,
    timestamp: nowStamp(),
  }
  list.push(message)
  return structuredClone(message)
}

export async function sendAiReply(leadId, prompt = '') {
  await delay(900)
  const list = ensureConversation(leadId)
  const lower = prompt.toLowerCase()
  let text = AI_REPLY_POOL[Math.floor(Math.random() * AI_REPLY_POOL.length)]

  if (lower.includes('black')) {
    text = 'Yes, we currently have several black SUV options available.'
  } else if (lower.includes('price') || lower.includes('budget')) {
    text = 'I can refine options around your budget. Would you like lease or finance estimates?'
  } else if (lower.includes('appointment') || lower.includes('visit')) {
    text = 'I can help schedule a visit this weekend. What time works best for you?'
  }

  const message = {
    id: `msg_${leadId}_ai_${Date.now()}`,
    sender: 'ai',
    text,
    timestamp: nowStamp(),
  }
  list.push(message)
  return structuredClone(message)
}

export async function pauseAI() {
  await delay(300)
  return { aiPaused: true }
}

export async function resumeAI() {
  await delay(300)
  return { aiPaused: false }
}

const conversationService = {
  getConversation,
  sendMessage,
  sendAiReply,
  pauseAI,
  resumeAI,
}

export default conversationService
