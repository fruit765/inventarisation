"use strict"

const express = require('express')
const { sendP } = require('../model/libs/command')
const Post_dep_loc = require('../model/orm/post_dep_loc')

const router = express.Router()

router.route('/post_dep_loc_united')
    .get(async (req, res, next) => {
        let response = Post_dep_loc
            .query()
            .joinRelated("[post, dep_loc.[department, location]]")
            .select("post_dep_loc.id", "post", "department", "location")
            .clone()

        if (req.query.status === "free") {
            response = response.where("free", ">", 0)
        }

        sendP(next)(res)(response)
    })
    // .post()
     

module.exports = router