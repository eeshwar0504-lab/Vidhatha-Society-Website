import React from "react";

export default function SocialIcons() {
  const items = [
    { href: "https://www.facebook.com/VidhathaSociety/", label: "Facebook", bg: "bg-blue-100", hover: "group-hover:bg-blue-600 group-hover:text-white", svg: FacebookSVG },
    { href: "https://www.instagram.com/vidhathasociety/", label: "Instagram", bg: "bg-pink-100", hover: "group-hover:bg-pink-600 group-hover:text-white", svg: InstagramSVG },
    { href: "https://www.linkedin.com/in/vidhatha-society-ngo-aba53732b/", label: "LinkedIn", bg: "bg-blue-100", hover: "group-hover:bg-blue-700 group-hover:text-white", svg: LinkedInSVG },
    { href: "https://www.youtube.com/@vidhathasociety", label: "YouTube", bg: "bg-red-100", hover: "group-hover:bg-red-600 group-hover:text-white", svg: YouTubeSVG },
    { href: "https://whatsapp.com/channel/0029VavKC8R6hENmCKcOTi1u", label: "WhatsApp", bg: "bg-green-100", hover: "group-hover:bg-green-600 group-hover:text-white", svg: WhatsAppSVG },
    { href: "https://t.me/vidhathasocietytelegram", label: "Telegram", bg: "bg-blue-100", hover: "group-hover:bg-blue-500 group-hover:text-white", svg: TelegramSVG },
  ];

  return (
    <div className="mt-6">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-center">
        {items.map(({ href, label, bg, hover, svg: Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center group"
            aria-label={label}
            title={label}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg} text-current transition transform group-hover:scale-110 ${hover}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs mt-1 text-gray-700">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ---------- SVG ICONS ---------- */
/* Each returns an SVG element. Adjust fill/stroke via CSS if needed. */

function FacebookSVG(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.07C22 6.66 17.52 2 12 2S2 6.66 2 12.07c0 5 3.66 9.15 8.44 9.95v-7.05H8.08v-2.9h2.36V9.41c0-2.33 1.39-3.61 3.52-3.61.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.42v1.71h2.5l-.4 2.9h-2.1V22C18.34 21.22 22 17.07 22 12.07z" />
    </svg>
  );
}

function InstagramSVG(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5.8A4.2 4.2 0 1016.2 12 4.2 4.2 0 0012 7.8zm6.5-.9a1.2 1.2 0 11-1.2 1.2 1.2 1.2 0 011.2-1.2zM12 10.6A1.4 1.4 0 1110.6 12 1.4 1.4 0 0112 10.6z" />
    </svg>
  );
}

function LinkedInSVG(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v14H0zM8 8h4.8v2h.1c.7-1.2 2.4-2.5 4.9-2.5C23 7.5 24 10.1 24 14.3V22h-5v-7c0-1.7 0-3.9-2.4-3.9s-2.8 1.9-2.8 3.8V22H8V8z" />
    </svg>
  );
}

function YouTubeSVG(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 7.1s-.2-1.6-.8-2.3c-.8-1-1.7-1-2.1-1.1C16.8 3.5 12 3.5 12 3.5h-.1s-4.8 0-8.5.2c-.4 0-1.4.1-2.1 1.1C.7 5.5.5 7.1.5 7.1S.2 9 .2 10.9v1.9C.2 14.9.5 16.9.5 16.9s.2 1.6.8 2.3c.8 1 1.9 1 2.4 1.1 1.8.1 7.8.2 7.8.2s4.8 0 8.5-.2c.4 0 1.4-.1 2.1-1.1.6-.7.8-2.3.8-2.3s.3-2 .3-3.9v-1.9c0-1.9-.3-3.9-.3-3.9zM9.8 15.1V8.9l5.7 3.1-5.7 3.1z"/>
    </svg>
  );
}

function WhatsAppSVG(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.5 3.5A11.7 11.7 0 0012 0C5.4 0 .2 5.3.2 11.9c0 2 0.5 3.9 1.5 5.6L0 24l6.9-1.8a11.8 11.8 0 005.1 1.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.3-6.2-3.4-8.3zM12 21.3a9.2 9.2 0 01-4.7-1.3l-.3-.2-4.1 1.1 1.1-3.9-.2-.4A9.3 9.3 0 1121.3 12 9.2 9.2 0 0112 21.3zM17 14.8c-.3-.1-1.9-.9-2.2-1-.3-.1-.5-.1-.8.1s-1 .8-1.2.9c-.2.1-.4.1-.7 0-.3-.1-1.1-.4-2-1.2-.8-.8-1.3-1.8-1.5-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.5-.6.2-.2.2-.4.3-.7.1-.2 0-.4 0-.5 0-.1-.8-2-1.1-2.7-.3-.7-.7-.6-.9-.6h-.7c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.2s1 2.7 1.2 3c.2.3 2 3.1 4.9 4.4.7.3 1.3.4 1.8.5.8.2 1.4.2 1.9.1.6-.1 1.8-.7 2.1-1.5.3-.8.3-1.5.2-1.7-.1-.2-.3-.3-.6-.4z"/>
    </svg>
  );
}

function TelegramSVG(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C5.4 0 .2 5.4.2 12S5.4 24 12 24s11.8-5.4 11.8-12S18.6 0 12 0zm5.4 7.2l-1.1 5-1.7 4.9c-.2.6-.5.8-1 .8-.3 0-.5-.1-.7-.3l-1.8-1.6-1.3 1.2c-.2.2-.4.4-.7.4-.1 0-.3 0-.4-.1l.2-2.7 4.9-4.5c.2-.1.1-.4-.1-.3l-6.6 4.1-2.8-.9c-.6-.2-.6-.6.1-.9L17 6.2c.5-.2.9 0 .4 1z"/>
    </svg>
  );
}
