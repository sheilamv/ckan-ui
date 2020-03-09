var addRoutes = function(router){
    let request = require('request');
    let auth = require('../../modules/auth');

    router.get('/classic', function(req, res, next){
        let config = require('config');
        let url = config.get('classicUi');

        return res.json({url: url});
    });



    /* GET facets. */
    router.get('/facets', auth.removeExpired, function(req, res, next) {

    facets = {
        // sectors:{
        //         name: "Sectors",
        //         icon: "business",
        //         facets: [
        //             {
        //                 sector: 'Sectors'
        //             },
        //         ]
        // },
        // dataTypes:{
        //     name: "Data Types",
        //     icon: "folder",
        //     facets: [
        //         {
        //             type: 'Dataset types'
        //         },
        //         {
        //             res_format: 'Format'
        //         }
        //     ]
        // },
        // organizations:{
        //     name: "Organizations",
        //     icon: "supervised_user_circle",
        //     facets: [
        //     {
        //         organization: 'Organizations'
        //     }
        //     ],
        // },
        // permissions:{
        //     name: " Download Permissions",
        //     icon: "vpn_lock",
        //     facets: [
        //         {
        //             download_audience: 'Download permission'
        //         },
        //         {
        //             license_id: 'License'
        //         },
        //         {
        //             edc_state: 'States' // normally only if admin, but what the hell
        //         }
        //     ],
        //     information: {
        //         "Public Datasets": "Catalogue records with data that can be viewed and accessed by anyone.",
        //         "Restricted Datasets": "Catalogue records with data that has restrictions on what may be viewed or downloaded. Access depends on permissions granted to your log-in",
        //         banner: "Log in with a Government IDIR or BCEID to view more datasets"
        //     }
        // },

        licenses:{
            name: "Licenses",
            icon: "",
            facets: [
                {
                    license_id: 'License'
                },
            ]
        },
        dataTypes:{
            name: "Data Types",
            icon: "",
            facets: [
                {
                    res_format: 'Format'
                }
            ]
        },
        permissions:{
            name: "Download Permissions",
            icon: "",
            facets: [
                {
                    download_audience: 'Download permission'
                },
            ]
        },
        states:{
            name: "State",
            icon: "",
            facets: [
                {
                    edc_state: 'States'
                },
            ]
        },
        organizations:{
            name: "Organizations",
            icon: "supervised_user_circle",
            facets: [
            {
                organization: 'Organizations'
            }
            ],
        },

    };

    res.json(facets);

    });






    /* GET tags. */
    router.get('/tagList', auth.removeExpired, function(req, res, next) {

        let config = require('config');
        let url = config.get('ckan');

        let reqUrl = url + "/api/3/action/tag_list";
        authObj = {};

        request(reqUrl, authObj, function(err, apiRes, body){
            if (err) {
                console.log(err);
                res.json({error: err});
                return;
            }
            if (apiRes.statusCode !== 200){
                console.log("Body Status? ", apiRes.statusCode);
            }

            try {
                let json = JSON.parse(body);
                res.json(json);
            }catch(ex){
                console.error("Error reading json from ckan", ex);
                res.json({error: ex});
            }
        });

    });

    /* GET one dataset. */
    router.get('/vocabList', auth.removeExpired, function(req, res, next) {

        let config = require('config');
        let url = config.get('ckan');

        let reqUrl = url + "/api/3/action/vocabulary_list";

        if (!req.user){
            return res.json({error: "Not logged in"});
        }

        let authObj = {
            'auth': {
            'bearer': req.user.jwt
            }
        };

        request(reqUrl, authObj, function(err, apiRes, body){
            if (err) {
                console.log(err);
                res.json({error: err});
                return;
            }
            if (apiRes.statusCode !== 200){
                console.log("Body Status? ", apiRes.statusCode);
            }

            try {
                let json = JSON.parse(body);
                let vocabs = {};
                for (let i = 0; i < json.result.length; i++) {
                    let tags = json.result[i].tags;
                    let name = json.result[i].name;
                    vocabs[name] = [];
                    for (let j = 0; j < tags.length; j++) {
                        vocabs[name].push(tags[j].name);
                    }
                }
                json.vocabs = vocabs;
                res.json(json);
            }catch(ex){
                console.error("Error reading json from ckan", ex);
                res.json({error: ex});
            }
        });
    });

    /* GET one dataset. */
    router.get('/licenseList', auth.removeExpired, function(req, res, next) {

        let config = require('config');
        let url = config.get('ckan');

        let reqUrl = url + "/api/3/action/license_list";

        // if (!req.user){
        //     return res.json({error: "Not logged in"});
        // }

        let authObj = {
            // 'auth': {
            //   'bearer': req.user.jwt
            // }
        };

        request(reqUrl, authObj, function(err, apiRes, body){
            if (err) {
                console.log(err);
                res.json({error: err});
                return;
            }
            if (apiRes.statusCode !== 200){
                console.log("Body Status? ", apiRes.statusCode);
            }

            try {
                let json = JSON.parse(body);
                res.json(json);
            }catch(ex){
                console.error("Error reading json from ckan", ex);
                res.json({error: ex});
            }
        });
    });



    /* GET ckan about */
    router.get('/about', auth.removeExpired, function(req, res, next) {

    let config = require('config');
    let url = config.get('ckan');

    let keys = Object.keys(req.query);
    let reqUrl = url + "/api/3/action/config_option_show?key=ckan.site_about";

    let authObj = {};

    if (req.user){
        authObj = {
            'auth': {
                'bearer': req.user.jwt
            }
        };
    }

    request(reqUrl, authObj, function(err, apiRes, body){
        if (err) {
        console.log(err);
        res.json({error: err});
        return;
        }
        if (apiRes.statusCode !== 200){
            console.log("Body Status? ", apiRes.statusCode);
        }

        try {
            let json = JSON.parse(body);
            res.json(json);
        }catch(ex){
            console.error("Error reading json from ckan", ex);
            res.json({error: ex});
        }
    });

    });




    /* GET ? */
    router.get('/', auth.removeExpired, function(req, res, next) {

        let config = require('config');
        let url = config.get('ckan');

        if (!req.query.url){
            return res.json({error: "uri encoded component query parameter url is required"}).status(400);
        }

        let reqUrl = url + decodeURIComponent(req.query.url);

        let authObj = {};

        if (req.user){
            authObj = {
                'auth': {
                    'bearer': req.user.jwt
                }
            };
        }

        request(reqUrl, authObj, function(err, apiRes, body){
        if (err) {
            console.log(err);
            res.json({error: err});
            return;
        }
        if (apiRes.statusCode !== 200){
            console.log("Body Status? ", apiRes.statusCode);
        }

        try {
            let json = JSON.parse(body);
            res.json(json);
        }catch(ex){
            console.error("Error reading json from ckan", ex);
            res.json({error: ex});
        }
        });

    });

    /* GET licenses */
    router.get('/licenses', auth.removeExpired, function(req, res, next) {

        let config = require('config');
        let url = config.get('ckan');


        let reqUrl = url + '/api/3/action/license_list';

        let authObj = {};

        if (req.user){
            authObj = {
                'auth': {
                    'bearer': req.user.jwt
                }
            };
        }

        request(reqUrl, authObj, function(err, apiRes, body){
        if (err) {
            console.log(err);
            res.json({error: err});
            return;
        }
        if (apiRes.statusCode !== 200){
            console.log("Body Status? ", apiRes.statusCode);
        }

        try {
            let json = JSON.parse(body);
            res.json(json);
        }catch(ex){
            console.error("Error reading json from ckan", ex);
            res.json({error: ex});
        }
        });

    });
    return router;
};

module.exports = addRoutes;
