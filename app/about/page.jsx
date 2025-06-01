"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Store, ShoppingBag, Smile } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
                        Hey ! Moi c&apos;est <strong>Mamadou</strong>, étudiant en maths à l&apos;UCAD 📚.<br/>
                        À la base, je résous des équations, pas des bugs 😅. Et pourtant, voilà que je code une marketplace pour VOUS 💻✨.<br/><br/>
                        Pourquoi ? Parce que j&apos;en avais marre de voir des vendeuses talentueuses galérer à vendre sur Insta ou WhatsApp. Parce que j&apos;ai vu des clientes abandonner leurs paniers à cause des DM sans réponse.<br/><br/>
                        C&apos;est pour ça que j&apos;ai créé <strong>Jayma</strong> ❤️. Pour toi. Pour ton business. Pour te simplifier la vie, comme une vraie copine ✨.
                    </p>

                    <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                        <Link href="/dashboard/add">
                            <button className="bg-[#D29587] hover:bg-[#c37f71] text-white px-6 py-3 rounded-full text-lg shadow-md flex items-center gap-2">
                                <Store className="w-5 h-5" />
                                Créer ma boutique maintenant
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Ce que Jayma t&apos;apporte */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto space-y-6"
                >
                    <h2 className="text-3xl font-extrabold text-[#1E1E1E]">Pourquoi vendre sur Jayma ? 🛍️</h2>
                    <p className="text-[#6B6B6B] text-base leading-relaxed">
                        ✅ Ta boutique prête en 3 minutes. <br/>
                        ✅ Tes clientes commandent direct via WhatsApp, sans stress. <br/>
                        ✅ Tu es visible partout, même au-delà de ton quartier. <br/>
                        ✅ Tu n&apos;as rien à payer. Zéro frais. Zéro commission. <br/>
                        ✅ Et surtout : tu es libre. Tu gères tes ventes à ta façon 🫶
                    </p>
                </motion.div>

                {/* FAQ vendeur */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto"
                >
                    <h2 className="text-2xl font-bold text-center text-[#1E1E1E] mb-6">Questions fréquentes 🤔</h2>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Est-ce que c&apos;est vraiment gratuit ?</AccordionTrigger>
                            <AccordionContent>
                                Oui, totalement 🙌. Tu ouvres ta boutique sans payer 1 franc. Zéro frais caché. Zéro commission. C&apos;est ton argent, à 100%.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Et si personne ne connaît Jayma ?</AccordionTrigger>
                            <AccordionContent>
                                C&apos;est normal, c&apos;est tout nouveau 🌱. Mais justement : tu fais partie des premières, celles qui auront une longueur d&apos;avance. Et on communique fort pour faire découvrir la plateforme 🥳.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Comment mes clientes vont commander ?</AccordionTrigger>
                            <AccordionContent>
                                Facile : chaque produit a un bouton &quot;Commander sur WhatsApp&quot;. Un message est pré-rempli, elles n&apos;ont qu&apos;à cliquer. Rapide, simple, comme tu aimes 💬.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Et la livraison ?</AccordionTrigger>
                            <AccordionContent>
                                Toi tu gères comme d&apos;habitude avec ton livreur préféré (tiak tiak ou autre 🚚). Jayma ne touche pas à ça. On te laisse 100% libre.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Et si j&apos;ai un problème ?</AccordionTrigger>
                            <AccordionContent>
                                Tu m&apos;écris direct sur WhatsApp. Je suis là pour toi comme une grande sœur tech 💖.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </motion.div>

                {/* Appel à l’action final */}
                <motion.div whileHover={{ scale: 1.03 }} className="text-center">
                    <Link href="/dashboard/add">
                        <button className="bg-[#D29587] hover:bg-[#c37f71] text-white px-8 py-4 rounded-full text-xl shadow-xl flex items-center justify-center gap-3 mx-auto">
                            <ShoppingBag className="w-6 h-6" />
                            Ouvre ta boutique, yalla bismillah ! 🚀
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    )
}

