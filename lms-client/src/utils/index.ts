export const BASE_URL = "http://localhost:4000";

export const formatTime = (z: string | number) => {
  const sec = typeof z === "string" ? parseFloat(z) : z;

  return sec < 60
    ? `${sec.toFixed(2)} sec`
    : sec < 3600
    ? `${Math.floor(sec / 60)} min ${(sec % 60).toFixed(2)} sec`
    : `${Math.floor(sec / 3600)} hr ${Math.floor((sec % 3600) / 60)} min`;
};
