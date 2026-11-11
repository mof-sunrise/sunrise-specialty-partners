import { buildConfirmationEmail, visitorSubject } from './_email.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, zip, office_size, frequency, contact_preference, source } = req.body;
  const clean = (v) => String(v || '').replace(/[<>&"']/g, '').slice(0, 120);
  const sourceText = source && typeof source === 'object'
    ? ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'landing_page'].filter((k) => source[k]).map((k) => `${k.replace('utm_', '')}: ${clean(source[k])}`).join(' · ')
    : '';

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const RESEND_KEY   = process.env.RESEND_KEY;

  // Send one email through Resend. Never throws: returns true if Resend accepted it.
  const sendEmail = async (payload) => {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
        body: JSON.stringify(payload)
      });
      if (!r.ok) console.error('Resend error', r.status, await r.text().catch(() => ''));
      return r.ok;
    } catch (err) {
      console.error('Resend request failed', err);
      return false;
    }
  };

  // 1. Save to Supabase. If this fails (for example, the project is paused),
  //    keep going: both emails still go out so the lead is never lost silently.
  let saved = false;
  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/quote_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, email, phone, zip, office_size, frequency, contact_preference })
    });
    saved = dbRes.ok;
    if (!saved) console.error('Supabase insert failed', dbRes.status, await dbRes.text().catch(() => ''));
  } catch (err) {
    console.error('Supabase request failed', err);
  }

  {
    // 2. Confirmation email to submitter
    const firstName = String(name || '').trim().split(' ')[0] || 'there';
    const { html: confirmationHtml, text: confirmationText } = buildConfirmationEmail({ firstName, office_size, frequency, zip });

    const confirmation = sendEmail({
        from: 'Morgan Olson-Fabbro <morgan@sunrisespecialtypartners.com>',
        reply_to: 'morgan@sunrisespecialtypartners.com',
        to: email,
        subject: visitorSubject(firstName),
        html: confirmationHtml,
        text: confirmationText
    });

    // 3. Notification email to Morgan (flagged when the database save failed)
    const notSavedNote = saved ? '' : `
            <p style="background:#FDECEA;border:1px solid #F5C2BC;color:#8A1F11;border-radius:8px;padding:12px 16px;margin:0 0 16px;font-size:14px;line-height:1.5;"><strong>Not saved to the database.</strong> Supabase could not be reached (the project may be paused). Add this lead to the quote_requests table by hand.</p>`;
    const notification = sendEmail({
        from: 'Sunrise Site <morgan@sunrisespecialtypartners.com>',
        to: 'mof@sunrisespecialtypartners.com',
        subject: `${saved ? '' : '[Not saved to database] '}New quote request: ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#006D77;">New Quote Request</h2>${notSavedNote}
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:8px 0;color:#888;width:140px;">Name</td><td style="padding:8px 0;color:#111;font-weight:500;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;color:#111;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;color:#111;">${phone}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">ZIP Code</td><td style="padding:8px 0;color:#111;">${zip || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Office Size</td><td style="padding:8px 0;color:#111;">${office_size || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Frequency</td><td style="padding:8px 0;color:#111;">${frequency || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Source</td><td style="padding:8px 0;color:#111;">${sourceText || 'No campaign tag (direct or untagged link)'}</td></tr>
            </table>
            <p style="color:#888;font-size:13px;margin-top:16px;">Step 2 details may follow shortly if they complete the property info form.</p>
          </div>`
    });

    const [, notified] = await Promise.all([confirmation, notification]);

    // The lead is lost only if it was neither saved nor emailed to Morgan.
    if (!saved && !notified) return res.status(500).json({ error: 'Lead could not be saved or emailed' });
    return res.status(200).json({ success: true, saved, notified });
  }
}
