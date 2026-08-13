import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function TurnoverReportPage() {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">TurnoverReportPage</h1>
      <Card>
        <CardContent className="p-6">
          <p>Conteúdo da página TurnoverReportPage</p>
        </CardContent>
      </Card>
    </div>
  );
}
