"use client";

import { useEffect, useState } from 'react';
import type { Campaign } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
function ShoppingCartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="20" cy="20" r="1" />
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

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M5 3v18l15-9L5 3z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M3 6h18" />
      <path d="M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
      <path d="M10 11v6M14 11v6" />
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

function DollarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
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
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function SellerPage() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    seller_id: '',
    title: '',
    description: '',
    image_url: '',
    starting_price: '',
    final_price: '',
    target_quantity: '',
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/campaigns?select=*&order=created_at.desc`;
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

  async function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/campaigns`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          seller_id: formData.seller_id,
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url,
          starting_price: parseFloat(formData.starting_price),
          final_price: parseFloat(formData.final_price),
          target_quantity: parseInt(formData.target_quantity),
          status: 'active',
        }),
      });
      if (!res.ok) throw new Error(`Failed to create campaign: ${res.status}`);

      toast({
        title: 'Campaign created!',
        description: 'Your group buy campaign is now live.',
      });

      setDialogOpen(false);
      setFormData({
        seller_id: '',
        title: '',
        description: '',
        image_url: '',
        starting_price: '',
        final_price: '',
        target_quantity: '',
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign. Please try again.',
        variant: 'destructive',
      });
    }
  }

  async function toggleCampaignStatus(campaignId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/campaigns?id=eq.${encodeURIComponent(
        campaignId
      )}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`Failed to update campaign: ${res.status}`);

      toast({
        title: `Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`,
        description: `The campaign is now ${newStatus}.`,
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to update campaign status.',
        variant: 'destructive',
      });
    }
  }

  async function deleteCampaign(campaignId: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/campaigns?id=eq.${encodeURIComponent(
        campaignId
      )}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to delete campaign: ${res.status}`);

      toast({
        title: 'Campaign deleted',
        description: 'The campaign has been removed.',
      });

      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete campaign.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="h-6 w-6 text-slate-900" />
                <h1 className="text-xl font-bold text-slate-900">Seller Dashboard</h1>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Create Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Group Buy Campaign</DialogTitle>
                  <DialogDescription>
                    Set up your product and pricing tiers for the group buy
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div>
                    <Label htmlFor="seller_id">Seller ID</Label>
                    <Input
                      id="seller_id"
                      required
                      value={formData.seller_id}
                      onChange={(e) => setFormData({ ...formData, seller_id: e.target.value })}
                      placeholder="Your unique seller identifier"
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Product Title</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Premium Wireless Headphones"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your product features and benefits..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      type="url"
                      required
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://images.pexels.com/..."
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Use high-quality product images from Pexels or similar sources
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="starting_price">Starting Price ($)</Label>
                      <Input
                        id="starting_price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={formData.starting_price}
                        onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                        placeholder="299.99"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Price before target is reached
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="final_price">Final Price ($)</Label>
                      <Input
                        id="final_price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={formData.final_price}
                        onChange={(e) => setFormData({ ...formData, final_price: e.target.value })}
                        placeholder="199.99"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Discounted price after target
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="target_quantity">Target Quantity</Label>
                    <Input
                      id="target_quantity"
                      type="number"
                      min="1"
                      required
                      value={formData.target_quantity}
                      onChange={(e) => setFormData({ ...formData, target_quantity: e.target.value })}
                      placeholder="50"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Number of buyers needed to unlock the final price
                    </p>
                  </div>

                  <Alert>
                    <AlertDescription>
                      Make sure your starting price is higher than the final price to create an attractive discount for buyers.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1">
                      Create Campaign
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Your Campaigns</h2>
          <p className="text-slate-600">Manage your active group buy campaigns</p>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-slate-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCartIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Campaigns Yet</h3>
              <p className="text-slate-600 mb-4">Create your first group buy campaign to get started</p>
              <Button onClick={() => setDialogOpen(true)} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => {
              const progress = (campaign.current_quantity / campaign.target_quantity) * 100;
              const discount = Math.round(((campaign.starting_price - campaign.final_price) / campaign.starting_price) * 100);
              const revenue = campaign.current_quantity * (campaign.current_quantity >= campaign.target_quantity ? campaign.final_price : campaign.starting_price);

              return (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle>{campaign.title}</CardTitle>
                          <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'paused' ? 'secondary' : 'outline'}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <img
                        src={campaign.image_url}
                        alt={campaign.title}
                        className="w-24 h-24 object-cover rounded-lg ml-4"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <DollarIcon className="h-5 w-5 text-slate-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-slate-900">${campaign.starting_price}</p>
                        <p className="text-xs text-slate-600">Starting Price</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <DollarIcon className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-green-600">${campaign.final_price}</p>
                        <p className="text-xs text-slate-600">Final Price ({discount}% off)</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <UsersIcon className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-blue-600">{campaign.current_quantity}/{campaign.target_quantity}</p>
                        <p className="text-xs text-slate-600">Buyers</p>
                      </div>
                      <div className="text-center p-4 bg-slate-50 rounded-lg">
                        <DollarIcon className="h-5 w-5 text-slate-600 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-slate-900">${revenue.toFixed(2)}</p>
                        <p className="text-xs text-slate-600">Total Revenue</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Progress to target</span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900 transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                        className="gap-2"
                      >
                        {campaign.status === 'active' ? (
                          <>
                            <PauseIcon className="h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <PlayIcon className="h-4 w-4" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteCampaign(campaign.id)}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </Button>
                      <Link href={`/product/${campaign.id}`} className="ml-auto">
                        <Button size="sm" variant="default">
                          View Campaign
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
