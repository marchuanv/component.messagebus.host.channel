const messagebusChannel = require("./component.messagebus.host.channel.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingModule = "component.messagebus.publisher";
    delegate.register(callingModule, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await messagebusChannel.handle(callingModule, { publicHost: "localhost", publicPort: 7000, privateHost: "localhost", privatePort: 7000, path: "/host/channel" });
})().catch((err)=>{
    console.error(err);
});