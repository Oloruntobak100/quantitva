// Webhook management utilities

export type WebhookType = 'on-demand' | 'recurring'

export interface WebhookConfig {
  id: string
  name: string
  url: string
  type: WebhookType
  description?: string
  active: boolean
  createdAt: string
}

const WEBHOOKS_KEY = 'market_intel_webhooks'

export const getWebhooks = (): WebhookConfig[] => {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(WEBHOOKS_KEY)
  if (!stored) {
    // Default webhooks - one for each type
    // Active by default so all users (including non-admins) can use core features
    // Admins can configure URLs in Settings page
    const defaultWebhooks: WebhookConfig[] = [
      {
        id: '1',
        name: 'On-Demand Research Handler',
        url: 'https://your-n8n-instance.app.n8n.cloud/webhook/on-demand',
        type: 'on-demand',
        description: 'Handles immediate market research requests',
        active: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Recurring Research Handler',
        url: 'https://your-n8n-instance.app.n8n.cloud/webhook/recurring',
        type: 'recurring',
        description: 'Handles scheduled recurring research requests',
        active: true,
        createdAt: new Date().toISOString(),
      },
    ]
    saveWebhooks(defaultWebhooks)
    return defaultWebhooks
  }
  
  return JSON.parse(stored)
}

export const saveWebhooks = (webhooks: WebhookConfig[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks))
}

export const getActiveWebhooks = (): WebhookConfig[] => {
  return getWebhooks().filter(w => w.active)
}

export const getActiveWebhooksByType = (type: WebhookType): WebhookConfig[] => {
  return getWebhooks().filter(w => w.active && w.type === type)
}

export const getWebhooksByType = (type: WebhookType): WebhookConfig[] => {
  return getWebhooks().filter(w => w.type === type)
}

