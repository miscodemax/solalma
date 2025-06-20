'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ImageUploader from '@/app/dashboard/add/imageuploader' // adapte le chemin si nécessaire

export default function UpdateProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ username: '', bio: '', avatar_url: '' })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/signin')

      const { data, error } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error(error)
      } else {
        setProfile(data)
        setPreviewUrl(data.avatar_url)
      }

      setLoading(false)
    }

    getProfile()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        bio: profile.bio,
        avatar_url: previewUrl || profile.avatar_url
      })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      console.error(error)
    } else {
      setSuccessMessage('✅ Profil mis à jour avec succès !')
      setTimeout(() => {
        router.push(`/profile/${user.id}`)
      }, 1500)
    }
  }

  const handleImageUpload = (url: string) => {
    setPreviewUrl(url)
  }

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600 animate-pulse">
        Chargement du profil...
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 dark:bg-black py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">🔧 Modifier mon profil</h1>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src={previewUrl || '/default-avatar.png'}
            alt="Avatar"
            width={100}
            height={100}
            className="rounded-full object-cover border"
          />
          <ImageUploader onUpload={handleImageUpload} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nom d’utilisateur</label>
          <input
            type="text"
            value={profile.username}
            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#D29587]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#D29587]"
            rows={4}
            placeholder="Parle-nous un peu de toi..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-[#D29587] text-white font-semibold py-3 rounded-xl hover:bg-[#c07a6b] transition disabled:opacity-60"
        >
          {saving ? '⏳ Enregistrement...' : '💾 Enregistrer'}
        </button>
      </form>

      {successMessage && (
        <div className="mt-4 text-center text-green-600 font-medium animate-fade-in">
          {successMessage}
        </div>
      )}
    </div>
  )
}
