'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { FileSearch, Calendar, Zap, Loader2, Repeat } from 'lucide-react'
import { getActiveWebhooksByType } from '@/lib/webhooks'
import { toast } from 'sonner'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { createScheduleFromForm, saveSchedule } from '@/lib/schedules'
import { supabase } from '@/lib/supabase/client'

const marketCategories = [
  'Technology & Software',
  'Healthcare & Pharmaceuticals',
  'Financial Services',
  'E-commerce & Retail',
  'Manufacturing & Industrial',
  'Food & Beverage',
  'Real Estate',
  'Education & E-learning',
  'Entertainment & Media',
  'Automotive',
  'Energy & Utilities',
  'Telecommunications',
]

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
]

// Geographic locations for searchable dropdown
const geographicLocations: ComboboxOption[] = [
  // Global & Multi-region
  { value: 'global', label: 'Global' },
  { value: 'worldwide', label: 'Worldwide' },
  { value: 'international', label: 'International' },
  
  // Continents & Regions
  { value: 'north-america', label: 'North America' },
  { value: 'south-america', label: 'South America' },
  { value: 'latin-america', label: 'Latin America' },
  { value: 'central-america', label: 'Central America' },
  { value: 'europe', label: 'Europe' },
  { value: 'western-europe', label: 'Western Europe' },
  { value: 'eastern-europe', label: 'Eastern Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'asia-pacific', label: 'Asia Pacific (APAC)' },
  { value: 'southeast-asia', label: 'Southeast Asia' },
  { value: 'east-asia', label: 'East Asia' },
  { value: 'south-asia', label: 'South Asia' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'mena', label: 'Middle East & North Africa (MENA)' },
  { value: 'africa', label: 'Africa' },
  { value: 'north-africa', label: 'North Africa' },
  { value: 'sub-saharan-africa', label: 'Sub-Saharan Africa' },
  { value: 'oceania', label: 'Oceania' },
  
  // Major Countries (alphabetical)
  { value: 'australia', label: 'Australia' },
  { value: 'austria', label: 'Austria' },
  { value: 'belgium', label: 'Belgium' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'canada', label: 'Canada' },
  { value: 'china', label: 'China' },
  { value: 'denmark', label: 'Denmark' },
  { value: 'finland', label: 'Finland' },
  { value: 'france', label: 'France' },
  { value: 'germany', label: 'Germany' },
  { value: 'hong-kong', label: 'Hong Kong' },
  { value: 'india', label: 'India' },
  { value: 'indonesia', label: 'Indonesia' },
  { value: 'ireland', label: 'Ireland' },
  { value: 'israel', label: 'Israel' },
  { value: 'italy', label: 'Italy' },
  { value: 'japan', label: 'Japan' },
  { value: 'malaysia', label: 'Malaysia' },
  { value: 'mexico', label: 'Mexico' },
  { value: 'netherlands', label: 'Netherlands' },
  { value: 'new-zealand', label: 'New Zealand' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'norway', label: 'Norway' },
  { value: 'philippines', label: 'Philippines' },
  { value: 'poland', label: 'Poland' },
  { value: 'portugal', label: 'Portugal' },
  { value: 'russia', label: 'Russia' },
  { value: 'saudi-arabia', label: 'Saudi Arabia' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'south-africa', label: 'South Africa' },
  { value: 'south-korea', label: 'South Korea' },
  { value: 'spain', label: 'Spain' },
  { value: 'sweden', label: 'Sweden' },
  { value: 'switzerland', label: 'Switzerland' },
  { value: 'taiwan', label: 'Taiwan' },
  { value: 'thailand', label: 'Thailand' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'uae', label: 'United Arab Emirates (UAE)' },
  { value: 'uk', label: 'United Kingdom (UK)' },
  { value: 'usa', label: 'United States (USA)' },
  { value: 'vietnam', label: 'Vietnam' },
  
  // US Regions & States (Major markets)
  { value: 'us-northeast', label: 'US - Northeast' },
  { value: 'us-southeast', label: 'US - Southeast' },
  { value: 'us-midwest', label: 'US - Midwest' },
  { value: 'us-southwest', label: 'US - Southwest' },
  { value: 'us-west', label: 'US - West Coast' },
  { value: 'california', label: 'California, USA' },
  { value: 'texas', label: 'Texas, USA' },
  { value: 'florida', label: 'Florida, USA' },
  { value: 'new-york', label: 'New York, USA' },
  { value: 'illinois', label: 'Illinois, USA' },
]

export default function NewResearchPage() {
  const router = useRouter()
  
  // Separate form states for each type
  const [onDemandForm, setOnDemandForm] = useState({
    marketCategory: '',
    subNiche: '',
    geography: '',
    email: '',
    notes: '',
  })
  
  const [recurringForm, setRecurringForm] = useState({
    marketCategory: '',
    subNiche: '',
    geography: '',
    email: '',
    frequency: 'weekly',
    notes: '',
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('on-demand')

  // Handle On-Demand Research submission
  const handleOnDemandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    console.log('🚀 On-Demand Research submission started')
    
    try {
      // ===== STEP 1: GET AUTHENTICATED USER =====
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('Authentication required', {
          description: 'You must be logged in to create a report. Please sign in and try again.',
        })
        setIsSubmitting(false)
        return
      }
      
      console.log('✅ Authenticated user:', user.id, user.email)
      
      // Get active on-demand webhooks
      const activeWebhooks = await getActiveWebhooksByType('on-demand')
      
      console.log('Active on-demand webhooks:', activeWebhooks)
      
      if (activeWebhooks.length === 0) {
        toast.warning('No active on-demand webhooks', {
          description: 'Please configure an on-demand webhook in Settings.',
        })
        setIsSubmitting(false)
        return
      }
      
      // ===== STEP 2: SEND DATA WITH USER ID TO WEBHOOK =====
      const webhookPromises = activeWebhooks.map(async (webhook) => {
        console.log(`📤 Sending to webhook: ${webhook.url}`)
        
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // ===== CRITICAL: USER TRACKING =====
            userId: user.id,
            userEmail: user.email,
            
            // Form data
            ...onDemandForm,
            submittedAt: new Date().toISOString(),
            webhookName: webhook.name,
            researchType: 'on-demand',
          }),
        })
        
        console.log(`📥 Response status from ${webhook.name}:`, response.status)
        
        return response
      })

      const results = await Promise.allSettled(webhookPromises)
      
      console.log('📊 All results:', results)
      
      // Check results and get response data
      let webhookResponseData = null
      let successCount = 0
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.ok) {
          successCount++
          if (!webhookResponseData) {
            try {
              const responseText = await result.value.text()
              console.log('📄 Raw response text:', responseText)
              
              const data = JSON.parse(responseText)
              console.log('✅ Parsed webhook response:', data)
              webhookResponseData = data
            } catch (err) {
              console.error('❌ Failed to parse webhook response:', err)
            }
          }
        } else if (result.status === 'fulfilled') {
          console.error('❌ Webhook returned non-OK status:', result.value.status)
        } else {
          console.error('❌ Webhook request failed:', result.reason)
        }
      }
      
      if (successCount > 0) {
        let savedReportId: string | null = null
        
        if (webhookResponseData) {
          console.log('💾 Saving report to database...')
          
          // Extract webReport and emailReport from webhook response
          const reportData = Array.isArray(webhookResponseData) ? webhookResponseData[0] : webhookResponseData
          const webReport = reportData.webReport || ''
          const emailReport = reportData.emailReport || webReport
          
          // Validate that we have report content
          if (!webReport || webReport.trim() === '') {
            console.error('❌ No report content received from webhook')
            toast.error('Report generation failed', {
              description: 'No content was generated. Please try again.',
            })
            setIsSubmitting(false)
            return
          }
          
          // Save to database via API
          try {
            const saveResponse = await fetch('/api/reports/on-demand', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                // ===== CRITICAL: USER ID =====
                user_id: user.id,
                
                // Report data
                industry: onDemandForm.marketCategory,
                sub_niche: onDemandForm.subNiche,
                geography: onDemandForm.geography || 'Global',
                email: onDemandForm.email,
                final_report: webReport,
                email_report: emailReport,
                notes: onDemandForm.notes,
              }),
            })
            
            if (saveResponse.ok) {
              const saveResult = await saveResponse.json()
              savedReportId = saveResult.execution_id
              console.log('✅ Report saved to database with ID:', savedReportId)
              
              // Wait a bit to ensure database transaction completes
              await new Promise(resolve => setTimeout(resolve, 1000))
            } else {
              const errorText = await saveResponse.text()
              console.error('❌ Failed to save report to database:', errorText)
              toast.error('Failed to save report', {
                description: 'The report was generated but could not be saved. Please contact support.',
              })
              setIsSubmitting(false)
              return
            }
          } catch (saveError) {
            console.error('❌ Error saving report to database:', saveError)
            toast.error('Failed to save report', {
              description: 'An unexpected error occurred. Please try again.',
            })
            setIsSubmitting(false)
            return
          }
        } else {
          console.error('❌ No webhook response data received')
          toast.error('Report generation failed', {
            description: 'No response received from the report generator.',
          })
          setIsSubmitting(false)
          return
        }

        // Show success message
        toast.success('On-Demand Research completed!', {
          description: 'Your report has been generated and saved. Redirecting...',
          duration: 3000,
        })
        
        // Reset form
        setOnDemandForm({
          marketCategory: '',
          subNiche: '',
          geography: '',
          email: '',
          notes: '',
        })

        // Navigate to the saved report with proper delay
        setTimeout(() => {
          if (savedReportId) {
            console.log('🔄 Navigating to report:', savedReportId)
            router.push(`/dashboard/reports/${savedReportId}`)
            router.refresh() // Refresh to ensure data is loaded
          } else {
            router.push('/dashboard/reports')
            router.refresh()
          }
        }, 2000)
      } else {
        throw new Error('All webhooks failed')
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Submission failed', {
        description: 'Please check your configuration and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Recurring Research submission
  const handleRecurringSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    console.log('🔄 Recurring Research submission started')
    console.log('📅 Frequency:', recurringForm.frequency)
    
    try {
      // ===== STEP 1: GET AUTHENTICATED USER =====
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        toast.error('Authentication required', {
          description: 'You must be logged in to create a schedule. Please sign in and try again.',
        })
        setIsSubmitting(false)
        return
      }
      
      console.log('✅ Authenticated user:', user.id, user.email)
      
      // Get active recurring webhooks
      const activeWebhooks = await getActiveWebhooksByType('recurring')
      
      console.log('Active recurring webhooks:', activeWebhooks)
      
      if (activeWebhooks.length === 0) {
        toast.warning('No active recurring webhooks', {
          description: 'Please configure a recurring webhook in Settings.',
        })
        setIsSubmitting(false)
        return
      }

      // ===== STEP 2: SEND DATA WITH USER ID TO WEBHOOK =====
      const webhookPromises = activeWebhooks.map(async (webhook) => {
        console.log(`📤 Sending to recurring webhook: ${webhook.url}`)
        
        const webhookPayload = {
          // ===== CRITICAL: USER TRACKING =====
          userId: user.id,
          userEmail: user.email,
          
          // Form data
          ...recurringForm,
          submittedAt: new Date().toISOString(),
          webhookName: webhook.name,
          researchType: 'recurring',
          isInitialRun: true,
        }
        
        console.log('📦 Payload:', webhookPayload)
        
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookPayload),
          })
          
          console.log(`📥 Response status from ${webhook.name}:`, response.status)
          console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()))
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error(`❌ Webhook error response:`, errorText)
            throw new Error(`Webhook ${webhook.name} failed with status ${response.status}: ${errorText.substring(0, 200)}`)
          }
          
          // Get the response data
          const responseText = await response.text()
          console.log('📄 Raw response (first 500 chars):', responseText.substring(0, 500))
          
          let responseData
          try {
            responseData = JSON.parse(responseText)
            console.log('✅ Parsed response data:', responseData)
          } catch (e) {
            console.warn('⚠️ Could not parse response as JSON:', e)
            responseData = { webReport: responseText }
          }
          
          return responseData
        } catch (error) {
          console.error(`❌ Fetch error for ${webhook.url}:`, error)
          throw error
        }
      })

      const results = await Promise.allSettled(webhookPromises)
      
      console.log('📊 Webhook results:', results)
      
      // Check if any webhooks succeeded and get response data
      let successCount = 0
      let webhookResponseData = null
      
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          successCount++
          if (!webhookResponseData) {
            webhookResponseData = result.value
          }
        }
      }
      
      if (successCount > 0) {
        let scheduleId: string | null = null
        let savedReportId: string | null = null
        
        // Create schedule for recurring reports
        const schedule = createScheduleFromForm(recurringForm)
        saveSchedule(schedule)
        scheduleId = schedule.id
        
        console.log('✅ Recurring research request logged')
        console.log('✅ Schedule created with ID:', schedule.id)
        console.log('📆 Next run:', schedule.nextRun)

        // Save the initial report to database if webhook returned data
        if (webhookResponseData) {
          console.log('💾 Saving initial recurring report to database...')
          
          try {
            const reportData = Array.isArray(webhookResponseData) ? webhookResponseData[0] : webhookResponseData
            const webReport = reportData.webReport || ''
            const emailReport = reportData.emailReport || webReport
            
            if (webReport && webReport.trim() !== '') {
              const saveResponse = await fetch('/api/reports/on-demand', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  user_id: user.id,
                  industry: recurringForm.marketCategory,
                  sub_niche: recurringForm.subNiche,
                  geography: recurringForm.geography || 'Global',
                  email: recurringForm.email,
                  final_report: webReport,
                  email_report: emailReport,
                  notes: recurringForm.notes,
                }),
              })
              
              if (saveResponse.ok) {
                const saveResult = await saveResponse.json()
                savedReportId = saveResult.execution_id
                console.log('✅ Initial recurring report saved with ID:', savedReportId)
                
                // Wait for database transaction
                await new Promise(resolve => setTimeout(resolve, 1000))
              } else {
                console.error('❌ Failed to save initial report:', await saveResponse.text())
              }
            }
          } catch (saveError) {
            console.error('❌ Error saving initial recurring report:', saveError)
          }
        }

        toast.success('Recurring Research scheduled successfully!', {
          description: savedReportId 
            ? 'Initial report generated! Future reports will be created automatically.'
            : 'Schedule created. Reports will be generated automatically according to your frequency.',
          duration: 6000,
        })
        
        // Reset form
        setRecurringForm({
          marketCategory: '',
          subNiche: '',
          geography: '',
          email: '',
          frequency: 'weekly',
          notes: '',
        })

        // Navigate based on whether we have a report
        setTimeout(() => {
          if (savedReportId) {
            console.log('🔄 Navigating to initial report:', savedReportId)
            router.push(`/dashboard/reports/${savedReportId}`)
            router.refresh() // Refresh to ensure data is loaded
          } else {
            router.push('/dashboard/schedules')
            router.refresh()
          }
        }, 2000)
      } else {
        throw new Error('All webhooks failed')
      }
    } catch (error) {
      console.error('❌ Recurring research submission failed:', error)
      
      // More detailed error message
      let errorMessage = 'Please check your webhook configuration and try again.'
      
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Could not reach webhook. Check if n8n workflow is active and URL is correct.'
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error: n8n webhook needs to allow cross-origin requests.'
        } else if (error.message.includes('status')) {
          errorMessage = `Webhook error: ${error.message}`
        }
      }
      
      toast.error('Submission failed', {
        description: errorMessage,
        duration: 8000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Full-screen loading overlay */}
      <LoadingOverlay isVisible={isSubmitting} />
      
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileSearch className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Create New Market Research</h2>
            <p className="text-sm sm:text-base text-gray-600">Choose your research type and configure parameters</p>
          </div>
        </div>
      </div>

      {/* Tab-based Forms */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="on-demand" className="gap-1.5 sm:gap-2 py-2.5 sm:py-3 min-h-[48px]">
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-xs sm:text-sm">On-Demand Research</div>
              <div className="text-xs text-gray-500 font-normal hidden sm:block">Immediate results</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="recurring" className="gap-1.5 sm:gap-2 py-2.5 sm:py-3 min-h-[48px]">
            <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-xs sm:text-sm">Recurring Research</div>
              <div className="text-xs text-gray-500 font-normal hidden sm:block">Automated schedule</div>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* On-Demand Research Form */}
        <TabsContent value="on-demand" className="space-y-4 sm:space-y-6">
          <form onSubmit={handleOnDemandSubmit}>
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <CardTitle className="text-base sm:text-lg">On-Demand Research</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Run once immediately and receive results within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                {/* Market Category */}
                <div className="space-y-2">
                  <Label htmlFor="od-marketCategory" className="text-sm sm:text-base">
                    Market Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={onDemandForm.marketCategory}
                    onValueChange={(value) => setOnDemandForm(prev => ({ ...prev, marketCategory: value }))}
                    required
                  >
                    <SelectTrigger className="h-11 sm:h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Select a market category" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-niche */}
                <div className="space-y-2">
                  <Label htmlFor="od-subNiche" className="text-sm sm:text-base">
                    Sub-niche or Specific Focus <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="od-subNiche"
                    type="text"
                    placeholder="e.g., AI-powered CRM software for small businesses"
                    value={onDemandForm.subNiche}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, subNiche: e.target.value }))}
                    required
                    className="h-11 text-sm sm:text-base"
                  />
                </div>

                {/* Geography */}
                <div className="space-y-2">
                  <Label htmlFor="od-geography" className="text-sm sm:text-base">
                    Geographic Focus <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={geographicLocations}
                    value={onDemandForm.geography}
                    onValueChange={(value) => setOnDemandForm(prev => ({ ...prev, geography: value }))}
                    placeholder="Select a location..."
                    searchPlaceholder="Search locations..."
                    emptyText="No location found."
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Choose the geographic region for market analysis
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="od-email" className="text-sm sm:text-base">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="od-email"
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={onDemandForm.email}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-11 text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Report will be sent to this email address
                  </p>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="od-notes" className="text-sm sm:text-base">
                    Additional Notes <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Textarea
                    id="od-notes"
                    placeholder="Any specific requirements, questions to answer, or areas of focus..."
                    value={onDemandForm.notes}
                    onChange={(e) => setOnDemandForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-3 sm:pt-4 border-t">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                      <span className="text-red-500">*</span> Required fields
                    </p>
                    <Button type="submit" size="lg" className="gap-2 w-full sm:w-auto min-h-[48px] order-1 sm:order-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span className="text-sm sm:text-base">Processing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">Submit On-Demand Request</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Info Card for On-Demand */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span>What happens next?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">1</span>
                <span className="pt-0.5"><strong>AI analyzes</strong> market data from multiple sources and industry databases</span>
              </p>
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">2</span>
                <span className="pt-0.5"><strong>Comprehensive report</strong> is generated with insights, trends, and competitive analysis</span>
              </p>
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">3</span>
                <span className="pt-0.5"><strong>Results delivered</strong> to your Reports section within 2-24 hours</span>
              </p>
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">4</span>
                <span className="pt-0.5"><strong>Email notification</strong> sent when your report is ready to view</span>
              </p>
              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-blue-200">
                <p className="flex items-center gap-2 text-blue-700 font-medium">
                  <span>⏱️</span>
                  <span>Typical turnaround: 4-12 hours</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recurring Research Form */}
        <TabsContent value="recurring" className="space-y-4 sm:space-y-6">
          <form onSubmit={handleRecurringSubmit}>
            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                  <CardTitle className="text-base sm:text-lg">Recurring Research</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Automated research on a regular schedule for ongoing monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                {/* Market Category */}
                <div className="space-y-2">
                  <Label htmlFor="rec-marketCategory" className="text-sm sm:text-base">
                    Market Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={recurringForm.marketCategory}
                    onValueChange={(value) => setRecurringForm(prev => ({ ...prev, marketCategory: value }))}
                    required
                  >
                    <SelectTrigger className="h-11 text-sm sm:text-base">
                      <SelectValue placeholder="Select a market category" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub-niche */}
                <div className="space-y-2">
                  <Label htmlFor="rec-subNiche" className="text-sm sm:text-base">
                    Sub-niche or Specific Focus <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rec-subNiche"
                    type="text"
                    placeholder="e.g., AI-powered CRM software for small businesses"
                    value={recurringForm.subNiche}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, subNiche: e.target.value }))}
                    required
                    className="h-11 text-sm sm:text-base"
                  />
                </div>

                {/* Geography */}
                <div className="space-y-2">
                  <Label htmlFor="rec-geography" className="text-sm sm:text-base">
                    Geographic Focus <span className="text-red-500">*</span>
                  </Label>
                  <Combobox
                    options={geographicLocations}
                    value={recurringForm.geography}
                    onValueChange={(value) => setRecurringForm(prev => ({ ...prev, geography: value }))}
                    placeholder="Select a location..."
                    searchPlaceholder="Search locations..."
                    emptyText="No location found."
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Choose the geographic region for market analysis
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="rec-email" className="text-sm sm:text-base">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rec-email"
                    type="email"
                    placeholder="e.g., john@example.com"
                    value={recurringForm.email}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-11 text-sm sm:text-base"
                  />
                  <p className="text-xs sm:text-sm text-gray-500">
                    Report will be sent to this email address
                  </p>
                </div>

                {/* Frequency */}
                <div className="space-y-2 bg-purple-100 p-3 sm:p-4 rounded-lg border border-purple-300">
                  <Label htmlFor="rec-frequency" className="text-sm sm:text-base">
                    Frequency <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={recurringForm.frequency}
                    onValueChange={(value) => setRecurringForm(prev => ({ ...prev, frequency: value }))}
                  >
                    <SelectTrigger className="h-11 bg-white text-sm sm:text-base">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs sm:text-sm text-purple-700">
                    How often should this research be automatically updated?
                  </p>
                </div>

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="rec-notes" className="text-sm sm:text-base">
                    Additional Notes <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Textarea
                    id="rec-notes"
                    placeholder="Any specific requirements, questions to answer, or areas of focus..."
                    value={recurringForm.notes}
                    onChange={(e) => setRecurringForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-3 sm:pt-4 border-t">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
                      <span className="text-red-500">*</span> Required fields
                    </p>
                    <Button type="submit" size="lg" className="gap-2 w-full sm:w-auto min-h-[48px] order-1 sm:order-2" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          <span className="text-sm sm:text-base">Creating Schedule...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-sm sm:text-base">Create Schedule</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Info Card for Recurring */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <span>How Recurring Research Works</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">1</span>
                <span className="pt-0.5"><strong>Schedule created</strong> and saved in your Schedules section for easy management</span>
              </p>
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">2</span>
                <span className="pt-0.5"><strong>Automatic monitoring</strong> runs on your chosen frequency (daily, weekly, or monthly)</span>
              </p>
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">3</span>
                <span className="pt-0.5"><strong>Fresh reports generated</strong> automatically with the latest market data and trends</span>
              </p>
              <p className="flex items-start gap-2 sm:gap-3">
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-600 text-white font-bold text-xs shrink-0">4</span>
                <span className="pt-0.5"><strong>Email alerts & dashboard updates</strong> notify you when new reports are available</span>
              </p>
              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-purple-200 bg-purple-100 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 sm:py-3 rounded-b-lg">
                <p className="flex items-center gap-2 text-purple-700 font-medium">
                  <span>💡</span>
                  <span>Pause or cancel schedules anytime from your Schedules page</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
