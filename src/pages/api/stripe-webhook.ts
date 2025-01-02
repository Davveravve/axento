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
    if (!sig || !endpointSecret) throw new Error('Missing signature or endpoint secret');
    
    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      
      if (metadata?.userId && metadata?.months) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + parseInt(metadata.months));
        
        await supabase.from('subscriptions').upsert({
          user_id: metadata.userId,
          status: 'active',
          current_period_end: endDate.toISOString()
        });
      }
    }

    return new Response(JSON.stringify({ received: true }));
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 400 }
    );
  }
};