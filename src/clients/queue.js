const Queue = require("bull");
const { startTrackLive } = require("../services/livechat.service");
const UserService = require("../services/user.service");

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PWD = process.env.REDIS_PWD;

const config = {
  redis: {
    family: 6,
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    password: REDIS_PWD,
  },
};

// Process single queue
const jobQueue = new Queue("job-queue", config);
jobQueue.process(async (job) => {
  const { tiktokId, userId } = job.data;

  // Start listening livestream
  await startTrackLive({ tiktokId, userId, jobId: job.id });
});

// Process all queues
const allJobsQueue = new Queue("all-job-queue", config);
allJobsQueue.process(async () => {
  const users = await UserService.list();

  const userWithTiktokIds = users.filter((user) => user.tiktokIds.length > 0);

  userWithTiktokIds.map((user) => {
    user.tiktokIds.map(({ tiktokId }) =>
      jobQueue.add({
        tiktokId,
        userId: user._id,
      })
    );
  });
});

const runQueue = () => {
  allJobsQueue.add({});
};

module.exports = { jobQueue, runQueue };
