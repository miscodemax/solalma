import { NextResponse } from "next/server";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!)
    ),
  });
}

export async function POST(req: Request) {
  const { token, title, body } = await req.json();

  await admin.messaging().send({
    token,
    notification: {
      title,
      body,
    },
  });

  return NextResponse.json({ success: true });
}
