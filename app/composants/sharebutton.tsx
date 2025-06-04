

export default function ShareButton({ id, children }) {
    <button
              onClick={() => {
                navigator.clipboard.writeText(`https://sangse.shop/profile/${id}`)
                alert("📎 Lien du profil copié pour TikTok !")
              }}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2"
            >
              {children}
            </button>
}