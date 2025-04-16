import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientLogin() {
  const { loginMutation, user, logoutMutation } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (user) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bienvenido, {user.name}</CardTitle>
          <CardDescription>Client ID: {localStorage.getItem("x-client-id")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleLogout} variant="destructive">
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 