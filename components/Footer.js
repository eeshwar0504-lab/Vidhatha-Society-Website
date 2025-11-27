import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const iconBase =
    "w-10 h-10 rounded-full flex items-center justify-center bg-[#111827] text-gray-300 transition-all hover:animate-pulse hover:scale-105";

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">

          {/* ABOUT */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Vidhatha Society</h3>
            <p className="text-sm mb-4">
              Empowering communities through dedicated programs and initiatives that create lasting positive change.
            </p>

            <div className="flex space-x-4">

              {/* FACEBOOK */}
              <a href="https://www.facebook.com/VidhathaSociety/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`${iconBase} hover:bg-blue-600`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 
                   23.403.597 24 1.326 24h11.494v-9.294H9.691v-3.622h3.129V8.413c0-3.1 
                   1.893-4.788 4.659-4.788 1.325 0 2.466.099 2.797.143v3.24h-1.922c-1.507 
                   0-1.8.717-1.8 1.767v2.317h3.6l-.469 3.622h-3.131V24h6.139C23.403 24 
                   24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0z"/>
                </svg>
              </a>

              {/* WHATSAPP */}
              <a href="https://whatsapp.com/channel/0029VavKC8R6hENmCKcOTi1u"
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`${iconBase} hover:bg-green-500`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.04 2.004A9.96 9.96 0 0 0 2.08 12c0 
                  1.756.46 3.465 1.337 4.966L2 22l5.207-1.37A9.96 
                  9.96 0 0 0 12.04 22c5.495 0 9.96-4.465 
                  9.96-9.96s-4.465-10.036-9.96-10.036zm5.633 
                  14.474c-.228.64-1.318 1.25-1.856 
                  1.33-.474.072-1.09.102-1.758-.109-.405-.129-.923-.301-1.594-.586-2.802-1.213-4.624-4.18-4.764-4.373-.14-.194-1.14-1.52-1.14-2.9 
                  0-1.38.72-2.058.975-2.338.255-.28.56-.35.747-.35.187 0 .373.002.535.01.175.008.4-.065.626.48.228.547.773 
                  1.89.84 2.026.07.137.117.297.023.476-.093.18-.14.296-.28.457-.14.162-.296.362-.423.486-.14.137-.285.286-.122.562.163.273.726 
                  1.196 1.56 1.938 1.072.957 1.974 1.253 2.246 1.39.273.14.437.117.6-.07.164-.185.69-.8.875-1.074.186-.273.374-.233.626-.14.255.093 
                  1.603.756 1.876.893.274.14.46.208.529.322.066.117.066.68-.162 1.32z"/>
                </svg>
              </a>

              {/* TELEGRAM */}
              <a href="https://t.me/vidhathasocietytelegram"
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`${iconBase} hover:bg-sky-500`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 
                   12 12 12 12-5.373 12-12S18.627 0 12 
                   0zm5.482 8.003a.54.54 0 0 1 .565.658l-1.38 
                   6.487c-.128.602-.682.98-1.272.82l-2.375-.743-1.26 
                   1.225a.877.877 0 0 1-.928.188.87.87 0 0 
                   1-.547-.75l-.23-2.004-2.183-.668a.878.878 0 0 
                   1-.059-1.671l9.544-3.853a.54.54 0 0 1 .125-.03z"/>
                </svg>
              </a>

              {/* INSTAGRAM */}
              <a href="https://www.instagram.com/vidhathasociety/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`${iconBase} hover:bg-pink-500`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.5 2A5.5 5.5 0 0 0 2 7.5v9A5.5 5.5 0 0 0 7.5 22h9a5.5 5.5 0 0 0 5.5-5.5v-9A5.5 5.5 0 0 0 16.5 2h-9zm0 2h9A3.5 3.5 0 0 
                   1 20 7.5v9a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 
                   0 0 1 4 16.5v-9A3.5 3.5 0 0 1 7.5 4zm9.25 
                   1a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 
                   7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 
                   2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                </svg>
              </a>

              {/* LINKEDIN */}
              <a href="https://www.linkedin.com/in/vidhatha-society-ngo-aba53732b/"
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`${iconBase} hover:bg-blue-700`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1-5 
                   0 2.5 2.5 0 0 1 5 0zM.5 8h4.9v14H.5V8zm7.5 
                   0h4.7v2h.1c.7-1.2 2.4-2.5 4.9-2.5C23 
                   7.5 24 10.1 24 14.3V22h-5v-7c0-1.7 
                   0-3.9-2.4-3.9s-2.8 1.9-2.8 
                   3.8V22h-5V8z"/>
                </svg>
              </a>

              {/* YOUTUBE */}
              <a href="https://www.youtube.com/@vidhathasociety"
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`${iconBase} hover:bg-red-600`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-1-1.7-1-2.1-1.1C16.8 
                   2.5 12 2.5 12 2.5s-4.8 0-8.5.2C3 
                   2.8 2 2.8 1.2 3.9c-.6.7-.8 2.3-.8 
                   2.3S0 8.1 0 10v1.9c0 1.9.4 3.8.4 
                   3.8s.2 1.6.8 2.3c.8 1 1.9 1 
                   2.4 1.1 1.8.1 7.8.2 7.8.2s4.8 0 
                   8.5-.2c.4 0 1.4-.1 2.1-1.1.6-.7.8-2.3.8-2.3s.4-1.9.4-3.8V10c0-1.9-.4-3.8-.4-3.8zM9.8 14.6V8.9l5.7 2.9-5.7 2.8z"/>
                </svg>
              </a>

            </div>
          </div>

          {/* Rest of footer unchanged */}
          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/programs" className="hover:text-white">What we do</Link></li>
              {/* <li><Link href="/events" className="hover:text-white">Events</Link></li> */}
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              {/* <li><Link href="/news" className="hover:text-white">News</Link></li> */}

              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* GET INVOLVED */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Get Involved</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/volunteer" className="hover:text-white">Volunteer</Link></li>
              <li><Link href="/donate" className="hover:text-white">Donate</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/gallery" className="hover:text-white">Gallery</Link></li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>C-841, NGO Colony, Vanasthalipuram, Hyderabad, Telangana 500070</li>
              <li><a href="mailto:vidhathasociety@gmail.com" className="hover:text-white">vidhathasociety@gmail.com</a></li>
              <li><a href="tel:+919542366556" className="hover:text-white">+91 95423 66556</a></li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-6 mt-6 text-sm text-center">
          <p>&copy; {currentYear} Vidhatha Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
