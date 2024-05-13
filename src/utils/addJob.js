const { jobQueue } = require("../clients/queue");

const addJob = ({ tiktokId, userId }) =>
  jobQueue.add({
    tiktokId,
    userId,
  });

module.exports = { addJob };
