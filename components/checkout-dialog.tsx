"use client"

import { useState } from "react"
import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"

import { format } from "date-fns"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    id: string
    name: string
    quantity: number
  } | null
  onCheckout: (itemId: string, handledBy: string, quantity: number, expectedReturnDate: string) => void
}



export function CheckoutDialog({ open, onOpenChange, item, onCheckout }: CheckoutDialogProps) {
  const { t } = useLanguage()
  const [handledBy, setHandledBy] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [checkoutDate, setCheckoutDate] = useState<Date>(new Date())
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date | undefined>(undefined)

  const handleSubmit = () => {
    if (!item || !handledBy || !expectedReturnDate || quantity <= 0) return

    onCheckout(item.id, handledBy, quantity, expectedReturnDate.toISOString())

    // Reset form
    setHandledBy("")
    setQuantity(1)
    setCheckoutDate(new Date())
    setExpectedReturnDate(undefined)
    onOpenChange(false)
  }

  const handleClose = () => {
    // Reset form when closing
    setHandledBy("")
    setQuantity(1)
    setCheckoutDate(new Date())
    setExpectedReturnDate(undefined)
    onOpenChange(false)
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("checkout")} - {item.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="item-name">{t("itemName")}</Label>
            <Input id="item-name" value={item.name} disabled className="bg-gray-50" />
          </div>

          <div>
            <Label htmlFor="handled-by">{t("handledBy")}</Label>
            <Input
              id="handled-by"
              type="text"
              value={handledBy}
              onChange={(e) => setHandledBy(e.target.value)}
              placeholder={t("enterHandlerName")}
            />
          </div>

          <div>
            <Label htmlFor="quantity">{t("quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={item.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
            />
            <p className="text-sm text-gray-500 mt-1">Available: {item.quantity}</p>
          </div>

          <div>
            <Label>{t("checkoutDate")}</Label>
            <Input
              id="checkout-date"
              type="date"
              value={format(checkoutDate, "yyyy-MM-dd")}
              onChange={(e) => setCheckoutDate(new Date(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="expected-return-date">{t("expectedReturnDate")} *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={
                    "w-full justify-start text-left font-normal " +
                    (!expectedReturnDate ? "text-muted-foreground" : "")
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expectedReturnDate ? (
                    format(expectedReturnDate, "PPP")
                  ) : (
                    <span>{t("pickADate")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expectedReturnDate}
                  onSelect={setExpectedReturnDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-[#2b4198] hover:bg-opacity-90"
              disabled={!handledBy || !expectedReturnDate || quantity <= 0 || quantity > item.quantity}
            >
              {t("checkout")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
