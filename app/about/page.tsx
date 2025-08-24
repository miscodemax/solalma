"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Store,
  Search,
  MessageCircle,

  Heart,

  Eye,
  ArrowRight,

  
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import BackButton from "../composants/back-button"

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#1A1A1A] transition-colors duration-500 overflow-hidden">

      {/* Hero Section */}
      <div className="relative">
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
          <BackButton />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center space-y-12 mt-16"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="inline-flex items-center bg-gradient-to-r from-[#A8D5BA] to-[#FFD6BA] text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                <Eye className="w-4 h-4 mr-2" />
                Le Google du shopping sénégalais
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#374151] to-[#6366F1] leading-tight">
                Trouve tout.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8D5BA] to-[#FFD6BA]">
                  Contacte direct.
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[#6B6B6B] dark:text-[#A0A0A0] max-w-4xl mx-auto leading-relaxed font-light">
                La première plateforme qui regroupe <strong className="font-semibold text-[#A8D5BA]">tous les vendeurs du Sénégal</strong> en un seul endroit.
                Cherche, filtre, trouve, contacte. Simple comme bonjour.
              </p>
            </motion.div>

            {/* 3 étapes */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {[
                { icon: Search, number: "1", title: "Tu cherches", desc: "Filtre par prix, catégorie, localisation..." },
                { icon: MessageCircle, number: "2", title: "Tu contactes", desc: "Message WhatsApp pré-écrit avec toutes les infos du produit" },
                { icon: Heart, number: "3", title: "Tu négocies", desc: "Prix, livraison, rendez-vous... tu gères directement avec le vendeur" }
              ].map((step, index) => (
                <motion.div key={index} whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-2xl p-6 shadow-xl border border-[#E5E7EB] relative">
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#A8D5BA] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                  <step.icon className="w-8 h-8 text-[#A8D5BA] mx-auto mb-4" />
                  <div className="text-xl font-bold text-[#374151] dark:text-[#E0E0E0] mb-2">{step.title}</div>
                  <div className="text-[#6B6B6B] dark:text-[#A0A0A0] text-sm">{step.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/dashboard/add">
                  <a className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl flex items-center gap-3 transition-all duration-300">
                    <Store className="w-5 h-5" />
                    Exposer mes produits gratuitement
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Link>
              </motion.div>

              <Link href="/boutiques">
                <a className="text-[#6366F1] hover:text-[#4F46E5] font-semibold px-6 py-3 border-2 border-[#6366F1] hover:border-[#4F46E5] rounded-full transition-all duration-300 flex items-center gap-2">
                  Commencer à chercher
                  <Search className="w-4 h-4" />
                </a>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Problème/Solution */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">

        {/* Le problème */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#374151] dark:text-[#E0E0E0]">Le problème qu'on résout</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-[#FFD6BA]/30 dark:bg-[#A8D5BA]/20 rounded-2xl p-8 border-l-4 border-[#FFD6BA]">
              <h3 className="text-2xl font-bold text-[#A8D5BA] mb-4">😫 Si tu achètes...</h3>
              <ul className="space-y-3 text-[#6B6B6B] dark:text-[#A0A0A0]">
                <li>× Tu fouilles 50 stories Instagram pour trouver un produit</li>
                <li>× Tu écris "prix ?" et on ne te répond jamais</li>
                <li>× Tu ne sais jamais qui vend quoi près de chez toi</li>
                <li>× Impossible de comparer les prix facilement</li>
              </ul>
            </div>
            <div className="bg-[#FFD6BA]/30 dark:bg-[#A8D5BA]/20 rounded-2xl p-8 border-l-4 border-[#FFD6BA]">
              <h3 className="text-2xl font-bold text-[#A8D5BA] mb-4">😩 Si tu vends...</h3>
              <ul className="space-y-3 text-[#6B6B6B] dark:text-[#A0A0A0]">
                <li>× Tes produits se perdent dans le feed Instagram</li>
                <li>× Tu passes ton temps à répondre aux mêmes questions</li>
                <li>× Seuls tes abonnés voient ce que tu proposes</li>
                <li>× Difficile de toucher de nouveaux clients</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Notre solution */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[#374151] dark:text-[#E0E0E0]">Notre solution</h2>
          <div className="bg-gradient-to-r from-[#A8D5BA]/20 to-[#FFD6BA]/20 dark:from-[#A8D5BA]/30 dark:to-[#FFD6BA]/30 rounded-3xl p-12 max-w-4xl mx-auto border border-[#E5E7EB]">
            <div className="text-6xl mb-6">💡</div>
            <h3 className="text-3xl font-bold text-[#A8D5BA] mb-6">Un catalogue géant de TOUT ce qui se vend au Sénégal</h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h4 className="font-bold text-[#374151] dark:text-[#E0E0E0] text-lg">✅ Pour les acheteurs :</h4>
                <ul className="space-y-2 text-[#6B6B6B] dark:text-[#A0A0A0]">
                  <li>• Compare 100 produits en 2 minutes</li>
                  <li>• Filtre par prix, zone, catégorie</li>
                  <li>• Contact direct avec message pré-écrit</li>
                  <li>• Découvre des vendeurs près de chez toi</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-[#374151] dark:text-[#E0E0E0] text-lg">✅ Pour les vendeurs :</h4>
                <ul className="space-y-2 text-[#6B6B6B] dark:text-[#A0A0A0]">
                  <li>• Vitrine permanente 24h/24</li>
                  <li>• Nouveaux clients automatiquement</li>
                  <li>• Zéro gestion de commandes</li>
                  <li>• Tu gardes ton process WhatsApp habituel</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success stories */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center space-y-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#374151] dark:text-[#E0E0E0]">Ils nous font confiance</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: "Awa D.", text: "J'ai doublé mes ventes en une semaine grâce à Sangse !", avatar: "/avatars/awa.jpg" },
              { name: "Moussa K.", text: "Mes clients me trouvent plus facilement. Simple et efficace.", avatar: "/avatars/moussa.jpg" },
              { name: "Fatou S.", text: "Je peux me concentrer sur mes produits, Sangse s'occupe du reste.", avatar: "/avatars/fatou.jpg" },
            ].map((story, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} className="bg-white dark:bg-[#2A2A2A] p-6 rounded-2xl shadow-lg border border-[#E5E7EB] text-left">
                <p className="text-[#6B6B6B] dark:text-[#A0A0A0] mb-4">{story.text}</p>
                <div className="flex items-center gap-4">
                  <Image src={story.avatar} alt={story.name} width={40} height={40} className="rounded-full" />
                  <div className="font-bold text-[#374151] dark:text-[#E0E0E0]">{story.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-[#374151] dark:text-[#E0E0E0]">FAQ</h2>
          <Accordion type="single" collapsible>
            {[
              { question: "C'est gratuit ?", answer: "Oui, absolument ! Pas de commission, pas de frais cachés." },
              { question: "Comment ajouter mes produits ?", answer: "Crée un compte vendeur, ajoute tes produits avec photos et prix. C'est simple et rapide." },
              { question: "Est-ce sécurisé ?", answer: "Toutes les communications se font via WhatsApp, la plateforme ne stocke pas les données sensibles." },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-[#6366F1] dark:text-[#A8D5BA]">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-[#6B6B6B] dark:text-[#A0A0A0]">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA final */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mt-20 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-[#374151] dark:text-[#E0E0E0]">Prêt à rejoindre la révolution du shopping ?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard/add">
              <a className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                <Store className="w-5 h-5" /> Devenir vendeur
              </a>
            </Link>
            <Link href="/boutiques">
              <a className="text-[#6366F1] hover:text-[#4F46E5] font-semibold px-6 py-4 border-2 border-[#6366F1] hover:border-[#4F46E5] rounded-full transition-all duration-300 flex items-center justify-center gap-2">
                Commencer à chercher
                <Search className="w-4 h-4" />
              </a>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
