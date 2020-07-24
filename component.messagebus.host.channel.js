const messagebusHost = require("component.messagebus.host");
const utils = require("utils");
const requestHandlerSecure = require("component.request.handler.secure");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("MessageBus Channel");
module.exports = { 
    handle: (options) => {
        const name = `${options.publicPort}/channel`;
        delegate.register("component.messagebus.host.channel", name, ({ host }) => {
            const registerChannelContext = `component.messagebus.host.channel.register`;
            const registerContextName = `${host.publicPort}/channel/register`;
            delegate.register(registerChannelContext, registerContextName, async ({  data }) => {
                
                const { channel } = utils.getJSONObject(data) || {};
                if (!channel){
                    return { headers: { "Content-Type":"text/plain"}, statusCode: 400, statusMessage: "Bad Request", data: "channel is required" };
                }
                const channelContextName = `${host.publicPort}/channel/${channel}`;
                
                const channelPublishContext = `component.messagebus.publish`;
                delegate.register(channelPublishContext, channelContextName, async ({ headers: { fromhost, fromport },data }) => {
                    await delegate.call({ context: `component.messagebus.publisher` }, { fromhost, fromport, channel, data });
                });
                requestHandlerSecure.handle(channelPublishContext, {
                    publicHost: host.publicHost,
                    publicPort: host.publicPort,
                    privateHost: host.privateHost,
                    privatePort: host.privatePort,
                    path: `/${channel}/publish`,
                    hashedPassphrase: host.hashedPassphrase,
                    hashedPassphraseSalt: host.hashedPassphraseSalt
                });

                const channelSubscribeContext = `component.messagebus.subscribe`;
                delegate.register(channelSubscribeContext, channelContextName, async ({ headers: { fromhost,fromport }, data }) => {
                    await delegate.call({ context: `component.messagebus.subscriber` }, { fromhost, fromport, channel, data });
                });
                requestHandlerSecure.handle(channelSubscribeContext, {
                    publicHost: host.publicHost,
                    publicPort: host.publicPort,
                    privateHost: host.privateHost,
                    privatePort: host.privatePort,
                    path: `/${channel}/subscribe`,
                    hashedPassphrase: host.hashedPassphrase,
                    hashedPassphraseSalt: host.hashedPassphraseSalt
                });

            });
            requestHandlerSecure.handle(registerChannelContext, {
                publicHost: host.publicHost,
                publicPort: host.publicPort,
                privateHost: host.privateHost,
                privatePort: host.privatePort,
                path: "/channel/register",
                hashedPassphrase: host.hashedPassphrase,
                hashedPassphraseSalt: host.hashedPassphraseSalt
            });
        });
        messagebusHost.handle(options);
    }
};