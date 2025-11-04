"use client";

import { useEffect, useState } from 'react';
import type { Campaign } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
// Lightweight inline icons to avoid pulling lucide-react into server bundles during build
function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="20" cy="20" r="1" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M7 21v-2a4 4 0 0 1 3-3.87" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TrendingDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
import Link from 'next/link';
import { calculateLinearPrice } from '@/lib/utils';

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/campaigns?select=*&status=eq.active&order=created_at.desc`;
      const res = await fetch(url, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch campaigns: ${res.status}`);
      const data = await res.json();
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  const calculateCurrentPrice = (campaign: Campaign) => {
    return calculateLinearPrice(
      campaign.starting_price,
      campaign.final_price,
      campaign.target_quantity,
      campaign.current_quantity
    );
  };

  const calculateDiscount = (starting: number, final: number) => {
    return Math.round(((starting - final) / starting) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="h-8 w-8 text-slate-900" />
              <h1 className="text-2xl font-bold text-slate-900">GroupBuy</h1>
            </div>
            <Link href="/seller">
              <Button className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Sell Product
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Better Prices Through Group Buying
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Join group buys to unlock incredible discounts. The more people join, the lower the price gets!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-64 bg-slate-200 animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCartIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Campaigns</h3>
            <p className="text-slate-600">Check back soon for new group buy opportunities!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const progress = calculateProgress(campaign.current_quantity, campaign.target_quantity);
              const currentPrice = calculateCurrentPrice(campaign);
              const discount = calculateDiscount(campaign.starting_price, campaign.final_price);
              const isTargetReached = campaign.current_quantity >= campaign.target_quantity;

              return (
                <Link key={campaign.id} href={`/product/${campaign.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <img
                        src={campaign.image_url}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-red-500 text-white text-sm px-3 py-1">
                          Save {discount}%
                        </Badge>
                      </div>
                      {isTargetReached && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                            Target Reached!
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl group-hover:text-slate-700 transition-colors">
                        {campaign.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {campaign.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">
                          ${currentPrice.toFixed(2)}
                        </span>
                        {!isTargetReached && (
                          <>
                            <span className="text-sm text-slate-500 line-through">
                              ${campaign.starting_price.toFixed(2)}
                            </span>
                            <TrendingDownIcon className="h-4 w-4 text-red-500" />
                          </>
                        )}
                      </div>

                      {!isTargetReached && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 flex items-center gap-1">
                              <UsersIcon className="h-4 w-4" />
                              {campaign.current_quantity} / {campaign.target_quantity} buyers
                            </span>
                            <span className="font-semibold text-slate-900">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-slate-500">
                            {campaign.target_quantity - campaign.current_quantity} more needed for ${campaign.final_price.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {isTargetReached && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm text-green-700 font-semibold text-center">
                            Best price unlocked! Get it for ${campaign.final_price.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-600">
            <p className="mb-2">GroupBuy - Better prices through collective purchasing power</p>
            <p className="text-sm">Join campaigns, save money, build community</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
