module.exports = {
  apps: [
    {
      name: "tiktok-live-chat",
      script: "src/index.js",
      out_file: "./logs/tiktok-live-chat.log", // Custom path for standard output log
      error_file: "./logs/tiktok-live-chat.log", // Custom path for error log
      log_date_format: "YYYY-MM-DD HH:mm:ss", // Timestamp format for each log entry
      log_rotate_interval: "1d", // Rotate logs weekly
      log_rotate_count: 7, // Keep 7 rotated logs
      log_rotate_keep: 7, // Keep 7 rotated logs
      compress: true,
      colorize: true,
    },
  ],
};
