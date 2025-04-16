import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("El email es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

const registerSchema = z.object({
  email: z.string().email("El email es requerido"),
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Login form setup - IMPORTANTE: debe estar antes del retorno condicional
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  // Register form setup - IMPORTANTE: debe estar antes del retorno condicional
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });
  
  // Redirect if already logged in - using useEffect for navigation
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };
  
  // If user is authenticated, return null (don't render the auth page)
  // IMPORTANTE: Todas las llamadas a hooks deben estar antes de este return
  if (user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="w-full md:w-1/2 bg-primary/10 dark:bg-primary/5 p-8 flex items-center justify-center">
        <div className="max-w-md p-6">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            API Management Platform
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Plataforma centralizada para gestionar todas tus APIs con facilidad.
            Administra credenciales, monitorea estadísticas y optimiza el rendimiento.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary/20 dark:bg-primary/10 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Monitoreo en tiempo real</h3>
                <p className="text-gray-500 dark:text-gray-400">Visualiza el uso de tus APIs con estadísticas detalladas.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/20 dark:bg-primary/10 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Seguridad avanzada</h3>
                <p className="text-gray-500 dark:text-gray-400">Gestiona llaves de API con controles de acceso robustos.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary/20 dark:bg-primary/10 p-2 rounded-full mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Multiple API Support</h3>
                <p className="text-gray-500 dark:text-gray-400">Gestiona diferentes tipos de APIs desde una única interfaz.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Forms */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Accede a tu cuenta para administrar tus APIs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingresa tu correo electrónico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Ingresa tu contraseña" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando sesión...
                          </>
                        ) : (
                          "Iniciar Sesión"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    ¿No tienes una cuenta?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                      Registrarse
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>
                    Registra una nueva cuenta para comenzar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingresa tu correo electrónico" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de Usuario</FormLabel>
                            <FormControl>
                              <Input placeholder="Elige un nombre de usuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Crea una contraseña segura" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando cuenta...
                          </>
                        ) : (
                          "Crear Cuenta"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    ¿Ya tienes una cuenta?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                      Iniciar Sesión
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}