import { prisma } from "@/lib/prisma";
import { StudentStatus, GoalStatus, ClassStatus, InvoiceStatus, PaymentMethod} from "@prisma-client";
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

  const student3 = await prisma.student.create({
    data: {
      name: "Ana Costa",
      email: "ana@example.com",
      status: StudentStatus.ACTIVE,
      user_id: user.id,
    },
  });

  const goal = await prisma.goal.create({
    data: {
      title: "Conversação básica",
      description: "Treinar vocabulário e frases do cotidiano",
      status: GoalStatus.IN_PROGRESS,
    },
  });

  await prisma.class.createMany({
    data: [
      {
        title: "Introdução",
        status: ClassStatus.COMPLETED,
        user_id: user.id,
        student_id: student1.id,
        goal_id: goal.id,
      },
      {
        title: "Vocabulário básico",
        status: ClassStatus.COMPLETED,
        user_id: user.id,
        student_id: student1.id,
        goal_id: goal.id,
      },
      {
        title: "Prática de conversação",
        status: ClassStatus.PENDING,
        user_id: user.id,
        student_id: student2.id,
        goal_id: goal.id,
      },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      {
        amount: 150,
        payment_method: PaymentMethod.PIX,
        status: InvoiceStatus.PAID,
        student_id: student1.id,
      },
      {
        amount: 150,
        payment_method: PaymentMethod.CREDIT_CARD,
        status: InvoiceStatus.PENDING,
        student_id: student2.id,
      },
    ],
  });

  console.log("RODOU O PRISMA PAIZAO");
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
