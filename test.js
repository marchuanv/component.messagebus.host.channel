const messagebusChannel = require("./component.messagebus.host.channel.js");
const delegate = require("component.delegate");
(async()=>{ 
    const publisherContext = "component.messagebus.publisher";
    const subscriberContext = "component.messagebus.subscriber";
    const contextName = `3000.apples`;
    delegate.register(publisherContext, contextName, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: "published" };
    });
    delegate.register(subscriberContext, contextName, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: "subscribed" };
    });
    await messagebusChannel.handle({ publicHost: "localhost", publicPort: 3000, privateHost: "localhost", privatePort: 3000 });
})().catch((err)=>{
    console.error(err);
});