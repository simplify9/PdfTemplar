import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import e, { Request, Response } from 'express';
import logger from 'morgan';
import path from 'path';
import BaseRouter from './routes';
import fs from "fs"
import bodyParser from "body-parser"
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob"
import aws from "aws-sdk";
//@ts-ignore
import fetch from "node-fetch";
import { Readable } from 'stream';

dotenv.config();

// Init express
const app = express();
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true,
  parameterLimit: 100000000
}));
app.use(bodyParser.json({ limit: '50mb', strict: false }));
// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', BaseRouter);

/**
 * Point express to the 'views' directory. If you're using a
 * single-page-application framework like react or angular
 * which has its own development server, you might want to
 * configure this to only serve the index file while in
 * production mode.
 */
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

//Always HTTPS
//app.use((req, res, next) => {
//    const proto = req.headers["x-forwarded-proto"] || "";
//    if(!req.headers.host!.includes("localhost") && proto !== "https"){
//        const secureUrl = "https://" + req.headers.host + (req.url === "/" ? "/editor" : req.url);
//        res.redirect(secureUrl);
//    }
//    else {
//        next();
//    }
//})


const b64ToArrayBuff = (base64: string) => {
  const bynString = window.atob(base64);
  var bynLen = bynString.length;
  var bytes = new Uint8Array(bynLen);
  for(let i = 0; i < bynLen; i++){
    var ascii = bynString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes;
}


app.post("/uploadImage", async (req, res) => {
  const format = req.body.split(',')[0].match(new RegExp("\/.*?;"))![0].slice(1, -1);
  const base64 = req.body.split(',')[1];
  const blobName = "blob-" + Math.random().toString(36).substring(7) + 
                "-" + new Date().toISOString() + "." + (format? format : "jpg");
  const buffer = Buffer.from(base64, "base64");

  const accessKey = process.env.ACCESSKEYID!
  const secretKey = process.env.SECRETACCESSKEY!
  const bucketName = process.env.BUCKETNAME!
  const serviceUrl = process.env.SERVICEURL!
  const blobUrl = process.env.BLOBURL!

  const s3 = new aws.S3({
    endpoint: serviceUrl,
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  })

  const params: aws.S3.PutObjectRequest = {
    Body: buffer,
    Bucket: bucketName,
    Key: blobName,
    ACL: "public-read"
  }

  const blobLocation = `${blobUrl}/${blobName}`;

  s3.putObject(params, (err, data) => {
    if (err) console.log(err, err.stack);
    else res.status(200).end(blobLocation);

  })

});

app.get('/version', (req, res) => {
  res.status(200).type('plain/text').end(process.env.REACT_APP_BUILD)
})

app.get('/healthcheck', (req, res) => {
  res.status(200).end("{}");
})

app.get('/', (req, res) => {
  let redirectString = `/editor`

  if (req.query) {
    if (req.query.data_endpoint)
      redirectString += `?data_endpoint=${req.query.data_endpoint}`
    if (req.query.post_url)
      redirectString += `&post_url=${req.query.post_url}`
  }
  redirectString = (req.headers.host!.includes("localhost") ? 
                  "http://" : "https://") + req.headers.host + redirectString;
  res.redirect(redirectString);
})
app.use(express.static(path.join(__dirname, 'editor/')));
app.use("/editor", express.static(path.join(__dirname, 'editor/')));
app.use("/guide", express.static(path.join(viewsDir + "/userGuide")));
//app.get('/', serveStatic)


app.on('unhandledRejection', (parent) => {
  console.log(parent.stack);
})

// Export express instance
export default app;
