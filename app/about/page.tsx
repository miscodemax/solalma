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
    <div className="min-h-screen bg-[#FAFAFA] dark:from-[#0A0A0A] dark:via-[#121212] dark:to-[#1A1A1A] transition-colors duration-500 overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Éléments décoratifs avec palette Sangse */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#A8D5BA]/15 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-[#FFD6BA]/15 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-[#6366F1]/10 rounded-full blur-3xl"></div>
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
              <div className="inline-flex items-center bg-gradient-to-r from-[#6366F1] to-[#A8D5BA] text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                <Eye className="w-4 h-4 mr-2" />
                Le Google du shopping sénégalais
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#374151] to-[#6B7280] dark:from-[#FFFFFF] dark:to-[#B0B0B0] leading-tight">
                Trouve tout.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A8D5BA]">
                  Contacte direct.
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[#374151] dark:text-[#A0A0A0] max-w-4xl mx-auto leading-relaxed font-light">
                La première plateforme qui regroupe <strong className="font-semibold text-[#6366F1]">tous les vendeurs du Sénégal</strong>
                en un seul endroit. Cherche, filtre, trouve, contacte.
                <br />Simple comme bonjour.
              </p>
            </motion.div>

            {/* Comment ça marche - 3 étapes avec palette Sangse */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {[
                {
                  icon: Search,
                  number: "1",
                  title: "Tu cherches",
                  desc: "Filtre par prix, catégorie, localisation... trouve exactement ce que tu veux"
                },
                {
                  icon: MessageCircle,
                  number: "2",
                  title: "Tu contactes",
                  desc: "Un clic et hop ! Message WhatsApp pré-écrit avec toutes les infos du produit"
                },
                {
                  icon: Heart,
                  number: "3",
                  title: "Tu négocies",
                  desc: "Prix, livraison, rendez-vous... tu gères directement avec le vendeur"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/90 dark:bg-[#1C1C1C]/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-[#E5E7EB] relative"
                >
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-[#6366F1] to-[#A8D5BA] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                  <step.icon className="w-8 h-8 text-[#6366F1] mx-auto mb-4" />
                  <div className="text-xl font-bold text-[#374151] dark:text-[#E0E0E0] mb-2">{step.title}</div>
                  <div className="text-[#374151]/70 dark:text-[#A0A0A0] text-sm">{step.desc}</div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons avec palette Sangse */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/add">
                  <a className="bg-gradient-to-r from-[#6366F1] to-[#5855d6] hover:from-[#5855d6] hover:to-[#4f46e5] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl flex items-center gap-3 transition-all duration-300">
                    <Store className="w-5 h-5" />
                    Exposer mes produits gratuitement
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </Link>
              </motion.div>

              <Link href="/boutiques">
                <a className="text-[#6366F1] hover:text-[#5855d6] font-semibold px-6 py-3 border-2 border-[#6366F1] hover:border-[#5855d6] rounded-full transition-all duration-300 flex items-center gap-2">
                  Commencer à chercher
                  <Search className="w-4 h-4" />
                </a>
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
          <h2 className="text-4xl md:text-5xl font-bold text-[#374151] dark:text-[#E0E0E0]">
            Le problème qu'on résout
          </h2>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Côté Acheteur */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-l-4 border-red-500">
              <h3 className="text-2xl font-bold text-red-600 mb-4">😫 Si tu achètes...</h3>
              <ul className="space-y-3 text-[#374151] dark:text-[#A0A0A0]">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">×</span>
                  Tu fouilles 50 stories Instagram pour trouver un produit
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">×</span>
                  Tu écris "prix ?" et on ne te répond jamais
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">×</span>
                  Tu ne sais jamais qui vend quoi près de chez toi
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">×</span>
                  Impossible de comparer les prix facilement
                </li>
              </ul>
            </div>

            {/* Côté Vendeur */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border-l-4 border-red-500">
              <h3 className="text-2xl font-bold text-red-600 mb-4">😩 Si tu vends...</h3>
              <ul className="space-y-3 text-[#374151] dark:text-[#A0A0A0]">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">×</span>
                  Tes produits se perdent dans le feed Instagram
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">×</span>
                  Tu passes ton temps à répondre aux mêmes questions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">×</span>
                  Seuls tes abonnés voient ce que tu proposes
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">×</span>
                  Difficile de toucher de nouveaux clients
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Notre Solution avec palette Sangse */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#374151] dark:text-[#E0E0E0]">
            Notre solution
          </h2>

          <div className="bg-gradient-to-r from-[#A8D5BA]/20 to-[#F5E6CC]/20 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-12 max-w-4xl mx-auto border border-[#A8D5BA]/30 dark:border-green-700">
            <div className="text-6xl mb-6">💡</div>
            <h3 className="text-3xl font-bold text-[#6366F1] mb-6">Un catalogue géant de TOUT ce qui se vend au Sénégal</h3>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="space-y-4">
                <h4 className="font-bold text-[#374151] dark:text-[#E0E0E0] text-lg">✅ Pour les acheteurs :</h4>
                <ul className="space-y-2 text-[#374151]/70 dark:text-[#A0A0A0]">
                  <li>• Compare 100 produits en 2 minutes</li>
                  <li>• Filtre par prix, zone, catégorie</li>
                  <li>• Contact direct avec message pré-écrit</li>
                  <li>• Découvre des vendeurs près de chez toi</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-[#374151] dark:text-[#E0E0E0] text-lg">✅ Pour les vendeurs :</h4>
                <ul className="space-y-2 text-[#374151]/70 dark:text-[#A0A0A0]">
                  <li>• Vitrine permanente 24h/24</li>
                  <li>• Nouveaux clients automatiquement</li>
                  <li>• Zéro gestion de commandes</li>
                  <li>• Tu gardes ton process WhatsApp habituel</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Success Stories avec palette Sangse */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#A8D5BA]/20 to-transparent rounded-3xl transform rotate-3"></div>
              <Image
                src="/images/pexels-photo-5472510.jpeg"
                alt="Fatou, créatrice artisanale"
                width={600}
                height={500}
                className="relative rounded-3xl shadow-2xl object-cover"
                priority
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-[#1C1C1C] p-4 rounded-2xl shadow-xl border border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#6366F1]" />
                  <span className="font-bold text-[#374151] dark:text-[#E0E0E0]">+200%</span>
                  <span className="text-sm text-[#374151]/70 dark:text-[#A0A0A0]">de visibilité</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center bg-gradient-to-r from-[#A8D5BA] to-[#6366F1] text-white px-4 py-2 rounded-full text-sm font-medium">
                <Users className="w-4 h-4 mr-2" />
                Témoignage Vendeur
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-[#374151] dark:text-[#E0E0E0]">
                "Je reçois des appels de
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A8D5BA]"> Touba à Ziguinchor</span>"
              </h2>

              <div className="space-y-4 text-[#374151]/70 dark:text-[#A0A0A0] text-lg leading-relaxed">
                <p>
                  <strong className="text-[#6366F1]">Fatou</strong> vendait uniquement à ses voisines à Pikine.
                  Maintenant, grâce à notre plateforme, ses savons naturels sont vus partout au Sénégal.
                </p>
                <p>
                  "Avant, je vendais 10 savons par semaine à mes connaissances.
                  Maintenant je reçois 3-4 appels par jour de gens que je ne connais même pas !
                  <strong className="text-[#A8D5BA]"> Mon téléphone n'arrête plus de sonner."</strong>
                </p>
              </div>

              <div className="bg-[#A8D5BA]/10 dark:bg-green-900/20 p-4 rounded-xl border-l-4 border-[#A8D5BA]">
                <p className="italic text-[#374151]/70 dark:text-[#A0A0A0]">
                  "C'est comme avoir une vitrine au marché Sandaga, mais qui ne ferme jamais !"
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <div className="inline-flex items-center bg-gradient-to-r from-[#FFD6BA] to-[#F5E6CC] text-[#374151] px-4 py-2 rounded-full text-sm font-medium border border-[#FFD6BA]/30">
                <Search className="w-4 h-4 mr-2" />
                Témoignage Acheteuse
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-[#374151] dark:text-[#E0E0E0]">
                "Fini de chercher
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD6BA] to-[#F5E6CC]"> pendant des heures</span>"
              </h2>

              <div className="space-y-4 text-[#374151]/70 dark:text-[#A0A0A0] text-lg leading-relaxed">
                <p>
                  <strong className="text-[#6366F1]">Zahra</strong> cherchait un hijab sous 5 000 FCFA.
                  En 5 minutes sur notre plateforme : 15 options, 8 vendeurs différents, tous les prix affichés.
                </p>
                <p>
                  "J'ai filtré par prix maximum, par couleur, et hop !
                  J'ai appelé 3 vendeurs, négocié, et trouvé exactement ce que je voulais.
                  <strong className="text-[#6366F1]"> Ça m'a pris moins de temps que de regarder 10 stories Instagram."</strong>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#6366F1]">5 min</div>
                  <div className="text-sm text-[#374151]/70 dark:text-[#A0A0A0]">de recherche</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#6366F1]">15</div>
                  <div className="text-sm text-[#374151]/70 dark:text-[#A0A0A0]">options trouvées</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#6366F1]">3</div>
                  <div className="text-sm text-[#374151]/70 dark:text-[#A0A0A0]">vendeurs contactés</div>
                </div>
              </div>
            </div>

            <div className="relative order-1 md:order-2">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFD6BA]/20 to-transparent rounded-3xl transform -rotate-3"></div>
              <Image
                src="/images/pexels-photo-6694860.jpeg"
                alt="Zahra utilise son téléphone"
                width={600}
                height={500}
                className="relative rounded-3xl shadow-2xl object-cover"
                priority
              />
              <div className="absolute -top-6 -left-6 bg-gradient-to-r from-[#6366F1] to-[#A8D5BA] text-white p-4 rounded-2xl shadow-xl">
                <Phone className="w-8 h-8" />
                <div className="text-xs opacity-90 mt-1">Contact direct</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pourquoi ça marche avec palette Sangse */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-12 relative py-24"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/5 via-[#A8D5BA]/5 to-[#F5E6CC]/5 rounded-3xl"></div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-[#374151] dark:text-[#E0E0E0] max-w-4xl mx-auto leading-tight">
              Pourquoi ça marche si bien ?
            </h2>

            <p className="text-xl text-[#374151]/70 dark:text-[#A0A0A0] max-w-3xl mx-auto leading-relaxed">
              Parce qu'on ne change pas vos habitudes. On les améliore juste.
            </p>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
              {[
                {
                  icon: MessageCircle,
                  title: "Tu gardes WhatsApp",
                  desc: "On force personne à changer. WhatsApp reste ton outil de vente principal."
                },
                {
                  icon: Zap,
                  title: "Zéro complications",
                  desc: "Pas de gestion de stock, pas de paiements en ligne, pas de livraisons à organiser."
                },
                {
                  icon: Eye,
                  title: "Visibilité maximale",
                  desc: "Tes produits sont vus par des milliers de personnes qui cherchent exactement ce que tu vends."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/90 dark:bg-[#1C1C1C]/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[#E5E7EB] hover:border-[#A8D5BA]/40 transition-all duration-300"
                >
                  <feature.icon className="w-12 h-12 text-[#6366F1] mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#374151] dark:text-[#E0E0E0] mb-3">{feature.title}</h3>
                  <p className="text-[#374151]/70 dark:text-[#A0A0A0] text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* FAQ avec palette Sangse */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#374151] dark:text-[#E0E0E0] mb-4">
              Questions fréquentes
            </h2>
            <p className="text-[#374151]/70 dark:text-[#A0A0A0] text-lg">
              On répond aux questions qu'on nous pose le plus souvent
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {[
              {
                question: "Comment ça marche exactement ?",
                answer: "Simple : tu postes tes produits avec photos et prix. Les clients cherchent, trouvent ton produit, cliquent sur 'Contacter' et ça ouvre WhatsApp avec un message pré-écrit. Après, vous vous débrouillez comme d'habitude."
              },
              {
                question: "Je dois gérer les livraisons et paiements ?",
                answer: "Non ! C'est justement ça qui est bien. Tu négocies prix, livraison et paiement directement avec ton client sur WhatsApp, comme tu as toujours fait. On est juste la vitrine."
              },
              {
                question: "Ça coûte combien ?",
                answer: "Créer ton catalogue et poster tes produits c'est 100% gratuit. Pour l'instant, on teste tout gratuitement pour améliorer la plateforme avec vos retours."
              },
              {
                question: "Les gens vont vraiment me trouver ?",
                answer: "Oui ! La plateforme grandit chaque jour. Les clients préfèrent chercher sur un seul site plutôt que de fouiller 50 comptes Instagram. Plus il y a de vendeurs, plus ça attire d'acheteurs."
              }
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-[#E5E7EB] dark:border-gray-700">
                <AccordionTrigger className="text-left text-[#374151] dark:text-[#E0E0E0] font-semibold hover:text-[#6366F1] transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#374151]/70 dark:text-[#A0A0A0] leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* A propos du créateur avec palette Sangse */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-[#F5E6CC]/30 to-[#FFD6BA]/20 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-12 text-center border border-[#F5E6CC]/40"
        >
          <div className="text-6xl mb-6">🎓</div>
          <h2 className="text-3xl font-bold text-[#374151] dark:text-[#E0E0E0] mb-6">
            Créé par un étudiant sénégalais, pour les Sénégalais
          </h2>
          <p className="text-lg text-[#374151]/70 dark:text-[#A0A0A0] max-w-3xl mx-auto leading-relaxed">
            Cette plateforme a été développée par un étudiant en mathématiques de 19 ans qui veut revolutionner le e-commerce sénégalais!.
            <br /><br />
            <strong className="text-[#6366F1]">L'idée est simple :</strong> si on peut commander un taxi avec une app,
            pourquoi on ne peut pas trouver facilement qui vend quoi près de chez nous ?
            <br /><br />
            Pas de grosses promesses, pas de révolution. Juste une solution pratique,
            made in Sénégal, qui marche.
          </p>
        </motion.div>

        {/* Final CTA avec palette Sangse */}
        <motion.div
          whileInView={{ scale: [0.9, 1.02, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-gradient-to-r from-[#6366F1] to-[#A8D5BA] rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Prêt(e) à être trouvé(e) par tes futurs clients ?
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Rejoins les vendeurs qui ont compris que la visibilité,
              c'est la clé du succès. <strong>Et c'est 100% gratuit.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/add">
                  <a className="bg-white text-[#6366F1] px-10 py-5 rounded-full text-xl font-bold shadow-xl flex items-center gap-3 hover:shadow-2xl transition-all duration-300">
                    <Store className="w-6 h-6" />
                    Créer mon catalogue maintenant
                    <ArrowRight className="w-6 h-6" />
                  </a>
                </Link>
              </motion.div>

              <Link href="/produits">
                <a className="text-white hover:text-white/80 font-semibold px-6 py-3 border-2 border-white/30 hover:border-white/50 rounded-full transition-all duration-300 flex items-center gap-2">
                  Voir ce qui se vend déjà
                  <Eye className="w-4 h-4" />
                </a>
              </Link>
            </div>

            <div className="text-white/80 text-sm pt-4">
              ⚡ Création en 2 minutes • 📱 Contact WhatsApp automatique • 👀 Visible par des milliers de clients
            </div>
          </div>
        </motion.div >
      </div>
    </div>

  )
}