import express from "express";
import * as LoginAuth from "../controllers/login_auth.js";
import * as UserRegister from "../controllers/user_controller.js";
import * as eInviteController from "../controllers/e_invite_controllers.js";
import * as galleryCategoryController from "../controllers/gallery_category_controller.js";
import * as galleryController from "../controllers/gallery_controller.js";
import * as egalleryController from "../controllers/e_gallery_controller.js";
import * as ealbumController from "../controllers/e_album_controller.js";
import * as userController from "../controllers/user_controller.js";
import * as cmsImageController from "../controllers/cms_image_controller.js";
import multer from "multer";
import * as uploadfilecontroller from "../controllers/upload_file_controller.js";
import {
    adminResolver,
    checkAllAuth,
    multiAuth,
    userResolver,
} from "../config/auth.js";
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
    router.post("/signup", UserRegister.RegisterUser);

    // EInvite
    router.put("/e_invite", adminResolver, eInviteController.create);
    router.post(
        "/e_invite",
        eInviteController.getAll,
    );
    router.get(
        "/e_invite/:_id",
        eInviteController.getOne,
    );
    router.get(
        "/e_invite",
        eInviteController.getAllWithoutPagination,
    );
    router.patch("/e_invite/:_id", adminResolver, eInviteController.update);
    router.delete("/e_invite/:_id", adminResolver, eInviteController.remove);
    // gallery category
    router.put(
        "/gallery_category",
        adminResolver,
        galleryCategoryController.create,
    );
    router.post(
        "/gallery_category",
        multiAuth([userResolver, adminResolver]),
        galleryCategoryController.getAll,
    );
    router.get(
        "/gallery_category/:_id",
        multiAuth([userResolver, adminResolver]),
        galleryCategoryController.getOne,
    );
    router.get(
        "/gallery_category",
        multiAuth([userResolver, adminResolver]),
        galleryCategoryController.getAllWithoutPagination,
    );
    router.patch(
        "/gallery_category/:_id",
        adminResolver,
        galleryCategoryController.update,
    );
    router.delete(
        "/gallery_category/:_id",
        adminResolver,
        galleryCategoryController.remove,
    );
    // gallery
    router.put("/gallery", adminResolver, galleryController.create);
    router.post(
        "/gallery",
        galleryController.getAll,
    );
    router.get(
        "/gallery/:_id",
        galleryController.getOne,
    );
    router.get(
        "/gallery",
        galleryController.getAllWithoutPagination,
    );
    router.patch("/gallery/:_id", adminResolver, galleryController.update);
    router.delete("/gallery/:_id", adminResolver, galleryController.remove);
    // gallery
    router.put("/e_gallery", adminResolver, egalleryController.create);
    router.post(
        "/e_gallery",
        multiAuth([userResolver, adminResolver]),
        egalleryController.getAll,
    );
    router.get("/e_gallery/:_id", checkAllAuth, egalleryController.getOne);
    router.get(
        "/e_gallery",
        checkAllAuth,
        egalleryController.getAllWithoutPagination,
    );
    router.patch("/e_gallery/:_id", adminResolver, egalleryController.update);
    router.delete("/e_gallery/:_id", adminResolver, egalleryController.remove);
    // ealbum
    router.put("/e_album", adminResolver, ealbumController.create);
    router.post(
        "/e_album",
        multiAuth([userResolver, adminResolver]),
        ealbumController.getAll,
    );
    router.get(
        "/e_album/:_id",
        multiAuth([userResolver, adminResolver]),
        ealbumController.getOne,
    );
    router.get(
        "/e_album",
        multiAuth([userResolver, adminResolver]),
        ealbumController.getAllWithoutPagination,
    );
    router.patch("/e_album/:_id", adminResolver, ealbumController.update);
    router.delete("/e_album/:_id", adminResolver, ealbumController.remove);
    // user
    router.post("/user", adminResolver, userController.getAll);
    router.get("/user/:_id", adminResolver, userController.getOne);
    router.get("/user", adminResolver, userController.getAllWithoutPagination);
    router.patch("/user/:_id", adminResolver, userController.update);
    router.delete("/user/:_id", adminResolver, userController.remove);
    // album uploade pdf to jpge
    // router.post("/upload-album", upload.single("file"), uploadAlbum);
    // file upload
    router.post(
        "/file-upload",
        multer({
            dest: "./Attachments/Files",
            // eslint-disable-next-line promise/prefer-await-to-callbacks
        }).any(),
        // checkAllAuth,
        uploadfilecontroller.filterFiles,
        uploadfilecontroller.uploadFiles,
    );
    // cms image
    router.put("/cms_image", adminResolver, cmsImageController.create);
    router.post(
        "/cms_image",
        cmsImageController.getAll,
    );
    router.post(
        "/get_all_gallery_images",
        cmsImageController.getAllGalleryImages,
    );
    router.get(
        "/cms_image/:_id",
        multiAuth([userResolver, adminResolver]),
        cmsImageController.getOne,
    );
    router.get(
        "/cms_image",
        multiAuth([userResolver, adminResolver]),
        cmsImageController.getAllWithoutPagination,
    );
    router.patch("/cms_image/:_id", adminResolver, cmsImageController.update);
    router.delete("/cms_image/:_id", adminResolver, cmsImageController.remove);

    router.post(
        "/upload-photo",
        multer({
            dest: "./Attachments/Files",
            // eslint-disable-next-line promise/prefer-await-to-callbacks
        }).any(),
        checkAllAuth,
        uploadfilecontroller.filterFiles,
        uploadfilecontroller.uploadFilesaws,
    );

    return router;
}
