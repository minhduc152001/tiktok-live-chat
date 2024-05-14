const addJob = async (jobQueue, { tiktokId, userId }) =>
  await jobQueue.add({
    tiktokId,
    userId,
  });

module.exports = { addJob };
