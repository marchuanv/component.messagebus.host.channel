const messagebusHost = require("component.messagebus.host");
const requestHandlerSecure = require("component.request.handler.secure");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("MessageBus Channel");

const thisModule = `component.messagebus.host.channel`;
const registerChannelModule = `component.messagebus.host.channel.register`;

module.exports = { 
    handle: (callingModule, options) => {
        delegate.register(thisModule, async ({ host }) => {
            delegate.register(registerChannelModule, async ({ channel }) => {
                await delegate.call(callingModule, { channel });
                const statusMessage = "success";
                return {
                    headers: { "Content-Type":"text/plain", "Content-Length": Buffer.byteLength(statusMessage) },
                    statusCode: 200,
                    statusMessage,
                    data: statusMessage
                };
            });
            requestHandlerSecure.handle(registerChannelModule, options);
        });
        messagebusHost.handle(thisModule, options);
    }
};