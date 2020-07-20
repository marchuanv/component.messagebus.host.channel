const messagebusHost = require("component.messagebus.host");
const utils = require("utils");
const requestHandlerSecure = require("component.request.handler.secure");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("MessageBus Channel");
const thisModule = "component.messagebus.host.channel";
module.exports = { 
    handle: (callingModule, options) => {
        delegate.register(thisModule, ({ host }) => {
            const channelModule = `component.messagebus.host.channel.register.${host.publicHost}.${host.publicPort}`;
            delegate.register(channelModule, async ({ data }) => {
                const {channel} = utils.getJSONObject(data) || {};
                if ( !channel){
                    return { headers: { "Content-Type":"text/plain"}, statusCode: 400, statusMessage: "Bad Request", data: "channel is required" };
                }
                await delegate.call(callingModule, { channel });
            });
            requestHandlerSecure.handle(channelModule, {
                publicHost: host.publicHost,
                publicPort: host.publicPort,
                privateHost: host.privateHost,
                privatePort: host.privatePort,
                path: "/channel",
                hashedPassphrase: host.hashedPassphrase,
                hashedPassphraseSalt: host.hashedPassphraseSalt
            });
        });
        messagebusHost.handle(thisModule, options);
    }
};