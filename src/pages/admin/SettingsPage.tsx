import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
export default function SettingsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">SettingsPage</h1>
      <Card><CardContent className="p-6"><p>Conteúdo da página SettingsPage</p></CardContent></Card>
    </div>
  );
}
