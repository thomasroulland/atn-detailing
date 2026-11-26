import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, vehicle, message } = body

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'noreply@atndetailing.fr',
    to: process.env.RESEND_TO_EMAIL ?? 'contact@atndetailing.fr',
    subject: `Demande de devis — ${name}`,
    html: `
      <h2>Nouvelle demande de devis ATN Detailing</h2>
      <table cellpadding="8" style="border-collapse:collapse;width:100%">
        <tr><td><strong>Nom</strong></td><td>${name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        ${phone ? `<tr><td><strong>Téléphone</strong></td><td>${phone}</td></tr>` : ''}
        ${vehicle ? `<tr><td><strong>Véhicule</strong></td><td>${vehicle}</td></tr>` : ''}
        <tr><td><strong>Message</strong></td><td>${message.replace(/\n/g, '<br>')}</td></tr>
      </table>
    `,
    replyTo: email,
  })

  if (error) {
    return NextResponse.json({ error: 'Erreur envoi email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
