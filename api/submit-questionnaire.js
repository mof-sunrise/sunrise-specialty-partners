export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, company, phone, email } = req.body;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;
  const RESEND_KEY   = process.env.RESEND_KEY;

  try {
    // 1. Save to Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/questionnaire_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ name, company, phone, email })
    });

    // 2. Confirmation email to submitter
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({
        from: 'Morgan Olson-Fabbro <morgan@sunrisespecialtypartners.com>',
        to: email,
        subject: `Your questionnaire is ready, ${name.split(' ')[0]} 🎉`,
        html: `
          <div style="font-family:'DM Sans',sans-serif;max-width:560px;margin:0 auto;background:#FAFAF7;border-radius:16px;overflow:hidden;">
            <div style="background:#0D6E6E;padding:32px 40px;">
              <p style="color:#FFBF00;font-size:22px;font-weight:600;margin:0;">Sunrise Specialty Partners</p>
            </div>
            <div style="padding:40px;">
              <p style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#0D6E6E;margin:0 0 12px;">Questionnaire Downloaded</p>
              <h1 style="font-size:26px;color:#111;margin:0 0 16px;">You're all set, ${name.split(' ')[0]}! 🎉</h1>
              <p style="color:#444;line-height:1.7;margin:0 0 24px;">Your employee office cleanliness questionnaire is ready to download and share with your team.</p>
              <a href="https://sunrisesp.lovable.app/Sunrise_Employee_Office_Cleanliness_Satisfaction_Questionnaire.pdf" style="display:inline-block;background:#FFBF00;color:#111;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;margin-bottom:32px;">Download the Questionnaire →</a>
              <div style="border:2px solid #FFBF00;border-radius:10px;padding:20px 24px;margin-bottom:32px;">
                <p style="margin:0 0 8px;font-weight:600;color:#111;">Ready to get a quote?</p>
                <p style="margin:0 0 16px;color:#444;line-height:1.7;">See what a better clean could look like for your office — free, no obligation.</p>
                <a href="https://form.typeform.com/to/F9RJDYva" style="color:#0D6E6E;font-weight:500;text-decoration:none;">Get matched with providers →</a>
              </div>
              <hr style="border:none;border-top:1px solid #E5E5E0;margin:0 0 24px;" />
              <p style="color:#888;font-size:13px;margin:0;">Morgan Olson-Fabbro<br/>Founder · Sunrise Specialty Partners<br/>morgan@sunrisespecialtypartners.com · (650) 722-4998</p>
            </div>
          </div>`
      })
    });

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
