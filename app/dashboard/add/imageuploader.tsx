'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ImagePlus, Loader2 } from 'lucide-react'


export default function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()


    

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
  

        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error } = await supabase.storage
            .from('product')
            .upload(filePath, file)

        if (error) {
            alert('Erreur upload : ' + error.message)
            setUploading(false)
            return
        }

        const { data } = supabase.storage.from('product').getPublicUrl(filePath)
        onUpload(data.publicUrl)
        setUploading(false)
    }


    return (
        <div className="w-full">
            <label
                htmlFor="upload-image"
                className="group cursor-pointer flex items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-[#DAD5CD] bg-[#F9F6F1] hover:bg-[#f0ece6] transition relative"
            >
                {uploading ? (
                    <Loader2 className="animate-spin w-6 h-6 text-[#D29587]" />
                ) : (
                    <div className="flex flex-col items-center text-[#A6A6A6] group-hover:text-[#D29587] transition">
                        <ImagePlus className="w-6 h-6 mb-2" />
                        <span className="text-sm font-medium">Téléverser une image</span>
                        <span className="text-xs">PNG, JPG jusqu&apos;à 5 Mo</span>
                    </div>
                )}
            </label>

            <input
                id="upload-image"
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className='hidden'
            />
        </div>
    )
}
