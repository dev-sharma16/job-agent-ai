"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Link2, ExternalLink, Bell, Shield, CreditCard, Download, Upload, Trash2 } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  designation: string | null;
  bio: string | null;
  image: string | null;
  functionArea: { id: number; name: string; status: number } | null;
  coins: { id: string; userId: string; coins: number } | null;
  streak: { id: string; userId: string; currentStreak: number; maxStreak: number } | null;
  premium: { id: string; userId: string; planId: number; startDate: Date; endDate: Date; isActive: boolean } | null;
  accounts: { provider: string; providerAccountId: string }[];
  passwordHash: string | null;
  linkedinToken: string | null;
  linkedinTokenExpiry: Date | null;
  extensionId: string | null;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

type PartialUserProfile = Partial<UserProfile> & { id: string; name: string; email: string };

interface AccountPageClientProps {
  initialProfile: PartialUserProfile | null;
}

export default function AccountPageClient({ initialProfile }: AccountPageClientProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({
    fullName: initialProfile?.name || "",
    email: initialProfile?.email || "",
    phone: initialProfile?.phone || "",
    location: initialProfile?.location || "",
    designation: initialProfile?.designation || "",
    bio: initialProfile?.bio || "",
  });

  useEffect(() => {
    if (initialProfile) {
      setProfile({
        fullName: initialProfile.name || "",
        email: initialProfile.email || "",
        phone: initialProfile.phone || "",
        location: initialProfile.location || "",
        designation: initialProfile.designation || "",
        bio: initialProfile.bio || "",
      });
    }
  }, [initialProfile]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailJobs: true,
    emailInterviews: true,
    emailMarketing: false,
    pushJobs: true,
    pushInterviews: true,
  });
  const [connectedAccounts] = useState([
    { provider: "google", connected: true, email: "john@gmail.com" },
    { provider: "linkedin", connected: false, email: "" },
  ]);
  const [subscription] = useState({
    plan: "Pro",
    status: "active",
    renewsAt: "2024-12-31",
    coins: 1250,
  });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    // API call would go here
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500">Manage your profile, security, and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="connected" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Connected
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {profile.fullName.charAt(0)}
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} disabled />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Current Designation</Label>
                <Input id="designation" value={profile.designation} onChange={(e) => setProfile({ ...profile, designation: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Summary</Label>
                <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveProfile} loading={saving}>
                  Save Changes
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t">
                <h4 className="font-medium text-gray-900 mb-3">Danger Zone</h4>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} minLength={8} />
                <p className="text-sm text-gray-500">Must be at least 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
              </div>
              <Button onClick={handleChangePassword}>Update Password</Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Authenticator App</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <SessionItem current />
                <SessionItem />
                <SessionItem />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connected">
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectedAccounts.map((account) => (
                <div key={account.provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", account.provider === "google" ? "bg-red-100" : "bg-blue-100")}>
                      {account.provider === "google" ? (
                        <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/></svg>
                      ) : (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      )}
                    </div>
                    <div>
                      <span className="font-medium capitalize">{account.provider}</span>
                      <p className="text-sm text-gray-500">{account.connected ? account.email : "Not connected"}</p>
                    </div>
                  </div>
                  {account.connected ? (
                    <Button variant="outline" size="sm">Disconnect</Button>
                  ) : (
                    <Button onClick={() => window.location.href = `/api/auth/signin/${account.provider}`}>Connect</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Browser Extension</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Extension ID</p>
                    <p className="text-sm text-gray-500 font-mono">ext_abc123def456</p>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Extension Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle label="Job Recommendations" description="Get personalized job matches" value={notifications.emailJobs} onChange={(v) => setNotifications({ ...notifications, emailJobs: v })} />
              <NotificationToggle label="Interview Reminders" description="Reminders for upcoming interviews" value={notifications.emailInterviews} onChange={(v) => setNotifications({ ...notifications, emailInterviews: v })} />
              <NotificationToggle label="Marketing Updates" description="Product updates and tips" value={notifications.emailMarketing} onChange={(v) => setNotifications({ ...notifications, emailMarketing: v })} />
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle label="Job Alerts" description="Real-time job notifications" value={notifications.pushJobs} onChange={(v) => setNotifications({ ...notifications, pushJobs: v })} />
              <NotificationToggle label="Interview Alerts" description="Interview reminders and updates" value={notifications.pushInterviews} onChange={(v) => setNotifications({ ...notifications, pushInterviews: v })} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{subscription.plan} Plan</h3>
                    <Badge variant="default">{subscription.status}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{subscription.coins} Coins</p>
                    <p className="text-sm text-gray-500">Renews {subscription.renewsAt}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <FeatureCard title="AI Resume Builder" included={true} />
                <FeatureCard title="Mock Interviews" included={true} />
                <FeatureCard title="LinkedIn Optimizer" included={true} />
              </div>

              <Button className="w-full" variant="outline">
                Manage Subscription
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Coin Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-2xl">🪙</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{subscription.coins}</p>
                    <p className="text-sm text-gray-500">Coins available</p>
                  </div>
                </div>
                <Button variant="outline">Redeem Coins</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function NotificationToggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-gray-300"}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`absolute top-0.5 transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`}>
          <span className="w-5 h-5 rounded-full bg-white shadow" />
        </span>
      </button>
    </div>
  );
}

function SessionItem({ current = false }: { current?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between p-3 rounded-lg", current ? "bg-primary/5" : "bg-gray-50")}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="font-medium">Chrome on Windows</p>
          <p className="text-sm text-gray-500">Active now</p>
        </div>
      </div>
      {current && <Badge variant="default" className="ml-2">Current</Badge>}
    </div>
  );
}

function FeatureCard({ title, included }: { title: string; included: boolean }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        {included ? (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
        ) : (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
        )}
        <span className="font-medium">{title}</span>
      </div>
    </div>
  );
}

const connectedAccounts = [
  { provider: "google", connected: true, email: "john@gmail.com" },
  { provider: "linkedin", connected: false, email: "" },
];