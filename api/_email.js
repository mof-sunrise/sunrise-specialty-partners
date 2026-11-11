// ---------------------------------------------------------------------------
// Emails sent to people who request proposals.
// The leading underscore keeps Vercel from turning this file into an endpoint.
// Table layout and inline styles so the emails render consistently in Gmail,
// Outlook and Apple Mail. The logo is a PNG because most email apps do not
// show SVG.
// ---------------------------------------------------------------------------
export const SITE = 'https://www.sunrisespecialtypartners.com';

const C = { cream: '#FBF8F1', card: '#FFFFFF', line: '#E8E2D4', teal: '#006D77', deep: '#00454C', tint: '#E6F1F2', ink: '#10292D', muted: '#4B5F63', faint: '#7E9396' };
const serif = "'Instrument Serif', Georgia, 'Times New Roman', serif";
const sans = "'DM Sans', Helvetica, Arial, sans-serif";

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Subject shared by both visitor emails, so the details update lands in the
// same conversation as the confirmation in Gmail and Apple Mail.
export function visitorSubject(firstName) {
  return `Your request is in, ${firstName}`;
}

// A cream summary box listing label/value pairs. Empty values are left out.
function summaryBox(title, pairs) {
  const rows = pairs.filter(([, v]) => v && String(v).trim());
  if (!rows.length) return '';
  const body = rows.map(([label, value], i) => `
                <tr>
                  <td valign="top" style="padding:10px 16px 10px 0;${i ? `border-top:1px solid ${C.line};` : ''}font-family:${sans};font-size:14px;color:${C.muted};white-space:nowrap;">${label}</td>
                  <td align="right" valign="top" style="padding:10px 0;${i ? `border-top:1px solid ${C.line};` : ''}font-family:${sans};font-size:14px;color:${C.ink};font-weight:600;">${escapeHtml(value).replace(/\n/g, '<br />')}</td>
                </tr>`).join('');
  return `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};border-radius:12px;margin:0 0 32px;">
                <tr><td style="padding:18px 22px 8px;font-family:${sans};font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${C.faint};">${title}</td></tr>
                <tr><td style="padding:0 22px 10px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}
                  </table>
                </td></tr>
              </table>`;
}

const contactBox = `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.tint};border-radius:12px;">
                <tr>
                  <td style="padding:18px 22px;font-family:${sans};font-size:14px;line-height:1.55;color:${C.ink};">
                    Questions in the meantime? Reply to this email or call <a href="tel:+16507224998" style="color:${C.teal};font-weight:600;text-decoration:none;">(650)&nbsp;722-4998</a>.
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;border-top:1px solid ${C.line};">
                <tr>
                  <td style="padding-top:24px;">
                    <div style="font-family:${sans};font-size:15px;font-weight:600;color:${C.ink};">Morgan Olson-Fabbro</div>
                    <div style="font-family:${sans};font-size:14px;line-height:1.6;color:${C.muted};">Founder, Sunrise Specialty Partners</div>
                    <div style="font-family:${sans};font-size:14px;line-height:1.6;"><a href="mailto:morgan@sunrisespecialtypartners.com" style="color:${C.teal};text-decoration:none;">morgan@sunrisespecialtypartners.com</a></div>
                  </td>
                </tr>
              </table>`;

const contactText = [
  'Questions in the meantime? Reply to this email or call (650) 722-4998.',
  '',
  'Morgan Olson-Fabbro',
  'Founder, Sunrise Specialty Partners',
  'morgan@sunrisespecialtypartners.com',
  '',
  SITE
];

// Page shell: logo, white card, footer.
function layout({ title, preheader, eyebrow, heading, cardHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  @media (max-width: 620px) {
    .card { padding: 28px 22px !important; }
    .h1 { font-size: 30px !important; }
  }
  a { color: ${C.teal}; }
</style>
</head>
<body style="margin:0;padding:0;background:${C.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.cream};">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
    <tr>
      <td align="center" style="padding:32px 16px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">

          <tr>
            <td style="padding:0 4px 20px;">
              <a href="${SITE}" style="text-decoration:none;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle" style="padding-right:12px;"><img src="${SITE}/assets/email-mark.png" width="40" height="40" alt="Sunrise" style="display:block;border:0;width:40px;height:40px;" /></td>
                    <td valign="middle">
                      <div style="font-family:${serif};font-size:24px;line-height:1;color:${C.teal};">Sunrise</div>
                      <div style="font-family:${sans};font-size:12px;font-weight:600;line-height:1.4;color:${C.deep};">Specialty Partners</div>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>

          <tr>
            <td class="card" style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:40px 44px;">
              <div style="font-family:${sans};font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:${C.teal};margin:0 0 12px;">${eyebrow}</div>
              <h1 class="h1" style="margin:0 0 16px;font-family:${serif};font-weight:400;font-size:36px;line-height:1.1;color:${C.ink};">${heading}</h1>
${cardHtml}
${contactBox}
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 12px 0;font-family:${sans};font-size:12px;line-height:1.6;color:${C.faint};">
              Sunrise Specialty Partners &middot; Office cleaning across the San Francisco Bay Area<br />
              <a href="${SITE}" style="color:${C.faint};">sunrisespecialtypartners.com</a><br />
              You're receiving this because you requested cleaning proposals on our website.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const p = (text, bottom = 28) => `              <p style="margin:0 0 ${bottom}px;font-family:${sans};font-size:16px;line-height:1.6;color:${C.muted};">${text}</p>`;

// 1. Sent right after the first form.
export function buildConfirmationEmail({ firstName, office_size, frequency, zip }) {
  const name = escapeHtml(firstName);
  const details = [['Office size', office_size], ['Cleaning frequency', frequency], ['ZIP code', zip]];
  const steps = [
    ['We review your request', "I'll reach out shortly to confirm a few details about your space."],
    ['Vetted providers send proposals', 'Every provider has met our standards before they can bid on your office.'],
    ['You compare and choose', 'Pick the proposal that fits. Service can be ready within 48 hours.']
  ];
  const stepRows = steps.map(([title, body], i) => {
    const last = i === steps.length - 1;
    return `
                <tr>
                  <td width="40" valign="top" style="padding:0 0 ${last ? 0 : 20}px;">
                    <div style="width:28px;height:28px;line-height:28px;border-radius:14px;background:${last ? '#FFBF00' : C.teal};color:${last ? C.ink : '#FFFFFF'};font-family:${sans};font-size:13px;font-weight:700;text-align:center;">${i + 1}</div>
                  </td>
                  <td valign="top" style="padding:3px 0 ${last ? 0 : 20}px;">
                    <div style="font-family:${sans};font-size:15px;font-weight:600;color:${C.ink};margin:0 0 3px;">${title}</div>
                    <div style="font-family:${sans};font-size:14px;line-height:1.55;color:${C.muted};">${body}</div>
                  </td>
                </tr>`;
  }).join('');
  const intro = "Thanks for asking us to find a cleaner for your office. Vetted Bay Area providers will compete for it, and you pick the one that fits. It's free to compare and there's no contract.";

  const html = layout({
    title: 'Your request is in',
    preheader: `Thanks, ${name}. Here's what happens next with your office cleaning proposals.`,
    eyebrow: 'Request received',
    heading: `You're all set, ${name}.`,
    cardHtml: `${p(intro)}
${summaryBox('Your request', details)}
              <div style="font-family:${serif};font-size:24px;line-height:1.2;color:${C.ink};margin:0 0 18px;">What happens next</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">${stepRows}
              </table>`
  });

  const filled = details.filter(([, v]) => v && String(v).trim());
  const text = [
    `You're all set, ${firstName}.`, '', intro,
    ...(filled.length ? ['', 'YOUR REQUEST', ...filled.map(([l, v]) => `${l}: ${v}`)] : []),
    '', 'WHAT HAPPENS NEXT', ...steps.map(([t, b], i) => `${i + 1}. ${t}. ${b}`),
    '', ...contactText
  ].join('\n');

  return { html, text };
}

// 2. Sent in the same conversation when they add the property details.
export function buildDetailsEmail({ firstName, address, headcount, restrooms, kitchen, depth, budget, notes }) {
  const name = escapeHtml(firstName);
  const details = [
    ['Address', address], ['Headcount', headcount], ['Restrooms', restrooms], ['Kitchen / break room', kitchen],
    ['Cleaning depth', depth], ['Budget', budget], ['Notes', notes]
  ];
  const intro = "We've added these to your request. Providers use them to price your exact space, so your proposals will be closer to the real cost.";

  const html = layout({
    title: 'Details added to your request',
    preheader: `We've added your office details, ${name}. Here's what we have.`,
    eyebrow: 'Details added',
    heading: `Thanks, ${name}. That helps.`,
    cardHtml: `${p(intro)}
${summaryBox('Your office details', details)}`
  });

  const filled = details.filter(([, v]) => v && String(v).trim());
  const text = [
    `Thanks, ${firstName}. That helps.`, '', intro,
    ...(filled.length ? ['', 'YOUR OFFICE DETAILS', ...filled.map(([l, v]) => `${l}: ${v}`)] : []),
    '', ...contactText
  ].join('\n');

  return { html, text, hasDetails: filled.length > 0 };
}
