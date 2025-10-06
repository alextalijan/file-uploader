const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  fileGet: async (req, res) => {
    const file = await prisma.file.findFirst({
      where: {
        name: req.params.fileName,
        userId: req.user.id,
      },
      include: {
        folder: true,
      },
    });
    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
      },
    });

    res.render('file', { file, folders });
  },
  changeFolder: async (req, res) => {
    let folderId;
    if (req.body.folder === 'none') {
      folderId = null;
    } else {
      folderId = req.body.folder;
    }

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
};
