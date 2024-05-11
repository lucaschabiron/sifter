import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function SiftsTable() {
  const sifts = [
    {
      id: 1,
      name: "AI sift",
      status: "active",
      nextIssue: "Wednesday 9AM",
      totalIssues: 25,
      createdAt: "2023-07-12 10:42 AM",
    },
    {
      id: 2,
      name: "AI ML FULL REACT STACK sift",
      status: "active",
      nextIssue: "Wednesday 9AM",
      totalIssues: 25,
      createdAt: "2023-07-12 10:42 AM",
    },
    {
      id: 3,
      name: "AI sift",
      status: "active",
      nextIssue: "Wednesday 9AM",
      totalIssues: 25,
      createdAt: "2023-07-12 10:42 AM",
    },
    {
      id: 4,
      name: "AI sift",
      status: "active",
      nextIssue: "Wednesday 9AM",
      totalIssues: 25,
      createdAt: "2023-07-12 10:42 AM",
    },
    {
      id: 5,
      name: "AI sift",
      status: "active",
      nextIssue: "Wednesday 9AM",
      totalIssues: 25,
      createdAt: "2023-07-12 10:42 AM",
    },
    {
      id: 6,
      name: "AI sift",
      status: "draft",
      nextIssue: "Wednesday 9AM",
      totalIssues: 25,
      createdAt: "2023-07-12 10:42 AM",
    },
    {
      id: 7,
      name: "AI sift",
      status: "active",
      nextIssue: "Wednesday 9AM",
      totalIssues: 25,
      createdAt: "2023-07-12 10:42 AM",
    },
    {
      id: 8,
      name: "AI sift",
      status: "inactive",
      nextIssue: "Wednesday 9AM",
      totalIssues: 25,
      createdAt: "2023-07-12 10:42 AM",
    },
  ];

  const numberOfSifts = 32;
  const siftsPerPage = 8;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sifts</CardTitle>
        <CardDescription>
          Here you can see all the sifts you have created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="">
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>

              <TableHead className="hidden sm:table-cell">Next Issue</TableHead>
              <TableHead className="hidden md:table-cell">
                Total Issues
              </TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sifts.map((sift) => (
              <TableRow key={sift.id} className="h-16">
                <TableCell className="font-medium">{sift.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={sift.status === "active" ? "default" : "outline"}
                    className={
                      sift.status === "active"
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {sift.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {sift.nextIssue}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {sift.totalIssues}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {sift.createdAt}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="">
        <div className="text-xs text-muted-foreground">
          Showing{" "}
          <strong>
            {sifts[0].id}-{sifts[siftsPerPage - 1].id}
          </strong>{" "}
          of <strong>{numberOfSifts}</strong> products
        </div>
      </CardFooter>
    </Card>
  );
}
