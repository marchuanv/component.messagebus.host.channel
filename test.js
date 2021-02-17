const messagebusChannel = require("./component.messagebus.host.channel.js");
const delegate = require("component.delegate");
const crypto = require("crypto");
const request = require("component.request");
const generateKeys = (passphrase) => {
    return crypto.generateKeyPairSync('rsa', { modulusLength: 4096,
        publicKeyEncoding: { type: 'spki', format: 'pem'},
        privateKeyEncoding: { type: 'pkcs8', format: 'pem', cipher: 'aes-256-cbc', passphrase }
    });
};
const stringToBase64 = (str) => {
    return Buffer.from(str, "utf8").toString("base64");
}

(async()=>{ 
   
    await messagebusChannel.handle({ host: "localhost", port: 3000 });
    
    //Register New Host
    const newHost = { host: "localhost", port: "6000" };
    let results = await request.send({
        host: "localhost",
        port: 3000,
        path: "/host",
        method: "GET",
        headers: { 
            username: "marchuanv",
            fromhost: "localhost",
            fromport: 6000,
            passphrase: "secure1"
        }, 
        data: JSON.stringify(newHost),
        retryCount: 1
    });
    if (results.statusCode !== 200){
        throw "New Request To Register New Host Test Failed";
    }

    //New Request To Secured Host To Get Token
    results = await request.send({
        host: newHost.host,
        port: newHost.port,
        path: "/channel/register",
        method: "GET",
        headers: { 
            username: "marchuanv",
            fromhost: "bob",
            fromport: 8000,
            passphrase: "secure1"
        }, 
        data: "",
        retryCount: 1
    });
    if (results.statusCode !== 200){
        throw "New Request To Secured Host To Get Token Test Failed";
    }
    const token = results.headers.token;

    //New Request To Secured Host To Register A Channel
    const { publicKey } = generateKeys("secure1");
    const encryptionkey = stringToBase64(publicKey);
    results = await request.send({
        host: newHost.host,
        port: newHost.port,
        path: "/channel/register",
        method: "GET",
        headers: { 
            username: "marchuanv",
            fromhost: "localhost",
            fromport: 6000,
            token,
            encryptionkey
        }, 
        data: `{ "channel":"apples" }`,
        retryCount: 1
    });
    if (results.statusCode !== 200){
        throw "New Request To Secured Host To Register A Channel Test Failed";
    }

    const publisherContext = "component.messagebus.publisher";
    const subscriberContext = "component.messagebus.subscriber";
    const contextName = `${newHost.port}/apples`;
    delegate.register(publisherContext, contextName, () => {
        return { statusCode: 200, statusMessage: "Publish Success", headers: {}, data: "published" };
    });
    delegate.register(subscriberContext, contextName, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: "subscribed" };
    });

    //New Publish Request To Secured Host Channel
    results = await request.send({
        host: newHost.host,
        port: newHost.port,
        path: "/apples/publish",
        method: "POST",
        headers: { 
            username: "marchuanv",
            fromhost: "localhost",
            fromport: 6000,
            token,
            encryptionkey
        }, 
        data: ``,
        retryCount: 1
    });
    if (results.statusCode !== 200 && results.statusMessage !== "Publish Success"){
        throw "New Publish Request To Secured Host Channel";
    }

    process.exit();

})().catch((err)=>{
    console.error(err);
});