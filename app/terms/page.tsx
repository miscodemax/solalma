// pages/politique-de-confidentialite.tsx
// ou app/politique-de-confidentialite/page.tsx si tu utilises App Router

export default function PolitiqueConfidentialite() {
  return (
    <main style={styles.main}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <span style={styles.logoA}>Sangse</span>
            <span style={styles.logoB}>Shop</span>
          </div>
          <h1 style={styles.title}>Politique de Confidentialité</h1>
          <p style={styles.subtitle}>
            Dernière mise à jour :{" "}
            {new Date().toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>1. Introduction</h2>
            <p style={styles.text}>
              Bienvenue sur Sangse ("nous", "notre", "nos"). Nous respectons
              votre vie privée et nous nous engageons à protéger vos données
              personnelles. Cette politique de confidentialité explique comment
              nous collectons, utilisons et protégeons vos informations lorsque
              vous utilisez notre application mobile Sangse disponible sur
              Google Play Store et Apple App Store.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>2. Données collectées</h2>
            <p style={styles.text}>
              Nous collectons les types de données suivants :
            </p>

            <h3 style={styles.subTitle}>
              2.1 Données que vous nous fournissez
            </h3>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                Adresse e-mail et mot de passe lors de l'inscription
              </li>
              <li style={styles.listItem}>
                Nom d'utilisateur et photo de profil
              </li>
              <li style={styles.listItem}>
                Informations sur vos produits (titre, description, prix, photos)
              </li>
              <li style={styles.listItem}>
                Numéro WhatsApp si vous choisissez de le partager
              </li>
              <li style={styles.listItem}>
                Messages envoyés via notre système de chat
              </li>
            </ul>

            <h3 style={styles.subTitle}>
              2.2 Données collectées automatiquement
            </h3>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                Localisation géographique (uniquement avec votre autorisation
                explicite)
              </li>
              <li style={styles.listItem}>
                Token de notification push (pour les alertes)
              </li>
              <li style={styles.listItem}>
                Données d'utilisation (pages visitées, produits consultés)
              </li>
              <li style={styles.listItem}>
                Informations sur l'appareil (modèle, système d'exploitation)
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>3. Utilisation de vos données</h2>
            <p style={styles.text}>Nous utilisons vos données pour :</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                Créer et gérer votre compte utilisateur
              </li>
              <li style={styles.listItem}>
                Afficher les produits près de chez vous grâce à la
                géolocalisation
              </li>
              <li style={styles.listItem}>
                Vous permettre de communiquer avec les vendeurs
              </li>
              <li style={styles.listItem}>
                Vous envoyer des notifications pertinentes (messages, likes,
                nouveaux produits)
              </li>
              <li style={styles.listItem}>
                Améliorer notre service et personnaliser votre expérience
              </li>
              <li style={styles.listItem}>
                Assurer la sécurité de la plateforme
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>4. Partage de vos données</h2>
            <p style={styles.text}>
              Nous ne vendons jamais vos données personnelles à des tiers. Vos
              données peuvent être partagées uniquement dans les cas suivants :
            </p>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <strong>Avec les autres utilisateurs :</strong> votre nom
                d'utilisateur, photo de profil et produits sont visibles
                publiquement sur la plateforme
              </li>
              <li style={styles.listItem}>
                <strong>Avec Supabase :</strong> notre fournisseur
                d'infrastructure qui héberge nos données de manière sécurisée
              </li>
              <li style={styles.listItem}>
                <strong>Avec Expo :</strong> pour la gestion des notifications
                push
              </li>
              <li style={styles.listItem}>
                <strong>Sur exigence légale :</strong> si la loi l'exige ou pour
                protéger nos droits
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>5. Géolocalisation</h2>
            <p style={styles.text}>
              Sangse utilise votre localisation pour afficher les produits près
              de chez vous. Cette fonctionnalité est entièrement optionnelle.
              Vous pouvez refuser l'accès à votre localisation et continuer à
              utiliser l'application normalement. Nous ne stockons pas votre
              position en temps réel — votre localisation est utilisée
              uniquement au moment de la recherche pour calculer les distances.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>6. Sécurité des données</h2>
            <p style={styles.text}>
              Nous mettons en œuvre des mesures de sécurité appropriées pour
              protéger vos données contre tout accès non autorisé, modification,
              divulgation ou destruction. Vos données sont stockées sur les
              serveurs de Supabase avec chiffrement SSL. Les mots de passe sont
              hashés et jamais stockés en clair.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>7. Vos droits</h2>
            <p style={styles.text}>Vous avez le droit de :</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                Accéder à vos données personnelles
              </li>
              <li style={styles.listItem}>Corriger vos données inexactes</li>
              <li style={styles.listItem}>
                Supprimer votre compte et toutes vos données
              </li>
              <li style={styles.listItem}>
                Retirer votre consentement à tout moment
              </li>
              <li style={styles.listItem}>Exporter vos données</li>
            </ul>
            <p style={styles.text}>
              Pour exercer ces droits, contactez-nous à l'adresse ci-dessous.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>8. Suppression du compte</h2>
            <p style={styles.text}>
              Vous pouvez supprimer votre compte à tout moment depuis les
              paramètres de l'application. La suppression de votre compte
              entraîne la suppression définitive de toutes vos données
              personnelles, produits, messages et historique dans un délai de 30
              jours.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>9. Données des mineurs</h2>
            <p style={styles.text}>
              Sangse n'est pas destiné aux enfants de moins de 13 ans. Nous ne
              collectons pas sciemment de données personnelles d'enfants de
              moins de 13 ans. Si vous êtes parent et pensez que votre enfant
              nous a fourni des informations personnelles, contactez-nous
              immédiatement.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              10. Modifications de cette politique
            </h2>
            <p style={styles.text}>
              Nous pouvons mettre à jour cette politique de confidentialité
              périodiquement. Nous vous informerons de tout changement important
              via une notification dans l'application ou par e-mail. La date de
              la dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>11. Contact</h2>
            <p style={styles.text}>
              Pour toute question concernant cette politique de confidentialité
              ou vos données personnelles, contactez-nous :
            </p>
            <div style={styles.contactBox}>
              <p style={styles.contactText}>
                <strong>Sangse</strong>
              </p>
              <p style={styles.contactText}>📍 Dakar, Sénégal</p>
              <p style={styles.contactText}>📧 contact@sangse.sn</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            © {new Date().getFullYear()} Sangse. Tous droits réservés.
          </p>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    backgroundColor: "#FAFAF8",
    fontFamily: "'Georgia', serif",
  },
  container: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "0 24px 60px",
  },
  header: {
    padding: "60px 0 40px",
    borderBottom: "2px solid #F6C445",
    marginBottom: "48px",
  },
  logoRow: {
    fontSize: "28px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    marginBottom: "20px",
    fontFamily: "'Arial Black', sans-serif",
  },
  logoA: {
    color: "#1F2937",
  },
  logoB: {
    color: "#F6C445",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1C2B49",
    margin: "0 0 8px",
    lineHeight: "1.2",
  },
  subtitle: {
    fontSize: "14px",
    color: "#9CA3AF",
    margin: "0",
  },
  content: {
    color: "#374151",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1C2B49",
    marginBottom: "14px",
    paddingBottom: "8px",
    borderBottom: "1px solid #F3F4F6",
  },
  subTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#374151",
    marginTop: "16px",
    marginBottom: "10px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "1.75",
    color: "#4B5563",
    marginBottom: "12px",
  },
  list: {
    paddingLeft: "20px",
    marginBottom: "12px",
  },
  listItem: {
    fontSize: "15px",
    lineHeight: "1.75",
    color: "#4B5563",
    marginBottom: "6px",
  },
  contactBox: {
    backgroundColor: "#FEF3C7",
    borderLeft: "4px solid #F6C445",
    padding: "20px 24px",
    borderRadius: "0 12px 12px 0",
    marginTop: "16px",
  },
  contactText: {
    fontSize: "15px",
    color: "#1C2B49",
    margin: "4px 0",
    lineHeight: "1.6",
  },
  footer: {
    borderTop: "1px solid #F3F4F6",
    paddingTop: "32px",
    marginTop: "60px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "13px",
    color: "#9CA3AF",
  },
};
