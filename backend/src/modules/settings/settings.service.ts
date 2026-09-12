import prisma from "../../prisma/client";
import { UpdateSettingsInput } from "./settings.validation";

const SETTINGS_ID = "default";

export async function getSettings() {
  return prisma.librarySettings.upsert({
    where: { id: SETTINGS_ID },
    update: {},
    create: { id: SETTINGS_ID },
  });
}

export async function updateSettings(input: UpdateSettingsInput) {
  return prisma.librarySettings.upsert({
    where: { id: SETTINGS_ID },
    update: input,
    create: { id: SETTINGS_ID, ...input },
  });
}