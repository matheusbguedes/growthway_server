import { prisma } from "@/lib/prisma";
import { StudentStatus } from "@prisma-client";
import bcrypt from "bcrypt";

async function seed() {
  const hashedPassword = await bcrypt.hash("password", 10);
  const user = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      name: "Maria Silva",
      email: "maria@example.com",
      status: StudentStatus.ACTIVE,
      user_id: user.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      name: "João Santos",
      email: "joao@example.com",
      status: StudentStatus.ACTIVE,
      user_id: user.id,
    },
  });

  console.log("Seed concluído com sucesso.");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
