import helmet from 'helmet';
export const policies = (allowIframe) => (req, res, next) => {
    const args = {
        referrerPolicy: { policy: ['no-referrer-when-downgrade'] },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                fontSrc: ["'self'", 'data:'],
                connectSrc: [
                    "'self'",
                    (req.protocol === 'http' ? 'ws://' : 'wss://') + req.get('host'),
                ],
            },
        },
        frameguard: false
    };
    if (!allowIframe)
        args.frameguard = { action: 'sameorigin' };
    helmet(args)(req, res, next);
};
//# sourceMappingURL=security.js.map