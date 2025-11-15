'use client'

import { Card } from '@/components/ui/card'
import { CheckCircle2, Store, Calendar, User, ReceiptIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ReceiptItem {
  name: string
  quantity: number
  price: number
  total: number
  vat: number
}

export interface ReceiptData {
  storeName: string
  storeAddress: string
  taxId: string
  receiptNumber: string
  cashier: string
  date: string
  time: string
  items: ReceiptItem[]
  subtotal: number
  totalVat: number
  total: number
  url: string
}

interface ReceiptDisplayProps {
  receipt: ReceiptData
  onClose: () => void
}

export function ReceiptDisplay({ receipt, onClose }: ReceiptDisplayProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4">
      <Card className="p-6 bg-white shadow-lg">
        {/* Success Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="p-2 bg-emerald-100 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Receipt Scanned Successfully</h2>
            <p className="text-sm text-gray-500">Receipt verified from e-Kassa system</p>
          </div>
        </div>

        {/* Store Information */}
        <div className="space-y-3 mb-6 pb-6 border-b">
          <div className="flex items-start gap-3">
            <Store className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900">{receipt.storeName}</p>
              <p className="text-sm text-gray-600">{receipt.storeAddress}</p>
              <p className="text-sm text-gray-500">VÖEN: {receipt.taxId}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ReceiptIcon className="h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-600">Satış çeki №: {receipt.receiptNumber}</p>
          </div>

          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-600">Kassir: {receipt.cashier}</p>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <p className="text-sm text-gray-600">Tarix: {receipt.date} {receipt.time}</p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Məhsullar</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 pb-2 border-b">
              <div className="col-span-5">Məhsul</div>
              <div className="col-span-2 text-center">Say</div>
              <div className="col-span-2 text-right">Qiymət</div>
              <div className="col-span-3 text-right">Cəmi</div>
            </div>
            {receipt.items.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="grid grid-cols-12 gap-2 text-sm">
                  <div className="col-span-5 text-gray-900">{item.name}</div>
                  <div className="col-span-2 text-center text-gray-600">{item.quantity}</div>
                  <div className="col-span-2 text-right text-gray-600">{item.price.toFixed(2)}</div>
                  <div className="col-span-3 text-right font-semibold text-gray-900">{item.total.toFixed(2)}</div>
                </div>
                <div className="text-xs text-gray-500 ml-1">*ƏDV: 18%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 pt-4 border-t border-dashed">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cəmi:</span>
            <span className="font-semibold text-gray-900">{receipt.total.toFixed(2)} ₼</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">*ƏDV 18%:</span>
            <span className="text-emerald-600 font-semibold">{receipt.totalVat.toFixed(2)} ₼</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">*Toplam vergi:</span>
            <span className="text-gray-900 font-semibold">{receipt.totalVat.toFixed(2)} ₼</span>
          </div>
        </div>
      </Card>

      <Button
        onClick={onClose}
        size="lg"
        className="w-full h-14 text-lg font-semibold rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white"
      >
        Add to Dashboard
      </Button>
    </div>
  )
}
