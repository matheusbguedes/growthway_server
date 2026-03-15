import { prisma } from "@/lib/prisma";
import { StudentStatus, ClassStatus, GoalStatus, PaymentMethod, InvoiceStatus } from "@prisma-client";
import bcrypt from "bcrypt";

async function seed() {

  const hashedPassword = await bcrypt.hash("password", 10);
  
  const user = await prisma.user.create({
    data: {
      name: "Professor Letiva",
      email: "admin@example.com",
      password: hashedPassword,
    },
  });

  const studentsData = [
    { name: "Maria Silva", email: "maria@example.com", status: StudentStatus.ACTIVE },
    { name: "João Santos", email: "joao@example.com", status: StudentStatus.ACTIVE },
    { name: "Ana Beatriz", email: "ana@example.com", status: StudentStatus.ACTIVE },
    { name: "Lucas Mendes", email: "lucas@example.com", status: StudentStatus.ACTIVE },
    { name: "Carla Souza", email: "carla@example.com", status: StudentStatus.PAUSED },
    { name: "Roberto Lima", email: "roberto@example.com", status: StudentStatus.PAUSED },
    { name: "Fernanda Dias", email: "fer@example.com", status: StudentStatus.INACTIVE },
  ];

  const createdStudents = await Promise.all(
    studentsData.map(s => prisma.student.create({ data: { ...s, user_id: user.id } }))
  );

  const goal1 = await prisma.goal.create({
    data: {
      title: "Fluência em Conversação",
      status: GoalStatus.IN_PROGRESS,
      start_at: new Date("2026-01-10"),
    },
  });

  const classesData = [
    { date: new Date("2026-03-01"), title: "Aula 01", status: ClassStatus.COMPLETED, student_id: createdStudents[0].id },
    { date: new Date("2026-03-02"), title: "Aula 02", status: ClassStatus.COMPLETED, student_id: createdStudents[1].id },
    { date: new Date("2026-03-03"), title: "Aula 03", status: ClassStatus.COMPLETED, student_id: createdStudents[2].id },
    { date: new Date("2026-03-04"), title: "Aula 04", status: ClassStatus.COMPLETED, student_id: createdStudents[3].id },
    { date: new Date("2026-03-05"), title: "Aula 05", status: ClassStatus.COMPLETED, student_id: createdStudents[0].id },
    
    { date: new Date("2026-03-20"), title: "Revisão Gramatical", status: ClassStatus.PENDING, student_id: createdStudents[0].id },
    { date: new Date("2026-03-21"), title: "Listening Practice", status: ClassStatus.PENDING, student_id: createdStudents[1].id },
    { date: new Date("2026-03-22"), title: "Speaking Lab", status: ClassStatus.PENDING, student_id: createdStudents[2].id },
    { date: new Date("2026-03-23"), title: "Business English", status: ClassStatus.PENDING, student_id: createdStudents[3].id },
    
    { date: new Date("2026-03-10"), title: "Aula de Terça", status: ClassStatus.CANCELLED, student_id: createdStudents[4].id },
    { date: new Date("2026-03-12"), title: "Aula de Quinta", status: ClassStatus.CANCELLED, student_id: createdStudents[5].id },
    
    { date: new Date("2026-03-15"), title: "Workshop Intensivo", status: ClassStatus.IN_PROGRESS, student_id: createdStudents[0].id },
    { date: new Date("2026-03-16"), title: "Avaliação Mensal", status: ClassStatus.IN_REVIEW, student_id: createdStudents[1].id },
  ];

  await Promise.all(
    classesData.map(c => prisma.class.create({ 
      data: { ...c, user_id: user.id, goal_id: goal1.id } 
    }))
  );
  
  await prisma.invoice.createMany({
    data: [
      { amount: 150.0, status: InvoiceStatus.PAID, payment_method: PaymentMethod.PIX, student_id: createdStudents[0].id },
      { amount: 200.0, status: InvoiceStatus.PENDING, payment_method: PaymentMethod.BANK_TRANSFER, student_id: createdStudents[1].id },
      { amount: 150.0, status: InvoiceStatus.OVERDUE, payment_method: PaymentMethod.CASH, student_id: createdStudents[4].id },
    ]
  });

  console.log("✅ Seed finalizado: Usuário, 7 alunos, 13 aulas e 3 faturas criados.");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});