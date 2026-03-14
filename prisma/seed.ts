import { prisma } from "@/lib/prisma";
import { StudentStatus, ClassStatus, GoalStatus } from "@prisma-client";
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

  const goal1 = await prisma.goal.create({
    data: {
      title: "Desenvolver autonomia nos estudos",
      description: "Criar hábitos de estudo independente e organização pessoal",
      status: GoalStatus.IN_PROGRESS,
      start_at: new Date("2026-03-01"),
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      title: "Melhorar desempenho em matemática",
      description: "Alcançar nota acima de 8 nas avaliações",
      status: GoalStatus.IN_PROGRESS,
      start_at: new Date("2026-02-15"),
    },
  });

  await prisma.class.createMany({
    data: [
      {
        date: new Date("2026-03-10"),
        title: "Introdução à álgebra",
        description: "Revisão de conceitos básicos e equações de primeiro grau",
        status: ClassStatus.COMPLETED,
        notes: "Aluna demonstrou boa compreensão dos conceitos. Precisa praticar mais exercícios.",
        user_id: user.id,
        student_id: student1.id,
        goal_id: goal2.id,
      },
      {
        date: new Date("2026-03-12"),
        title: "Técnicas de estudo e organização",
        description: "Como criar um cronograma de estudos eficiente",
        status: ClassStatus.COMPLETED,
        notes: "João criou seu primeiro cronograma. Acompanhar na próxima aula.",
        user_id: user.id,
        student_id: student2.id,
        goal_id: goal1.id,
      },
      {
        date: new Date("2026-03-13"),
        title: "Geometria plana",
        description: "Áreas e perímetros de figuras geométricas",
        status: ClassStatus.IN_REVIEW,
        url: "https://meet.google.com/abc-defg-hij",
        notes: "Aula online. Revisar exercícios pendentes.",
        user_id: user.id,
        student_id: student1.id,
        goal_id: goal2.id,
      },
      {
        date: new Date("2026-03-14"),
        title: "Redação: estrutura dissertativa",
        description: "Como construir argumentos sólidos",
        status: ClassStatus.IN_PROGRESS,
        url: "https://meet.google.com/xyz-1234-abc",
        user_id: user.id,
        student_id: student2.id,
      },
      {
        date: new Date("2026-03-17"),
        title: "Funções quadráticas",
        description: "Estudo de parábolas e resolução de problemas",
        status: ClassStatus.PENDING,
        user_id: user.id,
        student_id: student1.id,
        goal_id: goal2.id,
      },
      {
        date: new Date("2026-03-18"),
        title: "Revisão geral - prova",
        description: "Preparação para avaliação bimestral",
        status: ClassStatus.PENDING,
        user_id: user.id,
        student_id: student2.id,
        goal_id: goal1.id,
      },
      {
        date: new Date("2026-03-19"),
        title: "Física: cinemática",
        description: "Movimento uniforme e uniformemente variado",
        status: ClassStatus.PENDING,
        user_id: user.id,
        student_id: student1.id,
      },
      {
        date: new Date("2026-03-05"),
        title: "Aula cancelada",
        description: "Reagendada por indisponibilidade do aluno",
        status: ClassStatus.CANCELLED,
        user_id: user.id,
        student_id: student2.id,
      },
    ],
  });

  console.log("Seed concluído com sucesso.");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
