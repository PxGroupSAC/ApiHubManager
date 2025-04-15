import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientInfoCard({ client }: { client: any }) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cliente autenticado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div><strong>ID:</strong> {client.id}</div>
        <div><strong>Nombre:</strong> {client.name}</div>
        <div><strong>Ambiente:</strong> {client.environment}</div>
        <div><strong>Límite diario:</strong> {client.request_limit_per_day}</div>
        <div><strong>APIs habilitadas:</strong> {client.allowed_apis.join(", ")}</div>
        <div><strong>Creado en:</strong> {new Date(client.created_at).toLocaleString()}</div>
      </CardContent>
    </Card>
  );
} 