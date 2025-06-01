// app/register/page.tsx
'use client'

import SignupForm from './signupform' // ⛔️ No SSR

export default function RegisterPage() {
  return <SignupForm />
}
