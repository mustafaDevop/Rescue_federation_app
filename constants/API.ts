export const baseURL = {
    API:"https://rescue-federation-apii.vercel.app",
  
  };
  
  export const authHeaders = (token: string) => ({
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  });
  