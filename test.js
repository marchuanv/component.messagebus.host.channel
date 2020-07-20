const messagebusChannel = require("./component.messagebus.host.channel.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingModule = "component.messagebus.publisher";
    delegate.register(callingModule, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await messagebusChannel.handle({ publicHost: "localhost", publicPort: 3000, privateHost: "localhost", privatePort: 3000 });
})().catch((err)=>{
    console.error(err);
});