const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const downloadFileFromCloudinary = require('../utils/downloadFileFromCloudinary');

const prisma = new PrismaClient();

module.exports = {
  fileGet: async (req, res, next) => {
    const file = await prisma.file.findFirst({
      where: {
        name: req.params.fileName,
        userId: req.user.id,
      },
      include: {
        folder: true,
      },
    });

    // If the file doesn't exist, return error
    if (!file) {
      return next(new Error('File does not exist.'));
    }

    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
      },
    });

    res.render('file', { file, folders });
  },
  changeFolder: async (req, res) => {
    const folderId = req.body.folder === 'none' ? null : req.body.folder;
    let folder;
    if (folderId) {
      folder = await prisma.folder.findUnique({
        where: {
          id: folderId,
        },
      });
    }

    // Change the folder a file belongs in
    await prisma.file.updateMany({
      where: {
        name: req.params.itemName,
        userId: req.user.id,
      },
      data: {
        folderId: folderId === null ? null : folder.id,
        shareExpires: folderId === null ? new Date() : folder.shareExpires,
      },
    });

    // If the file has been moved to a folder, redirect there, else home page
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: {
          id: folderId,
        },
      });

      res.redirect(`/folders/${folder.name}`);
    } else {
      res.redirect('/');
    }
  },
  deleteFile: async (req, res, next) => {
    try {
      const file = await prisma.file.findFirst({
        where: {
          name: req.params.fileName,
          userId: req.user.id,
        },
        select: {
          cloudinaryId: true,
          type: true,
        },
      });

      // If the file doesn't exist, return error
      if (!file) {
        return next(new Error('File does not exist.'));
      }

      // Delete the file from cloudinary first
      await cloudinary.uploader.destroy(file.cloudinaryId, {
        resource_type: file.type === 'raw' ? 'raw' : file.type,
      });

      // Delete the file from the database
      await prisma.file.deleteMany({
        where: {
          name: req.params.fileName,
          userId: req.user.id,
        },
      });

      res.redirect('/');
    } catch (err) {
      next(err);
    }
  },
  downloadFile: async (req, res, next) => {
    const user = req.user;
    const file = await prisma.file.findFirst({
      where: {
        name: req.params.fileName,
        userId: req.user.id,
      },
      select: {
        cloudinaryId: true,
        url: true,
        name: true,
        user: true,
      },
    });

    // If the file doesn't exist, stop them from proceeding
    if (!file) {
      return next(new Error('File does not exist.'));
    }

    // Check if the owner is trying to access the file
    if (user && user.id === file.user.id) {
      return downloadFileFromCloudinary(file, res);
    }

    // Check if the file has been shared for download
    if (file.shareExpires > new Date()) {
      return downloadFileFromCloudinary(file, res);
    }

    // Else, the user is unauthorized to download
    next(new Error('You are not authorized to download this file.'));
  },
};
