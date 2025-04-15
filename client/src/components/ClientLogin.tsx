import { useState } from "react";

export default function ClientLogin() {
  const [clientId, setClientId] = useState("");

  const handleLogin = () => {
    localStorage.setItem("x-client-id", clientId);
    window.location.reload();
  };

  return (
    <div className="p-4 bg-muted border rounded mb-6 max-w-md mx-auto">
      <h2 className="text-sm font-medium mb-2">Identificate con tu Client ID</h2>
      <input
        type="text"
        placeholder="client_id"
        value={clientId}
        onChange={(e) => setClientId(e.target.value)}
        className="border p-2 w-full text-sm"
      />
      <button
        onClick={handleLogin}
        className="mt-2 px-4 py-1 bg-primary text-white text-sm rounded"
      >
        Ingresar
      </button>
    </div>
  );
} 