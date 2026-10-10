import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import WebsiteNavbar from "../../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../../components/website/layout/WebsiteFooter";
import HostProfileHeader from "../../../components/website/host-profile/HostProfileHeader";
import HostProfileTabs from "../../../components/website/host-profile/HostProfileTabs";
import { verifiedHostsData } from "../../../data/hosts/hosts.data";
import { liveRafflesData } from "../../../data/live-raffles.data";
import { hostReviewsData } from "../../../data/reviews/reviews.data";
import { winnersData } from "../../../data/winners/winners.data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function resolveMockHost(slug: string) {
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Direct or alias match
  const found = verifiedHostsData.find((h) => {
    const s = h.slug.toLowerCase();
    if (s === cleanSlug) return true;
    if (h.id.toLowerCase() === cleanSlug) return true;
    // Check aliases between fairway-golf-pro-shop and fairway-pro-shop
    if (
      (cleanSlug === "fairway-golf-pro-shop" || cleanSlug === "fairway-pro-shop") &&
      (s === "fairway-golf-pro-shop" || s === "fairway-pro-shop")
    ) {
      return true;
    }
    // Normalized slug match
    if (s.replace(/-/g, "") === cleanSlug.replace(/-/g, "")) return true;
    return false;
  });

  if (!found) {
    // Fuzzy fallback if slug contains key host identity
    if (cleanSlug.includes("fairway")) return verifiedHostsData[0];
    if (cleanSlug.includes("links")) return verifiedHostsData[1];
    if (cleanSlug.includes("custom-club")) return verifiedHostsData[2];
    if (cleanSlug.includes("weekend")) return verifiedHostsData[3];
    return null;
  }

  return found;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let name = "Verified Host";

  try {
    const apiUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:5000/api/v1";
    const res = await fetch(`${apiUrl}/hosts/public/${slug}`, { next: { revalidate: 60 } });

    if (res.ok) {
      const json = await res.json();
      const host = json.data || json;
      if (host && host.isVerified && !host.isBlocked) {
        name = host.name;
      }
    } else {
      const mock = resolveMockHost(slug);
      if (mock) name = mock.name;
    }
  } catch {
    const mock = resolveMockHost(slug);
    if (mock) name = mock.name;
  }

  return {
    title: `${name} | Verified Host | TCG Draws`,
    description: `View live and past competitions hosted by ${name} on TCG Draws.`,
  };
}

export default async function HostProfilePage({ params }: PageProps) {
  const { slug } = await params;

  let host: any = null;

  try {
    const apiUrl =
      process.env.BACKEND_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:5000/api/v1";
    const res = await fetch(`${apiUrl}/hosts/public/${slug}`, {
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      host = json.data || json;
    }
  } catch (e) {
    console.error("Failed to fetch host from backend API:", e);
  }

  // Fallback to verifiedHostsData if backend is unavailable or host not found in DB
  if (!host || !host.isVerified || host.isBlocked) {
    const mock = resolveMockHost(slug);
    if (mock) {
      // Build past raffles from winnersData
      const pastRaffles = winnersData.slice(0, 4).map((w, idx) => ({
        id: `past-raffle-${w.id || idx}`,
        title: `${w.prizeTitle} (Concluded)`,
        description: `Official competition completed with verified ticket winner ${w.name} (${w.location}).`,
        image:
          idx === 0
            ? "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop"
            : idx === 1
            ? "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop"
            : "https://images.unsplash.com/photo-1592919505780-303950717480?q=80&w=800&auto=format&fit=crop",
        ticketPrice: 2.0,
        totalTickets: 250,
        ticketsSold: 250,
        soldTickets: 250,
        endDate: w.drawDate || "Draw Closed",
        status: "ENDED",
        category: w.category || "drivers",
        slug: `past-${w.id}`,
      }));

      // Find reviews for this host
      const hostReviews = hostReviewsData.filter(
        (r) => r.hostId === mock.id || r.status === "approved"
      );

      host = {
        id: mock.id,
        slug: mock.slug,
        name: mock.name,
        logo: mock.logo || "/uploads/avatars/ef6734d3d6c19d4ab982e5aa1b5bb10f6.webp",
        bio:
          mock.description ||
          `${mock.name} is an officially verified partner on TCG Draws delivering authentic equipment competitions, audited transparent draws, and fast tracked UK delivery.`,
        category: mock.category || "Pro Shop",
        isVerified: true,
        isBlocked: false,
        drawsHosted: mock.competitionCount || 45,
        rating: mock.averageRating || 4.9,
        totalReviews: mock.totalReviews || 120,
        memberSince: mock.memberSince || 2024,
        location: mock.location || "Manchester, UK",
        raffles: [...liveRafflesData.slice(0, 4), ...pastRaffles],
        reviews: hostReviews,
      };
    }
  }

  // If host is still completely unavailable / not found
  if (!host || !host.isVerified || host.isBlocked) {
    return (
      <>
        <WebsiteNavbar />
        <main className="min-h-screen flex items-center justify-center bg-[#090A0E] px-4 pt-28 pb-16">
          <div className="relative isolate overflow-hidden mx-auto flex w-full max-w-[520px] flex-col items-center justify-center gap-4 rounded-3xl border border-[rgba(212,175,55,0.25)] bg-[#12151F] px-8 py-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-2xl" />

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(212,175,55,0.3)] bg-[#181C28] text-3xl shadow-inner text-[#D4AF37]">
              🔒
            </div>

            <span className="font-sans text-[10px] font-black tracking-[0.2em] text-[#D4AF37] uppercase">
              Host Profile
            </span>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#F4EBD9] uppercase tracking-tight">
              Host Unavailable
            </h1>

            <p className="max-w-[360px] font-sans text-xs sm:text-sm leading-relaxed text-[#A69B82]">
              This host profile could not be found, is currently unverified, or is undergoing scheduled platform review.
            </p>

            <Link
              href="/verified-hosts"
              className="btn-gold-metallic mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-heading text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all"
            >
              Browse All Verified Hosts →
            </Link>
          </div>
        </main>
        <WebsiteFooter />
      </>
    );
  }

  const name = host.name;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((w: string) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Reviews fallback if not passed directly in host object
  const reviews =
    host.reviews && host.reviews.length > 0
      ? host.reviews
      : hostReviewsData.filter(
          (r) => r.hostId === host.id || r.status === "approved"
        );

  // Dynamic host ratings & review metrics
  const rating = host.rating !== undefined ? host.rating : (host.averageRating !== undefined ? host.averageRating : null);
  const totalReviews = host.totalReviews !== undefined ? host.totalReviews : (host.reviews ? host.reviews.length : 0);
  const reviewsStats = host.reviewsStats || null;

  return (
    <>
      <WebsiteNavbar />

      <main className="relative isolate min-h-screen bg-[#090A0E] pt-28 pb-16 sm:pt-32 md:pb-24">
        {/* Ambient Luxury Lighting */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#141722_1px,transparent_1px),linear-gradient(to_bottom,#141722_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_20%,#000_70%,transparent_100%)] opacity-35" />
          <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(212,175,55,0.15)_0%,transparent_70%)] blur-[90px]" />
          <div className="absolute top-1/3 right-10 h-[450px] w-[450px] bg-[radial-gradient(circle,rgba(163,123,36,0.12)_0%,transparent_70%)] blur-[100px]" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#090A0E] to-transparent" />
        </div>

        <section className="container-custom relative z-10">
          <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 font-sans text-xs font-semibold text-[#A69B82]">
              <Link href="/" className="hover:text-[#D4AF37] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/verified-hosts" className="hover:text-[#D4AF37] transition-colors">
                Verified Hosts
              </Link>
              <span>/</span>
              <span className="text-[#F4EBD9] font-bold">{name}</span>
            </nav>

            {/* Profile Header */}
            <HostProfileHeader
              name={name}
              logo={host.logo || initials}
              bio={host.bio || "TCG Draws verified partner hosting authentic competitions."}
              category={host.category || "Pro Shop"}
              isVerified={host.isVerified}
              drawsHosted={host.drawsHosted || host.competitionCount || 0}
              rating={rating}
              totalReviews={totalReviews}
              memberSince={host.memberSince || 2024}
              location={host.location || "Manchester, UK"}
            />

            {/* Profile Tabs */}
            <HostProfileTabs
              hostId={host.id}
              name={name}
              bio={host.bio}
              location={host.location || "Manchester, UK"}
              rating={rating}
              totalReviews={totalReviews}
              stats={reviewsStats}
              raffles={host.raffles || []}
              reviews={reviews}
            />
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </>
  );
}
