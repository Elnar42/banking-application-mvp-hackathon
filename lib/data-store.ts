// In-memory data store for MVP
export type ItemStatus = 'pending' | 'approved'

export interface ScannedItem {
  id: string
  qrCode: string
  name: string
  category: string
  quantity: number
  price: number
  co2: number | null
  status: ItemStatus
  scannedAt: Date
  approvedAt?: Date
  storeName: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt?: Date
  stores: string[]
  discount?: string
  isActive?: boolean
  prizes?: string[]
}

export interface Milestone {
  id: string
  name: string
  description: string
  target: number
  current: number
  progress: number
  badgeId?: string
  completed: boolean
  startedAt?: Date
}

// Mock data store with Supabase integration
import { createClient } from '@/lib/supabase/client'

class DataStore {
  private items: ScannedItem[] = []
  private badges: Badge[] = []
  private activeBadges: string[] = []
  private milestones: Milestone[] = [
    {
      id: 'm1',
      name: 'First Scan',
      description: 'Scan your first receipt',
      target: 1,
      current: 0,
      progress: 0,
      badgeId: 'b1',
      completed: false,
    },
    {
      id: 'm2',
      name: 'Eco Warrior',
      description: 'Scan 5 receipts',
      target: 5,
      current: 0,
      progress: 0,
      badgeId: 'b2',
      completed: false,
    },
    {
      id: 'm3',
      name: 'Green Champion',
      description: 'Scan 10 receipts',
      target: 10,
      current: 0,
      progress: 0,
      badgeId: 'b3',
      completed: false,
    },
    {
      id: 'm4',
      name: 'Carbon Saver',
      description: 'Keep monthly CO₂ under 50kg',
      target: 50,
      current: 0,
      progress: 0,
      badgeId: 'b4',
      completed: false,
    },
    {
      id: 'm5',
      name: 'Weekly Tracker',
      description: 'Scan receipts for 4 consecutive weeks',
      target: 4,
      current: 0,
      progress: 0,
      badgeId: 'b5',
      completed: false,
    },
    {
      id: 'm6',
      name: 'Eco Explorer',
      description: 'Shop at 5+ different eco-friendly stores',
      target: 5,
      current: 0,
      progress: 0,
      badgeId: 'b6',
      completed: false,
    },
    {
      id: 'm7',
      name: 'Low Impact Master',
      description: 'Maintain average CO₂ per item under 3kg',
      target: 3,
      current: 0,
      progress: 0,
      badgeId: 'b7',
      completed: false,
    },
    {
      id: 'm8',
      name: 'Sustainability Champion',
      description: 'Scan 25+ receipts',
      target: 25,
      current: 0,
      progress: 0,
      badgeId: 'b8',
      completed: false,
    },
  ]

  private allBadges: Badge[] = [
    {
      id: 'b1',
      name: 'Eco Shopper',
      description: 'Purchased 10+ eco-friendly items',
      icon: '🛒',
      stores: ['Araz Market', 'Bravo Supermarket', 'Bazarstore'],
      discount: '5% off eco-friendly products',
      prizes: [
        '5% discount at participating stores',
        'Eco-friendly tote bag',
        'Priority checkout lanes',
        'Access to exclusive eco products',
        'Monthly newsletter with sustainability tips',
      ],
    },
    {
      id: 'b2',
      name: 'Conscious Buyer',
      description: 'Maintaining low carbon footprint',
      icon: '💚',
      stores: ['Araz Market', 'Bravo Supermarket', 'Bazarstore', 'Port Baku Mall'],
      discount: '10% off eco-friendly products',
      prizes: [
        '10% discount at all stores',
        'Reusable shopping bags set',
        'Free eco-friendly products monthly',
        'Early access to sales',
        'Personalized carbon reduction plan',
      ],
    },
    {
      id: 'b3',
      name: 'Green Hero',
      description: 'Monthly footprint under 80kg CO₂',
      icon: '🏆',
      stores: ['All participating stores'],
      discount: '15% off eco-friendly products',
      prizes: [
        '15% discount everywhere',
        'Exclusive green card benefits',
        'Carbon offset certificate',
        'VIP customer support',
        'Invitation to sustainability events',
      ],
    },
    {
      id: 'b4',
      name: 'Carbon Saver',
      description: 'Keep monthly CO₂ under 50kg',
      icon: '🌱',
      stores: ['Araz Market', 'Bravo Supermarket', 'Bazarstore'],
      discount: '8% off all purchases',
      prizes: [
        '8% discount on all purchases',
        'Carbon footprint analysis report',
        'Eco-friendly starter kit',
        'Free delivery on eco products',
        'Sustainability consultation session',
      ],
    },
    {
      id: 'b5',
      name: 'Weekly Tracker',
      description: 'Scan receipts for 4 consecutive weeks',
      icon: '📅',
      stores: ['All participating stores'],
      discount: '7% off weekly purchases',
      prizes: [
        '7% weekly discount',
        'Habit tracking dashboard access',
        'Weekly sustainability tips',
        'Bonus points multiplier',
        'Achievement certificate',
      ],
    },
    {
      id: 'b6',
      name: 'Eco Explorer',
      description: 'Shop at 5+ different eco-friendly stores',
      icon: '🗺️',
      stores: ['All participating stores'],
      discount: '12% off at new stores',
      prizes: [
        '12% discount at new stores',
        'Store discovery guide',
        'Exclusive store partnerships',
        'Store loyalty points',
        'Eco store directory access',
      ],
    },
    {
      id: 'b7',
      name: 'Low Impact Master',
      description: 'Maintain average CO₂ per item under 3kg',
      icon: '⭐',
      stores: ['All participating stores'],
      discount: '10% off low-carbon products',
      prizes: [
        '10% discount on low-carbon items',
        'Advanced carbon calculator',
        'Personalized product recommendations',
        'Impact reduction report',
        'Master sustainability badge',
      ],
    },
    {
      id: 'b8',
      name: 'Sustainability Champion',
      description: 'Scan 25+ receipts',
      icon: '👑',
      stores: ['All participating stores'],
      discount: '20% off all purchases',
      prizes: [
        '20% discount everywhere',
        'Champion status recognition',
        'Exclusive merchandise',
        'Annual sustainability report',
        'Invitation to join eco ambassador program',
      ],
    },
  ]

  private supabase: ReturnType<typeof createClient> | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.supabase = createClient()
      this.loadFromDatabase()
    }
  }

  private async loadFromDatabase() {
    if (!this.supabase) return

    try {
      console.log('[v0] Loading data from Supabase...')

      // Load scanned items
      const { data: itemsData, error: itemsError } = await this.supabase
        .from('scanned_items')
        .select('*')
        .order('scanned_at', { ascending: false })

      if (itemsError) {
        console.error('[v0] Error loading items:', itemsError)
      } else if (itemsData) {
        this.items = itemsData.map((item: any) => ({
          id: item.id,
          qrCode: item.qr_code,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: parseFloat(item.price),
          co2: item.co2 ? parseFloat(item.co2) : null,
          status: item.status as ItemStatus,
          scannedAt: new Date(item.scanned_at),
          approvedAt: item.approved_at ? new Date(item.approved_at) : undefined,
          storeName: item.store_name,
        }))
        console.log('[v0] Loaded', this.items.length, 'items from database')
      }

      // Load badges
      const { data: badgesData, error: badgesError } = await this.supabase
        .from('badges')
        .select('*')
        .not('earned_at', 'is', null)

      if (badgesError) {
        console.error('[v0] Error loading badges:', badgesError)
      } else if (badgesData) {
        this.badges = badgesData.map((badge: any) => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          earnedAt: badge.earned_at ? new Date(badge.earned_at) : undefined,
          stores: badge.stores || [],
          discount: badge.discount,
          prizes: badge.prizes || [],
        }))
        console.log('[v0] Loaded', this.badges.length, 'badges from database')
      }

      // Load active badges
      const { data: activeData, error: activeError } = await this.supabase
        .from('active_badges')
        .select('badge_id')

      if (activeError) {
        console.error('[v0] Error loading active badges:', activeError)
      } else if (activeData) {
        this.activeBadges = activeData.map((item: any) => item.badge_id)
        console.log('[v0] Loaded', this.activeBadges.length, 'active badges')
      }

      // Load milestones
      const { data: milestonesData, error: milestonesError } = await this.supabase
        .from('milestones')
        .select('*')

      if (milestonesError) {
        console.error('[v0] Error loading milestones:', milestonesError)
      } else if (milestonesData && milestonesData.length > 0) {
        const milestoneMap = new Map(milestonesData.map((m: any) => [m.id, m]))
        
        this.milestones = this.milestones.map(defaultMilestone => {
          const stored = milestoneMap.get(defaultMilestone.id)
          if (stored) {
            return {
              ...defaultMilestone,
              current: stored.current || 0,
              progress: stored.progress || 0,
              completed: stored.completed || false,
              startedAt: stored.started_at ? new Date(stored.started_at) : undefined,
            }
          }
          return defaultMilestone
        })
        console.log('[v0] Loaded milestones from database')
      }

      // Update milestones after loading
      this.updateMilestones()

      // Fallback to localStorage for backward compatibility
      if (this.items.length === 0) {
        console.log('[v0] No data in database, trying localStorage...')
        this.loadFromStorage()
      }
    } catch (error) {
      console.error('[v0] Failed to load from database:', error)
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('ecobank_data')
      if (stored) {
        const data = JSON.parse(stored)
        
        // Restore items with proper Date objects
        this.items = (data.items || []).map((item: any) => ({
          ...item,
          scannedAt: new Date(item.scannedAt),
          approvedAt: item.approvedAt ? new Date(item.approvedAt) : undefined,
        }))
        
        // Restore badges with proper Date objects
        this.badges = (data.badges || []).map((badge: any) => ({
          ...badge,
          earnedAt: badge.earnedAt ? new Date(badge.earnedAt) : undefined,
        }))
        
        this.activeBadges = data.activeBadges || []
        
        // Restore milestones, merge with defaults to ensure all milestones exist
        const storedMilestones = data.milestones || []
        const milestoneMap = new Map(storedMilestones.map((m: any) => [m.id, m]))
        
        this.milestones = this.milestones.map(defaultMilestone => {
          const stored = milestoneMap.get(defaultMilestone.id)
          if (stored) {
            return {
              ...defaultMilestone,
              ...stored,
              // Ensure current and progress are numbers
              current: typeof stored.current === 'number' ? stored.current : defaultMilestone.current,
              progress: typeof stored.progress === 'number' ? stored.progress : defaultMilestone.progress,
              startedAt: stored.startedAt ? new Date(stored.startedAt) : undefined,
            }
          }
          return defaultMilestone
        })
        
        // Update milestones after loading to ensure they're current
        this.updateMilestones()
        
        console.log('[v0] Loaded data from storage:', { 
          itemsCount: this.items.length,
          badgesCount: this.badges.length,
          activeBadgesCount: this.activeBadges.length
        })
      }
    } catch (error) {
      console.error('[v0] Failed to load from storage:', error)
      // Reset to defaults on error
      this.items = []
      this.badges = []
      this.activeBadges = []
    }
  }

  private async saveToDatabase() {
    if (!this.supabase) {
      this.saveToStorage()
      return
    }

    try {
      console.log('[v0] Saving data to Supabase...')

      for (const milestone of this.milestones) {
        const { error } = await this.supabase
          .from('milestones')
          .upsert({
            id: milestone.id,
            name: milestone.name,
            description: milestone.description,
            target: milestone.target,
            current: Math.floor(milestone.current),
            progress: Math.floor(milestone.progress),
            completed: milestone.completed,
            badge_id: milestone.badgeId,
            updated_at: new Date().toISOString(),
            started_at: milestone.startedAt?.toISOString(),
          })

        if (error) {
          console.error('[v0] Error saving milestone:', milestone.id, error.message)
        }
      }

      // First, delete badges that are no longer active
      const { data: existingBadges } = await this.supabase
        .from('active_badges')
        .select('badge_id')
      
      if (existingBadges) {
        const existingIds = existingBadges.map((b: any) => b.badge_id)
        const toDelete = existingIds.filter((id: string) => !this.activeBadges.includes(id))
        
        for (const badgeId of toDelete) {
          await this.supabase
            .from('active_badges')
            .delete()
            .eq('badge_id', badgeId)
        }
      }
      
      // Then upsert current active badges
      for (const badgeId of this.activeBadges) {
        const { error } = await this.supabase
          .from('active_badges')
          .upsert({
            badge_id: badgeId,
            started_at: new Date().toISOString(),
          }, {
            onConflict: 'badge_id'
          })

        if (error) {
          console.error('[v0] Error saving active badge:', badgeId, error.message)
        }
      }

      console.log('[v0] Saved data to Supabase successfully')
      
      this.saveToStorage()
    } catch (error) {
      console.error('[v0] Failed to save to database:', error)
      this.saveToStorage()
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        // Serialize with proper date handling
        const data = {
          items: this.items.map(item => ({
            ...item,
            scannedAt: item.scannedAt.toISOString(),
            approvedAt: item.approvedAt?.toISOString(),
          })),
          badges: this.badges.map(badge => ({
            ...badge,
            earnedAt: badge.earnedAt?.toISOString(),
          })),
          activeBadges: this.activeBadges,
          milestones: this.milestones.map(milestone => ({
            ...milestone,
            startedAt: milestone.startedAt?.toISOString(),
          })),
        }
        localStorage.setItem('ecobank_data', JSON.stringify(data))
        console.log('[v0] Saved data to storage:', { 
          itemsCount: this.items.length,
          badgesCount: this.badges.length,
          activeBadgesCount: this.activeBadges.length
        })
      } catch (error) {
        console.error('[v0] Failed to save to storage:', error)
        // Try to clear and save again if storage is full
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          try {
            localStorage.removeItem('ecobank_data')
            localStorage.setItem('ecobank_data', JSON.stringify({
              items: this.items.slice(-50), // Keep last 50 items
              badges: this.badges,
              activeBadges: this.activeBadges,
              milestones: this.milestones.map(milestone => ({
                ...milestone,
                startedAt: milestone.startedAt?.toISOString(),
              })),
            }))
          } catch (retryError) {
            console.error('[v0] Failed to save after cleanup:', retryError)
          }
        }
      }
    }
  }

  getItems() {
    console.log('[v0] getItems called, returning:', this.items.length, 'items')
    return this.items
  }

  addItem(item: Omit<ScannedItem, 'id'>) {
    // Calculate CO2 based on category
    const co2ByCategory: Record<string, number> = {
      'Food': 2.5,
      'Electronics': 8.0,
      'Clothing': 5.5,
      'Home & Garden': 3.0,
      'Transport': 12.0,
    }
    
    const calculatedCO2 = (co2ByCategory[item.category] || 3.0) * item.quantity
    
    const newItem: ScannedItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random()}`,
      status: 'approved', // Auto-approve
      co2: calculatedCO2,
      approvedAt: new Date(),
    }
    this.items.push(newItem)
    console.log('[v0] Added new item:', newItem.id, 'Total items:', this.items.length)
    
    this.saveToDatabase()
    
    this.updateMilestones()
    
    return newItem
  }

  approveItem(itemId: string, co2: number) {
    const item = this.items.find((i) => i.id === itemId)
    if (item) {
      item.status = 'approved'
      item.co2 = co2
      item.approvedAt = new Date()
      this.saveToDatabase()
      this.updateMilestones()
    }
    return item
  }

  updateMilestones() {
    const badgesToAward: string[] = []
    
    this.milestones.forEach((milestone) => {
      const isActive = this.activeBadges.includes(milestone.badgeId || '')
      
      const relevantItems = milestone.startedAt 
        ? this.items.filter((i) => 
            i.status === 'approved' && 
            new Date(i.scannedAt) >= milestone.startedAt!
          )
        : (isActive ? this.items.filter((i) => i.status === 'approved') : [])
      
      const approvedCount = relevantItems.length
      const totalCO2 = relevantItems
        .filter(i => i.co2)
        .reduce((sum, item) => sum + (item.co2 || 0), 0)
      const avgCO2PerItem = approvedCount > 0 ? totalCO2 / approvedCount : 0
      
      const uniqueStores = new Set(relevantItems.map(item => item.storeName))
      const storeCount = uniqueStores.size
      
      const itemDates = relevantItems.map(item => new Date(item.scannedAt).getTime())
      const weeks = itemDates.length > 0 
        ? Math.floor((Math.max(...itemDates) - Math.min(...itemDates)) / (7 * 24 * 60 * 60 * 1000)) + 1 
        : 0
      
      milestone.completed = false
      
      if (milestone.id === 'm1' || milestone.id === 'm2' || milestone.id === 'm3' || milestone.id === 'm8') {
        milestone.current = approvedCount
        milestone.progress = approvedCount
        if (milestone.current >= milestone.target) {
          milestone.completed = true
        }
      } else if (milestone.id === 'm4') {
        milestone.current = totalCO2
        milestone.progress = totalCO2
        if (milestone.current <= milestone.target && approvedCount > 0) {
          milestone.completed = true
        }
      } else if (milestone.id === 'm5') {
        milestone.current = Math.min(weeks, milestone.target)
        milestone.progress = weeks
        if (milestone.current >= milestone.target) {
          milestone.completed = true
        }
      } else if (milestone.id === 'm6') {
        milestone.current = storeCount
        milestone.progress = storeCount
        if (milestone.current >= milestone.target) {
          milestone.completed = true
        }
      } else if (milestone.id === 'm7') {
        milestone.current = avgCO2PerItem
        milestone.progress = avgCO2PerItem
        if (milestone.current <= milestone.target && approvedCount > 0) {
          milestone.completed = true
        }
      }
      
      if (milestone.completed && milestone.badgeId && isActive) {
        const alreadyEarned = this.badges.find((b) => b.id === milestone.badgeId)
        
        if (!alreadyEarned) {
          badgesToAward.push(milestone.badgeId)
          console.log('[v0] Milestone completed, badge will be awarded:', milestone.name, milestone.badgeId)
        }
      }
    })
    
    if (badgesToAward.length > 0) {
      console.log('[v0] Awarding badges:', badgesToAward)
      badgesToAward.forEach(badgeId => {
        this.awardBadge(badgeId)
      })
      this.activeBadges = this.activeBadges.filter(id => !badgesToAward.includes(id))
      console.log('[v0] Active badges after awarding:', this.activeBadges)
    }
    
    console.log('[v0] Milestones updated, active badges:', this.activeBadges, 'earned badges:', this.badges.map(b => b.id))
    
    this.saveToDatabase()
  }

  private awardBadge(badgeId: string) {
    const template = this.allBadges.find(b => b.id === badgeId)
    if (template) {
      const newBadge = {
        ...template,
        earnedAt: new Date(),
      }
      this.badges.push(newBadge)
      console.log('[v0] Badge awarded:', template.name)
      
      if (this.supabase) {
        this.supabase
          .from('badges')
          .insert({
            id: newBadge.id,
            name: newBadge.name,
            description: newBadge.description,
            icon: newBadge.icon,
            earned_at: newBadge.earnedAt?.toISOString(),
            stores: newBadge.stores,
            discount: newBadge.discount,
            prizes: newBadge.prizes,
            created_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) {
              console.error('[v0] Error saving badge to database:', error)
            } else {
              console.log('[v0] Badge saved to database:', newBadge.id)
            }
          })
      }
      
      this.saveToStorage()
    }
  }

  getAvailableBadges() {
    const earnedIds = this.badges.map(b => b.id)
    return this.allBadges.filter(b => !earnedIds.includes(b.id))
  }

  getAllBadgeTemplates() {
    return this.allBadges
  }

  startBadge(badgeId: string) {
    if (!this.activeBadges.includes(badgeId)) {
      this.activeBadges.push(badgeId)
      
      const milestone = this.milestones.find(m => m.badgeId === badgeId)
      if (milestone) {
        milestone.current = 0
        milestone.progress = 0
        milestone.completed = false
        milestone.startedAt = new Date()
        console.log('[v0] Badge started, milestone reset:', badgeId, milestone.name, 'startedAt:', milestone.startedAt)
      }
      
      console.log('[v0] Badge started:', badgeId)
      this.saveToDatabase()
      this.updateMilestones()
    }
  }
  
  isBadgeActive(badgeId: string): boolean {
    return this.activeBadges.includes(badgeId)
  }
  
  getBadgeProgress(badgeId: string): { current: number; target: number; progress: number; isInverted?: boolean } | null {
    const milestone = this.milestones.find(m => m.badgeId === badgeId)
    if (milestone) {
      const isInverted = milestone.id === 'm4' || milestone.id === 'm7'
      return {
        current: milestone.current,
        target: milestone.target,
        progress: milestone.progress,
        isInverted,
      }
    }
    return null
  }

  getActiveBadges() {
    return this.activeBadges
  }

  getContinuingBadges() {
    const earnedIds = this.badges.map(b => b.id)
    return this.activeBadges
      .filter(badgeId => !earnedIds.includes(badgeId))
      .map(badgeId => {
        const badge = this.allBadges.find(b => b.id === badgeId)
        const milestone = this.milestones.find(m => m.badgeId === badgeId)
        return badge && milestone ? { badge, milestone } : null
      })
      .filter((item): item is { badge: Badge; milestone: Milestone } => item !== null)
  }

  getBadges() {
    return this.badges
  }

  getMilestones() {
    return this.milestones
  }

  getTotalCO2() {
    return this.items
      .filter((i) => i.status === 'approved' && i.co2)
      .reduce((sum, item) => sum + (item.co2 || 0), 0)
  }

  getStats() {
    const total = this.items.length
    const pending = this.items.filter((i) => i.status === 'pending').length
    const approved = this.items.filter((i) => i.status === 'approved').length
    const totalCO2 = this.getTotalCO2()
    
    const calculatedCO2 = this.items
      .filter((i) => i.status === 'approved' && i.co2 !== null && i.co2 !== undefined)
      .reduce((sum, item) => sum + (item.co2 || 0), 0)
    
    const finalCO2 = calculatedCO2 > 0 ? calculatedCO2 : totalCO2

    console.log('[v0] getStats:', { total, pending, approved, totalCO2, calculatedCO2, finalCO2 })

    return { total, pending, approved, totalCO2: finalCO2 }
  }
}

export const dataStore = new DataStore()
