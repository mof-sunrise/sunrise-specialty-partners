export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, address, headcount, restrooms, kitchen, depth, budget, notes } = req.body;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const RESEND_KEY   = process.env.RESEND_KEY;

  if (!email) return res.status(400).json({ error: 'Email is required to match the original request' });

  try {
    // 1. Update the existing row in Supabase (match on email, update most recent)
    const dbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/quote_requests?email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=1`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ address, headcount, restrooms, kitchen, depth, budget, notes })
      }
    );
    if (!dbRes.ok) throw new Error('Supabase update error');

    // 2. Notification email to Morgan with the additional details
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'Sunrise Site <morgan@sunrisespecialtypartners.com>',
        to: 'mof@sunrisespecialtypartners.com',
        subject: `Property details added: ${email}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#0D6E6E;">Step 2 Details Submitted</h2>
            <p style="color:#444;margin-bottom:16px;">The lead <strong>${email}</strong> just completed the property details form. Their quote_requests row has been updated.</p>
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:8px 0;color:#888;width:140px;">Address</td><td style="padding:8px 0;color:#111;">${address || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Headcount</td><td style="padding:8px 0;color:#111;">${headcount || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Restrooms</td><td style="padding:8px 0;color:#111;">${restrooms || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Kitchen</td><td style="padding:8px 0;color:#111;">${kitchen || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Cleaning Depth</td><td style="padding:8px 0;color:#111;">${depth || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Budget</td><td style="padding:8px 0;color:#111;">${budget || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Notes</td><td style="padding:8px 0;color:#111;">${notes || 'Not provided'}</td></tr>
            </table>
          </div>`
      })
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
