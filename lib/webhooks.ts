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
    // Note: Configure these URLs in your Settings page or update them here with your n8n webhook URLs
    const defaultWebhooks: WebhookConfig[] = [
      {
        id: '1',
        name: 'On-Demand Research Handler',
        url: 'https://your-n8n-instance.app.n8n.cloud/webhook/on-demand',
        type: 'on-demand',
        description: 'Handles immediate market research requests',
        active: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Recurring Research Handler',
        url: 'https://your-n8n-instance.app.n8n.cloud/webhook/recurring',
        type: 'recurring',
        description: 'Handles scheduled recurring research requests',
        active: false,
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

