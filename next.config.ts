import type { NextConfig } from "next";
import { securityHeaders } from "./lib/request-security";
const config: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
export default config;
