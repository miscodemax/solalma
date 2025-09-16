import { Share2, MessageCircle, Facebook, Twitter, Mail, Copy } from "lucide-react";

export default function SocialShareButton({
    shareText,
    shareUrl,
    title = "Partager",
    className = "",
}: {
    shareText: string;
    shareUrl: string;
    title?: string;
    className?: string;
}) {
    const socialNetworks = [
        {
            name: "WhatsApp",
            icon: MessageCircle,
            color: "bg-green-500 hover:bg-green-600",
            url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        },
        {
            name: "Facebook",
            icon: Facebook,
            color: "bg-blue-600 hover:bg-blue-700",
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
            )}&quote=${encodeURIComponent(shareText)}`,
        },
        {
            name: "Twitter",
            icon: Twitter,
            color: "bg-sky-500 hover:bg-sky-600",
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `${shareText} ${shareUrl}`
            )}`,
        },
        {
            name: "Email",
            icon: Mail,
            color: "bg-gray-600 hover:bg-gray-700",
            url: `mailto:?subject=${encodeURIComponent(
                title
            )}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
        },
    ];

    return (
        <>
            {/* Bouton principal */}
            <button
                data-share-text={shareText}
                data-share-url={shareUrl}
                data-share-title={title}
                className={`bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${className}`}
            >
                <Share2 className="w-5 h-5" />
                Partager sur les réseaux
            </button>

            {/* Modal caché (fallback si pas de navigator.share) */}
            <div
                id="share-modal"
                className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
                <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">Partager</h3>
                        <button
                            id="close-modal"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {socialNetworks.map((n) => {
                            const Icon = n.icon;
                            return (
                                <a
                                    key={n.name}
                                    href={n.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${n.color} text-white p-4 rounded-xl font-medium flex items-center gap-3 transition-all hover:scale-105 active:scale-95`}
                                >
                                    <Icon size={20} />
                                    <span>{n.name}</span>
                                </a>
                            );
                        })}
                    </div>

                    <div className="border-t pt-4">
                        <button
                            id="copy-link"
                            data-copy={`${shareText} ${shareUrl}`}
                            className="w-full p-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            <Copy size={20} />
                            Copier le lien
                        </button>
                    </div>
                </div>
            </div>

            {/* Script côté client */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
          document.addEventListener("DOMContentLoaded", () => {
            const btn = document.querySelector("button[data-share-url]");
            const modal = document.getElementById("share-modal");
            const close = document.getElementById("close-modal");
            const copyBtn = document.getElementById("copy-link");

            btn?.addEventListener("click", async () => {
              const text = btn.getAttribute("data-share-text");
              const url = btn.getAttribute("data-share-url");
              const title = btn.getAttribute("data-share-title");

              if (navigator.share) {
                try {
                  await navigator.share({ title, text, url });
                  return;
                } catch (err) {
                  console.log("Partage annulé", err);
                }
              }
              modal.classList.remove("hidden");
            });

            close?.addEventListener("click", () => {
              modal.classList.add("hidden");
            });

            copyBtn?.addEventListener("click", async () => {
              try {
                const text = copyBtn.getAttribute("data-copy");
                await navigator.clipboard.writeText(text);
                copyBtn.innerText = "✔ Copié !";
                setTimeout(() => {
                  copyBtn.innerText = "Copier le lien";
                }, 2000);
              } catch (err) {
                console.error("Erreur copie", err);
              }
            });
          });
        `,
                }}
            />
        </>
    );
}
