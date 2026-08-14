"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    image: "/banner-chicken-1.jpg",
    title: "Cita Rasa Ayam Goreng Krispi Mafaaza",
    subtitle: "Kelola resep, stok bahan baku, dan pesanan outlet dengan sistem pencatatan serba praktis.",
  },
  {
    id: 2,
    image: "/banner-chicken-2.jpg",
    title: "Manajemen POS & Transaksi Real-Time",
    subtitle: "Pantau pesanan kasir, volume transaksi harian, dan layanan pelanggan tanpa hambatan.",
  },
  {
    id: 3,
    image: "/banner-chicken-3.jpg",
    title: "Laporan Keuangan & Grafik Penjualan",
    subtitle: "Dapatkan analisis performa pendapatan dan grafik pertumbuhan outlet Mafaaza secara akurat.",
  },
];

export function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  // Auto slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative hidden h-full min-h-[600px] w-full flex-col justify-between overflow-hidden rounded-none bg-muted lg:col-span-7 xl:col-span-7 lg:flex lg:rounded-r-[28px] sm:lg:rounded-r-[36px]">

      {/* Slide Images */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            priority={idx === 0}
            className={`object-cover transition-transform duration-10000 ease-linear ${
              idx === current ? "scale-105" : "scale-100"
            }`}
          />
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

          {/* Banner Text Overlay */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-10 text-white xl:p-14">
            <p className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight drop-shadow-md xl:text-4xl">
              {slide.title}
            </p>
            <p className="mt-3.5 max-w-xl text-base text-white/85 drop-shadow-xs leading-relaxed">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Controls & Slide Indicators */}
      <div className="absolute bottom-10 right-10 z-20 flex items-center gap-4 xl:bottom-14 xl:right-14">
        {/* Indicators Dots */}
        <div className="flex items-center gap-2 mr-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === current ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Ke slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrow Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide sebelumnya"
            className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/30 active:scale-95 shadow-sm"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide berikutnya"
            className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/30 active:scale-95 shadow-sm"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
