import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
interface UserCardProps { name: string; email?: string; phone?: string; avatar?: string; role?: string; department?: string; location?: string; joinDate?: Date; status?: 'online' | 'offline' | 'busy' | 'away'; onClick?: () => void; }
export function UserCard({ name, email, phone, avatar, role, department, location, joinDate, status = 'offline', onClick }: UserCardProps) {
  const statusColors = { online: 'bg-green-500', offline: 'bg-gray-400', busy: 'bg-red-500', away: 'bg-yellow-500' };
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="relative"><Avatar className="h-12 w-12"><AvatarImage src={avatar} alt={name} /><AvatarFallback>{name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback></Avatar><div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColors[status]}`} /></div>
          <div><CardTitle className="text-base">{name}</CardTitle>{role && <p className="text-sm text-muted-foreground">{role}</p>}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{email}</div>}
        {phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{phone}</div>}
        {department && <div className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" />{department}</div>}
        {location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{location}</div>}
        {joinDate && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />Desde {joinDate.toLocaleDateString()}</div>}
      </CardContent>
    </Card>
  );
}
