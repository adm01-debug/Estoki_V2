import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function CycleCountPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">CycleCountPage</h1>
      <Card>
        <CardContent className="p-6">
          <p>Conteúdo da página CycleCountPage</p>
        </CardContent>
      </Card>
    </div>
  );
}
