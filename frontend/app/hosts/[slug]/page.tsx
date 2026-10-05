import React from "react";
import { Metadata } from "next";
import WebsiteNavbar from "../../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../../components/website/layout/WebsiteFooter";
import HostProfileHeader from "../../../components/website/host-profile/HostProfileHeader";
import HostProfileTabs from "../../../components/website/host-profile/HostProfileTabs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let name = slug;
  try {
    const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';
    const res = await fetch(`${apiUrl}/hosts/public/${slug}`);

    if (res.ok) {
      const json = await res.json();
      const host = json.data || json;
      if (host && host.isVerified && !host.isBlocked) {
        name = host.name;
      }
    }
  } catch (e) {}

  return {
    title: `${name} | Fairway Draws Verified Host`,
    description: `View live and past competitions hosted by ${name}.`,
  };
}

export default async function HostProfilePage({ params }: PageProps) {
  const { slug } = await params;
  
  let host = null;
  try {
    const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';
    const res = await fetch(`${apiUrl}/hosts/public/${slug}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      host = json.data || json;
    }
  } catch (e) {
    console.error("Failed to fetch host", e);
  }

  if (!host || !host.isVerified || host.isBlocked) {
    return (
      <>
        <WebsiteNavbar />
        <main className="flex min-h-screen items-center justify-center bg-[#F8FAF6] pt-[80px]">
          <div className="mx-auto flex w-full max-w-[500px] flex-col items-center justify-center gap-3 rounded-[20px] border border-[#CBD8C8] bg-white px-8 py-16 text-center shadow-lg">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#0b4d35]/20 bg-[#dcebd8] text-[26px]">🔒</span>
            <span className="font-sans text-[10px] font-black tracking-[.16em] text-[#dc2626] uppercase">Host Profile</span>
            <h1 className="font-heading text-2xl font-black text-[#073826] uppercase">Host Unavailable</h1>
            <p className="max-w-[340px] font-sans text-xs leading-relaxed text-[#5e766c]">
              This host profile is currently unverified, pending admin review, or has been deactivated.
            </p>
          </div>
        </main>
        <WebsiteFooter />
      </>
    );
  }

  const name = host.name;
  const initials = name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      <WebsiteNavbar />
      
      <main className="min-h-screen bg-[#F8FAF6] pt-[80px] md:pt-[90px]">
        <section className="py-8 md:py-12">
          <div className="container-custom">
            
            <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
              <HostProfileHeader 
                name={name}
                logo={host.logo || initials}
                bio={host.bio || "Fairway Draws verified host"}
                isVerified={host.isVerified}
                drawsHosted={host.drawsHosted || 0}
                rating={host.rating || 5.0}
                memberSince={host.memberSince || 2026}
              />
              
              <HostProfileTabs name={name} bio={host.bio} location={host.location} raffles={host.raffles} />
            </div>

          </div>
        </section>
      </main>

      <WebsiteFooter />
    </>
  );
}
