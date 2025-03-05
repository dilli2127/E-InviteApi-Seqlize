import express from "express";
import * as LoginAuth from "../controllers/login_auth.js";
import * as eInviteController from "../controllers/e_invite_controllers.js";
import * as cmsImageController from "../controllers/cms_image_controller.js";
import multer from "multer";
import * as uploadfilecontroller from "../controllers/upload_file_controller.js";
// import {uploadAlbum} from "../controllers/album_controller.js";
export default function exportedRouter() {
    const options = {
        caseSensitive: true,
    };
    const router = express.Router(options);

    router.get("/", (req, res) => {
        res.send("Hello World!");
    });
    router.get("/favicon.ico", (req, res) => {
        res.send(null);
    });

    router.post("/login", LoginAuth.LoginAuth);

    // EInvite
    router.put("/e_invite", eInviteController.create);
    router.post("/e_invite", eInviteController.getAll);
    router.get("/e_invite/:_id", eInviteController.getOne);
    router.get("/e_invite", eInviteController.getAllWithoutPagination);
    router.patch("/e_invite/:_id", eInviteController.update);
    router.delete("/e_invite/:_id", eInviteController.remove);

    //Upload File
    router.post(
        "/fileupload",
        multer({
            dest: "./Attachments/Files",
            // eslint-disable-next-line promise/prefer-await-to-callbacks
        }).any(),
        uploadfilecontroller.filterFiles,
        uploadfilecontroller.uploadFiles,
    );
    router.post("/urltobase64", uploadfilecontroller.urlToBase64);

    // router.post("/upload-album", upload.single("file"), uploadAlbum);
    router.post(
        "/file-upload",
        multer({
            dest: "./Attachments/Files",
            // eslint-disable-next-line promise/prefer-await-to-callbacks
        }).any(),
        uploadfilecontroller.filterFiles,
        uploadfilecontroller.uploadFiles,
    );
     // cms image
     router.put("/cms_image", cmsImageController.create);
     router.post("/cms_image", cmsImageController.getAll);
     router.get("/cms_image/:_id", cmsImageController.getOne);
     router.get("/cms_image", cmsImageController.getAllWithoutPagination);
     router.patch("/cms_image/:_id", cmsImageController.update);
     router.delete("/cms_image/:_id", cmsImageController.remove);
    return router;
}
