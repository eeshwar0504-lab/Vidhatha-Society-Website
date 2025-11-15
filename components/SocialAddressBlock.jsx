// components/SocialAddressBlock.jsx
import React from "react";

/*
  Make sure Font Awesome CSS is loaded once in your app.
  Example (put inside app/layout.tsx <head> or pages/_document):
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    integrity="sha512-pc6LQGq3YtqVb6sQk3uZQj0i6q9nq+1vG/2t2FZf1Yqh2qvYx2XG3q3f2l1z3c1K8mXNd9G3dT3e3Xk9G2f4g=="
    crossOrigin="anonymous"
    referrerPolicy="no-referrer"
  />
*/

export default function SocialAddressBlock({
  facebook = "https://www.facebook.com/VidhathaSociety/",
  twitter = "", // none provided
  instagram = "https://www.instagram.com/vidhathasociety/",
  linkedin = "https://www.linkedin.com/in/vidhatha-society-ngo-aba53732b/",
  youtube = "https://www.youtube.com/@vidhathasociety",
  whatsappChannel = "https://whatsapp.com/channel/0029VavKC8R6hENmCKcOTi1u",
  whatsappChat = "https://chat.whatsapp.com/J8iWUxXF8XqE9xLVh2IfRi?mode=ems_copy_t",
  telegram = "https://t.me/vidhathasocietytelegram",
  email = "vidhathasociety@gmail.com",
  phone = "+91 95423 66556",
  address = "Vidhatha Society, Hyderabad, Telangana, India"
}) {
  const mapsQuery = encodeURIComponent(address);
  // Use Google Maps search API to open the address in Maps
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  const iconBase =
    "w-10 h-10 flex items-center justify-center rounded-full transition-transform transform hover:scale-110";

  return (
    <div className="mt-6">
      {/* Contact info */}
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Email</div>
            <a href={`mailto:${email}`} className="text-sm text-gray-900 underline">
              {email}
            </a>

            <div className="text-sm text-gray-600 mt-2">Phone</div>
            <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-sm text-gray-900 underline">
              {phone}
            </a>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {facebook && (
              <a
                href={facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconBase} bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white`}
                title="Facebook"
              >
                <i className="fab fa-facebook-f" />
              </a>
            )}

            {twitter && (
              <a
                href={twitter}
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconBase} bg-gray-100 text-gray-700 hover:bg-sky-500 hover:text-white`}
                title="Twitter"
              >
                <i className="fab fa-twitter" />
              </a>
            )}

            {instagram && (
              <a
                href={instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconBase} bg-gray-100 text-gray-700 hover:bg-pink-500 hover:text-white`}
                title="Instagram"
              >
                <i className="fab fa-instagram" />
              </a>
            )}

            {linkedin && (
              <a
                href={linkedin}
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconBase} bg-gray-100 text-gray-700 hover:bg-blue-700 hover:text-white`}
                title="LinkedIn"
              >
                <i className="fab fa-linkedin-in" />
              </a>
            )}

            {youtube && (
              <a
                href={youtube}
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconBase} bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white`}
                title="YouTube"
              >
                <i className="fab fa-youtube" />
              </a>
            )}

            {whatsappChat && (
              <a
                href={whatsappChat}
                aria-label="WhatsApp Chat"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconBase} bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white`}
                title="WhatsApp Chat"
              >
                <i className="fab fa-whatsapp" />
              </a>
            )}

            {whatsappChannel && (
              <a
                href={whatsappChannel}
                aria-label="WhatsApp Channel"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconBase} bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white`}
                title="WhatsApp Channel"
              >
                <i className="fas fa-bullhorn" />
              </a>
            )}

            {telegram && (
              <a
                href={telegram}
                aria-label="Telegram"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconBase} bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white`}
                title="Telegram"
              >
                <i className="fab fa-telegram-plane" />
              </a>
            )}
          </div>
        </div>

        {/* Address block */}
        <div className="mt-4">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded border border-gray-100 hover:shadow-md transition-colors bg-white"
            aria-label={`Open address in Google Maps: ${address}`}
            title="Open in Google Maps"
          >
            <div className="text-xs text-gray-500">Office Address</div>
            <div className="text-sm font-semibold text-gray-900">{address}</div>
          </a>
        </div>
      </div>
    </div>
  );
}
