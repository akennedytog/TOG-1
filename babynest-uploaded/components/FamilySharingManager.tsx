'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Mail, 
  Copy, 
  CheckCircle2, 
  XCircle,
  Clock,
  Shield,
  UserPlus,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const permissionLevels = [
  { id: 'admin', name: 'Admin', description: 'Full access - manage family members, settings', color: 'bg-purple-100 text-purple-700' },
  { id: 'editor', name: 'Editor', description: 'Can add expenses, update goals, complete tasks', color: 'bg-blue-100 text-blue-700' },
  { id: 'viewer', name: 'Viewer', description: 'View-only access, can contribute to savings', color: 'bg-warm-100 text-warm-700' },
];

const relationships = [
  { id: 'partner', name: 'Partner/Spouse', icon: '💑' },
  { id: 'grandparent', name: 'Grandparent', icon: '👴' },
  { id: 'support', name: 'Support Person', icon: '🤝' },
];

interface FamilyMember {
  id: string;
  email: string;
  name?: string;
  relationship: string;
  permissionLevel: string;
  status: 'pending' | 'active' | 'declined';
  invitedAt: string;
  acceptedAt?: string;
  avatar?: string;
}

interface Activity {
  id: string;
  userName: string;
  action: string;
  target: string;
  timestamp: string;
  avatar?: string;
}

interface FamilySharingManagerProps {
  userId?: string;
  userEmail?: string;
}

export function FamilySharingManager({ userId, userEmail }: FamilySharingManagerProps) {
  const [members, setMembers] = useState<FamilyMember[]>([
    { id: '1', email: 'partner@example.com', name: 'Alex', relationship: 'partner', permissionLevel: 'admin', status: 'active', invitedAt: '2026-01-01', acceptedAt: '2026-01-01' },
    { id: '2', email: 'mom@example.com', name: 'Grandma', relationship: 'grandparent', permissionLevel: 'viewer', status: 'pending', invitedAt: '2026-05-10' },
  ]);
  
  const [activities] = useState<Activity[]>([
    { id: '1', userName: 'Alex', action: 'added', target: '$100 to 529 Plan', timestamp: '2026-05-11T10:30:00' },
    { id: '2', userName: 'You', action: 'completed', target: 'Insurance enrollment task', timestamp: '2026-05-11T09:15:00' },
    { id: '3', userName: 'Alex', action: 'logged', target: 'Diapers expense - $45', timestamp: '2026-05-10T16:45:00' },
  ]);
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('partner');
  const [invitePermission, setInvitePermission] = useState('editor');
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const generateInviteLink = () => {
    const token = Math.random().toString(36).substring(2, 15);
    setInviteLink(`https://babynest.app/join/${token}`);
  };

  const sendInvite = () => {
    if (!inviteEmail) return;
    
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      email: inviteEmail,
      relationship: inviteRelationship,
      permissionLevel: invitePermission,
      status: 'pending',
      invitedAt: new Date().toISOString(),
    };
    
    setMembers([...members, newMember]);
    setInviteEmail('');
    setShowInviteForm(false);
    generateInviteLink();
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const getPermissionLabel = (level: string) => {
    return permissionLevels.find(p => p.id === level)?.name || level;
  };

  const getPermissionColor = (level: string) => {
    return permissionLevels.find(p => p.id === level)?.color || 'bg-warm-100 text-warm-700';
  };

  const getRelationshipLabel = (rel: string) => {
    return relationships.find(r => r.id === rel)?.name || rel;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Family Sharing</h2>
          <p className="text-warm-600">Invite partners, grandparents, and support people to collaborate.</p>
        </div>
        
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Family Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">Email Address</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="partner@example.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">Relationship</label>
                <select
                  value={inviteRelationship}
                  onChange={(e) => setInviteRelationship(e.target.value)}
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg"
                >
                  {relationships.map(r => (
                    <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-warm-700 mb-2">Permission Level</label>
                <select
                  value={invitePermission}
                  onChange={(e) => setInvitePermission(e.target.value)}
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg"
                >
                  {permissionLevels.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-4 bg-warm-50 rounded-lg">
              <p className="text-sm text-warm-600 mb-2">They'll be able to:</p>
              <ul className="text-sm text-warm-600 space-y-1">
                <li>View all family data (expenses, goals, tasks)</li>
                {invitePermission !== 'viewer' && <li>Add expenses and update goals</li>}
                {invitePermission === 'admin' && <li>Manage family members and settings</li>}
                <li>Receive activity notifications</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={sendInvite}>Send Invite</Button>
              <Button variant="ghost" onClick={() => setShowInviteForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Link Modal */}
      {inviteLink && (
        <Card className="bg-primary-50 border-primary-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-medium text-warm-900">Invite sent!</p>
                  <p className="text-sm text-warm-600">Or share this link:</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white px-3 py-2 rounded">{inviteLink}</code>
                <Button size="sm" variant="outline">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4 border border-warm-100 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-warm-900">{member.name || member.email}</span>
                    {member.status === 'pending' && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" /> Pending
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-warm-500">{getRelationshipLabel(member.relationship)}</span>
                    <span className="text-warm-300">•</span>
                    <Badge className={cn("text-xs", getPermissionColor(member.permissionLevel))}>
                      {getPermissionLabel(member.permissionLevel)}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-warm-400 mt-1">
                    {member.status === 'active' 
                      ? `Joined ${member.acceptedAt ? format(new Date(member.acceptedAt), 'MMM d, yyyy') : 'recently'}`
                      : `Invited ${format(new Date(member.invitedAt), 'MMM d, yyyy')}`
                    }
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => removeMember(member.id)}
                className="p-2 text-warm-400 hover:text-accent-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                  {activity.userName.charAt(0)}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium text-warm-900">{activity.userName}</span>{' '}
                    <span className="text-warm-600">{activity.action}</span>{' '}
                    <span className="font-medium text-warm-900">{activity.target}</span>
                  </p>
                  <p className="text-xs text-warm-400 mt-1">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
