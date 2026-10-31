import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { TicketStatus } from "../src/lib/ticket-status";
import * as schema from "../src/server/db/schema";

const {
  accounts,
  customers,
  parts,
  payments,
  stockMovements,
  tenants,
  ticketEvents,
  ticketItems,
  tickets,
  users,
} = schema;

type Db = PostgresJsDatabase<typeof schema>;
type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
type DeviceType = "laptop" | "phone" | "tablet" | "other";
type StaffRole = "owner" | "admin" | "technician";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;
const DEV_PASSWORD = "password123";
const SIGNATURE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><path d="M20 100C60 20 90 140 140 80s80-20 140 10" fill="none" stroke="#15191f" stroke-width="2"/></svg>';

// Every status on the way to the ticket's current one, one step per 12 hours.
const TO_PICKED_UP: TicketStatus[] = [
  "received",
  "diagnosing",
  "awaiting_approval",
  "in_progress",
  "ready",
  "picked_up",
];
const pathTo = (status: TicketStatus) =>
  TO_PICKED_UP.slice(0, TO_PICKED_UP.indexOf(status) + 1);

interface SeedItem {
  /** A part SKU, or a service description. */
  part?: string;
  service?: string;
  qty?: number;
  price?: number;
}

interface SeedTicket {
  customer: number;
  /** Email of the assigned technician. */
  assignee?: string;
  device: [DeviceType, string, string];
  complaint: string;
  path: TicketStatus[];
  startedDaysAgo: number;
  approvedVia?: "link" | "manual";
  items?: SeedItem[];
  discount?: number;
  downPayment?: number;
  invoiced?: boolean;
  /** Pays the remaining balance. */
  settled?: boolean;
  dueInDays?: number;
  diagnosis?: string;
  cancelReason?: string;
  unsigned?: boolean;
}

interface SeedShop {
  name: string;
  phoneWa: string;
  address: string;
  billingCode: number;
  requireSignature?: boolean;
  techniciansCanClaim?: boolean;
  staff: { email: string; name: string; role: StaffRole }[];
  customers: [string, string][];
  parts: {
    sku: string;
    name: string;
    cost: number;
    sell: number;
    purchased: number;
    minStock: number;
  }[];
  tickets: SeedTicket[];
  tokenPrefix: string;
}

const SHOPS: SeedShop[] = [
  {
    name: "Toko Demo Servis",
    phoneWa: "6281234500001",
    address: "Jl. Merdeka No. 10, Bandung",
    billingCode: 123,
    tokenPrefix: "demo",
    staff: [
      { email: "owner@demo.test", name: "Budi Santoso", role: "owner" },
      { email: "admin@demo.test", name: "Sari Wulandari", role: "admin" },
      { email: "teknisi@demo.test", name: "Andi Pratama", role: "technician" },
      { email: "teknisi2@demo.test", name: "Rudi Hartono", role: "technician" },
    ],
    customers: [
      ["Dewi Lestari", "6281300000001"],
      ["Agus Setiawan", "6281300000002"],
      ["Rina Marlina", "6281300000003"],
      ["Joko Susilo", "6281300000004"],
      ["Maya Anggraini", "6281300000005"],
      ["Hendra Gunawan", "6281300000006"],
      ["Putri Ayu", "6281300000007"],
      ["Bayu Nugroho", "6281300000008"],
    ],
    parts: [
      {
        sku: "LCD-14-HD",
        name: 'LCD 14" HD 30 pin',
        cost: 650_000,
        sell: 850_000,
        purchased: 6,
        minStock: 2,
      },
      {
        sku: "BAT-ASUS-X441",
        name: "Baterai Asus X441",
        cost: 280_000,
        sell: 400_000,
        purchased: 3,
        minStock: 3,
      },
      {
        sku: "KBD-ACER-E14",
        name: "Keyboard Acer E14",
        cost: 120_000,
        sell: 200_000,
        purchased: 2,
        minStock: 2,
      },
      {
        sku: "SSD-256",
        name: "SSD SATA 256 GB",
        cost: 320_000,
        sell: 450_000,
        purchased: 8,
        minStock: 2,
      },
      {
        sku: "RAM-8-DDR4",
        name: "RAM DDR4 8 GB",
        cost: 280_000,
        sell: 380_000,
        purchased: 6,
        minStock: 2,
      },
      {
        sku: "LCD-RN8",
        name: "LCD Redmi Note 8",
        cost: 350_000,
        sell: 500_000,
        purchased: 5,
        minStock: 1,
      },
      {
        sku: "BAT-IP11",
        name: "Baterai iPhone 11",
        cost: 220_000,
        sell: 350_000,
        purchased: 5,
        minStock: 1,
      },
      {
        sku: "CON-TYPEC",
        name: "Konektor charger Type-C",
        cost: 15_000,
        sell: 50_000,
        purchased: 20,
        minStock: 5,
      },
      {
        sku: "PASTA-TERMAL",
        name: "Pasta termal",
        cost: 25_000,
        sell: 50_000,
        purchased: 10,
        minStock: 2,
      },
      {
        sku: "FAN-ACER-E14",
        name: "Kipas Acer E14",
        cost: 90_000,
        sell: 160_000,
        purchased: 4,
        minStock: 1,
      },
    ],
    tickets: [
      {
        customer: 0,
        device: ["laptop", "Asus", "X441MA"],
        complaint: "Laptop tidak menyala setelah terkena air.",
        path: pathTo("received"),
        startedDaysAgo: 0,
        downPayment: 100_000,
      },
      {
        customer: 1,
        assignee: "teknisi@demo.test",
        device: ["phone", "Xiaomi", "Redmi Note 8"],
        complaint: "Layar retak dan sentuhan tidak merespons.",
        path: pathTo("received"),
        startedDaysAgo: 1,
        dueInDays: 3,
      },
      {
        customer: 2,
        assignee: "teknisi@demo.test",
        device: ["laptop", "Acer", "Aspire E14"],
        complaint: "Kipas berisik dan laptop cepat panas.",
        path: pathTo("diagnosing"),
        startedDaysAgo: 2,
        dueInDays: -1,
      },
      {
        customer: 3,
        assignee: "teknisi@demo.test",
        device: ["laptop", "Asus", "X441UA"],
        complaint: "Baterai cepat habis.",
        path: pathTo("awaiting_approval"),
        startedDaysAgo: 3,
        diagnosis: "Kapasitas baterai tersisa 40%, perlu diganti.",
        items: [
          { part: "BAT-ASUS-X441" },
          { service: "Jasa pasang baterai", price: 75_000 },
        ],
      },
      {
        customer: 4,
        assignee: "teknisi@demo.test",
        device: ["phone", "Apple", "iPhone 11"],
        complaint: "Baterai kembung.",
        path: pathTo("in_progress"),
        startedDaysAgo: 4,
        approvedVia: "link",
        diagnosis: "Baterai perlu diganti.",
        items: [
          { part: "BAT-IP11" },
          { service: "Jasa ganti baterai", price: 100_000 },
        ],
        downPayment: 200_000,
      },
      {
        customer: 5,
        assignee: "teknisi2@demo.test",
        device: ["laptop", "Lenovo", "IdeaPad 330"],
        complaint: "Laptop lambat, hard disk bunyi.",
        path: pathTo("in_progress"),
        startedDaysAgo: 5,
        approvedVia: "manual",
        diagnosis: "Hard disk mulai rusak, diganti SSD.",
        items: [
          { part: "SSD-256" },
          { service: "Jasa instal ulang", price: 100_000 },
        ],
      },
      {
        customer: 6,
        assignee: "teknisi2@demo.test",
        device: ["laptop", "Acer", "Aspire E14"],
        complaint: "Tombol keyboard banyak yang mati.",
        path: [...pathTo("in_progress"), "waiting_parts"],
        startedDaysAgo: 6,
        approvedVia: "link",
        diagnosis: "Keyboard perlu diganti.",
        items: [
          { part: "KBD-ACER-E14" },
          { service: "Jasa ganti keyboard", price: 75_000 },
        ],
      },
      {
        customer: 7,
        assignee: "teknisi@demo.test",
        device: ["phone", "Samsung", "Galaxy A52"],
        complaint: "Tidak bisa mengisi daya.",
        path: pathTo("ready"),
        startedDaysAgo: 5,
        approvedVia: "link",
        diagnosis: "Konektor charger rusak.",
        items: [
          { part: "CON-TYPEC" },
          { service: "Jasa solder konektor", price: 100_000 },
        ],
        invoiced: true,
        downPayment: 50_000,
      },
      {
        customer: 0,
        assignee: "teknisi2@demo.test",
        device: ["tablet", "Samsung", "Galaxy Tab A8"],
        complaint: "Layar berkedip.",
        path: pathTo("ready"),
        startedDaysAgo: 12,
        approvedVia: "manual",
        diagnosis: "Kabel fleksibel longgar, sudah dipasang ulang.",
        items: [{ service: "Jasa perbaikan layar", price: 150_000 }],
      },
      {
        customer: 1,
        assignee: "teknisi@demo.test",
        device: ["laptop", "HP", "14s-dq2"],
        complaint: "Layar laptop bergaris.",
        path: pathTo("picked_up"),
        startedDaysAgo: 15,
        approvedVia: "link",
        diagnosis: "LCD rusak, perlu diganti.",
        items: [
          { part: "LCD-14-HD" },
          { service: "Jasa ganti LCD", price: 150_000 },
        ],
        discount: 50_000,
        downPayment: 300_000,
        invoiced: true,
        settled: true,
      },
      {
        customer: 2,
        assignee: "teknisi2@demo.test",
        device: ["laptop", "Dell", "Inspiron 3501"],
        complaint: "Sering mati sendiri.",
        path: pathTo("picked_up"),
        startedDaysAgo: 30,
        approvedVia: "manual",
        diagnosis: "Pasta termal kering, kipas kotor.",
        items: [
          { part: "PASTA-TERMAL" },
          { service: "Jasa pembersihan", price: 100_000 },
        ],
        invoiced: true,
        settled: true,
      },
      {
        customer: 3,
        device: ["other", "Sony", "PlayStation 4"],
        complaint: "Tidak ada gambar di TV.",
        path: ["received", "diagnosing", "cancelled"],
        startedDaysAgo: 8,
        diagnosis: "Chip HDMI rusak, part tidak tersedia.",
        items: [{ service: "Biaya pengecekan", price: 50_000 }],
        cancelReason: "Pelanggan memilih tidak melanjutkan servis.",
      },
    ],
  },
  {
    name: "Toko Lain",
    phoneWa: "6281234500002",
    address: "Jl. Sudirman No. 5, Surabaya",
    billingCode: 456,
    requireSignature: false,
    techniciansCanClaim: true,
    tokenPrefix: "lain",
    staff: [
      { email: "owner@lain.test", name: "Tono Wijaya", role: "owner" },
      { email: "teknisi@lain.test", name: "Eko Prasetyo", role: "technician" },
    ],
    customers: [
      ["Lina Kusuma", "6281300000001"],
      ["Fajar Ramadhan", "6281300000009"],
    ],
    parts: [],
    tickets: [
      {
        customer: 0,
        device: ["laptop", "Asus", "VivoBook 14"],
        complaint: "Engsel patah.",
        path: pathTo("received"),
        startedDaysAgo: 1,
        unsigned: true,
      },
      {
        customer: 1,
        assignee: "teknisi@lain.test",
        device: ["phone", "Oppo", "A16"],
        complaint: "Speaker tidak bersuara.",
        path: pathTo("diagnosing"),
        startedDaysAgo: 2,
      },
    ],
  },
];

async function seedShop(
  tx: Tx,
  shop: SeedShop,
  password: string,
  now: Date,
): Promise<void> {
  const ago = (days: number, hours = 0) =>
    new Date(now.getTime() - days * DAY_IN_MS + hours * HOUR_IN_MS);

  const [tenant] = await tx
    .insert(tenants)
    .values({
      name: shop.name,
      phoneWa: shop.phoneWa,
      address: shop.address,
      billingCode: shop.billingCode,
      requireSignature: shop.requireSignature,
      techniciansCanClaim: shop.techniciansCanClaim,
      trialEndsAt: ago(-14),
    })
    .returning();
  const tenantId = tenant!.id;

  const staff = await tx
    .insert(users)
    .values(shop.staff.map((member) => ({ ...member, tenantId })))
    .returning();
  await tx.insert(accounts).values(
    staff.map((member) => ({
      userId: member.id,
      accountId: member.id,
      providerId: "credential",
      password,
    })),
  );
  const userId = (email: string) =>
    staff.find((member) => member.email === email)!.id;
  const owner = staff.find((member) => member.role === "owner")!.id;

  const shopCustomers = await tx
    .insert(customers)
    .values(
      shop.customers.map(([name, phoneWa]) => ({ tenantId, name, phoneWa })),
    )
    .returning();

  const shopParts = shop.parts.length
    ? await tx
        .insert(parts)
        .values(
          shop.parts.map((part) => ({
            tenantId,
            sku: part.sku,
            name: part.name,
            costPrice: part.cost,
            sellPrice: part.sell,
            stock: part.purchased,
            minStock: part.minStock,
          })),
        )
        .returning()
    : [];
  if (shop.parts.length) {
    await tx.insert(stockMovements).values(
      shop.parts.map((part, index) => ({
        tenantId,
        partId: shopParts[index]!.id,
        qtyChange: part.purchased,
        reason: "purchase" as const,
        unitCost: part.cost,
        note: "Stok awal",
        createdBy: owner,
        createdAt: ago(45),
      })),
    );
  }

  let invoiceSeq = 0;
  for (const [index, ticket] of shop.tickets.entries()) {
    const sequence = index + 1;
    const status = ticket.path.at(-1)!;
    const stepAt = (step: number) => ago(ticket.startedDaysAgo, step * 12);
    const lastStepAt = stepAt(ticket.path.length - 1);
    const assignee = ticket.assignee ? userId(ticket.assignee) : null;

    const lines = (ticket.items ?? []).map((item) => {
      const part = shopParts.find(({ sku }) => sku === item.part);
      return {
        kind: part ? ("part" as const) : ("service" as const),
        part,
        description: part?.name ?? item.service!,
        qty: item.qty ?? 1,
        unitPrice: part?.sellPrice ?? item.price!,
      };
    });
    const subtotal = lines.reduce(
      (sum, line) => sum + line.qty * line.unitPrice,
      0,
    );
    const total = subtotal - (ticket.discount ?? 0);
    if (ticket.invoiced) {
      invoiceSeq += 1;
    }

    const [row] = await tx
      .insert(tickets)
      .values({
        tenantId,
        number: `SRV-${String(sequence).padStart(5, "0")}`,
        publicToken: `${shop.tokenPrefix}-status-token-${String(sequence).padStart(4, "0")}`,
        customerId: shopCustomers[ticket.customer]!.id,
        status,
        assignedTo: assignee,
        deviceType: ticket.device[0],
        brand: ticket.device[1],
        model: ticket.device[2],
        complaint: ticket.complaint,
        accessories: ["charger"],
        signatureSvg: ticket.unsigned ? null : SIGNATURE_SVG,
        termsAcceptedAt: stepAt(0),
        dueDate:
          ticket.dueInDays === undefined
            ? null
            : ago(-ticket.dueInDays).toISOString().slice(0, 10),
        diagnosis: ticket.diagnosis,
        discountAmount: ticket.discount ?? 0,
        warrantyDays: 30,
        estimateApprovedTotal: ticket.approvedVia ? total : null,
        estimateApprovedAt: ticket.approvedVia ? stepAt(3) : null,
        estimateApprovalVia: ticket.approvedVia,
        cancelReason: ticket.cancelReason,
        invoiceNumber: ticket.invoiced
          ? `INV-${String(invoiceSeq).padStart(5, "0")}`
          : null,
        invoicedAt: ticket.invoiced ? stepAt(4) : null,
        pickedUpAt: status === "picked_up" ? lastStepAt : null,
        createdBy: owner,
        createdAt: stepAt(0),
        updatedAt: lastStepAt,
      })
      .returning();
    const ticketId = row!.id;

    if (lines.length) {
      await tx.insert(ticketItems).values(
        lines.map((line) => ({
          tenantId,
          ticketId,
          kind: line.kind,
          partId: line.part?.id,
          description: line.description,
          qty: line.qty,
          unitPrice: line.unitPrice,
          unitCost: line.part?.costPrice,
          createdBy: assignee ?? owner,
          createdAt: stepAt(1),
          updatedAt: stepAt(1),
        })),
      );
    }

    for (const line of lines) {
      if (!line.part) {
        continue;
      }
      await tx.insert(stockMovements).values({
        tenantId,
        partId: line.part.id,
        qtyChange: -line.qty,
        reason: "ticket_use",
        ticketId,
        unitCost: line.part.costPrice,
        createdBy: assignee ?? owner,
        createdAt: stepAt(1),
      });
      await tx
        .update(parts)
        .set({ stock: line.part.stock - line.qty })
        .where(eq(parts.id, line.part.id));
      line.part.stock -= line.qty;
    }

    const events: (typeof ticketEvents.$inferInsert)[] = [
      {
        tenantId,
        ticketId,
        type: "created",
        isPublic: true,
        actorId: owner,
        createdAt: stepAt(0),
      },
    ];
    if (assignee) {
      events.push({
        tenantId,
        ticketId,
        type: "assigned",
        actorId: owner,
        createdAt: stepAt(0),
      });
    }
    ticket.path.slice(1).forEach((toStatus, step) => {
      const createdAt = stepAt(step + 1);
      const fromStatus = ticket.path[step]!;
      const approved =
        fromStatus === "awaiting_approval" && toStatus === "in_progress";
      // A null actor means the customer, through the status link.
      const actorId =
        approved && ticket.approvedVia === "link" ? null : (assignee ?? owner);
      if (approved) {
        events.push({
          tenantId,
          ticketId,
          type: "estimate_approved",
          isPublic: true,
          actorId,
          createdAt,
        });
      }
      events.push({
        tenantId,
        ticketId,
        type: "status_changed",
        fromStatus,
        toStatus,
        isPublic: true,
        actorId,
        createdAt,
      });
    });
    if (ticket.invoiced) {
      events.push({
        tenantId,
        ticketId,
        type: "invoice_created",
        actorId: owner,
        createdAt: stepAt(4),
      });
    }

    const paid = ticket.downPayment ?? 0;
    const ticketPayments: {
      amount: number;
      method: "cash" | "transfer";
      paidAt: Date;
      note: string;
    }[] = [];
    if (paid > 0) {
      ticketPayments.push({
        amount: paid,
        method: "cash",
        paidAt: stepAt(0),
        note: "DP",
      });
    }
    if (ticket.settled) {
      ticketPayments.push({
        amount: total - paid,
        method: "transfer",
        paidAt: lastStepAt,
        note: "Pelunasan",
      });
    }
    for (const payment of ticketPayments) {
      await tx.insert(payments).values({
        tenantId,
        ticketId,
        kind: "payment",
        createdBy: owner,
        createdAt: payment.paidAt,
        ...payment,
      });
      events.push({
        tenantId,
        ticketId,
        type: "payment_recorded",
        actorId: owner,
        createdAt: payment.paidAt,
      });
    }

    await tx.insert(ticketEvents).values(events);
  }

  await tx
    .update(tenants)
    .set({ ticketSeq: shop.tickets.length, invoiceSeq })
    .where(eq(tenants.id, tenantId));
}

/** Inserts docs/BSD.md section 7 into an empty database; false if it has data. */
export async function seedDatabase(db: Db, now = new Date()) {
  const existing = await db.select({ id: tenants.id }).from(tenants).limit(1);
  if (existing.length) {
    return false;
  }

  const password = await hashPassword(DEV_PASSWORD);

  await db.transaction(async (tx) => {
    for (const shop of SHOPS) {
      await seedShop(tx, shop, password, now);
    }

    const [superAdmin] = await tx
      .insert(users)
      .values({
        name: "Admin Fixmaster",
        email: "admin@fixmaster.test",
        tenantId: null,
        role: "super_admin",
      })
      .returning();
    await tx.insert(accounts).values({
      userId: superAdmin!.id,
      accountId: superAdmin!.id,
      providerId: "credential",
      password,
    });
  });

  return true;
}
