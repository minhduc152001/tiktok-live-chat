const Queue = require("bull");
const UserService = require("../services/user.service");

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PWD = process.env.REDIS_PWD;

const jobIntervals = {}; // To store jobId and intervalId mappings

const removeJob = async (jobId) => {
  if (jobIntervals[jobId]) {
    clearInterval(jobIntervals[jobId]); // Clear the interval
    delete jobIntervals[jobId]; // Remove the reference to the interval
  }

  const job = await jobQueue.getJob(jobId);
  if (job) {
    await job.remove();
    console.log(`Job ${jobId} removed`);
  }
};

const config = {
  redis: {
    family: 6,
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    password: REDIS_PWD,
  },
};

const jobQueue = new Queue("job-queue", config);
const allJobsQueue = new Queue("all-job-queue", config);

const processJobQueue = (startTrackLive) => {
  jobQueue.process(async (job) => {
    const { tiktokId, userId } = job.data;
    await startTrackLive({ tiktokId, userId, jobId: job.id }, jobIntervals);
  });

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
};

const runQueue = () => {
  allJobsQueue.add({});
};

module.exports = {
  jobQueue,
  runQueue,
  processJobQueue,
  jobIntervals,
  removeJob,
};
