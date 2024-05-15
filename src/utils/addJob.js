const addJob =
  (jobQueue) =>
  async ({ tiktokId, userId }) =>
    await jobQueue.add({
      tiktokId,
      userId,
    });

module.exports = { addJob };
