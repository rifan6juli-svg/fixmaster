import Link from "next/link";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPhoneWa } from "@/lib/phone";
import type { CustomerListItem } from "@/server/services/customers";

interface CustomerListProps {
  customers: CustomerListItem[];
  /** This list's URL, so S-11 can return to the same search and page. */
  listHref: string;
}

// A table from 640px and cards below it (DBD section 3).
export function CustomerList({ customers, listHref }: CustomerListProps) {
  const detailHref = (id: string) =>
    listHref === "/customers"
      ? `/customers/${id}`
      : `/customers/${id}?back=${encodeURIComponent(listHref)}`;

  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Nomor WA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              // The link's ::after covers the row, so the whole row is the target.
              <TableRow
                key={customer.id}
                className="relative transition-colors duration-150 hover:bg-surface-sunken"
              >
                <TableCell className="w-full max-w-0">
                  <Link
                    href={detailHref(customer.id)}
                    className="block truncate font-medium after:absolute after:inset-0"
                  >
                    {customer.name}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatPhoneWa(customer.phoneWa)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:hidden">
        {customers.map((customer) => (
          <li key={customer.id}>
            <Card asChild interactive className="gap-1 px-4 py-4">
              <Link href={detailHref(customer.id)}>
                <span className="truncate font-medium">{customer.name}</span>
                <span className="text-body-sm text-text-muted">
                  {formatPhoneWa(customer.phoneWa)}
                </span>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
