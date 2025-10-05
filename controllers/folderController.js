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
  editFolderGet: async (req, res) => {
    const folder = await prisma.folder.findFirst({
      where: {
        name: req.params.folderName,
        userId: req.user.id,
      },
    });

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
};
