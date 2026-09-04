import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

const SUBJECTS = [
  'General Feedback',
  'Bug Report',
  'Feature Request',
  'Player / Club Data Issue',
  'Other',
];

export default function ContactPage() {
  const { dark } = useTheme();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [errors,  setErrors]  = useState({});
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [sendErr, setSendErr] = useState('');

  const t1  = dark ? 'text-white'    : 'text-gray-900';
  const t3  = dark ? 'text-gray-400' : 'text-gray-500';
  const bg1 = dark ? 'bg-[#1a1a1a]'  : 'bg-white';
  const bg2 = dark ? 'bg-[#222]'     : 'bg-gray-50';
  const inp = `w-full px-3 py-2.5 rounded-lg text-[0.75rem] border outline-none transition-colors ${
    dark
      ? 'bg-[#2a2a2a] border-white/10 text-white placeholder-gray-600 focus:border-[#cc0000]'
      : 'bg-gray-50 border-black/10 text-gray-900 placeholder-gray-400 focus:border-[#cc0000]'
  }`;

  const validate = () => {
    const e = {};
    if (!form.name.trim())                        e.name    = 'Name is required';
    if (!form.email.trim())                       e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))   e.email   = 'Invalid email';
    if (!form.message.trim())                     e.message = 'Message is required';
    else if (form.message.trim().length < 10)     e.message = 'Message too short (min 10 chars)';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSending(true);
    setSendErr('');

    // Check if EmailJS is configured
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      // EmailJS not configured — show instructions
      setSendErr('EmailJS not configured yet. See setup instructions above the form.');
      setSending(false);
      return;
    }

    try {
      // Dynamically load EmailJS SDK
      const emailjs = await import('@emailjs/browser');

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          subject:    form.subject,
          message:    form.message,
          reply_to:   form.email,
        },
        EMAILJS_PUBLIC_KEY
      );

      setSent(true);
      setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
    } catch (err) {
      console.error('EmailJS error:', err);
      setSendErr('Failed to send. Please try again or email us directly.');
    }

    setSending(false);
  };

  return (
    <div className="flex-1 p-4 max-w-2xl mx-auto w-full">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className={`inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded border mb-6 transition-all ${
          dark ? 'text-white bg-[#222] border-white/10 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]'
               : 'text-gray-700 bg-gray-100 border-black/10 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]'
        }`}
      >← Back</button>

      <h1 className={`text-2xl font-black uppercase tracking-tight mb-1 ${t1}`}>
        Contact <span className="text-[#cc0000]">Us</span>
      </h1>
      <p className={`text-[0.72rem] mb-6 ${t3}`}>
        Have feedback, found a bug or want a feature? We'd love to hear from you.
      </p>

      {/* Success state */}
      {sent ? (
        <div className={`rounded-xl p-8 text-center ${bg1}`}>
          <p className="text-5xl mb-4">✅</p>
          <p className={`text-[0.9rem] font-black uppercase tracking-wide mb-2 ${t1}`}>Message Sent!</p>
          <p className={`text-[0.72rem] mb-6 ${t3}`}>Thanks for reaching out. We'll get back to you soon.</p>
          <button
            onClick={() => setSent(false)}
            className="px-6 py-2 rounded-lg bg-[#cc0000] text-white text-[0.7rem] font-bold uppercase tracking-widest hover:bg-[#a80000] transition-colors"
          >Send Another</button>
        </div>
      ) : (
        <div className={`rounded-xl p-5 ${bg1}`}>

          {/* Name */}
          <div className="mb-4">
            <label className={`block text-[0.6rem] font-bold uppercase tracking-widest mb-1.5 ${t3}`}>Your Name *</label>
            <input
              type="text"
              placeholder="Rafik Mondal"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={inp}
            />
            {errors.name && <p className="text-[0.58rem] text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={`block text-[0.6rem] font-bold uppercase tracking-widest mb-1.5 ${t3}`}>Email Address *</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className={inp}
            />
            {errors.email && <p className="text-[0.58rem] text-red-400 mt-1">{errors.email}</p>}
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className={`block text-[0.6rem] font-bold uppercase tracking-widest mb-1.5 ${t3}`}>Subject</label>
            <select
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className={inp}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Message */}
          <div className="mb-5">
            <label className={`block text-[0.6rem] font-bold uppercase tracking-widest mb-1.5 ${t3}`}>Message *</label>
            <textarea
              rows={5}
              placeholder="Tell us what's on your mind…"
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              className={`${inp} resize-none`}
            />
            {errors.message && <p className="text-[0.58rem] text-red-400 mt-1">{errors.message}</p>}
          </div>

          {/* Error */}
          {sendErr && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-[0.65rem] text-red-400">{sendErr}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="w-full py-3 rounded-lg bg-[#cc0000] hover:bg-[#a80000] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[0.72rem] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              'Send Message'
            )}
          </button>

          <p className={`text-center text-[0.58rem] mt-3 ${t3}`}>
            Your message goes directly to our inbox via EmailJS.
          </p>
        </div>
      )}

      {/* Setup instructions (only shown if EmailJS not configured) */}
      {!EMAILJS_SERVICE_ID && (
        <div className={`rounded-xl p-4 mt-4 border-l-4 border-yellow-500 ${bg1}`}>
          <p className="text-[0.65rem] font-extrabold text-yellow-500 uppercase tracking-widest mb-2">⚙️ EmailJS Setup Required</p>
          <div className={`text-[0.65rem] leading-relaxed space-y-1 ${t3}`}>
            <p>1. Go to <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-[#cc0000] hover:underline">emailjs.com</a> → create free account</p>
            <p>2. Add Email Service (Gmail) → copy <strong className="text-yellow-400">Service ID</strong></p>
            <p>3. Create Template with variables: <code className="text-yellow-300">from_name, from_email, subject, message</code></p>
            <p>4. Copy <strong className="text-yellow-400">Template ID</strong> and <strong className="text-yellow-400">Public Key</strong></p>
            <p>5. Add to <code className="text-yellow-300">.env</code> and Vercel Environment Variables:</p>
            <div className={`rounded p-2 mt-1 font-mono text-[0.58rem] ${bg2}`}>
              <p>REACT_APP_EMAILJS_SERVICE_ID=your_service_id</p>
              <p>REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id</p>
              <p>REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
