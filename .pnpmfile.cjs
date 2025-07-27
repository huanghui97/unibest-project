const fs = require('fs');
const path = require('path');

module.exports = {
  hooks: {
    afterAllResolved(lockfile) {
      setTimeout(() => {
        const resources = path.join(__dirname, './resources');
        fs.readdirSync(resources).forEach(file => {
          const from = path.join(__dirname, './resources', file);
          const to = path.join(__dirname, './node_modules/wot-design-uni/components/wd-icon', file);
          if (fs.existsSync(from)) {
            fs.copyFileSync(from, to);
          }
        });
      }, 3000);
      return lockfile;
    },
  },
}