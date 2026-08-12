import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
  const { dark } = useTheme();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', subject: '', message: '' });
  const [sent,    setSent]    = useState(false);
  const [errors,  setErrors]  = useState({});

  const t1  = dark ? 'text-white'    : 'text-gray-900';
  const t2  = dark ? 'text-gray-300' : 'text-gray-700';
  const t3  = dark ? 'text-gray-400' : 'text-gray-500';
  const bg1 = dark ? 'bg-[#1a1a1a]'  : 'bg-white';
  const bg2 = dark ? 'bg-[#222]'     : 'bg-gray-50';

  const inputCls = `w-full rounded-lg px-3 py-2.5 text-[0.82rem] outline-none transition-colors border-[1.5px] font-sans ${
    dark
      ? 'bg-[#222] border-white/10 text-white focus:border-[#cc0000]/60 placeholder-gray-600'
      : 'bg-gray-50 border-black/10 text-gray-900 focus:border-[#cc0000]/60 placeholder-gray-400'
  }`;
  const labelCls = `block text-[0.6rem] font-bold uppercase tracking-widest mb-1.5 ${t3}`;

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.email.trim())   e.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSent(true);
  };

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const contacts = [
    { icon: '📧', label: 'Email',   value: 'hello@goalpedia.com',   sub: 'We reply within 24 hours' },
    { icon: '🐦', label: 'Twitter', value: '@goalpedia',             sub: 'Follow for updates' },
    { icon: '💼', label: 'LinkedIn',value: 'linkedin.com/goalpedia', sub: 'Business enquiries' },
  ];

  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto w-full">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className={`inline-flex items-center gap-1.5 text-[0.64rem] font-bold uppercase tracking-widest px-3 py-1.5 rounded border mb-6 transition-all ${dark ? 'text-white bg-[#222] border-white/10 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]' : 'text-gray-700 bg-gray-100 border-black/10 hover:bg-[#cc0000] hover:text-white hover:border-[#cc0000]'}`}
      >
        ← Back
      </button>

      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-black uppercase tracking-tight mb-1 ${t1}`}>Contact Us</h1>
        <p className={`text-[0.8rem] ${t3}`}>Got feedback, a bug report, or a partnership idea? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Contact cards */}
        <div className="flex flex-col gap-3">
          {contacts.map(c => (
            <div key={c.label} className={`rounded-xl p-4 flex items-start gap-3 ${bg1}`}>
              <span className="text-2xl flex-shrink-0">{c.icon}</span>
              <div>
                <p className={`text-[0.65rem] font-extrabold uppercase tracking-widest mb-0.5 ${t3}`}>{c.label}</p>
                <p className={`text-[0.78rem] font-bold ${t1}`}>{c.value}</p>
                <p className={`text-[0.62rem] ${t3}`}>{c.sub}</p>
              </div>
            </div>
          ))}

          {/* FAQ note */}
          <div className={`rounded-xl p-4 border-l-4 border-[#cc0000] ${bg1}`}>
            <p className={`text-[0.65rem] font-extrabold uppercase tracking-widest mb-1 ${t1}`}>Response Time</p>
            <p className={`text-[0.65rem] leading-relaxed ${t3}`}>
              We aim to respond to all messages within 24–48 hours. For urgent issues please use Twitter DMs.
            </p>
          </div>
        </div>

        {/* Contact form */}
        <div className={`md:col-span-2 rounded-xl p-5 ${bg1}`}>
          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <span className="text-5xl">✅</span>
              <h3 className={`text-[1rem] font-black uppercase tracking-wide ${t1}`}>Message Sent!</h3>
              <p className={`text-[0.72rem] ${t3} max-w-xs`}>Thanks for reaching out. We'll get back to you within 24 hours.</p>
              <button
                onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}
                className="mt-2 px-4 py-2 rounded-lg bg-[#cc0000] text-white text-[0.7rem] font-bold uppercase tracking-wider hover:bg-[#a80000] transition-colors"
              >
                Send Another
              </button>
            </div>
          ) : (
            <>
              <h2 className={`text-[0.85rem] font-extrabold uppercase tracking-widest mb-4 pb-2 border-b-2 border-[#cc0000] ${t1}`}>
                Send a Message
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className={labelCls}>Your Name *</label>
                  <input className={inputCls} placeholder="John Doe" value={form.name} onChange={e => handleChange('name', e.target.value)} />
                  {errors.name && <p className="text-[0.58rem] text-red-400 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <input className={inputCls} type="email" placeholder="you@example.com" value={form.email} onChange={e => handleChange('email', e.target.value)} />
                  {errors.email && <p className="text-[0.58rem] text-red-400 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="mb-3">
                <label className={labelCls}>Subject</label>
                <select className={inputCls} value={form.subject} onChange={e => handleChange('subject', e.target.value)}>
                  <option value="">Select a subject…</option>
                  <option value="feedback">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="partnership">Partnership / Business</option>
                  <option value="data">Data Correction</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className={labelCls}>Message *</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={5}
                  placeholder="Tell us what's on your mind…"
                  value={form.message}
                  onChange={e => handleChange('message', e.target.value)}
                />
                {errors.message && <p className="text-[0.58rem] text-red-400 mt-1">{errors.message}</p>}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-lg bg-[#cc0000] hover:bg-[#a80000] text-white text-[0.78rem] font-bold uppercase tracking-widest transition-colors"
              >
                Send Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
