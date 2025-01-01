// src/pages/api/stripe-webhook.ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
const endpointSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

const supabase = createClient(
 import.meta.env.PUBLIC_SUPABASE_URL,
 import.meta.env.SUPABASE_SERVICE_KEY
);

export const POST: APIRoute = async ({ request }) => {
 const sig = request.headers.get('stripe-signature');
 const body = await request.text();

 try {
   if (!sig) throw new Error('No signature');
   
   const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
   
   if (event.type === 'checkout.session.completed') {
     const session = event.data.object as Stripe.Checkout.Session;
     const metadata = session.metadata;
     
     if (metadata && metadata.userId && metadata.months) {
       await supabase.from('subscriptions').upsert({
         user_id: metadata.userId,
         status: 'active',
         current_period_end: new Date(Date.now() + parseInt(metadata.months) * 30 * 24 * 60 * 60 * 1000)
       });
     }
   }

   return new Response(JSON.stringify({ received: true }));
 } catch (error: any) {
   return new Response(JSON.stringify({ error: error.message }), { status: 400 });
 }
};