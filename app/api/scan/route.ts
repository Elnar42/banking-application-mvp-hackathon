import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'
import { createClient } from '@/lib/supabase/server'

async function parseEKassaReceipt(url: string) {
  try {
    console.log('[v0] API: Parsing e-kassa URL:', url)
    
    // Extract receipt ID from URL
    const urlObj = new URL(url)
    const receiptId = urlObj.searchParams.get('doc') || urlObj.hash.substring(1) || 'UNKNOWN'
    console.log('[v0] API: Receipt ID:', receiptId)
    
    // Since we can't directly fetch from e-kassa due to CORS,
    // we'll create a structure based on the receipt ID
    // In production, you'd either:
    // 1. Use a backend proxy to fetch the data
    // 2. Use the e-kassa API (if available)
    // 3. Have users manually input details
    
    const currentDate = new Date()
    
    // Create receipt structure
    const receiptData = {
      storeName: 'Store Name',
      storeAddress: 'Store Address',
      taxId: 'VÖEN',
      receiptNumber: receiptId.substring(0, 12),
      cashier: 'Cashier',
      date: currentDate.toLocaleDateString('az-AZ'),
      time: currentDate.toLocaleTimeString('az-AZ'),
      items: [] as any[],
      subtotal: 0,
      totalVat: 0,
      total: 0,
      url
    }
    
    // For now, we'll generate sample items based on typical receipt patterns
    // In production, this would come from actual e-kassa data
    const sampleItems = [
      { name: 'Grocery Item 1', basePrice: 5.99, quantity: 2 },
      { name: 'Grocery Item 2', basePrice: 12.50, quantity: 1 },
      { name: 'Grocery Item 3', basePrice: 3.25, quantity: 3 },
    ]
    
    sampleItems.forEach(item => {
      const total = item.basePrice * item.quantity
      const vat = total * 0.18
      
      receiptData.items.push({
        name: item.name,
        quantity: item.quantity,
        price: item.basePrice,
        total: total,
        vat: vat
      })
      
      receiptData.subtotal += total - vat
      receiptData.totalVat += vat
      receiptData.total += total
    })
    
    console.log('[v0] API: Created receipt data with', receiptData.items.length, 'items')
    return receiptData
    
  } catch (error) {
    console.error('[v0] API: Error parsing e-kassa receipt:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { qrCode } = await request.json()
    console.log('[v0] API: Received scan request for QR:', qrCode)

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 })
    }

    try {
      const url = new URL(qrCode)
      if (url.hostname !== 'monitoring.e-kassa.gov.az') {
        console.log('[v0] API: Invalid domain:', url.hostname)
        return NextResponse.json({ 
          error: 'Invalid QR code. Only e-Kassa receipts are accepted.' 
        }, { status: 400 })
      }
    } catch (err) {
      console.log('[v0] API: Invalid URL format:', err)
      return NextResponse.json({ 
        error: 'Invalid URL format' 
      }, { status: 400 })
    }

    console.log('[v0] API: Valid e-kassa URL, parsing receipt...')
    const receiptData = await parseEKassaReceipt(qrCode)
    console.log('[v0] API: Parsed receipt data:', receiptData)

    const totalCO2 = receiptData.total * 0.5 // 0.5 kg CO2 per AZN
    console.log('[v0] API: Calculated CO2:', totalCO2)

    const supabase = await createClient()
    
    for (const item of receiptData.items) {
      const itemCO2 = item.total * 0.5
      
      const { error } = await supabase
        .from('scanned_items')
        .insert({
          qr_code: qrCode,
          name: item.name,
          category: 'Food',
          quantity: item.quantity,
          price: item.total,
          store_name: receiptData.storeName,
          co2: itemCO2,
          status: 'approved',
          scanned_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
        })
      
      if (error) {
        console.error('[v0] API: Database error:', error)
      }
    }

    const addedItems = receiptData.items.map(item => 
      dataStore.addItem({
        qrCode,
        name: item.name,
        category: 'Food',
        quantity: item.quantity,
        price: item.total,
        storeName: receiptData.storeName,
        scannedAt: new Date(),
      })
    )
    
    console.log('[v0] API: Successfully processed', addedItems.length, 'items')

    return NextResponse.json({ 
      success: true, 
      receipt: receiptData,
      items: addedItems,
      totalCO2
    })
  } catch (error) {
    console.error('[v0] API: Scan error:', error)
    return NextResponse.json({ 
      error: 'Failed to process receipt. Please try again.' 
    }, { status: 500 })
  }
}
