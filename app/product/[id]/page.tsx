'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase, type Campaign } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, Users, TrendingDown, ArrowLeft, CheckCircle2, Package } from 'lucide-react';
import Link from 'next/link';
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
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        router.push('/');
        return;
      }
      setCampaign(data);
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

      const { error } = await supabase
        .from('orders')
        .insert({
          campaign_id: campaign.id,
          buyer_name: formData.name,
          buyer_email: formData.email,
          quantity: formData.quantity,
          price_paid: currentPrice,
          status: 'confirmed',
        });

      if (error) throw error;

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
  const currentPrice = campaign.current_quantity >= campaign.target_quantity
    ? campaign.final_price
    : campaign.starting_price;
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
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-slate-900" />
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
                    <Package className="h-5 w-5" />
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
                        <TrendingDown className="h-5 w-5 text-red-500" />
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
                            <Users className="h-5 w-5" />
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
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
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
