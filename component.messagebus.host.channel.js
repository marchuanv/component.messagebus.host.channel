const messagebusHost = require("component.messagebus.host");
const utils = require("utils");
const requestHandlerSecure = require("component.request.handler.secure");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("MessageBus Channel");
const thisModule = "component.messagebus.host.channel";
module.exports = { 
    handle: ({ callingSubscriberModule, callingPublisherModule }, options) => {
        delegate.register(thisModule, ({ host }) => {
            const thisModuleRegisterChannel = `component.messagebus.host.channel.register.${host.publicHost}.${host.publicPort}`;
            delegate.register(thisModuleRegisterChannel, async ({ data }) => {
                
                const {channel} = utils.getJSONObject(data) || {};
                if ( !channel){
                    return { headers: { "Content-Type":"text/plain"}, statusCode: 400, statusMessage: "Bad Request", data: "channel is required" };
                }
                
                const channelPublishHandler = `component.messagebus.${host.publicHost}${channel}.publish`;
                delegate.register(channelPublishHandler, async ({ data }) => {
                    return await delegate.call(callingPublisherModule, { channel, data });
                });
                requestHandlerSecure.handle(channelPublishHandler, {
                    publicHost: host.publicHost,
                    publicPort: host.publicPort,
                    privateHost: host.privateHost,
                    privatePort: host.privatePort,
                    path: `/${channel}/publish`,
                    hashedPassphrase: host.hashedPassphrase,
                    hashedPassphraseSalt: host.hashedPassphraseSalt
                });
                const channelSubscribeHandler = `component.messagebus.${host.publicHost}${channel}.subscribe`;
                delegate.register(channelSubscribeHandler, async ({ data }) => {
                    return await delegate.call(callingSubscriberModule, { channel, data });
                });
                requestHandlerSecure.handle(channelSubscribeHandler, {
                    publicHost: host.publicHost,
                    publicPort: host.publicPort,
                    privateHost: host.privateHost,
                    privatePort: host.privatePort,
                    path: `/${channel}/subscribe`,
                    hashedPassphrase: host.hashedPassphrase,
                    hashedPassphraseSalt: host.hashedPassphraseSalt
                });
            });
            requestHandlerSecure.handle(thisModuleRegisterChannel, {
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