"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Store,
  Search,
  MessageCircle,
  Users,
  Heart,
  Zap,
  Eye,
  ArrowRight,
  Phone
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
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] transition-colors duration-500 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Déco palette Sangsé */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#A8D5BA]/20 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-[#FFD6BA]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-[#6366F1]/15 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-24">
          <BackButton />

          {/* Hero Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center space-y-12 mt-16"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="inline-flex items-center bg-gradient-to-r from-[#6366F1] to-[#A8D5BA] text-white px-6 py-2 rounded-full text-sm font-medium shadow-md">
                <Eye className="w-4 h-4 mr-2" />
                Le Google du shopping sénégalais
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#374151] to-[#6B7280] dark:from-white dark:to-gray-400 leading-tight">
                Trouve tout.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A8D5BA]">
                  Contacte direct.
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[#374151] dark:text-[#A0A0A0] max-w-4xl mx-auto leading-relaxed font-light">
                La première plateforme qui regroupe{" "}
                <strong className="font-semibold text-[#6366F1]">
                  tous les vendeurs du Sénégal
                </strong>{" "}
                en un seul endroit. Cherche, filtre, trouve, contacte.
                <br /> Simple comme bonjour.
              </p>
            </motion.div>

            {/* Étapes */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {[
                {
                  icon: Search,
                  number: "1",
                  title: "Tu cherches",
                  desc: "Filtre par prix, catégorie, localisation...",
                },
                {
                  icon: MessageCircle,
                  number: "2",
                  title: "Tu contactes",
                  desc: "Un clic et hop ! Message WhatsApp pré-écrit",
                },
                {
                  icon: Heart,
                  number: "3",
                  title: "Tu négocies",
                  desc: "Prix, livraison, rendez-vous... tu gères direct",
                },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/90 dark:bg-[#1C1C1C]/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-[#E5E7EB] relative"
                >
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-[#6366F1] to-[#A8D5BA] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                  <step.icon className="w-8 h-8 text-[#6366F1] mx-auto mb-4" />
                  <div className="text-xl font-bold text-[#374151] dark:text-[#E0E0E0] mb-2">
                    {step.title}
                  </div>
                  <div className="text-[#374151]/70 dark:text-[#A0A0A0] text-sm">
                    {step.desc}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99,102,241,0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard/add"
                  className="bg-gradient-to-r from-[#6366F1] to-[#5855d6] hover:from-[#5855d6] hover:to-[#4f46e5] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl flex items-center gap-3 transition-all"
                >
                  <Store className="w-5 h-5" />
                  Exposer mes produits gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              <Link
                href="/boutiques"
                className="text-[#6366F1] hover:text-[#5855d6] font-semibold px-6 py-3 border-2 border-[#6366F1] hover:border-[#5855d6] rounded-full transition-all flex items-center gap-2"
              >
                Commencer à chercher
                <Search className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
      {/* Le Problème/Solution */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">

        {/* Problème actuel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] dark:text-[#E0E0E0]">
            Le problème qu'on résout
          </h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Acheteur */}
            <div className="bg-[#FFF8E1] dark:bg-[#1C1C1C]/40 rounded-2xl p-8 border-l-4 border-[#F4B400]">
              <h3 className="text-2xl font-bold text-[#FB8C00] mb-4">😫 Si tu achètes...</h3>
              <ul className="space-y-3 text-[#1C1C1C]/80 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B400] mt-1">×</span>
                  Tu fouilles 50 stories Instagram pour trouver un produit
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B400] mt-1">×</span>
                  Tu écris "prix ?" et on ne te répond jamais
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B400] mt-1">×</span>
                  Tu ignores qui vend près de chez toi
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B400] mt-1">×</span>
                  Impossible de comparer les prix
                </li>
              </ul>
            </div>

            {/* Vendeur */}
            <div className="bg-[#FFF8E1] dark:bg-[#1C1C1C]/40 rounded-2xl p-8 border-l-4 border-[#F4B400]">
              <h3 className="text-2xl font-bold text-[#FB8C00] mb-4">😩 Si tu vends...</h3>
              <ul className="space-y-3 text-[#1C1C1C]/80 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B400] mt-1">×</span>
                  Tes produits se perdent dans le feed Insta
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B400] mt-1">×</span>
                  Tu répètes 100 fois les mêmes infos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B400] mt-1">×</span>
                  Seuls tes abonnés voient tes produits
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F4B400] mt-1">×</span>
                  Difficile de trouver de nouveaux clients
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Notre solution */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#1C1C1C] dark:text-[#E0E0E0]">
            Notre solution
          </h2>

          <div className="bg-gradient-to-r from-[#F4B400]/20 to-[#FB8C00]/20 rounded-3xl p-12 max-w-4xl mx-auto border border-[#F4B400]/30">
            <div className="text-6xl mb-6">💡</div>
            <h3 className="text-3xl font-bold text-[#F4B400] mb-6">
              Un catalogue géant de TOUT ce qui se vend au Sénégal
            </h3>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h4 className="font-bold text-[#1C1C1C] dark:text-[#E0E0E0] text-lg">✅ Pour les acheteurs :</h4>
                <ul className="space-y-2 text-[#1C1C1C]/70 dark:text-gray-300">
                  <li>• Compare 100 produits en 2 minutes</li>
                  <li>• Filtre par prix, zone, catégorie</li>
                  <li>• Contact direct WhatsApp</li>
                  <li>• Découvre des vendeurs près de chez toi</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-[#1C1C1C] dark:text-[#E0E0E0] text-lg">✅ Pour les vendeurs :</h4>
                <ul className="space-y-2 text-[#1C1C1C]/70 dark:text-gray-300">
                  <li>• Vitrine permanente 24h/24</li>
                  <li>• Nouveaux clients automatiquement</li>
                  <li>• Zéro gestion compliquée</li>
                  <li>• Tu gardes ton WhatsApp habituel</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  )
}
