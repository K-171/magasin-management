import { useState, useEffect } from "react"
import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: {
    id: string
    name: string
    quantity: number
    category: string
  } | null
  onCheckout: (itemId: string, handledBy: string, quantity: number, expectedReturnDate?: string) => void
}

export function CheckoutDialog({ open, onOpenChange, item, onCheckout }: CheckoutDialogProps) {
  const { t } = useLanguage()
  const [handledBy, setHandledBy] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [checkoutDate, setCheckoutDate] = useState<Date>(new Date())
  const [expectedReturnDate, setExpectedReturnDate] = useState<Date | undefined>(undefined)

  useEffect(() => {
    if (item) {
      setHandledBy("")
      setQuantity(1)
      setCheckoutDate(new Date())
      setExpectedReturnDate(undefined)
    }
  }, [item])

  const handleSubmit = () => {
    if (!item || !handledBy || quantity <= 0) return

    if (item.category === "Pièce consomable") {
      onCheckout(item.id, handledBy, quantity)
    } else {
      if (!expectedReturnDate) return
      onCheckout(item.id, handledBy, quantity, expectedReturnDate.toISOString())
    }

    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  if (!item) return null

  const isConsumable = item.category === "Pièce consomable"

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

          {!isConsumable && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expected-return-date">{t("expectedReturnDate")} *</Label>
                <Input
                  id="expected-return-date"
                  type="date"
                  value={expectedReturnDate ? format(expectedReturnDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : undefined;
                    if (newDate && expectedReturnDate) {
                      newDate.setHours(expectedReturnDate.getHours());
                      newDate.setMinutes(expectedReturnDate.getMinutes());
                    }
                    setExpectedReturnDate(newDate);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="expected-return-time">{t("expectedReturnTime")} *</Label>
                <Input
                  id="expected-return-time"
                  type="time"
                  value={expectedReturnDate ? format(expectedReturnDate, "HH:mm") : ""}
                  onChange={(e) => {
                    const newTime = e.target.value;
                    if (newTime && expectedReturnDate) {
                      const [hours, minutes] = newTime.split(":").map(Number);
                      const newDate = new Date(expectedReturnDate);
                      newDate.setHours(hours);
                      newDate.setMinutes(minutes);
                      setExpectedReturnDate(newDate);
                    }
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-[#2b4198] hover:bg-opacity-90"
              disabled={
                !handledBy ||
                quantity <= 0 ||
                quantity > item.quantity ||
                (!isConsumable && !expectedReturnDate)
              }
            >
              {t("checkout")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
