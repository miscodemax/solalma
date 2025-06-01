"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Store, ShoppingBag, Smile } from "lucide-react"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F9F6F1] py-16 px-4">
            <div className="max-w-6xl mx-auto space-y-24">

                {/* Introduction */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-6"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E1E1E]">
                        Une plateforme née d&apos;un rêve 🌱
                    </h1>
                    <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
                        Hey ! Moi c&apos;est <strong>Mamadou</strong>, étudiant en maths à l&apos;UCAD 📚.
                        À la base, je résous des équations, pas des bugs 😅. Je n&apos;ai jamais mis les pieds dans une école d&apos;informatique… et pourtant, *me voilà à coder une marketplace tout seul comme un grand* ! 💻✨
                        <br /><br />
                        Comment j&apos;en suis arrivé là ? Eh bien… un mélange de café ☕ (naan je blague, je déteste le café !), de tutoriels YouTube à 2h du matin 🌙, de beaucoup (beaaaaucoup) de galères, et d&apos;un rêve un peu fou : permettre aux créatrices sénégalaises de vendre facilement leurs merveilles 🧕🏾👜.
                        <br /><br />
                        Ce site, c&apos;est un peu comme un projet DIY (oui, comme les tutos coiffure mais en version code) : j&apos;ai tout fait à la main, avec amour, erreurs et persévérance ❤️.
                        <br /><br />
                        Donc si jamais tu croises une coquille ou un bouton un peu capricieux… sois sympa, pense au jeune mathématicien qui a troqué ses intégrales contre du JavaScript 😄.
                    </p>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-block"
                    >
                        <Link href="/dashboard/add">
                            <button className="bg-[#D29587] hover:bg-[#c37f71] text-white px-6 py-3 rounded-full text-lg shadow-md flex items-center gap-2">
                                <Store className="w-5 h-5" />
                                Créer ma boutique maintenant
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Histoire de Fatou */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row items-center gap-10"
                >
                    <Image
                        src="/images/pexels-photo-5472510.jpeg"
                        alt="Fatou vend ses produits"
                        width={500}
                        height={400}
                        className="rounded-xl shadow-md"
                    />
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-[#1E1E1E]">📦 Fatou et ses merveilles faites main</h2>
                        <p className="text-[#6B6B6B] text-base leading-relaxed">
                            Fatou, c&apos;est une vraie artiste 🎨. Chaque jour, entre deux lessives et les devoirs des enfants, elle fabrique des savons naturels, des foulards cousus main, des colliers perlés...
                        </p>
                        <p className="text-[#6B6B6B] text-base">
                            Elle poste parfois sur WhatsApp ou Instagram, mais entre les DM non lus, les clientes qui disparaissent et les livraisons manquées... elle finit souvent découragée 😞.
                        </p>
                        <p className="text-[#6B6B6B] text-base">
                            Alors on a imaginé une solution pour elle : une vraie boutique en ligne, simple, jolie et fiable. Aujourd&apos;hui, Fatou vend tranquillement depuis chez elle, et elle a même reçu sa première commande depuis Thiès 😍 !
                        </p>
                    </div>
                </motion.div>

                {/* Histoire de Zahra */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col-reverse md:flex-row items-center gap-10"
                >
                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-[#1E1E1E]">🛍️ Zahra en quête de simplicité</h2>
                        <p className="text-[#6B6B6B] text-base leading-relaxed">
                            Zahra, elle, adore les hijabs stylés. Mais pour en trouver un beau et abordable ? C&apos;est le parcours du combattant 💥.
                        </p>
                        <p className="text-[#6B6B6B] text-base">
                            Elle passe des heures à fouiller les stories Insta, à demander &quot;prix ?&quot; par DM… pour souvent finir sans réponse ou avec un article qui ne lui plaît pas vraiment 😐.
                        </p>
                        <p className="text-[#6B6B6B] text-base">
                            Depuis qu&apos;elle a découvert notre marketplace, c&apos;est fini tout ça ✨. Elle navigue, compare les styles, lit les avis, commande en 2 clics... et hop, elle reçoit son hijab préféré en 48h.
                        </p>
                    </div>
                    <Image
                        src="/images/pexels-photo-6694860.jpeg"
                        alt="Zahra fait du shopping"
                        width={500}
                        height={400}
                        className="rounded-xl shadow-md"
                    />
                </motion.div>

                {/* Vision */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl mx-auto space-y-6"
                >
                    <h2 className="text-3xl font-extrabold text-[#1E1E1E]">
                        Notre mission : vous simplifier la vie 🌍
                    </h2>
                    <p className="text-[#6B6B6B] text-base leading-relaxed">
                        Que vous soyez une créatrice comme Fatou ou une acheteuse comme Zahra, on veut vous faire gagner du temps, de l&apos;énergie et du plaisir.
                        <br />💡 Pas besoin de savoir coder. Pas besoin d&apos;avoir des moyens énormes.
                        <br />
                        Juste vous, vos produits, et nous à vos côtés.
                    </p>
                    <div className="flex justify-center">
                        <Smile className="w-10 h-10 text-[#D29587]" />
                    </div>
                </motion.div>

                {/* Appel à l’action final */}
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="text-center"
                >
                    <Link href="/dashboard/add">
                        <button className="bg-[#D29587] hover:bg-[#c37f71] text-white px-8 py-4 rounded-full text-xl shadow-xl flex items-center justify-center gap-3 mx-auto">
                            <ShoppingBag className="w-6 h-6" />
                            Lance ta boutique maintenant 🚀
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}
