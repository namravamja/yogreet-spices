import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          select: {
            id: true,
            companyName: true,
            fullName: true,
            businessAddress: {
              select: {
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
        Review: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  } catch (error) {
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
};

