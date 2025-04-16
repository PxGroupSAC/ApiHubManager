import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientInfoCardProps {
  client: {
    name: string;
    environment: string;
    request_limit_per_day: number;
    allowed_apis: string[];
    created_at: string;
  };
}

export default function ClientInfoCard({ client }: ClientInfoCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificado';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'No especificado';
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'No especificado';
    }
  };

  const formatNumber = (num: number) => {
    if (isNaN(num)) return 'No especificado';
    return num.toLocaleString('es-ES');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cliente autenticado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="w-32 text-muted-foreground">Nombre:</span>
            <span>{client.name || 'No especificado'}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground">Ambiente:</span>
            <span>{client.environment || 'No especificado'}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground">Límite diario:</span>
            <span>{formatNumber(client.request_limit_per_day)}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground">APIs habilitadas:</span>
            <span>{client.allowed_apis?.join(", ") || 'No especificado'}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground">Creado en:</span>
            <span>{formatDate(client.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 