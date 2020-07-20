const messagebusChannel = require("./component.messagebus.host.channel.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingPublisherModule = "component.messagebus.publisher";
    const callingSubscriberModule = "component.messagebus.subscriber";
    delegate.register(callingPublisherModule, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: "published" };
    });
    delegate.register(callingSubscriberModule, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: "subscribed" };
    });
    await messagebusChannel.handle({ callingPublisherModule, callingSubscriberModule }, { publicHost: "localhost", publicPort: 3000, privateHost: "localhost", privatePort: 3000 });
})().catch((err)=>{
    console.error(err);
});