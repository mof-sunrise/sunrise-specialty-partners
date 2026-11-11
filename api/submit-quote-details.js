export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, address, headcount, restrooms, kitchen, depth, budget, notes } = req.body;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const RESEND_KEY   = process.env.RESEND_KEY;

  if (!email) return res.status(400).json({ error: 'Email is required to match the original request' });

  // 1. Update the existing row in Supabase (match on email, update most recent).
  //    If this fails, or no matching lead exists (for example, step 1 could not be
  //    saved), keep going: the details are still emailed to Morgan.
  //    status: 'updated' | 'no-match' | 'failed'
  let status = 'failed';
  try {
    const dbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/quote_requests?email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=1`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ address, headcount, restrooms, kitchen, depth, budget, notes })
      }
    );
    if (dbRes.ok) {
      const rows = await dbRes.json().catch(() => null);
      status = Array.isArray(rows) && rows.length === 0 ? 'no-match' : 'updated';
    } else {
      console.error('Supabase update failed', dbRes.status, await dbRes.text().catch(() => ''));
    }
  } catch (err) {
    console.error('Supabase request failed', err);
  }
  const saved = status === 'updated';

  const note = {
    updated: `<p style="color:#444;margin-bottom:16px;">The lead <strong>${email}</strong> just completed the property details form. Their quote_requests row has been updated.</p>`,
    'no-match': `<p style="background:#FDECEA;border:1px solid #F5C2BC;color:#8A1F11;border-radius:8px;padding:12px 16px;margin:0 0 16px;font-size:14px;line-height:1.5;"><strong>Not saved to the database.</strong> No quote_requests row matches <strong>${email}</strong>, so step 1 was probably not saved. Add the lead and these details by hand.</p>`,
    failed: `<p style="background:#FDECEA;border:1px solid #F5C2BC;color:#8A1F11;border-radius:8px;padding:12px 16px;margin:0 0 16px;font-size:14px;line-height:1.5;"><strong>Not saved to the database.</strong> Supabase could not be reached (the project may be paused). Add these details to the lead for <strong>${email}</strong> by hand.</p>`
  }[status];

  // 2. Notification email to Morgan with the additional details
  let notified = false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'Sunrise Site <morgan@sunrisespecialtypartners.com>',
        to: 'mof@sunrisespecialtypartners.com',
        subject: `${saved ? '' : '[Not saved to database] '}Property details added: ${email}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#006D77;">Step 2 Details Submitted</h2>
            ${note}
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
    notified = r.ok;
    if (!notified) console.error('Resend error', r.status, await r.text().catch(() => ''));
  } catch (err) {
    console.error('Resend request failed', err);
  }

  // The details are lost only if they were neither saved nor emailed to Morgan.
  if (!saved && !notified) return res.status(500).json({ error: 'Details could not be saved or emailed' });
  return res.status(200).json({ success: true, saved, notified });
}
