export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, zip, office_size, frequency, contact_preference } = req.body;

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
      body: JSON.stringify({ name, email, phone, zip, office_size, frequency, contact_preference })
    });
    if (!dbRes.ok) throw new Error('Supabase error');

    // 2. Confirmation email to submitter
    const firstName = name.split(' ')[0];
    const contactMethodText = contact_preference === 'phone'
      ? `I'll give you a quick call at <strong>${phone}</strong> from <strong>(650) 722-4998</strong> to learn a bit more about your space.`
      : contact_preference === 'email'
      ? `I'll send over your proposals by email. If I need to clarify anything about your space, I'll reach out to <strong>${email}</strong> first.`
      : `I'll reach out shortly to learn a bit more about your space, then match you with providers who will each submit competing proposals.`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'Morgan Olson-Fabbro <morgan@sunrisespecialtypartners.com>',
        to: email,
        subject: `Your quote request is in, ${firstName}`,
        html: `
          <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#FAFAF7;border-radius:16px;overflow:hidden;">
            <div style="background:#0D6E6E;padding:32px 40px;">
              <p style="color:#FFBF00;font-size:22px;font-weight:600;margin:0;">Sunrise Specialty Partners</p>
            </div>
            <div style="padding:40px;">
              <h1 style="font-size:26px;color:#111;margin:0 0 16px;">You're all set, ${firstName}!</h1>
              <p style="color:#444;line-height:1.7;margin:0 0 12px;">Thank you for reaching out to Sunrise Specialty Partners.</p>
              <p style="color:#444;line-height:1.7;margin:0 0 24px;">I completely understand the hesitation of submitting contact info. I promise to respect that trust and keep things simple.</p>
              <div style="background:#f0f9f9;border-left:3px solid #0D6E6E;border-radius:8px;padding:20px 24px;margin:0 0 24px;">
                <p style="margin:0 0 6px;font-weight:600;color:#111;">What happens next</p>
                <p style="margin:0;color:#444;line-height:1.7;">${contactMethodText} Expect your competing proposals within 48 hours.</p>
              </div>
              <p style="color:#444;line-height:1.7;margin:0 0 24px;">In the meantime, if you have any questions, feel free to reply to this email or call me directly.</p>
              <hr style="border:none;border-top:1px solid #E5E5E0;margin:32px 0;" />
              <p style="color:#888;font-size:13px;margin:0;">Morgan Olson-Fabbro<br/>Founder, Sunrise Specialty Partners<br/>morgan@sunrisespecialtypartners.com · (650) 722-4998</p>
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
        subject: `New quote request: ${name}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <h2 style="color:#0D6E6E;">New Quote Request</h2>
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:8px 0;color:#888;width:140px;">Name</td><td style="padding:8px 0;color:#111;font-weight:500;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;color:#111;">${email}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Phone</td><td style="padding:8px 0;color:#111;">${phone}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">ZIP Code</td><td style="padding:8px 0;color:#111;">${zip || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Office Size</td><td style="padding:8px 0;color:#111;">${office_size || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Frequency</td><td style="padding:8px 0;color:#111;">${frequency || 'Not provided'}</td></tr>
              <tr><td style="padding:8px 0;color:#888;">Contact Pref</td><td style="padding:8px 0;color:#111;">${contact_preference || 'Not provided'}</td></tr>
            </table>
            <p style="color:#888;font-size:13px;margin-top:16px;">Step 2 details may follow shortly if they complete the property info form.</p>
          </div>`
      })
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
