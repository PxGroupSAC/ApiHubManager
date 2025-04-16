import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/use-toast";

// Tipo para la respuesta del login
interface ClientResponse {
  client_id: string;
  name: string;
  allowed_apis: string[];
  plan: string;
  environment: string;
  request_limit_per_day: number;
  created_at: string;
  email: string;
  is_active: boolean;
  updated_at: string | null;
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
      
      // Usar la información que ya tenemos del login
      return {
        client_id: clientId,
        name: "Admin", // Este valor debería venir del login
        allowed_apis: ["reader", "dni-reader"], // Este valor debería venir del login
        plan: "Basic", // Este valor debería venir del login
        environment: "",
        request_limit_per_day: 0,
        created_at: "",
        email: "",
        is_active: true,
        updated_at: null
      };
    },
  });

  const queryClient = useQueryClient();

  const loginMutation = useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/login", credentials);
      const data = await res.json();
      localStorage.setItem("x-client-id", data.client_id);
      // Guardar toda la información del cliente
      console.log('Datos completos del cliente desde el backend:', data);
      localStorage.setItem("client-info", JSON.stringify({
        name: data.name,
        allowed_apis: data.allowed_apis,
        plan: data.plan
      }));
      return data as ClientResponse;
    },
    onSuccess: (user: ClientResponse) => {
      queryClient.setQueryData(["/user"], user);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.name}!`,
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Error de inicio de sesión",
        description: "Email o contraseña incorrectos",
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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const loginMutation = useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/login", credentials);
      const data = await res.json();
      localStorage.setItem("x-client-id", data.client_id);
      // Guardar toda la información del cliente
      console.log('Datos completos del cliente desde el backend:', data);
      localStorage.setItem("client-info", JSON.stringify({
        name: data.name,
        allowed_apis: data.allowed_apis,
        plan: data.plan
      }));
      return data as ClientResponse;
    },
    onSuccess: (user: ClientResponse) => {
      queryClient.setQueryData(["/user"], user);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${user.name}!`,
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Error de inicio de sesión",
        description: "Email o contraseña incorrectos",
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

  return {
    loginMutation,
    registerMutation,
    logoutMutation,
    user: localStorage.getItem("client-info")
      ? JSON.parse(localStorage.getItem("client-info")!)
      : null,
  };
}