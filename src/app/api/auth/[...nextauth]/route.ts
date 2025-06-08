import { PrismaClient } from '@prisma/client';
import { handlers } from "@/../auth";

const prisma = new PrismaClient();

export const { GET, POST } = handlers;