const messagebusHost = require("component.messagebus.host");
const utils = require("utils");
const requestHandlerSecure = require("component.request.handler.secure");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("MessageBus Channel");
module.exports = { 
    handle: (options) => {
        const name = `${options.port}/channel`;
        delegate.register("component.messagebus.host.channel", name, ({ host }) => {
            const registerChannelContext = `component.messagebus.host.channel.register`;
            const registerContextName = `${host.port}/channel/register`;
            delegate.register(registerChannelContext, registerContextName, async ({  data }) => {
                
                const { channel } = utils.getJSONObject(data) || {};
                if (!channel){
                    return { headers: { "Content-Type":"text/plain"}, statusCode: 400, statusMessage: "Bad Request", data: "channel is required" };
                }

                const publisherChannelContextName = `${host.port}/${channel}/publish`;
                const channelPublishContext = `component.messagebus.publish`;
                delegate.register(channelPublishContext, publisherChannelContextName, async ({ headers: { fromhost, fromport },data }) => {
                    return await delegate.call({ context: `component.messagebus.publisher`, name: `${host.port}/${channel}` }, { fromhost, fromport, channel, data });
                });
                requestHandlerSecure.handle(channelPublishContext, {
                    host: host.name,
                    port: host.port,
                    path: `/${channel}/publish`,
                    hashedPassphrase: host.hashedPassphrase,
                    hashedPassphraseSalt: host.hashedPassphraseSalt
                });

                const subscriberChannelContextName = `${host.port}/${channel}/subscribe`;
                const channelSubscribeContext = `component.messagebus.subscribe`;
                delegate.register(channelSubscribeContext, subscriberChannelContextName, async ({ headers: { fromhost,fromport }, data }) => {
                    return await delegate.call({ context: `component.messagebus.subscriber`, name: `${host.port}/${channel}` }, { fromhost, fromport, channel, data });
                });
                requestHandlerSecure.handle(channelSubscribeContext, {
                    host: host.name,
                    port: host.port,
                    path: `/${channel}/subscribe`,
                    hashedPassphrase: host.hashedPassphrase,
                    hashedPassphraseSalt: host.hashedPassphraseSalt
                });

            });
            requestHandlerSecure.handle(registerChannelContext, {
                host: host.name,
                port: host.port,
                path: "/channel/register",
                hashedPassphrase: host.hashedPassphrase,
                hashedPassphraseSalt: host.hashedPassphraseSalt
            });
        });
        messagebusHost.handle(options);
    }
};