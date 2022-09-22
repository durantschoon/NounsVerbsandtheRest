import OAuth from "oauth"
// var OAuth = require('oauth')

import util from "util"

// `npm install oauth` to satisfy
// website: https://github.com/ciaranj/node-oauth

var KEY = "3aba1f5314a44126a5da6bb5a138bdcc"
var SECRET = "5c857b0282c04b5f87fbfe2ef7fc309c"

var oauth = new OAuth.OAuth(
	'http://api.thenounproject.com',
	'http://api.thenounproject.com',
	KEY,
	SECRET,
	'1.0',
	null,
	'HMAC-SHA1'
)

const result = oauth.get(
    'http://api.thenounproject.com/icon/6324',
    null,
    null,
    function (e, data, res){
        if (e) console.error(e)
        console.log(util.inspect(data))
    }
)