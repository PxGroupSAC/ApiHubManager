import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

// Permitir que application sea de tipo any para soportar tanto Application como Client
interface ApplicationRowProps {
  application: any;
  onView: (application: any) => void;
}

export default function ApplicationRow({ application, onView }: ApplicationRowProps) {
  // Detectar si es client (tiene allowed_apis y environment) o application (tiene description y appId)
  const isClient = !!application.allowed_apis;

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">{application.name}</TableCell>
      {isClient ? (
        <>
          <TableCell className="text-muted-foreground">{application.environment}</TableCell>
          <TableCell className="text-muted-foreground">{Array.isArray(application.allowed_apis) ? application.allowed_apis.join(", ") : ""}</TableCell>
          <TableCell className="font-mono text-sm">{application.created_at ? new Date(application.created_at).toLocaleDateString() : ""}</TableCell>
        </>
      ) : (
        <>
          <TableCell className="text-muted-foreground">{application.description}</TableCell>
          <TableCell className="font-mono text-sm">{application.appId}</TableCell>
          <TableCell className="font-mono text-sm">{application.apiKey || "-"}</TableCell>
        </>
      )}
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onView(application)}
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
