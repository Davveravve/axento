import type { APIRoute } from 'astro';
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { months, userId } = await request.json();
    
    // Prissättning i öre (1 kr = 100 öre)
    const prices = {
      1: 4900,    // 49 kr
      3: 12900,   // 129 kr
      6: 24900,   // 249 kr
      12: 44900   // 449 kr
    };

    const descriptions = {
      1: '1 månad',
      3: '3 månader',
      6: '6 månader',
      12: '12 månader'
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sek',
          product_data: {
            name: 'Axento Prenumeration',
            description: descriptions[months as keyof typeof descriptions]
          },
          unit_amount: prices[months as keyof typeof prices],
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://www.axento.se/dashboard/profile?success=true`,
      cancel_url: `https://www.axento.se/dashboard/profile?canceled=true`,
      metadata: {
        userId,
        months: months.toString()
      }
    });

    return new Response(JSON.stringify({ url: session.url }));
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 400 }
    );
  }
};