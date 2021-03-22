'use strict';

module.exports = {
    "plugins": [
        "node_modules/better-docs/typescript"
    ],
    "recurseDepth": 10,
    "source": {
        "include": ["../src"],
        "includePattern": "\\.(ts|js)$"
    },
    "sourceType": "module",
    "tags": {
        "allowUnknownTags": true,
    },
    "templates": {
        "cleverLinks": false,
        "monospaceLinks": false
    },
    "opts": {
        "template": "node_modules/better-docs",
        "destination": "./docs/"
    }
}

// module.exports = {
//     "source": {
//         "include": ["../src/"],
//         "includePattern": ".+\\.(js)$"
//     },
//     "recurseDepth": 10
// }

