const messagebusHost = require("component.messagebus.host");
const requestHandlerSecure = require("component.request.handler.secure");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("MessageBus Channel");

const thisModule = `component.messagebus.host.channel`;
const registerChannelModule = `component.messagebus.host.channel.register`;

module.exports = { 
    handle: (callingModule, options) => {
        delegate.register(thisModule, ({ host }) => {
            delegate.register(registerChannelModule, async ({ channel }) => {
                return await delegate.call(callingModule, { channel });
            });
            requestHandlerSecure.handle(registerChannelModule, {
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