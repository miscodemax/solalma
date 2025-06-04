// components/CopyButton.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Copy, Check } from "lucide-react"

export default function CopyButton({ text, platform }: { text: string; platform: string }) {
  const [copied, setCopied] = useState(false)


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast('lien copié avec succès !')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast('oups : ' + error)
    }
  }

  return (
    <Button onClick={handleCopy} variant="secondary" className="flex items-center gap-2 rounded-xl text-sm">
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {platform}
    </Button>
  )
}
