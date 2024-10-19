import express from "express";
import cors from "cors";
import busboy from "busboy";
import fs from "fs";
import { nanoid } from "nanoid";
import { exec } from "node:child_process";
/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {Array<CoursePart>} parts
 */

/**
 * @typedef {Object} CoursePart
 * @property {string} id
 * @property {string} name
 * @property {number} duration
 * @property {string} thumbnail
 */

/** @type {Course[]} */
const LMS_DB = [];

const app = express();
app.use(cors());
app.use(express.json());
app.use("/thumbnails", express.static("thumbnails"));

app.post("/upload", (req, res) => {
  const bb = busboy({ headers: req.headers });
  const fileId = nanoid(10);
  bb.on("file", (_, fileData, fileInfo) => {
    console.log(fileInfo);
    const filePath = `videos/${fileId}.mp4`;
    const stream = fs.createWriteStream(filePath);

    fileData.pipe(stream);
  });

  bb.on("close", () => {
    res.send({ id: fileId });
  });

  req.pipe(bb);

  return;
});

const CHUNK_SIZE = 1000000;

app.get("/video/:id", (req, res) => {
  const filePath = `videos/${req.params.id}.mp4`;

  const fileStat = fs.statSync(filePath);
  if (!fileStat) {
    console.log("no file");
    return res.sendStatus(400);
  }

  const videoSizeBytes = fileStat.size;

  const range = req.headers.range;

  if (!range) {
    console.log("no range");
    return res.sendStatus(400);
  }

  const match = range.match(/bytes=(\d+)-/);
  if (!match) {
    console.log("no match");
    return res.sendStatus(400);
  }

  const chunkStart = Number(match[1]);

  const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, videoSizeBytes - 1);

  const contentLength = chunkEnd - chunkStart + 1;

  const headers = {
    "Content-Range": `bytes ${chunkStart}-${chunkEnd}/${videoSizeBytes}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  const stream = fs.createReadStream(filePath, {
    start: chunkStart,
    end: chunkEnd,
  });

  stream.pipe(res);
});

app.post("/publish/:id", async (req, res) => {
  const videoId = req.params.id;
  const parts = req.body;
  /** @type {CoursePart[]} */
  const courseParts = [];
  for (const part of parts) {
    const videoPath = `videos/${videoId}.mp4`;
    const partId = nanoid(10);
    const partStart = parseFloat(part.start);
    const partEnd = parseFloat(part.end);
    const duration = partEnd - partStart;
    const partFilePath = `videos/${partId}.mp4`;
    const thumbnailFilePath = `thumbnails/${partId}.png`;

    const ffmpegCommand = `ffmpeg -i ${videoPath} -ss ${partStart} -to ${partEnd} -c:v copy -c:a copy ${partFilePath}`;
    const thumbnailCommand = `ffmpeg -i ${videoPath} -ss ${
      partStart + (partEnd - partStart) / 2
    } -vframes 1 ${thumbnailFilePath}`;

    try {
      await Promise.all([
        new Promise((resolve, reject) => {
          exec(ffmpegCommand, (error) => {
            if (error) {
              return reject(`Error splitting video part: ${error.message}`);
            }
            resolve();
          });
        }),

        new Promise((resolve, reject) => {
          exec(thumbnailCommand, (error) => {
            if (error) {
              return reject(`Error creating thumbnail: ${error.message}`);
            }
            resolve();
          });
        }),
      ]);
    } catch (error) {
      console.error(error);

      return res.status(500).send({ error: error });
    }
    console.log("success for part", partId);
    courseParts.push({
      id: partId,
      duration,
      thumbnail: thumbnailFilePath,
      name: part.name,
    });
  }

  LMS_DB.push({ id: videoId, parts: courseParts });

  return res.sendStatus(200);
});

app.get("/course/:id", (req, res) => {
  const courseId = req.params.id;
  const course = LMS_DB.find((c) => c.id === courseId);
  if (!course) return res.sendStatus(400);
  return res.send(course);
});

app.get("/courses", (req, res) => {
  return res.send(LMS_DB);
});

app.listen(4000, () => {
  console.log("uploading service started at port 4000");
});
