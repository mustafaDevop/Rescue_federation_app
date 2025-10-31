export const baseURL = {
    API: "http://192.168.108.193:7227",
  
    Socket: "ws://192.168.108.193:7227",
  };
  
  export const authHeaders = (token: string) => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  });
  