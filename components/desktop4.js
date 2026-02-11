"use client";

import Image from "next/image";
import Link from "next/link";

/**
 * Kalakrithi × Arangetra - Single Page Design with Register Buttons
 */
const KalakrithiHomePage = () => {
  return (
    <div className="w-full min-h-screen bg-white">
      {/* Section 1 - Main Hero/Landing */}
      <section className="relative w-full min-h-screen">
        <Image
          src="/WhatsApp Image 2026-02-11 at 3.40.01 PM.jpeg"
          alt="Kalakrithi Arangetra Hero Section"
          fill
          className="object-cover object-center"
          priority
        />
      </section>

      {/* Section 2 - Workshops with Register Button */}
      <section className="relative w-full min-h-screen">
        <Image
          src="/WhatsApp Image 2026-02-11 at 3.40.03 PM.jpeg"
          alt="Workshops Section"
          fill
          className="object-cover object-center"
        />

        {/* Register Button for Workshops */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <Link href="/register/workshop">
            <button className="px-16 py-5 bg-gradient-to-r from-red-600 to-orange-600 text-white text-2xl font-bold rounded-full hover:from-red-700 hover:to-orange-700 transition-all shadow-2xl font-lakki-reddy transform hover:scale-105">
              Register for Workshop
            </button>
          </Link>
        </div>
      </section>

      {/* Section 3 - Games with Register Button */}
      <section className="relative w-full min-h-screen">
        <Image
          src="/WhatsApp Image 2026-02-11 at 3.40.05 PM.jpeg"
          alt="Games Section"
          fill
          className="object-cover object-center"
        />

        {/* Register Button for Games */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <Link href="/register/game">
            <button className="px-16 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl font-bold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl font-lakki-reddy transform hover:scale-105">
              Register for Game
            </button>
          </Link>
        </div>
      </section>

      {/* Section 4 - Stalls */}
      <section className="relative w-full min-h-screen">
        <Image
          src="/WhatsApp Image 2026-02-11 at 3.40.07 PM.jpeg"
          alt="Stalls Section"
          fill
          className="object-cover object-center"
        />
      </section>
    </div>
  );
};

export default KalakrithiHomePage;
