import express from "express";
import * as LoginAuth from "../controllers/login_auth.js";
import * as UserRegister from "../controllers/user_controller.js";
import * as eInviteController from "../controllers/e_invite_controllers.js";
import * as galleryCategoryController from "../controllers/gallery_category_controller.js";
import * as galleryController from "../controllers/gallery_controller.js";
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
    router.post("/signup", UserRegister.RegisterUser);

    // EInvite
    router.put("/e_invite", eInviteController.create);
    router.post("/e_invite", eInviteController.getAll);
    router.get("/e_invite/:_id", eInviteController.getOne);
    router.get("/e_invite", eInviteController.getAllWithoutPagination);
    router.patch("/e_invite/:_id", eInviteController.update);
    router.delete("/e_invite/:_id", eInviteController.remove);
     // gallery category
     router.put("/gallery_category", galleryCategoryController.create);
     router.post("/gallery_category", galleryCategoryController.getAll);
     router.get("/gallery_category/:_id", galleryCategoryController.getOne);
     router.get("/gallery_category", galleryCategoryController.getAllWithoutPagination);
     router.patch("/gallery_category/:_id", galleryCategoryController.update);
     router.delete("/gallery_category/:_id", galleryCategoryController.remove);
      // gallery
      router.put("/gallery", galleryController.create);
      router.post("/gallery", galleryController.getAll);
      router.get("/gallery/:_id", galleryController.getOne);
      router.get("/gallery", galleryController.getAllWithoutPagination);
      router.patch("/gallery/:_id", galleryController.update);
      router.delete("/gallery/:_id", galleryController.remove);
// album uploade pdf to jpge
    // router.post("/upload-album", upload.single("file"), uploadAlbum);
    // file upload
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
    router.post("/get_all_gallery_images", cmsImageController.getAllGalleryImages);
    router.get("/cms_image/:_id", cmsImageController.getOne);
    router.get("/cms_image", cmsImageController.getAllWithoutPagination);
    router.patch("/cms_image/:_id", cmsImageController.update);
    router.delete("/cms_image/:_id", cmsImageController.remove);


   
    router.post(
        "/upload-photo",
        multer({
            dest: "./Attachments/Files",
            // eslint-disable-next-line promise/prefer-await-to-callbacks
        }).any(),
        uploadfilecontroller.filterFiles,
        uploadfilecontroller.uploadFilesaws,
    );

    return router;
}
