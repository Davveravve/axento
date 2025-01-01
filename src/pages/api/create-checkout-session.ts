// src/pages/api/create-checkout-session.ts
import Stripe from 'stripe';
import type { APIRoute } from 'astro';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request }) => {
 const { months, userId } = await request.json();

 try {
   const session = await stripe.checkout.sessions.create({
     payment_method_types: ['card'],
     line_items: [{
       price_data: {
         currency: 'sek',
         product_data: {
           name: `${months} månaders prenumeration`,
         },
         unit_amount: 4900 * months,
       },
       quantity: 1,
     }],
     mode: 'payment',
     success_url: `${request.headers.get('origin')}/dashboard/profile?success=true`,
     cancel_url: `${request.headers.get('origin')}/dashboard/profile?canceled=true`,
     metadata: {
       userId,
       months
     }
   });

   return new Response(JSON.stringify({ url: session.url }));
 } catch (error: any) {
   return new Response(JSON.stringify({ error: error.message }), { status: 500 });
 }
};