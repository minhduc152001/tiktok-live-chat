module.exports = {
  apps: [
    {
      name: "tiktok-live-chat",
      script: "src/index.js",
      out_file: "./logs/combined.log", // Custom path for standard output log
      error_file: "./logs/combined.log", // Custom path for error log
      log_date_format: "YYYY-MM-DD HH:mm:ss", // Timestamp format for each log entry
    },
  ],
};
