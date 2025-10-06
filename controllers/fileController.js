const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

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

    // Change the folder a file belongs in
    await prisma.file.updateMany({
      where: {
        name: req.params.itemName,
        userId: req.user.id,
      },
      data: {
        folderId,
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
        },
      });

      // If the file doesn't exist, return error
      if (!file) {
        return next(new Error('File does not exist.'));
      }

      // Delete the file from cloudinary first
      await cloudinary.uploader.destroy(file.cloudinaryId);

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
};
