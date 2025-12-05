import { prisma } from "../lib/prisma";

async function main() {
  const email = "lucasdono391@gmail.com";

  const user = await prisma.user.update({
    where: { email },
    data: { plan: "ultra" },
    select: { id: true, email: true, plan: true, name: true },
  });

  console.log("✅ Usuario actualizado a Ultra:");
  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
