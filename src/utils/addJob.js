const addJob = async ({ tiktokId, userId }) =>
  await jobQueue.add({
    tiktokId,
    userId,
  });

module.exports = { addJob };
