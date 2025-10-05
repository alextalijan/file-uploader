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
};
