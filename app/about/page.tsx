"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  Store,
  ShoppingBag,
  TrendingUp,
  Users,
  Heart,
  Zap,
  Shield,
  Globe,
  Star,
  ArrowRight,
  CheckCircle
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
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F6F1] via-[#FDF9F4] to-[#F5F1EC] dark:from-[#0A0A0A] dark:via-[#121212] dark:to-[#1A1A1A] transition-colors duration-500 overflow-hidden">
      {/* Hero Section avec effet parallaxe */}
      <div className="relative">
        {/* Éléments décoratifs en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#D29587]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-[#E6B8A2]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-[#D29587]/5 rounded-full blur-3xl"></div>
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
              <div className="inline-flex items-center bg-gradient-to-r from-[#D29587] to-[#E6B8A2] text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                <Zap className="w-4 h-4 mr-2" />
                La révolution du e-commerce sénégalais
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1E1E1E] to-[#4A4A4A] dark:from-[#FFFFFF] dark:to-[#B0B0B0] leading-tight">
                Transforme ton
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D29587] to-[#E6B8A2]">
                  business
                </span> en empire
              </h1>

              <p className="text-xl md:text-2xl text-[#6B6B6B] dark:text-[#A0A0A0] max-w-4xl mx-auto leading-relaxed font-light">
                Rejoins la première plateforme qui transforme les créatrices sénégalaises en entrepreneures digitales.
                <strong className="font-semibold text-[#D29587]"> Plus de 10,000 vendeuses </strong>
                nous font déjà confiance.
              </p>
            </motion.div>

            {/* Stats en temps réel */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[
                { icon: Users, number: "10K+", label: "Créatrices actives" },
                { icon: ShoppingBag, number: "50K+", label: "Produits vendus" },
                { icon: TrendingUp, number: "95%", label: "Satisfaction client" }
              ].map((stat, index) => (
                <div key={index} className="bg-white/80 dark:bg-[#1C1C1C]/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
                  <stat.icon className="w-8 h-8 text-[#D29587] mx-auto mb-4" />
                  <div className="text-3xl font-bold text-[#1E1E1E] dark:text-[#E0E0E0]">{stat.number}</div>
                  <div className="text-[#6B6B6B] dark:text-[#A0A0A0] text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(210, 149, 135, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/add">
                  <a className="bg-gradient-to-r from-[#D29587] to-[#E6B8A2] hover:from-[#c37f71] hover:to-[#d4a494] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl flex items-center gap-3 transition-all duration-300">
                    <Store className="w-5 h-5" />
                    Créer ma boutique gratuitement
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Link>
              </motion.div>

              <Link href="/boutiques">
                <a className="text-[#D29587] hover:text-[#c37f71] font-semibold px-6 py-3 border-2 border-[#D29587] hover:border-[#c37f71] rounded-full transition-all duration-300 flex items-center gap-2">
                  Explorer les boutiques
                  <Globe className="w-4 h-4" />
                </a>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Success Stories avec design cards moderne */}
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-32">

        {/* Fatou's Story - Redesigned */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D29587]/20 to-transparent rounded-3xl transform rotate-3"></div>
              <Image
                src="/images/pexels-photo-5472510.jpeg"
                alt="Fatou, créatrice artisanale"
                width={600}
                height={500}
                className="relative rounded-3xl shadow-2xl object-cover"
                priority
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-[#1C1C1C] p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-bold text-[#1E1E1E] dark:text-[#E0E0E0]">4.9/5</span>
                  <span className="text-sm text-[#6B6B6B] dark:text-[#A0A0A0]">(127 avis)</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                <TrendingUp className="w-4 h-4 mr-2" />
                Success Story
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-[#1E1E1E] dark:text-[#E0E0E0]">
                De WhatsApp à
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D29587] to-[#E6B8A2]"> 50 000 FCFA/mois</span>
              </h2>

              <div className="space-y-4 text-[#6B6B6B] dark:text-[#A0A0A0] text-lg leading-relaxed">
                <p>
                  <strong className="text-[#D29587]">Fatou</strong> fabriquait de magnifiques savons artisanaux depuis sa cuisine.
                  Bloquée par les DM perdus et les paiements compliqués, elle gagnait à peine de quoi couvrir ses matières premières.
                </p>
                <p>
                  En 3 mois sur notre plateforme, elle a multiplié son chiffre d'affaires par 8 et livre maintenant dans tout Dakar.
                  <strong className="text-green-600"> Sa boutique génère aujourd'hui plus que son ancien salaire.</strong>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">+800% de revenus</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">127 clientes fidèles</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Zahra's Story - Redesigned */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="inline-flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                <Heart className="w-4 h-4 mr-2" />
                Customer Love
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-[#1E1E1E] dark:text-[#E0E0E0]">
                Fini les
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"> "prix ?" </span>
                sans réponse
              </h2>

              <div className="space-y-4 text-[#6B6B6B] dark:text-[#A0A0A0] text-lg leading-relaxed">
                <p>
                  <strong className="text-purple-500">Zahra</strong> passait des heures à chercher le hijab parfait sur Instagram.
                  Stories floues, prix cachés, vendeurs qui ne répondent pas...
                </p>
                <p>
                  Maintenant, elle compare 50 boutiques en 5 minutes, lit les vrais avis,
                  et reçoit ses commandes en 24h chrono.
                  <strong className="text-purple-500"> "C'est devenu un plaisir de faire du shopping !"</strong>
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl border-l-4 border-purple-500">
                <p className="italic text-[#6B6B6B] dark:text-[#A0A0A0]">
                  "Avant je perdais 2h pour acheter un hijab. Maintenant, je trouve 10 options en 5 minutes et je commande directement.
                  Cette plateforme a changé ma façon de faire du shopping !"
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">- Zahra M., Cliente depuis 8 mois</span>
                </div>
              </div>
            </div>

            <div className="relative order-1 md:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-3xl transform -rotate-3"></div>
              <Image
                src="/images/pexels-photo-6694860.jpeg"
                alt="Zahra, cliente satisfaite"
                width={600}
                height={500}
                className="relative rounded-3xl shadow-2xl object-cover"
                priority
              />
              <div className="absolute -top-6 -left-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-xl">
                <div className="text-2xl font-bold">24h</div>
                <div className="text-sm opacity-90">Livraison express</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vision Section avec design futuriste */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-12 relative py-24"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#D29587]/5 via-transparent to-[#E6B8A2]/5 rounded-3xl"></div>

          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center bg-gradient-to-r from-[#D29587] to-[#E6B8A2] text-white px-6 py-3 rounded-full text-base font-semibold shadow-lg">
              <Globe className="w-5 h-5 mr-2" />
              Notre Vision
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-[#1E1E1E] dark:text-[#E0E0E0] max-w-4xl mx-auto leading-tight">
              Faire du Sénégal la
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D29587] to-[#E6B8A2]">
                Silicon Valley
              </span> de l'Afrique de l'Ouest
            </h2>

            <p className="text-xl text-[#6B6B6B] dark:text-[#A0A0A0] max-w-3xl mx-auto leading-relaxed">
              Chaque créatrice sénégalaise mérite d'avoir accès aux mêmes outils que les plus grandes marques mondiales.
              <strong className="text-[#D29587]"> Nous démocratisons le e-commerce</strong> pour que le talent soit la seule limite au succès.
            </p>

            {/* Pourquoi nous choisir - Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
              {[
                {
                  icon: Shield,
                  title: "Paiements Sécurisés",
                  desc: "Orange Money, Wave, virements - tous vos moyens de paiement préférés"
                },
                {
                  icon: Zap,
                  title: "Setup en 5 minutes",
                  desc: "Pas besoin d'être développeuse. Notre interface est si simple que ta grand-mère pourrait l'utiliser"
                },
                {
                  icon: TrendingUp,
                  title: "Growth garantie",
                  desc: "Nos vendeurs voient en moyenne +300% d'augmentation de leurs ventes en 3 mois"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/80 dark:bg-[#1C1C1C]/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 hover:border-[#D29587]/30 transition-all duration-300"
                >
                  <feature.icon className="w-12 h-12 text-[#D29587] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#1E1E1E] dark:text-[#E0E0E0] mb-3">{feature.title}</h3>
                  <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section modernisée */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E1E1E] dark:text-[#E0E0E0] mb-4">
              Questions fréquentes
            </h2>
            <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-lg">
              Tout ce que tu dois savoir avant de te lancer
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              {
                question: "Est-ce vraiment gratuit de créer ma boutique ?",
                answer: "Oui, 100% gratuit ! Tu peux créer ta boutique, ajouter tes produits et commencer à vendre sans payer un centime. Nous prenons seulement une petite commission (3%) sur tes ventes pour maintenir la plateforme."
              },
              {
                question: "Comment mes clients peuvent-ils payer ?",
                answer: "Orange Money, Wave, virements bancaires, espèces à la livraison... Tous les moyens de paiement populaires au Sénégal sont acceptés. Tes clients choisissent ce qui leur convient."
              },
              {
                question: "Qui peut vendre sur la plateforme ?",
                answer: "Toute personne basée au Sénégal ! Que tu vendes des vêtements, de l'artisanat, de la nourriture, des services... Si c'est légal, tu peux le vendre chez nous."
              },
              {
                question: "Comment je récupère mon argent ?",
                answer: "Dès qu'une vente est confirmée, l'argent est transféré sur ton compte Orange Money ou Wave en moins de 24h. Simple, rapide, sécurisé."
              }
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 dark:border-gray-700">
                <AccordionTrigger className="text-left text-[#1E1E1E] dark:text-[#E0E0E0] font-semibold hover:text-[#D29587] transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#6B6B6B] dark:text-[#A0A0A0] leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Final CTA avec urgence */}
        <motion.div
          whileInView={{ scale: [0.9, 1.02, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-[#D29587] to-[#E6B8A2] rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Prête à rejoindre les 10,000 créatrices qui ont déjà transformé leur passion en business ?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Créer ta boutique prend moins de temps que de faire du ataya.
              <strong> Et c'est 100% gratuit.</strong>
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link href="/dashboard/add">
                <a className="bg-white text-[#D29587] px-10 py-5 rounded-full text-xl font-bold shadow-xl flex items-center gap-3 hover:shadow-2xl transition-all duration-300">
                  <Store className="w-6 h-6" />
                  Je lance ma boutique maintenant
                  <ArrowRight className="w-6 h-6" />
                </a>
              </Link>
            </motion.div>

            <div className="text-white/80 text-sm">
              ⚡ Setup en moins de 5 minutes • 🎯 Première vente sous 48h • 💰 Commission seulement sur les ventes
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}