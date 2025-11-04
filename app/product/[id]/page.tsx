"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Campaign } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// Inline icons to avoid pulling lucide-react into server bundles during build
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

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M9 12l2 2 4-4" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73L12 2 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 22l8-4.27A2 2 0 0 0 21 16z" />
    </svg>
  );
}
import Link from 'next/link';
import { calculateLinearPrice } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    quantity: 1,
  });

  useEffect(() => {
    if (params.id) {
      fetchCampaign(params.id as string);
    }
  }, [params.id]);

  async function fetchCampaign(id: string) {
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/campaigns?select=*&id=eq.${encodeURIComponent(
        id
      )}`;
      const res = await fetch(url, {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch campaign: ${res.status}`);
      const data = await res.json();
      const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!item) {
        router.push('/');
        return;
      }
      setCampaign(item);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!campaign) return;

    setSubmitting(true);
    try {
      const currentPrice = campaign.current_quantity >= campaign.target_quantity
        ? campaign.final_price
        : campaign.starting_price;
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          campaign_id: campaign.id,
          buyer_name: formData.name,
          buyer_email: formData.email,
          quantity: formData.quantity,
          price_paid: currentPrice,
          status: 'confirmed',
        }),
      });
      if (!res.ok) throw new Error(`Failed to create order: ${res.status}`);

      toast({
        title: 'Order placed successfully!',
        description: `You'll receive a confirmation email at ${formData.email}`,
      });

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const progress = (campaign.current_quantity / campaign.target_quantity) * 100;
  const currentPrice = calculateLinearPrice(
    campaign.starting_price,
    campaign.final_price,
    campaign.target_quantity,
    campaign.current_quantity
  );
  const discount = Math.round(((campaign.starting_price - campaign.final_price) / campaign.starting_price) * 100);
  const isTargetReached = campaign.current_quantity >= campaign.target_quantity;
  const isPaused = campaign.status === 'paused';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeftIcon className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-6 w-6 text-slate-900" />
              <h1 className="text-xl font-bold text-slate-900">GroupBuy</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="relative rounded-lg overflow-hidden bg-white shadow-lg">
              <img
                src={campaign.image_url}
                alt={campaign.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                  Save {discount}%
                </Badge>
              </div>
              {isTargetReached && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                    Target Reached!
                  </Badge>
                </div>
              )}
              {isPaused && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
                    Campaign Paused
                  </Badge>
                </div>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-600 leading-relaxed">{campaign.description}</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-slate-600">
                      <PackageIcon className="h-5 w-5" />
                    <span>Free shipping on all orders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                <CardDescription className="text-base">
                  Join the group buy and save big!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-bold text-slate-900">
                      ${currentPrice.toFixed(2)}
                    </span>
                    {!isTargetReached && (
                      <>
                        <span className="text-xl text-slate-500 line-through">
                          ${campaign.starting_price.toFixed(2)}
                        </span>
                          <TrendingDownIcon className="h-5 w-5 text-red-500" />
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">Current price per unit</p>
                </div>

                {!isTargetReached && (
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 flex items-center gap-2">
                     <UsersIcon className="h-5 w-5" />
                            {campaign.current_quantity} / {campaign.target_quantity} buyers
                          </span>
                          <span className="font-bold text-slate-900">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                        <p className="text-sm text-slate-600">
                          Only <strong>{campaign.target_quantity - campaign.current_quantity} more buyers</strong> needed to unlock the best price of <strong>${campaign.final_price.toFixed(2)}</strong>!
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {isTargetReached && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-700 font-semibold">
                      Congratulations! The target has been reached. You're getting the best price at ${campaign.final_price.toFixed(2)}!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>Complete your purchase below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      disabled={isPaused}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      disabled={isPaused}
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      disabled={isPaused}
                    />
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-slate-900">
                        ${(currentPrice * formData.quantity).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Price includes current group buy discount
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={submitting || isPaused}
                  >
                    {submitting ? 'Processing...' : isPaused ? 'Campaign Paused' : 'Place Order'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
