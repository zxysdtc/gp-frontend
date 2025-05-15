const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  devServer: {
    port: 8081,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      fallback: {
        path: require.resolve("path-browserify"),
      },
    },
  },
  chainWebpack: (config) => {
    config.plugin("define").tap((args) => {
      const env = args[0]["process.env"] || {};
      env.VUE_APP_API_URL = JSON.stringify(
        process.env.VUE_APP_API_URL || "http://localhost:3000/api"
      );
      env.BASE_URL = JSON.stringify(process.env.BASE_URL || "/");
      args[0]["process.env"] = env;
      return args;
    });
  },
});
