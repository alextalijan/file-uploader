const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  fileGet: async (req, res) => {
    const file = await prisma.file.findFirst({
      where: {
        name: req.params.fileName,
        userId: req.user.id,
      },
    });

    res.render('file', { file });
  },
};
