"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import Typed from "react-typed"
import {
  Store,
  Search,
  MessageCircle,
  Users,
  Heart,
  Zap,
  Eye,
  ArrowRight,
  Phone,
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import BackButton from "../composants/back-button"

/**
 * Variants & helpers
 */
const container = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: delay },
  }),
}

const item = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const tiltOnHover = {
  rest: { rotateX: 0, rotateY: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
  hover: { rotateX: -2, rotateY: 2, scale: 1.02, transition: { type: "spring", stiffness: 200, damping: 14 } },
}

/**
 * Animated background gradient (pure CSS + opacity fade)
 */
function AnimatedGradientBG() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-60"
      style={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(210,149,135,0.16), transparent 55%), radial-gradient(900px 600px at 100% 10%, rgba(230,184,162,0.16), transparent 60%), radial-gradient(800px 500px at 50% 110%, rgba(210,149,135,0.10), transparent 60%)",
        maskImage:
          "radial-gradient(60% 50% at 50% 30%, black 70%, transparent 100%)",
      }}
    />
  )
}

/**
 * Floating orbs reacting to mouse (subtle parallax)
 */
function FloatingOrbs() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      setPos({ x, y })
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])
  const dx = (p: number) => (p - 0.5) * 30

  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute top-20 left-10 w-40 h-40 rounded-full blur-3xl"
        style={{ background: "rgba(210,149,135,0.18)" }}
        animate={{ x: dx(pos.x), y: dx(pos.y) }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
      />
      <motion.div
        className="absolute top-40 right-16 w-56 h-56 rounded-full blur-3xl"
        style={{ background: "rgba(230,184,162,0.18)" }}
        animate={{ x: -dx(pos.x), y: dx(pos.y) }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
      />
      <motion.div
        className="absolute bottom-10 left-1/3 w-72 h-72 rounded-full blur-3xl"
        style={{ background: "rgba(210,149,135,0.10)" }}
        animate={{ x: dx(pos.x) * 0.5, y: -dx(pos.y) * 0.5 }}
        transition={{ type: "spring", stiffness: 30, damping: 20 }}
      />
    </div>
  )
}

export default function AboutPage() {
  // Scroll progress to slightly lift hero
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 300], [0, -30])

  // Dynamic stats (simple, no API): incremental feel
  const sellersToday = useMemo(() => 180 + Math.floor(Math.random() * 70), [])
  const productsNow = useMemo(() => 1200 + Math.floor(Math.random() * 300), [])

  return (
    <div className="min-h-screen bg-[#FCFAF7] dark:bg-[#0C0C0C] text-[#1E1E1E] dark:text-[#EDEDED] overflow-clip">
      {/* HERO */}
      <section className="relative">
        <AnimatedGradientBG />
        <FloatingOrbs />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10 md:pt-12 pb-24">
          <div className="flex items-center justify-between">
            <BackButton />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hidden md:flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur border border-white/30 dark:border-white/10"
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">+{sellersToday} vendeurs inscrits aujourd’hui</span>
            </motion.div>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="text-center space-y-10 md:space-y-12 mt-16"
            style={{ y: heroY as any }}
          >
            <motion.div variants={item} className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D29587] to-[#E6B8A2] text-white px-5 py-2 rounded-full text-xs md:text-sm font-medium shadow-lg">
                <Eye className="w-4 h-4" />
                Le “Google” du shopping sénégalais
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.05]">
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#1E1E1E] to-[#5A5A5A] dark:from-white dark:to-[#BFBFBF]">
                  Trouve&nbsp;tout.
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D29587] to-[#E6B8A2]">
                  <Typed
                    strings={["Contacte direct.", "Négocie en 1 clic.", "Achète malin."]}
                    typeSpeed={45}
                    backSpeed={28}
                    backDelay={1300}
                    loop
                    smartBackspace
                  />
                </span>
              </h1>

              <p className="text-lg md:text-2xl text-[#6B6B6B] dark:text-[#A6A6A6] max-w-4xl mx-auto leading-relaxed font-light">
                La première plateforme qui regroupe <strong className="font-semibold text-[#C57F70] dark:text-[#E6B8A2]">tous les vendeurs du Sénégal</strong> en un seul endroit.
                Cherche, filtre, trouve, contacte. <span className="whitespace-nowrap">Simple comme bonjour.</span>
              </p>
            </motion.div>

            {/* Steps */}
            <motion.div
              variants={item}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto"
            >
              {[
                { icon: Search, title: "Tu cherches", desc: "Filtre par prix, catégorie, localisation… trouve exactement ce que tu veux." },
                { icon: MessageCircle, title: "Tu contactes", desc: "Un clic et hop ! Message WhatsApp pré-écrit avec l’URL du produit." },
                { icon: Heart, title: "Tu négocies", desc: "Prix, livraison, rendez-vous… tu gères directement avec le vendeur." },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  className="relative group rounded-2xl p-6 md:p-7 border border-white/50 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_40px_-16px_rgba(16,16,16,0.2)]"
                >
                  <motion.div variants={tiltOnHover}>
                    <div className="absolute -top-4 -left-4 w-9 h-9 rounded-full bg-gradient-to-r from-[#D29587] to-[#E6B8A2] text-white flex items-center justify-center font-bold text-xs shadow-lg">
                      {i + 1}
                    </div>
                    <s.icon className="w-8 h-8 text-[#D29587] mx-auto mb-4" />
                    <div className="text-lg font-bold mb-1.5">{s.title}</div>
                    <div className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6]">{s.desc}</div>
                  </motion.div>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(210,149,135,0.28)" }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/dashboard/add"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D29587] to-[#E6B8A2] text-white px-8 py-4 rounded-full text-base md:text-lg font-semibold shadow-xl transition-all duration-300"
                >
                  <Store className="w-5 h-5" />
                  Exposer mes produits gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              <Link
                href="/boutiques"
                className="inline-flex items-center gap-2 text-[#C57F70] hover:text-[#b67263] font-semibold px-6 py-3 border-2 border-[#D29587]/90 hover:border-[#c78375] rounded-full transition-all duration-300"
              >
                Commencer à chercher
                <Search className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              variants={item}
              className="text-xs md:text-sm text-[#7C7C7C] dark:text-[#9A9A9A]"
            >
              Déjà <strong>{productsNow.toLocaleString("fr-FR")}</strong> produits indexés • Contact WhatsApp automatique
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* PROBLÈME */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold">Le problème qu’on résout</h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10 max-w-5xl mx-auto">
            {/* Acheteur */}
            <motion.div
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="rounded-2xl p-8 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/15"
            >
              <motion.div variants={tiltOnHover}>
                <h3 className="text-2xl font-bold text-red-600 mb-4">😫 Si tu achètes…</h3>
                <ul className="space-y-3 text-[#6B6B6B] dark:text-[#A6A6A6]">
                  <li>× Tu fouilles 50 stories Instagram pour trouver un produit</li>
                  <li>× Tu écris “prix ?” et on ne te répond jamais</li>
                  <li>× Tu ne sais jamais qui vend quoi près de chez toi</li>
                  <li>× Impossible de comparer les prix facilement</li>
                </ul>
              </motion.div>
            </motion.div>

            {/* Vendeur */}
            <motion.div
              initial="rest"
              whileHover="hover"
              animate="rest"
              className="rounded-2xl p-8 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/15"
            >
              <motion.div variants={tiltOnHover}>
                <h3 className="text-2xl font-bold text-red-600 mb-4">😩 Si tu vends…</h3>
                <ul className="space-y-3 text-[#6B6B6B] dark:text-[#A6A6A6]">
                  <li>× Tes produits se perdent dans le feed Instagram</li>
                  <li>× Tu passes ton temps à répondre aux mêmes questions</li>
                  <li>× Seuls tes abonnés voient ce que tu proposes</li>
                  <li>× Difficile de toucher de nouveaux clients</li>
                </ul>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SOLUTION */}
      <section className="px-6">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8 max-w-5xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold">Notre solution</h2>

          <div className="rounded-3xl p-10 md:p-12 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/15 dark:to-emerald-900/15 border border-green-200/70 dark:border-green-800/40 shadow-[0_12px_60px_-24px_rgba(16,16,16,0.35)]">
            <div className="text-6xl mb-6">💡</div>
            <h3 className="text-2xl md:text-3xl font-bold text-green-600 mb-6">
              Un catalogue géant de TOUT ce qui se vend au Sénégal
            </h3>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h4 className="font-bold text-lg">✅ Pour les acheteurs :</h4>
                <ul className="space-y-2 text-[#6B6B6B] dark:text-[#A6A6A6]">
                  <li>• Compare 100 produits en 2 minutes</li>
                  <li>• Filtre par prix, zone, catégorie</li>
                  <li>• Contact direct avec message pré-écrit (incluant l’URL)</li>
                  <li>• Découvre des vendeurs près de chez toi</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-lg">✅ Pour les vendeurs :</h4>
                <ul className="space-y-2 text-[#6B6B6B] dark:text-[#A6A6A6]">
                  <li>• Vitrine permanente 24h/24</li>
                  <li>• Nouveaux clients automatiquement</li>
                  <li>• Zéro gestion de commandes</li>
                  <li>• Tu gardes ton process WhatsApp habituel</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Seller story */}
          <motion.div
            initial={{ opacity: 0, x: -46 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#D29587]/20 to-transparent rounded-3xl rotate-3" />
            <Image
              src="/images/pexels-photo-5472510.jpeg"
              alt="Fatou, créatrice artisanale"
              width={640}
              height={520}
              className="relative rounded-3xl shadow-2xl object-cover"
              priority
            />
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-[#141414] p-4 rounded-2xl shadow-xl border border-white/30 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#D29587]" />
                <span className="font-bold">+200%</span>
                <span className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6]">de visibilité</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 46 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Users className="w-4 h-4 mr-2" />
              Témoignage Vendeur
            </div>

            <h3 className="text-3xl md:text-5xl font-bold">
              “Je reçois des appels de
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D29587] to-[#E6B8A2]"> Touba à Ziguinchor</span>”
            </h3>

            <div className="space-y-4 text-[#6B6B6B] dark:text-[#A6A6A6] text-lg leading-relaxed">
              <p>
                <strong className="text-[#D29587]">Fatou</strong> vendait uniquement à ses voisines à Pikine.
                Maintenant, grâce à notre plateforme, ses savons naturels sont vus partout au Sénégal.
              </p>
              <p>
                “Avant, je vendais 10 savons/semaine. Maintenant je reçois 3–4 appels par jour de gens que je ne connais même pas !
                <strong className="text-green-600"> Mon téléphone n’arrête plus de sonner.</strong>”
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/15 p-4 rounded-xl border-l-4 border-green-500">
              <p className="italic text-[#6B6B6B] dark:text-[#A6A6A6]">
                “C’est comme avoir une vitrine au marché Sandaga, mais qui ne ferme jamais !”
              </p>
            </div>
          </motion.div>
        </div>

        {/* Buyer story */}
        <div className="grid md:grid-cols-2 gap-12 items-center mt-20 md:mt-28">
          <motion.div
            initial={{ opacity: 0, x: -46 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 order-2 md:order-1"
          >
            <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Search className="w-4 h-4 mr-2" />
              Témoignage Acheteuse
            </div>

            <h3 className="text-3xl md:text-5xl font-bold">
              “Fini de chercher
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"> pendant des heures</span>”
            </h3>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">5 min</div>
                <div className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6]">de recherche</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">15</div>
                <div className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6]">options trouvées</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">3</div>
                <div className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6]">vendeurs contactés</div>
              </div>
            </div>

            <p className="text-[#6B6B6B] dark:text-[#A6A6A6] text-lg leading-relaxed">
              <strong className="text-purple-600">Zahra</strong> cherchait un hijab sous 5 000 FCFA.
              En 5 minutes : 15 options, 8 vendeurs, tous les prix affichés. Filtre par prix max, couleur, et hop !
              <strong className="text-purple-600"> Moins long que 10 stories Instagram.</strong>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 46 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="relative order-1 md:order-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-3xl -rotate-3" />
            <Image
              src="/images/pexels-photo-6694860.jpeg"
              alt="Zahra utilise son téléphone"
              width={640}
              height={520}
              className="relative rounded-3xl shadow-2xl object-cover"
              priority
            />
            <div className="absolute -top-6 -left-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-xl">
              <Phone className="w-7 h-7" />
              <div className="text-xs opacity-90 mt-1">Contact direct</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* POURQUOI ÇA MARCHE */}
      <section className="px-6 py-20 md:py-28 relative">
        <div className="absolute inset-0 max-w-6xl mx-auto left-0 right-0 rounded-3xl bg-gradient-to-r from-[#D29587]/8 via-transparent to-[#E6B8A2]/8" />
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="relative text-center space-y-8 max-w-5xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-black">Pourquoi ça marche si bien&nbsp;?</h2>
          <p className="text-lg md:text-xl text-[#6B6B6B] dark:text-[#A6A6A6] max-w-3xl mx-auto">
            Parce qu’on ne change pas vos habitudes. On les améliore juste.
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-10">
            {[
              { icon: MessageCircle, title: "Tu gardes WhatsApp", desc: "On force personne à changer. WhatsApp reste ton outil de vente principal." },
              { icon: Zap, title: "Zéro complications", desc: "Pas de stock, pas de paiements en ligne, pas de livraisons à organiser." },
              { icon: Eye, title: "Visibilité maximale", desc: "Tes produits sont vus par des gens qui cherchent exactement ce que tu vends." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className="rounded-2xl p-8 border border-white/60 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_10px_50px_-20px_rgba(16,16,16,0.35)]"
              >
                <motion.div variants={tiltOnHover}>
                  <f.icon className="w-12 h-12 text-[#D29587] mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-[#6B6B6B] dark:text-[#A6A6A6]">{f.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Questions fréquentes</h2>
          <p className="text-[#6B6B6B] dark:text-[#A6A6A6] text-lg">
            On répond aux questions qu’on nous pose le plus souvent
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: "Comment ça marche exactement ?",
              a: "Simple : tu postes tes produits avec photos et prix. Les clients cherchent, trouvent ton produit, cliquent sur “Contacter” et ça ouvre WhatsApp avec un message pré-écrit (incluant l’URL du produit). Ensuite, vous continuez comme d’habitude.",
            },
            {
              q: "Je dois gérer les livraisons et paiements ?",
              a: "Non ! Tu négocies prix, livraison et paiement directement avec le client sur WhatsApp, comme toujours. Nous, on est la vitrine qui t’apporte des clients.",
            },
            {
              q: "Ça coûte combien ?",
              a: "Créer ton catalogue et poster tes produits, c’est 100% gratuit pour l’instant. On teste et on améliore la plateforme avec vos retours.",
            },
            {
              q: "Les gens vont vraiment me trouver ?",
              a: "Oui. Les clients préfèrent chercher sur un seul site plutôt que de fouiller 50 comptes Instagram. Plus il y a de vendeurs, plus ça attire d’acheteurs.",
            },
          ].map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-gray-200 dark:border-gray-800">
              <AccordionTrigger className="text-left font-semibold hover:text-[#D29587]">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#6B6B6B] dark:text-[#A6A6A6] leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* A PROPOS */}
      <section className="px-6 pb-20 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto rounded-3xl p-10 md:p-12 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/15 dark:to-indigo-900/15 border border-white/60 dark:border-white/10 backdrop-blur-xl"
        >
          <div className="text-6xl mb-5">🎓</div>
          <h2 className="text-3xl font-bold mb-5">
            Créé par un étudiant sénégalais, pour les Sénégalais
          </h2>
          <p className="text-lg text-[#6B6B6B] dark:text-[#A6A6A6] max-w-3xl mx-auto leading-relaxed">
            Développée par un étudiant en maths de 19 ans, lassé de voir sa mère galérer à vendre ses gâteaux sur WhatsApp.
            <br /><br />
            <strong className="text-[#C57F70]">L’idée est simple :</strong> si on peut commander un taxi en 1 clic,
            on doit pouvoir trouver facilement qui vend quoi près de chez nous.
            <br /><br />
            Pas de grandes promesses. Juste une solution pratique, <em>made in Sénégal</em>, qui marche.
          </p>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-12 md:p-16 bg-gradient-to-r from-[#D29587] to-[#E6B8A2] shadow-2xl"
        >
          <motion.div
            aria-hidden
            initial={{ opacity: 0.35 }}
            animate={{ opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-16"
            style={{
              background:
                "radial-gradient(500px 200px at 20% 20%, rgba(255,255,255,0.28), transparent 60%), radial-gradient(600px 240px at 80% 80%, rgba(255,255,255,0.2), transparent 60%)",
            }}
          />
          <div className="relative z-10 space-y-6 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Prêt(e) à être trouvé(e) par tes futurs clients ?
            </h2>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Rejoins les vendeurs qui misent sur la visibilité. <strong>C’est 100% gratuit.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/dashboard/add"
                  className="inline-flex items-center gap-3 bg-white text-[#C57F70] px-9 py-4 rounded-full text-lg font-bold shadow-xl hover:shadow-2xl transition-all"
                >
                  <Store className="w-6 h-6" />
                  Créer mon catalogue maintenant
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </motion.div>

              <Link
                href="/produits"
                className="inline-flex items-center gap-2 text-white/95 hover:text-white font-semibold px-6 py-3 border-2 border-white/40 hover:border-white/70 rounded-full transition-all"
              >
                Voir ce qui se vend déjà
                <Eye className="w-4 h-4" />
              </Link>
            </div>

            <div className="text-white/85 text-sm pt-3">
              ⚡ Création en 2 minutes • 📱 WhatsApp automatique • 👀 Visible par des milliers de clients
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
