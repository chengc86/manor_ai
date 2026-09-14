import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.RENDER_BUILD==='1'?{output:'standalone' as const,distDir:'.render-next',webpack:(config:any,{webpack}:any)=>{config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^cloudflare:workers$/,process.cwd()+'/runtime/neon-env.ts'));return config}}:{}),
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
};

export default nextConfig;
