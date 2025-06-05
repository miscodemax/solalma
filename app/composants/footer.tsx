'use client'

import Link from 'next/link'
import TextLogo from './textLogo'
import { Facebook, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 w-full text-sm text-gray-600 dark:text-gray-400 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* Bloc Logo */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <TextLogo />
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Mode féminine abordable : hijabs, vêtements, soins et accessoires.
          </p>
          <div className="flex gap-4 mt-2">
            <Link href="https://instagram.com" className="hover:text-gray-800 dark:hover:text-white transition">
              <Instagram size={18} />
            </Link>
            <Link href="https://facebook.com" className="hover:text-gray-800 dark:hover:text-white transition">
              <Facebook size={18} />
            </Link>
            <Link href="/contact" className="hover:text-gray-800 dark:hover:text-white transition">
              <Mail size={18} />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-gray-900 dark:text-white font-semibold mb-3">Navigation</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-gray-900 dark:hover:text-white transition">Accueil</Link></li>
            <li><Link href="/dashboard/products" className="hover:text-gray-900 dark:hover:text-white transition">Dashboard</Link></li>
            <li><Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition">À propos</Link></li>
            <li><Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition">Contact</Link></li>
          </ul>
        </div>

        {/* Mentions légales */}
        <div>
          <h3 className="text-gray-900 dark:text-white font-semibold mb-3">Mentions légales</h3>
          <ul className="space-y-2">
            <li><Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition">Conditions générales</Link></li>
            <li><Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition">Politique de confidentialité</Link></li>
            <li><Link href="/cookies" className="hover:text-gray-900 dark:hover:text-white transition">Cookies</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-gray-900 dark:text-white font-semibold mb-3">Contact</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Une question ? <br />
            Écris-nous à{" "}
            <a href="mailto:support@ndndiaye.com" className="text-gray-700 dark:text-gray-300 hover:underline">
              support@ndndiaye.com
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} Nd.Ndiaye CORP. Tous droits réservés.
      </div>
    </footer>
  )
}
