// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */

const allowedHostnames = [
  "example.com",
  "img.icons8.com",
  "s3-alpha.figma.com",
  "cdn.prod.website-files.com",
  "c8.alamy.com",
  "i.vimeocdn.com",
  "toolset.com",
  "lreclvqyoujucqaggxfy.supabase.co",
  "dev.windwardsailingclub.com",
  "pknbhkxuqdmghngwniok.supabase.co",
];

const nextConfig = {
  images: {
    remotePatterns: allowedHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
    // unoptimized: true,
  },
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
