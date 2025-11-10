import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount } = req.body || {};

  const donationAmount = Number(amount) || 0;

  if (!donationAmount || donationAmount < 1) {
    return res.status(400).json({ error: 'Invalid donation amount' });
  }

  try {
    const origin = req.headers.origin || `http://${req.headers.host}` || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to Vidhatha Society',
            },
            unit_amount: Math.round(donationAmount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate/cancel`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Stripe session error:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
