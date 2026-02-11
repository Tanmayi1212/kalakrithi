"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStalls } from "../lib/api";

/**
 * Desktop3 Component
 * Kalakrithi Stalls Page - Displays exhibition stalls with folk art decorations
 * Features dynamic stall data from API with interactive elements
 */
const Desktop3 = () => {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStalls() {
      try {
        setLoading(true);
        const data = await getStalls();
        setStalls(data);
      } catch (err) {
        console.error("Failed to load stalls:", err);
        setStalls([
          { id: 1, name: "stalls inside the frame", color: "indianred", position: "left" },
          { id: 2, name: "stalls inside the frame", color: "gray", position: "left-center" },
          { id: 3, name: "stalls inside the frame", color: "firebrick", position: "center" },
          { id: 4, name: "stalls inside the frame", color: "maroon", position: "right-center" },
          { id: 5, name: "stalls inside the frame", color: "rosybrown", position: "right" }
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadStalls();
  }, []);

  const getStallColor = (index) => {
    const colors = ["bg-indianred", "bg-gray", "bg-firebrick", "bg-maroon", "bg-rosybrown"];
    return stalls[index]?.color ? `bg-${stalls[index].color}` : colors[index];
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-brown">
        <div className="text-white text-2xl font-lakki-reddy">Loading Stalls...</div>
      </div>
    );
  }

  return (
    <>
      {/* Navigation */}
      <nav className="bg-[#7d1414] text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold font-lakki-reddy">KALAKRITHI × ARANGETRA</h1>
          <div className="flex gap-6 text-lg">
            <Link href="/" className="hover:text-yellow-300 transition font-medium">Home</Link>
            <Link href="/workshops" className="hover:text-yellow-300 transition font-medium">Workshops</Link>
            <Link href="/games" className="hover:text-yellow-300 transition font-medium">Games</Link>
            <Link href="/stalls" className="hover:text-yellow-300 transition font-medium">Stalls</Link>
          </div>
        </div>
      </nav>

      <div className="w-full h-[1024px] relative overflow-hidden bg-[url('/Desktop-3@3x.png')] bg-cover bg-no-repeat bg-[top] text-center text-num-24 text-black font-lakki-reddy">
        {/* Bottom decorative section */}
        <div className="absolute bottom-[-410px] left-[calc(50%_-_720px)] bg-aquamarine w-[1440px] h-[420px] shrink-0" />

        {/* Top decorative ornamental frames */}
        <Image
          className="absolute top-[172px] left-[64px] w-num-249 h-num-72 object-cover shrink-0"
          width={249}
          height={72}
          sizes="100vw"
          alt="Decorative ornamental frame"
          src="/Screenshot-2026-02-07-214557-removebg-preview-1@2x.png"
        />
        <Image
          className="absolute top-[160px] right-[57px] w-num-249 h-num-72 object-cover shrink-0"
          width={249}
          height={72}
          sizes="100vw"
          alt="Decorative ornamental frame"
          src="/Screenshot-2026-02-07-214557-removebg-preview-1@2x.png"
        />

        {/* Bottom decorative ornamental frames */}
        <Image
          className="absolute bottom-[459px] left-[64px] w-num-249 h-num-72 object-cover shrink-0"
          loading="lazy"
          width={249}
          height={72}
          sizes="100vw"
          alt="Decorative ornamental frame"
          src="/Screenshot-2026-02-07-214557-removebg-preview-1@2x.png"
        />
        <Image
          className="absolute right-[80px] bottom-[465px] w-num-249 h-num-72 object-cover shrink-0"
          loading="lazy"
          width={249}
          height={72}
          sizes="100vw"
          alt="Decorative ornamental frame"
          src="/Screenshot-2026-02-07-214557-removebg-preview-1@2x.png"
        />
        <Image
          className="absolute bottom-[459px] left-[584px] w-num-249 h-num-72 object-cover shrink-0"
          loading="lazy"
          width={249}
          height={72}
          sizes="100vw"
          alt="Decorative ornamental frame"
          src="/Screenshot-2026-02-07-214557-removebg-preview-1@2x.png"
        />

        {/* Decorative text element */}
        <Image
          className="absolute top-[453px] left-[275px] w-[309px] h-[39px] object-cover shrink-0"
          loading="lazy"
          width={309}
          height={39}
          sizes="100vw"
          alt="Decorative text element"
          src="/Screenshot-2026-02-07-170048-removebg-preview-10@2x.png"
        />

        {/* Dancing figure illustrations - Top row */}
        <Image
          className="absolute top-[208px] right-[377px] w-num-105 h-num-158 object-cover shrink-0"
          loading="lazy"
          width={105}
          height={158}
          sizes="100vw"
          alt="Traditional dancing figure"
          src="/image-257@2x.png"
        />
        <Image
          className="absolute top-[208px] left-[calc(50%_-_53px)] w-num-105 h-num-158 object-cover shrink-0"
          loading="lazy"
          width={105}
          height={158}
          sizes="100vw"
          alt="Traditional dancing figure"
          src="/image-257@2x.png"
        />
        <Image
          className="absolute top-[208px] left-[382px] w-num-105 h-num-158 object-cover shrink-0"
          loading="lazy"
          width={105}
          height={158}
          sizes="100vw"
          alt="Traditional dancing figure"
          src="/image-257@2x.png"
        />
        <Image
          className="absolute top-[208px] left-[94px] w-num-105 h-num-158 object-cover shrink-0"
          loading="lazy"
          width={105}
          height={158}
          sizes="100vw"
          alt="Traditional dancing figure"
          src="/image-257@2x.png"
        />
        <Image
          className="absolute top-[208px] right-[99px] w-num-105 h-num-158 object-cover shrink-0"
          loading="lazy"
          width={105}
          height={158}
          sizes="100vw"
          alt="Traditional dancing figure"
          src="/image-257@2x.png"
        />

        {/* Main Stalls Section */}
        <main
          className="absolute top-[calc(50%_-_512px)] left-[calc(50%_-_720px)] bg-brown w-[1444px] h-[1025px] shrink-0 text-center text-num-24 text-black font-lakki-reddy"
          role="main"
          aria-label="Exhibition stalls layout"
        >
          {/* Page Title */}
          <h1 className="m-0 absolute top-[56px] left-[498px] text-[48px] font-normal font-[inherit] text-white">
            KALAKRITHI STALLS
          </h1>

          {/* Stall 5 - Right */}
          <section
            className={`absolute right-[-143px] bottom-[461px] ${getStallColor(4)} w-num-893 h-72 [transform:_rotate(-90deg)] [transform-origin:0_0]`}
            aria-label={stalls[4]?.name || "Exhibition stall"}
          />

          {/* Stall 4 - Right Center */}
          <section
            className={`absolute bottom-[462px] left-[calc(50%_+_289px)] ${getStallColor(3)} w-num-893 h-72 [transform:_rotate(-90deg)] [transform-origin:0_0]`}
            aria-label={stalls[3]?.name || "Exhibition stall"}
          />
          <h3 className="m-0 absolute top-[417px] left-[892px] text-[length:inherit] font-normal font-[inherit]">
            {stalls[3]?.name || "stalls inside the frame"}
          </h3>

          {/* Stall 3 - Center */}
          <section
            className={`absolute bottom-[461px] left-[calc(50%_+_1px)] ${getStallColor(2)} w-num-893 h-72 [transform:_rotate(-90deg)] [transform-origin:0_0]`}
            aria-label={stalls[2]?.name || "Exhibition stall"}
          />
          <h3 className="m-0 absolute top-[417px] left-[604px] text-[length:inherit] font-normal font-[inherit]">
            {stalls[2]?.name || "stalls inside the frame"}
          </h3>

          {/* Stall 2 - Left Center */}
          <h3 className="m-0 absolute top-[calc(50%_-_95.5px)] left-[calc(50%_-_390px)] text-[length:inherit] font-normal font-[inherit]">
            {stalls[1]?.name || "stalls inside the frame"}
          </h3>
          <section
            className={`absolute bottom-[462px] left-[calc(50%_-_287px)] ${getStallColor(1)} w-num-893 h-72 [transform:_rotate(-90deg)] [transform-origin:0_0]`}
            aria-label={stalls[1]?.name || "Exhibition stall"}
          />
          <h3 className="m-0 absolute top-[calc(50%_-_91.5px)] left-[calc(50%_-_406px)] text-[length:inherit] font-normal font-[inherit]">
            {stalls[1]?.name || "stalls inside the frame"}
          </h3>

          {/* Stall 1 - Left */}
          <section
            className={`absolute bottom-[461px] left-[147px] ${getStallColor(0)} w-num-893 h-72 [transform:_rotate(-90deg)] [transform-origin:0_0]`}
            aria-label={stalls[0]?.name || "Exhibition stall"}
          />
          <h3 className="m-0 absolute top-[413px] left-[28px] text-[length:inherit] font-normal font-[inherit]">
            {stalls[0]?.name || "stalls inside the frame"}
          </h3>
        </main>

        {/* Right side stall label */}
        <h3 className="m-0 absolute top-[417px] right-[22px] text-[length:inherit] font-normal font-[inherit] shrink-0">
          {stalls[4]?.name || "stalls inside the frame"}
        </h3>

        {/* Bottom decorative curved text */}
        <Image
          className="absolute right-[57px] bottom-[33px] w-[314px] h-[59px] shrink-0"
          loading="lazy"
          width={314}
          height={59}
          sizes="100vw"
          alt="Decorative curved text"
          src="/Text-on-a-path.svg"
        />

        {/* Call to Action Button */}
        <button
          className="cursor-pointer [border:none] p-0 bg-[transparent] absolute right-[56.5px] bottom-[-5px] text-[32px] font-lakki-reddy text-white text-center inline-block shrink-0 hover:opacity-80 transition-opacity"
          onClick={() => {
            console.log('Learn more clicked');
          }}
          aria-label="Learn more about Kalakrithi stalls"
        >
          Learn More
        </button>
      </div>
    </>
  );
};

export default Desktop3;
