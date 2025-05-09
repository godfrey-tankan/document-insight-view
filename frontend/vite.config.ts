import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      '@react-pdf-viewer/core',
      '@react-pdf-viewer/default-layout',
      'recharts'
    ],
    exclude: []
  }
}));

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import commonjs from 'vite-plugin-commonjs'
// import path from 'path'

// export default defineConfig({
//   server: {
//     host: "::",
//     port: 8080,
//   },

//   resolve: {
//     alias: [
//       {
//         find: "@",
//         replacement: path.resolve(__dirname, "./src"),
//       },
//       // Add specific component aliases for better resolution
//       {
//         find: "@/components",
//         replacement: path.resolve(__dirname, "./src/components"),
//       },
//       {
//         find: "@/lib",
//         replacement: path.resolve(__dirname, "./src/lib"),
//       },
//     ],
//   },
//   plugins: [
//     react(),
//     commonjs({
//       filter(id) {
//         return ['@react-pdf-viewer'].some(p => id.includes(p))
//       }
//     })
//   ],
//   optimizeDeps: {
//     include: [
//       '@react-pdf-viewer/core',
//       '@react-pdf-viewer/default-layout'
//     ]
//   }
// })