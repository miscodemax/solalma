"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Store, ShoppingBag, Smile } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import BackButton from "../auth/callback/composants/back-button"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#121212] py-16 px-4 transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-24">
        <BackButton />
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1E1E1E] dark:text-[#E0E0E0]">
            Crée ta boutique. Développe ta visibilité. 📱
          </h1>

          <p className="text-lg text-[#6B6B6B] dark:text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed">
            Tu vends déjà sur WhatsApp, Instagram ou Snapchat ? Alors cette plateforme est faite pour toi.
            <br /><br />
            Ici, tu peux créer ta boutique en quelques clics, regrouper tous tes produits sur une seule page professionnelle et partager le lien à ta clientèle comme un catalogue.
            <br /><br />
            Fini les albums éparpillés et les descriptions répétitives. Ta boutique est claire, jolie, et facile à consulter. Et surtout : tes clientes peuvent découvrir <strong>d’autres produits</strong> que tu proposes sans que tu aies à tout leur renvoyer à chaque fois.
            <br /><br />
            Plus tu partages ta boutique, plus la plateforme attire du monde… ce qui veut dire : plus de chances d’être découverte, même par de nouvelles clientes 👀✨.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
            <Link href="/dashboard/add" legacyBehavior>
              <a
                className="bg-[#D29587] hover:bg-[#c37f71] text-white px-6 py-3 rounded-full text-lg shadow-md flex items-center gap-2 transition-colors duration-300"
                aria-label="Créer ma boutique maintenant"
              >
                <Store className="w-5 h-5" />
                Créer ma boutique maintenant
              </a>
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
            priority
          />
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[#1E1E1E] dark:text-[#E0E0E0]">📦 Fatou et ses merveilles faites main</h2>
            <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-base leading-relaxed">
              Fatou, c&apos;est une vraie artiste 🎨. Chaque jour, entre deux lessives et les devoirs des enfants, elle fabrique des savons naturels, des foulards cousus main, des colliers perlés...
            </p>
            <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-base">
              Elle poste parfois sur WhatsApp ou Instagram, mais entre les DM non lus, les clientes qui disparaissent et les livraisons manquées... elle finit souvent découragée 😞.
            </p>
            <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-base">
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
            <h2 className="text-3xl font-bold text-[#1E1E1E] dark:text-[#E0E0E0]">🛍️ Zahra en quête de simplicité</h2>
            <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-base leading-relaxed">
              Zahra, elle, adore les hijabs stylés. Mais pour en trouver un beau et abordable ? C&apos;est le parcours du combattant 💥.
            </p>
            <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-base">
              Elle passe des heures à fouiller les stories Insta, à demander &quot;prix ?&quot; par DM… pour souvent finir sans réponse ou avec un article qui ne lui plaît pas vraiment 😐.
            </p>
            <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-base">
              Depuis qu&apos;elle a découvert notre marketplace, c&apos;est fini tout ça ✨. Elle navigue, compare les styles, lit les avis, commande en 2 clics... et hop, elle reçoit son hijab préféré en 48h.
            </p>
          </div>
          <Image
            src="/images/pexels-photo-6694860.jpeg"
            alt="Zahra fait du shopping"
            width={500}
            height={400}
            className="rounded-xl shadow-md"
            priority
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
          <h2 className="text-3xl font-extrabold text-[#1E1E1E] dark:text-[#E0E0E0]">
            Notre mission : vous simplifier la vie 🌍
          </h2>
          <p className="text-[#6B6B6B] dark:text-[#A0A0A0] text-base leading-relaxed">
            Que vous soyez une créatrice comme Fatou ou une acheteuse comme Zahra, on veut vous faire gagner du temps, de l&apos;énergie et du plaisir.
            <br />💡 Pas besoin de savoir coder. Pas besoin d&apos;avoir des moyens énormes.
            <br />
            Juste vous, vos produits, et nous à vos côtés.
          </p>
          <div className="flex justify-center">
            <Smile className="w-10 h-10 text-[#D29587]" />
          </div>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="w-full dark:bg-[#1C1C1C] dark:rounded-lg dark:shadow-lg">
            <AccordionItem value="item-1" className="dark:border-b dark:border-gray-700">
              <AccordionTrigger className="dark:text-[#E0E0E0]">Pourquoi avoir créé cette marketplace ?</AccordionTrigger>
              <AccordionContent className="dark:text-[#A0A0A0]">
                Pour aider les créatrices comme Fatou à vendre facilement sans connaissances techniques, et pour permettre aux acheteuses comme Zahra de trouver rapidement ce qu'elles cherchent.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="dark:border-b dark:border-gray-700">
              <AccordionTrigger className="dark:text-[#E0E0E0]">Qui peut vendre ici ?</AccordionTrigger>
              <AccordionContent className="dark:text-[#A0A0A0]">
                Toute personne basée au Sénégal, en particulier les femmes entrepreneures qui veulent une vitrine simple et efficace.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="dark:border-b dark:border-gray-700">
              <AccordionTrigger className="dark:text-[#E0E0E0]">Combien ça coûte ?</AccordionTrigger>
              <AccordionContent className="dark:text-[#A0A0A0]">
                L'inscription est gratuite ! Des frais légers peuvent s'appliquer sur chaque vente pour maintenir la plateforme.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Appel à l’action final */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="text-center"
        >
          <Link href="/dashboard/add" legacyBehavior>
            <a
              className="bg-[#D29587] hover:bg-[#c37f71] text-white px-8 py-4 rounded-full text-xl shadow-xl flex items-center justify-center gap-3 mx-auto transition-colors duration-300"
              aria-label="Lance ta boutique maintenant"
            >
              <ShoppingBag className="w-6 h-6" />
              Lance ta boutique maintenant 🚀
            </a>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
