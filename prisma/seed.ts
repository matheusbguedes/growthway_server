import { prisma } from "@/lib/prisma";
import {
    GoalStatus,
    InvoiceStatus,
    PaymentMethod,
    StudentStatus,
} from "@prisma-client";
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

    await prisma.goal.create({
        data: {
            student_id: student1.id,
            title: "Fluência em conversação",
            description: "Conseguir manter diálogos de 30 min em inglês",
            status: GoalStatus.IN_PROGRESS,
            start_at: new Date("2025-01-01"),
        },
    });

    await prisma.goal.create({
        data: {
            student_id: student1.id,
            title: "Completar nível B2",
            status: GoalStatus.IN_PROGRESS,
            start_at: new Date("2025-02-01"),
            end_at: new Date("2025-06-30"),
        },
    });

    await prisma.lesson.create({
        data: {
            student_id: student1.id,
            date: new Date("2025-03-10"),
            title: "Present perfect",
            content: "Revisão de present perfect e exercícios de conversação.",
            duration: 60,
            notes: "Aluna engajada, boa pronúncia.",
        },
    });

    await prisma.lesson.create({
        data: {
            student_id: student1.id,
            date: new Date("2025-03-12"),
            title: "Listening practice",
            content: "Áudio sobre rotina e compreensão oral.",
            duration: 45,
        },
    });

    await prisma.invoice.create({
        data: {
            student_id: student1.id,
            amount: 350,
            payment_method: PaymentMethod.PIX,
            status: InvoiceStatus.PAID,
            notes: "Mensalidade março/2025",
        },
    });

    await prisma.invoice.create({
        data: {
            student_id: student2.id,
            amount: 350,
            payment_method: PaymentMethod.CREDIT_CARD,
            status: InvoiceStatus.PENDING,
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
