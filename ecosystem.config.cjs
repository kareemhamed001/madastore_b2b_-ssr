module.exports = {
  apps: [
    {
      name: "nuxt-app",
      script: ".output/server/index.mjs",
      cwd: "/home/madafurniture-b2b/htdocs/b2b.madafurniture.com",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
}