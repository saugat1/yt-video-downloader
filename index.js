let express = require("express");
let fs = require("fs");
let http = require("http");
let app = express();
let server = http.createServer(app);
const ytdl = require("ytdl-core");
const readline = require("readline");
const cp = require("child_process");
const youtubedl = require("youtube-dl-exec");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/test", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/info", async function (req, res) {
  try {
    console.time("info");
    let url = req.body.url;
    console.log(req.body);
    let validUrl = ytdl.validateURL(url);
    if (!validUrl) return res.json({ success: false, message: "invalid url" });
    let info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      referer: "http://localhost",
    });
    console.timeEnd("info");

    let audioOnlyFormat = info.requested_formats[1];
    let videoAndAudio = info.formats.filter(
      (format) => format.format_id == 18
    )[0];
    // ytdl(url).pipe(fs.createWriteStream("music.mp4"));

    res.json({
      success: true,
      thumbnail: info.thumbnail,
      title: info.title,
      duration: info.duration,
      formats: [
        { audio: audioOnlyFormat },
        { audiovideo: videoAndAudio || null },
      ],
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message || "server error",
    });
  }
});

server.listen(process.env.PORT || 8000, function () {
  console.log("server running ");
});
