import { exec } from 'child_process';
const envVersion = () => new Promise((resolve, reject) => {
    exec('/usr/bin/env --version', (error, stdout, stderr) => {
        if (error) {
            return reject(Error(`error getting env version: ${error.message}`));
        }
        if (stderr) {
            return reject(Error(`error getting env version: ${stderr}`));
        }
        return resolve(parseInt(stdout.split(/\r?\n/)[0].split(' (GNU coreutils) ')[1].split('.')[0], 10));
    });
});
export const envVersionOr = (fallback) => envVersion().catch(() => fallback);
//# sourceMappingURL=env.js.map