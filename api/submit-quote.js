export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, company, phone, email, address, office_size, frequency, notes } = req.body;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const RESEND_KEY   = process.env.RESEND_KEY;

  try {
    // 1. Save to Supabase
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/quote_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, company, phone, email, address, office_size, frequency, notes })
    });
    if (!dbRes.ok) throw new Error('Supabase error');

    // 2. Confirmation email to submitter
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'Morgan Olson-Fabbro <morgan@sunrisespecialtypartners.com>',
        to: email,
        subject: `Your quote request is in, ${name.split(' ')[0]}`,
        html: `
          <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#FAFAF7;border-radius:16px;overflow:hidden;">
            <div style="background:#0D6E6E;padding:32px 40px;">
              <p style="color:#FFBF00;font-size:22px;font-weight:600;margin:0;">Sunrise Specialty Partners</p>
            </div>
            <div style="padding:40px;">
              <h1 style="font-size:26px;color:#111;margin:0 0 16px;">You're all set, ${name.split(' ')[0]}!</h1>
              <p style="color:#444;line-height:1.7;margin:0 0 12px;">Thank you for reaching out to Sunrise Specialty Partners.</p>
              <p style="color:#444;line-height:1.7;margin:0 0 24px;">I completely understand the hesitation of submitting contact info. I promise to respect that trust and keep things simple.</p>
              <div style="background:#f0f9f9;border-left:3px solid #0D6E6E;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
                <p style="margin:0 0 6px;font-weight:600;color:#111;">What happens next</p>
                <p style="margin:0;color:#444;line-height:1.7;">I'll call <strong>${phone}</strong> from <strong>(650) 722-4998</strong> for a quick ~5 minute call to understand your office. Then I'll match you with vetted providers who will each submit proposals within 24 hours.</p>
              </div>
              <a href="https://form.typeform.com/to/F9RJDYva" style="display:inline-block;background:#0D6E6E;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:500;font-size:15px;">Fill Out the Intake Questionnaire →</a>
              <hr style="border:none;border-top:1px solid #E5E5E0;margin:32px 0;" />
              <p style="color:#888;font-size:13px;margin:0;">Morgan Olson-Fabbro<br/>Founder · Sunrise Specialty Partners<br/>morgan@sunrisespecialtypartners.com · (650) 722-4998</p>
            </div>
          </div>`
      })
    });

    // 3. Notification email to Morgan
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'Sunrise Site <morgan@sunrisespecialtypartners.com>',
        to: 'mof@sunrisespecialtypartners.com',
        subject: `New quote request — ${name}${company ? ', ' + company : ''}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#0D6E6E;">New Quote Request</h2>
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:8px 0;color:#888;width:140px;">Name</td><td style="padding:8px 0;color:#111;font-weight:500;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Company</td><td style="padding:8px 0;color:#111;">${company || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;color:#111;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;color:#111;">${phone}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Address</td><td style="padding:8px 0;color:#111;">${address || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Office Size</td><td style="padding:8px 0;color:#111;">${office_size || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Frequency</td><td style="padding:8px 0;color:#111;">${frequency || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Notes</td><td style="padding:8px 0;color:#111;">${notes || '—'}</td></tr>
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
