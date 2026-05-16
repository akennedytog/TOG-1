'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Baby, 
  Calendar, 
  MapPin, 
  TrendingUp,
  LogOut,
  Users,
  BookOpen,
  MessageSquare,
  Calculator,
  Briefcase,
  Menu,
  X,
  ChevronDown,
  User
} from 'lucide-react';
import { supabase, Profile } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateProfile } from '@/lib/supabase';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Baby },
  { href: '/financial-timeline', label: 'Timeline', icon: Calendar },
  { href: '/hospital-costs', label: 'Costs', icon: TrendingUp },
  { href: '/readiness', label: 'Readiness', icon: TrendingUp },
  { href: '/milestones', label: 'Milestones', icon: TrendingUp },
  { href: '/baby-name', label: 'Baby Name', icon: Baby },
  { href: '/community', label: 'Community', icon: MessageSquare },
  { href: '/providers', label: 'Providers', icon: Briefcase },
  { href: '/leave-calculator', label: 'Leave Calc', icon: Calculator },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: User },
];

export function SharedHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Profile edit modal state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editDueDate, setEditDueDate] = useState('');
  const [editState, setEditState] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
      setLoading(false);
    };
    
    fetchUser();
  }, []);

  // Calculate pregnancy stats
  const weeksPregnant = profile?.due_date 
    ? Math.max(0, 40 - Math.ceil((new Date(profile.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)))
    : null;
  
  const trimester = weeksPregnant 
    ? weeksPregnant <= 12 ? 1 : weeksPregnant <= 27 ? 2 : 3
    : null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Don't show header on landing page
  if (pathname === '/') return null;

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-warm-100 sticky top-0 z-40 shadow-soft">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center shadow-soft group-hover:shadow-md transition-shadow">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-warm-900 text-sm">BabyNest</h1>
                <p className="text-[10px] text-warm-600 -mt-0.5">Financial Planning</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive 
                        ? "bg-primary-100 text-primary-700" 
                        : "text-warm-600 hover:bg-warm-50 hover:text-warm-900"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side - Profile Info */}
            <div className="flex items-center gap-2">
              {profile && (
                <div className="hidden md:flex items-center gap-2">
                  {/* Due Date */}
                  {profile.due_date && (
                    <button 
                      onClick={() => {
                        setEditDueDate(profile.due_date || '');
                        setEditState(profile.state || '');
                        setShowEditProfile(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 text-xs hover:shadow-sm transition-shadow"
                    >
                      <Calendar className="w-3 h-3 text-primary-600" />
                      <span className="font-medium text-primary-700">
                        {formatDate(profile.due_date)}
                      </span>
                    </button>
                  )}
                  
                  {/* State */}
                  {profile.state && (
                    <button 
                      onClick={() => {
                        setEditDueDate(profile.due_date || '');
                        setEditState(profile.state || '');
                        setShowEditProfile(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg border border-accent-200 text-xs hover:shadow-sm transition-shadow"
                    >
                      <MapPin className="w-3 h-3 text-accent-600" />
                      <span className="font-medium text-accent-700">
                        {profile.state}
                      </span>
                    </button>
                  )}
                  
                  {/* Week/Trimester */}
                  {weeksPregnant !== null && (
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-200 text-xs">
                      <TrendingUp className="w-3 h-3 text-primary-600" />
                      <span className="font-medium text-primary-700">
                        W{weeksPregnant} • T{trimester}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-warm-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-warm-600" />
                ) : (
                  <Menu className="w-5 h-5 text-warm-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-3 pt-3 border-t border-warm-100">
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                        isActive 
                          ? "bg-primary-100 text-primary-700" 
                          : "text-warm-600 hover:bg-warm-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              {/* Mobile Profile Info */}
              {profile && (
                <div className="mt-3 pt-3 border-t border-warm-100 flex flex-wrap gap-2">
                  {profile.due_date && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary-50 rounded text-xs">
                      <Calendar className="w-3 h-3 text-primary-600" />
                      <span className="text-primary-700">{formatDate(profile.due_date)}</span>
                    </div>
                  )}
                  {profile.state && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-accent-50 rounded text-xs">
                      <MapPin className="w-3 h-3 text-accent-600" />
                      <span className="text-accent-700">{profile.state}</span>
                    </div>
                  )}
                  {weeksPregnant !== null && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary-50 rounded text-xs">
                      <TrendingUp className="w-3 h-3 text-primary-600" />
                      <span className="text-primary-700">Week {weeksPregnant}</span>
                    </div>
                  )}
                </div>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Profile Edit Modal */}
      <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={editState}
                onValueChange={(value) => setEditState(value)}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alabama">Alabama</SelectItem>
                  <SelectItem value="Alaska">Alaska</SelectItem>
                  <SelectItem value="Arizona">Arizona</SelectItem>
                  <SelectItem value="Arkansas">Arkansas</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="Colorado">Colorado</SelectItem>
                  <SelectItem value="Connecticut">Connecticut</SelectItem>
                  <SelectItem value="Delaware">Delaware</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Hawaii">Hawaii</SelectItem>
                  <SelectItem value="Idaho">Idaho</SelectItem>
                  <SelectItem value="Illinois">Illinois</SelectItem>
                  <SelectItem value="Indiana">Indiana</SelectItem>
                  <SelectItem value="Iowa">Iowa</SelectItem>
                  <SelectItem value="Kansas">Kansas</SelectItem>
                  <SelectItem value="Kentucky">Kentucky</SelectItem>
                  <SelectItem value="Louisiana">Louisiana</SelectItem>
                  <SelectItem value="Maine">Maine</SelectItem>
                  <SelectItem value="Maryland">Maryland</SelectItem>
                  <SelectItem value="Massachusetts">Massachusetts</SelectItem>
                  <SelectItem value="Michigan">Michigan</SelectItem>
                  <SelectItem value="Minnesota">Minnesota</SelectItem>
                  <SelectItem value="Mississippi">Mississippi</SelectItem>
                  <SelectItem value="Missouri">Missouri</SelectItem>
                  <SelectItem value="Montana">Montana</SelectItem>
                  <SelectItem value="Nebraska">Nebraska</SelectItem>
                  <SelectItem value="Nevada">Nevada</SelectItem>
                  <SelectItem value="New Hampshire">New Hampshire</SelectItem>
                  <SelectItem value="New Jersey">New Jersey</SelectItem>
                  <SelectItem value="New Mexico">New Mexico</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="North Carolina">North Carolina</SelectItem>
                  <SelectItem value="North Dakota">North Dakota</SelectItem>
                  <SelectItem value="Ohio">Ohio</SelectItem>
                  <SelectItem value="Oklahoma">Oklahoma</SelectItem>
                  <SelectItem value="Oregon">Oregon</SelectItem>
                  <SelectItem value="Pennsylvania">Pennsylvania</SelectItem>
                  <SelectItem value="Rhode Island">Rhode Island</SelectItem>
                  <SelectItem value="South Carolina">South Carolina</SelectItem>
                  <SelectItem value="South Dakota">South Dakota</SelectItem>
                  <SelectItem value="Tennessee">Tennessee</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="Utah">Utah</SelectItem>
                  <SelectItem value="Vermont">Vermont</SelectItem>
                  <SelectItem value="Virginia">Virginia</SelectItem>
                  <SelectItem value="Washington">Washington</SelectItem>
                  <SelectItem value="West Virginia">West Virginia</SelectItem>
                  <SelectItem value="Wisconsin">Wisconsin</SelectItem>
                  <SelectItem value="Wyoming">Wyoming</SelectItem>
                  <SelectItem value="District of Columbia">District of Columbia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowEditProfile(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!user?.id) {
                  alert('Please sign in again');
                  return;
                }
                setSavingProfile(true);
                try {
                  const { error } = await updateProfile(user.id, {
                    due_date: editDueDate || null,
                    state: editState || null,
                  });
                  if (error) {
                    alert('Failed to save: ' + error.message);
                  } else if (profile) {
                    setProfile({ ...profile, due_date: editDueDate || null, state: editState || null });
                    setShowEditProfile(false);
                  }
                } catch (err: any) {
                  alert('Error: ' + err.message);
                } finally {
                  setSavingProfile(false);
                }
              }}
              disabled={savingProfile}
            >
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
