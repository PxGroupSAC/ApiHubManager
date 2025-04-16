import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { InsertUser } from "@shared/schema";
import { apiRequest } from "../lib/api-request";
import { useToast } from "@/hooks/use-toast";
import React from "react";

// Tipo para la respuesta del login
interface ClientResponse {
  id: string;
  name: string;
  allowed_apis: string[];
  plan?: string;
  environment: string;
  request_limit_per_day: number;
  created_at: string;
  email?: string;
  is_active?: boolean;
  updated_at?: string | null;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  client: ClientResponse;
}

type AuthContextType = {
  user: ClientResponse | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<LoginResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<null, Error, void>;
  registerMutation: UseMutationResult<ClientResponse, Error, RegisterData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<ClientResponse | null, Error>({
    queryKey: ["/user"],
    queryFn: async () => {
      const clientId = localStorage.getItem("x-client-id");
      if (!clientId) return null;
      
      // Obtener los datos del cliente desde localStorage
      const clientInfo = localStorage.getItem("client-info");
      if (clientInfo) {
        return JSON.parse(clientInfo);
      }
      
      return null;
    },
    // No ejecutar la query si no hay client_id
    enabled: !!localStorage.getItem("x-client-id"),
  });

  const queryClient = useQueryClient();

  const loginMutation = useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      try {
        // 1. Login request
        const loginRes = await apiRequest("/login", {
          method: "POST",
          body: JSON.stringify(credentials)
        });
        
        console.log('=== LOGIN RESPONSE ===');
        const loginData = await loginRes.json();
        console.log('Login data:', loginData);
        
        // 2. Validar y guardar el client_id
        if (!loginData.client_id) {
          console.error('Login response missing client_id:', loginData);
          throw new Error("No se recibió el client_id en la respuesta del login");
        }
        
        localStorage.setItem("x-client-id", loginData.client_id);
        console.log('client_id guardado:', loginData.client_id);
        
        // 3. Obtener datos completos del cliente
        console.log('Obteniendo datos del cliente...');
        const clientRes = await apiRequest("/clients/me");
        
        console.log('=== CLIENT RESPONSE ===');
        const clientData = await clientRes.json();
        console.log('Client data:', clientData);
        
        // 4. Verificar que la respuesta no sea vacía
        if (!clientData || !clientData.id) {
          console.error('Client response invalid:', clientData);
          throw new Error("No se pudieron obtener los datos completos del cliente");
        }
        
        // 5. Guardar datos completos en localStorage
        localStorage.setItem("client-info", JSON.stringify(clientData));
        console.log('Datos del cliente guardados en localStorage');
        
        // 6. Retornar respuesta completa
        const response = {
          access_token: loginData.client_id,
          token_type: 'bearer',
          client: {
            ...clientData,
            client_id: clientData.id
          }
        };
        console.log('Respuesta final:', response);
        return response;
        
      } catch (error) {
        console.error('Error en el proceso de login:', error);
        // Limpiar localStorage en caso de error
        localStorage.removeItem("x-client-id");
        localStorage.removeItem("client-info");
        throw error;
      }
    },
    onSuccess: (response) => {
      // Verificar que tenemos los datos necesarios antes de redirigir
      if (!response.client || !response.client.name) {
        toast({
          title: "Error",
          description: "No se pudieron obtener los datos del cliente",
          variant: "destructive",
        });
        return;
      }

      queryClient.setQueryData(["/user"], response.client);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.client.name}!`,
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Email o contraseña incorrectos",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<ClientResponse, Error, RegisterData>({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      console.log('Datos del registro:', responseData);
      return responseData;
    },
    onSuccess: (data) => {
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error en el registro",
        description: "Hubo un error al crear tu cuenta",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<null, Error, void>({
    mutationFn: async () => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("client-info");
      localStorage.removeItem("x-client-id");
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client"] });
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}