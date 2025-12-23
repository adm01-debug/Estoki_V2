import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building, User, Mail, Phone, MapPin, Globe, Hash } from 'lucide-react';
interface CompanyCardProps { name: string; tradeName?: string; cnpj?: string; email?: string; phone?: string; address?: { street: string; city: string; state: string; zip: string }; website?: string; logo?: string; status?: 'active' | 'inactive' | 'pending'; onClick?: () => void; }
export function CompanyCard({ name, tradeName, cnpj, email, phone, address, website, logo, status = 'active', onClick }: CompanyCardProps) {
  const statusConfig = { active: { label: 'Ativo', color: 'bg-green-500' }, inactive: { label: 'Inativo', color: 'bg-red-500' }, pending: { label: 'Pendente', color: 'bg-yellow-500' } };
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {logo ? <img src={logo} alt={name} className="w-12 h-12 rounded object-cover" /> : <div className="w-12 h-12 rounded bg-muted flex items-center justify-center"><Building className="h-6 w-6 text-muted-foreground" /></div>}
          <div className="flex-1"><CardTitle className="text-base">{name}</CardTitle>{tradeName && <p className="text-sm text-muted-foreground">{tradeName}</p>}</div>
          <Badge className={statusConfig[status].color}>{statusConfig[status].label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {cnpj && <div className="flex items-center gap-2 text-muted-foreground"><Hash className="h-4 w-4" />{cnpj}</div>}
        {email && <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />{email}</div>}
        {phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />{phone}</div>}
        {address && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{address.street}, {address.city}/{address.state}</div>}
        {website && <div className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4" />{website}</div>}
      </CardContent>
    </Card>
  );
}
