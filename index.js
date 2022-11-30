const aws = require("aws-sdk");
aws
    .config
    .update({region: 'us-east-1'})
const ses = new aws.SES({region: "us-east-1"});
const dynamoDatabase = new aws.DynamoDB({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION || 'us-east-1'
});
exports.handler = async function (event) {
    const message = event
        .Records[0]
        .Sns
        .Message
    const messageFromWebApp = JSON.parse(message);
    const emailAddress = messageFromWebApp.username;
    const token = messageFromWebApp.token;
    const seconds = 300;
    const secondsInEpoch = Math.round(Date.now() / 1000);
    const expirationTime = secondsInEpoch + seconds;
    const body = `
      <!DOCTYPE html>
          <head>
          </head>
          <body>
            <p>Hi, ${emailAddress}</p>
            <p><a href="https://prod.prasannanimbalkar.me/v1/verifyUserEmail?token=${token}&email=${emailAddress}"> 
             Click here </a> to verify your email
              </br>
              <p>Link will be valid only for 5 minutes!</p>
              </br>
              <p>you can use the following link:</p>
            </p>
            <p>
              <a href="https://prod.prasannanimbalkar.me/v1/verifyUserEmail?token=${token}&email=${emailAddress}"> 
              https://prod.prasannanimbalkar.me/v1/verifyUserEmail?token=${token}&email=${emailAddress} </a> 
            </p>
            </body>
      </html>`;
    const params = {
        Destination: {
            ToAddresses: [emailAddress]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: body
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Please verify your email for Prazz's website"
            }
        },
        Source: "reply@prod.prasannanimbalkar.me"
    };
    return ses
        .sendEmail(params)
        .promise()
};