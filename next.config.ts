import type { NextConfig } from "next";
import { networkInterfaces, type NetworkInterfaceInfo } from "node:os";

function getLocalIpv4Addresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter((networkInterface): networkInterface is NetworkInterfaceInfo => {
      return (
        networkInterface !== undefined &&
        networkInterface.family === "IPv4" &&
        !networkInterface.internal
      );
    })
    .map((networkInterface) => networkInterface.address);
}

const nextConfig: NextConfig = {
  allowedDevOrigins: getLocalIpv4Addresses(),
  output: "standalone",
  reactStrictMode: true,
};

export default nextConfig;
