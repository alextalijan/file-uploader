const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  newFolderGet: (req, res) => {
    res.render('newFolder');
  },
  newFolderPost: async (req, res, next) => {
    // If the folder with the name already exists, stop them from creating it
    const folder = await prisma.folder.findFirst({
      where: {
        name: {
          contains: req.body.name.trim(),
          mode: 'insensitive',
        },
        userId: req.user.id,
      },
    });
    if (folder) {
      return next(new Error('Folder with this name already exists.'));
    }

    // Add folder into db
    await prisma.folder.create({
      data: {
        name: req.body.name.trim(),
        userId: req.user.id,
      },
    });

    res.redirect('/');
  },
  editFolderGet: async (req, res, next) => {
    const folder = await prisma.folder.findFirst({
      where: {
        name: req.params.folderName,
        userId: req.user.id,
      },
    });

    // If the folder doesn't exist, return error
    if (!folder) {
      return next(new Error('Folder does not exist.'));
    }

    res.render('editFolder', { folder });
  },
  editFolderPost: async (req, res, next) => {
    // First check if the new name is already in use
    const folder = await prisma.folder.findFirst({
      where: {
        name: {
          contains: req.body.rename.trim(),
          mode: 'insensitive',
        },
        userId: req.user.id,
      },
    });
    if (folder) {
      return next(new Error('Folder name already in use.'));
    }

    // Update the name of the folder
    await prisma.folder.updateMany({
      where: {
        name: req.params.folderName,
        userId: req.user.id,
      },
      data: {
        name: req.body.rename.trim(),
      },
    });

    res.redirect('/');
  },
  deleteFolder: async (req, res, next) => {
    const folder = await prisma.folder.findFirst({
      where: {
        name: req.params.folderName,
        userId: req.user.id,
      },
      select: {
        id: true,
      },
    });

    // If the folder doesn't exist, stop them from deleting
    if (!folder) {
      return next(new Error('Folder that does not exist cannot be deleted.'));
    }

    // Empty the folder of files inside it
    await prisma.file.updateMany({
      where: {
        folderId: folder.id,
      },
      data: {
        folderId: null,
        userId: req.user.id,
      },
    });

    // Delete the folder
    await prisma.folder.delete({
      where: {
        id: folder.id,
      },
    });

    res.redirect('/');
  },
  folderGet: async (req, res, next) => {
    const folder = await prisma.folder.findFirst({
      where: {
        name: req.params.folderName,
        userId: req.user.id,
      },
      include: {
        files: true,
      },
    });

    // If the folder doesn't exist, return error
    if (!folder) {
      return next(new Error('Folder does not exist.'));
    }

    res.render('folder', { folder });
  },
  shareFolder: async (req, res) => {
    const folder = await prisma.folder.findFirst({
      where: {
        name: req.params.folderName,
        userId: req.user.id,
      },
    });

    // Create the date the share expires at
    const date = new Date();
    date.setDate(date.getDate() + Number(req.body.duration));

    // Update the expiration date
    await prisma.folder.update({
      where: {
        id: folder.id,
      },
      data: {
        shareExpires: date,
      },
    });

    // Redirect the user to shared folder
    res.redirect(`/share/${folder.id}`);
  },
};
