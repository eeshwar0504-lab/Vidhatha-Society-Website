// backend/src/scripts/seedPrograms.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import Program from "../models/Program";
import { MONGO_URI } from "../config";
import { slugify } from "../utils/slugify";

dotenv.config();

const seedItems = [
  {
    title: "Free Food Distribution",
    short: "Providing meals to underprivileged families.",
    description:
      "Help us deliver hope and food to people in need by donating to our Food Distribution Program. In order to provide wholesome food to those in need, we frequently offer meals in underprivileged areas, hospitals, and slums.\n\nAny amount you choose to donate, even ₹11, can have a significant impact. Every donation enables us to reach more people and feed the most vulnerable.\n\nParticipate in this act of kindness with us; your help can make someone's day happier and more comfortable. Make a donation now to contribute to the change!",
    category: "Social Welfare & Humanitarian Aid",
    images: [],
    donation_target: 50000,
  },
  {
    title: "Funeral Services",
    short: "Dignified, culturally-aware funeral support.",
    description:
      "We provide funeral services that are adapted to the unique traditions and customs of various religions as part of our dedication to helping people and families through trying times.\n\nWe make this difficult moment a bit easier by handling everything with tact and consideration — from setting up the ceremonies to offering advice on religious customs. Our staff is committed to helping families through their grieving process while honouring their spiritual and cultural needs.",
    category: "Social Welfare & Humanitarian Aid",
    images: [],
  },
  {
    title: "Distributions and Donations",
    short: "Food, clothing, educational kits and essentials distribution.",
    description:
      "Vidhatha Society’s commitment to community welfare shines through our distributions and donations, which lie at the core of our mission to uplift those in need.\n\nBy reaching out with food donations to streets, hospitals, orphanages, old age homes, and supporting individuals facing hardship, we work tirelessly to reduce hunger and provide crucial aid to vulnerable communities. Collaborating with local organizations and dedicated volunteers, we deliver nutritious meals, clothing, and everyday essentials to ensure everyone can access basic comforts and support.\n\nWe believe that education is a transformative force. Our educational initiatives provide children in need with notebooks, textbooks, stationery, uniforms, and school bags, enabling them to achieve their academic goals. By removing barriers to learning, we foster brighter futures and help empower the next generation to succeed.",
    category: "Social Welfare & Humanitarian Aid",
    images: [],
  },
  {
    title: "Sanitary Napkin Distribution",
    short: "Essential menstrual hygiene products for women & girls.",
    description:
      "Our sanitary napkin distribution program provides essential menstrual hygiene products to women and girls in underserved areas. By supplying sanitary napkins free of charge or at low cost, we help break the stigma around menstruation, safeguard health, and empower women to lead their lives and continue education or work with confidence and dignity.",
    category: "Distributions & Health",
    images: [],
  },
  {
    title: "Books and Stationery Distribution",
    short: "Textbooks, notebooks, stationery & school supplies.",
    description:
      "Our books and stationery drives ensure that children from low-income families receive vital educational materials—textbooks, notebooks, pens, and pencils. By providing these resources, we help bridge educational gaps, promote literacy, and support children’s academic journeys. We also provide sweaters, blankets and school bags when needed.",
    category: "Education & Empowerment",
    images: [],
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding programs.");

    for (const item of seedItems) {
      const slug = slugify(item.title);
      const exists = await Program.findOne({ slug });
      if (exists) {
        console.log(`Skipping (exists): ${item.title} (${slug})`);
        continue;
      }
      const toCreate = {
        ...item,
        slug,
      };
      await Program.create(toCreate);
      console.log(`Created program: ${item.title} (${slug})`);
    }

    console.log("Program seeding complete.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding programs failed:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {
      /* ignore */
    }
    process.exit(1);
  }
}

seed();
